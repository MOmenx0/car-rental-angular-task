import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { PaginatedResponse } from '../../../../shared/models/paginated-response';
import { AdminUser, AdminUsersApi } from '../admin-users.api';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    PageShellComponent,
    DataStateComponent,
    PaginationComponent,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    TableModule
  ],
  templateUrl: './admin-users-page.component.html'
})
export class AdminUsersPageComponent {
  private readonly api = inject(AdminUsersApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<PaginatedResponse<AdminUser> | null>(null);

  readonly roleOptions = [
    { label: 'All', value: '' },
    { label: 'admin', value: 'admin' },
    { label: 'customer', value: 'customer' }
  ];

  readonly form = this.fb.nonNullable.group({
    search: [''],
    role: [''],
    country: [''],
    per_page: [10]
  });

  ngOnInit() {
    this.load(1);
  }

  applyFilters() {
    this.load(1);
  }

  load(page: number) {
    this.loading.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();
    this.api
      .list({
        search: v.search || undefined,
        role: v.role || undefined,
        country: v.country || undefined,
        per_page: Number(v.per_page) || 10,
        page
      })
      .subscribe({
        next: res => this.result.set(res),
        error: () => {
          const msg = this.t.instant('common.networkError');
          this.error.set(msg);
          this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
        },
        complete: () => this.loading.set(false)
      });
  }
}
