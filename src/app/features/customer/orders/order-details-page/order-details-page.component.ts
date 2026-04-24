import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';
import { CustomerOrdersApi, Order } from '../customer-orders.api';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PageShellComponent, DataStateComponent, ButtonModule, TableModule],
  templateUrl: './order-details-page.component.html'
})
export class OrderDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CustomerOrdersApi);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly order = signal<Order | null>(null);

  ngOnInit() {
    this.load();
  }

  load() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.error.set(null);
    this.api.get(id).subscribe({
      next: res => this.order.set(res),
      error: () => {
        const msg = this.t.instant('common.networkError');
        this.error.set(msg);
        this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
      },
      complete: () => this.loading.set(false)
    });
  }
}
