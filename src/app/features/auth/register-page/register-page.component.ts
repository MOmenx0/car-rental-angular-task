import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../../../core/auth/auth.service';
import { applyBackendValidationErrors } from '../../../shared/utils/backend-errors';
import { nonWhitespaceValidator } from '../../../shared/utils/form-validators';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule, InputTextModule, ButtonModule],
  templateUrl: './register-page.component.html'
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly t = inject(TranslateService);

  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, nonWhitespaceValidator()]],
    email: ['', [Validators.required, Validators.email, nonWhitespaceValidator()]],
    country: ['', [Validators.required, nonWhitespaceValidator()]],
    password: ['', [Validators.required, Validators.minLength(6), nonWhitespaceValidator()]],
    password_confirmation: ['', [Validators.required, nonWhitespaceValidator()]]
  });

  submit() {
    if (this.form.invalid) return;

    if (this.form.value.password !== this.form.value.password_confirmation) {
      this.form.controls.password_confirmation.setErrors({ mismatch: true });
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      name: raw.name.trim(),
      email: raw.email.trim(),
      country: raw.country.trim()
    };

    this.isSubmitting.set(true);
    this.formError.set(null);
    this.form.disable();

    this.auth
      .register(payload)
      .pipe(
        finalize(() => {
          this.form.enable();
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/login'),
        error: err => {
          applyBackendValidationErrors(this.form, err);
          this.formError.set(this.t.instant('common.networkError'));
        }
      });
  }
}
