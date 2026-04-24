import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { AdminUsersApi, AdminUser } from '../admin-users.api';
import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ButtonModule, PageShellComponent, DataStateComponent],
  templateUrl: './admin-user-details-page.component.html'
})
export class AdminUserDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AdminUsersApi);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly user = signal<AdminUser | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.error.set(this.t.instant('common.noData'));
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.get(id).subscribe({
      next: data => this.user.set(data),
      error: () => {
        const msg = this.t.instant('common.networkError');
        this.error.set(msg);
        this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
      },
      complete: () => this.loading.set(false)
    });
  }
}
