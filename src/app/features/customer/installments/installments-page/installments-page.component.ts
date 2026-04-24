import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { PaginatedResponse } from '../../../../shared/models/paginated-response';
import { CustomerInstallmentsApi, InstallmentItem } from '../customer-installments.api';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    PageShellComponent,
    DataStateComponent,
    PaginationComponent,
    TableModule,
    ButtonModule
  ],
  templateUrl: './installments-page.component.html'
})
export class InstallmentsPageComponent {
  private readonly api = inject(CustomerInstallmentsApi);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly payingId = signal<number | null>(null);
  readonly error = signal<string | null>(null);
  readonly result = signal<PaginatedResponse<InstallmentItem> | null>(null);

  ngOnInit() {
    this.load(1);
  }

  load(page: number) {
    this.loading.set(true);
    this.error.set(null);
    this.api.list({ per_page: 5, page }).subscribe({
      next: res => this.result.set(res),
      error: () => {
        const msg = this.t.instant('common.networkError');
        this.error.set(msg);
        this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
      },
      complete: () => this.loading.set(false)
    });
  }

  confirmPay(item: InstallmentItem) {
    if (item.status !== 'pending') return;

    this.confirm.confirm({
      header: this.t.instant('dialog.payInstallmentTitle'),
      message: this.t.instant('dialog.payInstallmentMessage'),
      acceptLabel: this.t.instant('common.pay'),
      rejectLabel: this.t.instant('common.cancel'),
      icon: 'pi pi-credit-card',
      accept: () => this.pay(item)
    });
  }

  private pay(item: InstallmentItem) {
    this.payingId.set(item.id);
    this.api.pay(item.id).subscribe({
      next: () => {
        this.toast.add({ severity: 'success', summary: this.t.instant('toast.successTitle'), detail: this.t.instant('installments.paid') });
        this.load(this.result()?.current_page ?? 1);
      },
      error: () => {
        const msg = this.t.instant('common.networkError');
        this.error.set(msg);
        this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
      },
      complete: () => this.payingId.set(null)
    });
  }
}
