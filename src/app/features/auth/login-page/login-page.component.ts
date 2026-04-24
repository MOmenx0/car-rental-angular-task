import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/auth/auth.service';
import { SessionService } from '../../../core/auth/session.service';
import { applyBackendValidationErrors, extractBackendErrorMessage } from '../../../shared/utils/backend-errors';
import { nonWhitespaceValidator } from '../../../shared/utils/form-validators';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, InputTextModule, ButtonModule],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  readonly t = inject(TranslateService);

  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, nonWhitespaceValidator()]],
    password: ['', [Validators.required, nonWhitespaceValidator()]]
  });

  submit() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const payload = {
      email: raw.email.trim(),
      password: raw.password
    };

    this.isSubmitting.set(true);
    this.formError.set(null);
    this.form.disable();

    this.auth
      .login(payload)
      .pipe(
        finalize(() => {
          this.form.enable();
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: result => {
          this.session.setUserFromLogin(result.user);

          if (result.scope === 'admin') {
            this.router.navigateByUrl('/admin/users');
            return;
          }

          if (result.scope === 'customer') {
            this.router.navigateByUrl('/cars');
            return;
          }

          this.session.clearSession();
          this.formError.set(this.t.instant('common.networkError'));
        },
        error: err => {
          applyBackendValidationErrors(this.form, err);
          const status = (err as { status?: number })?.status;
          if (status === 401) {
            this.formError.set(this.t.instant('auth.invalidCredentials'));
            return;
          }

          this.formError.set(extractBackendErrorMessage(err, this.t.instant('common.networkError')));
        }
      });
  }
}
