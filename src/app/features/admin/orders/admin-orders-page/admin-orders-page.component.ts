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
import {
  AdminOrder,
  AdminOrdersApi,
  AdminOrderPaymentType,
  AdminOrderType,
  AdminPaymentStatus
} from '../admin-orders.api';

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
  templateUrl: './admin-orders-page.component.html'
})
export class AdminOrdersPageComponent {
  private readonly api = inject(AdminOrdersApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<PaginatedResponse<AdminOrder> | null>(null);

  readonly paymentTypeOptions = [
    { label: 'All', value: '' },
    { label: 'cash', value: 'cash' },
    { label: 'visa', value: 'visa' },
    { label: 'tamara', value: 'tamara' }
  ];

  readonly paymentStatusOptions = [
    { label: 'All', value: '' },
    { label: 'pending', value: 'pending' },
    { label: 'success', value: 'success' },
    { label: 'failed', value: 'failed' }
  ];

  readonly orderTypeOptions = [
    { label: 'All', value: '' },
    { label: 'full', value: 'full' },
    { label: 'installments', value: 'installments' }
  ];

  readonly filtersForm = this.fb.nonNullable.group({
    search: [''],
    user_id: [0],
    car_id: [0],
    payment_type: ['' as AdminOrderPaymentType | ''],
    payment_status: ['' as AdminPaymentStatus | ''],
    order_type: ['' as AdminOrderType | ''],
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
    const v = this.filtersForm.getRawValue();

    const rawSearch = v.search.trim();
    let search: string | undefined = rawSearch || undefined;
    let userId = this.toPositiveInt(v.user_id);
    const carId = this.toPositiveInt(v.car_id);

    if (!userId && rawSearch && /^\d+$/.test(rawSearch)) {
      userId = Number(rawSearch);
      search = undefined;
    }

    this.api
      .list({
        search,
        user_id: userId,
        car_id: carId,
        payment_type: v.payment_type || undefined,
        payment_status: v.payment_status || undefined,
        order_type: v.order_type || undefined,
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

  private toPositiveInt(value: number): number | undefined {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return undefined;
    return num;
  }
}
