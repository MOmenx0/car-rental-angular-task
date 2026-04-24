import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { PaginatedResponse } from '../../../../shared/models/paginated-response';
import { CustomerCarsApi, Car } from '../customer-cars.api';

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
    ButtonModule,
    TableModule
  ],
  templateUrl: './cars-page.component.html'
})
export class CarsPageComponent {
  private readonly api = inject(CustomerCarsApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<PaginatedResponse<Car> | null>(null);

  readonly form = this.fb.nonNullable.group({
    search: [''],
    brand: [''],
    min_price: [0],
    max_price: [0],
    per_page: [5]
  });

  ngOnInit() {
    this.load(1);
  }

  submitFilters() {
    this.load(1);
  }

  load(page: number) {
    this.loading.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();

    this.api
      .list({
        search: v.search || undefined,
        brand: v.brand || undefined,
        min_price: v.min_price || undefined,
        max_price: v.max_price || undefined,
        per_page: Number(v.per_page) || 5,
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
