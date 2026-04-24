import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

import {
  AdminOrder,
  AdminOrdersApi,
  AdminPaymentStatus
} from '../admin-orders.api';
import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    SelectModule,
    TableModule,
    PageShellComponent,
    DataStateComponent
  ],
  templateUrl: './admin-order-details-page.component.html'
})
export class AdminOrderDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(AdminOrdersApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly order = signal<AdminOrder | null>(null);

  readonly statusUpdating = signal(false);
  readonly statusError = signal<string | null>(null);

  readonly updateStatusOptions = [
    { label: 'pending', value: 'pending' },
    { label: 'success', value: 'success' },
    { label: 'failed', value: 'failed' }
  ];

  readonly statusForm = this.fb.nonNullable.group({
    payment_status: ['pending' as AdminPaymentStatus, [Validators.required]]
  });

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
      next: data => {
        this.order.set(data);
        this.statusForm.setValue({
          payment_status: data.payment_status
        });
      },
      error: () => {
        const msg = this.t.instant('common.networkError');
        this.error.set(msg);
        this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
      },
      complete: () => this.loading.set(false)
    });
  }

  updatePaymentStatus() {
    const order = this.order();
    if (!order) return;

    this.statusUpdating.set(true);
    this.statusError.set(null);

    this.api
      .update(order.id, {
        payment_status: this.statusForm.getRawValue().payment_status
      })
      .subscribe({
        next: updated => {
          this.order.set(updated);
          this.toast.add({
            severity: 'success',
            summary: this.t.instant('toast.successTitle'),
            detail: this.t.instant('admin.orders.updated')
          });
        },
        error: () => {
          const msg = this.t.instant('common.networkError');
          this.statusError.set(msg);
          this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
        },
        complete: () => this.statusUpdating.set(false)
      });
  }
}
