import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { PaginatedResponse } from '../../../../shared/models/paginated-response';
import { CustomerOrdersApi, Order } from '../customer-orders.api';

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
  templateUrl: './orders-page.component.html'
})
export class OrdersPageComponent {
  private readonly api = inject(CustomerOrdersApi);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<PaginatedResponse<Order> | null>(null);

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
}
