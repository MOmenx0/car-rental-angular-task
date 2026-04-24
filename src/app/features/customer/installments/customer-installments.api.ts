import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../../../core/api/api-client.service';
import { PaginatedResponse } from '../../../shared/models/paginated-response';
import { Order } from '../orders/customer-orders.api';

export interface InstallmentItem {
  id: number;
  order_id: number;
  amount: string;
  due_date: string;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
}

@Injectable({ providedIn: 'root' })
export class CustomerInstallmentsApi {
  private readonly api = inject(ApiClient);

  list(params: { per_page?: number; page?: number }) {
    return this.api.get<PaginatedResponse<InstallmentItem>>('/customer/installments', params);
  }

  pay(id: number) {
    return this.api.post<unknown>(`/customer/installments/${id}/pay`);
  }
}

