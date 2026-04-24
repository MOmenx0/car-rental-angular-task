import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../../../core/api/api-client.service';
import { PaginatedResponse } from '../../../shared/models/paginated-response';
import { AdminCar } from '../cars/admin-cars.api';
import { AdminUser } from '../users/admin-users.api';

export type AdminOrderPaymentType = 'cash' | 'visa' | 'tamara';
export type AdminOrderType = 'full' | 'installments';
export type AdminPaymentStatus = 'pending' | 'success' | 'failed';

export interface AdminInstallment {
  id: number;
  order_id: number;
  amount: string;
  due_date: string;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: number;
  user_id: number;
  car_id: number;
  delivery_date: string;
  receiving_date: string;
  days: number;
  total_price: string;
  points: number;
  payment_type: AdminOrderPaymentType;
  payment_status: AdminPaymentStatus;
  order_type: AdminOrderType;
  created_at: string;
  updated_at: string;
  user?: AdminUser;
  car?: AdminCar;
  installments?: AdminInstallment[];
}

export interface AdminOrdersFilters {
  search?: string;
  user_id?: number | string;
  car_id?: number | string;
  payment_type?: AdminOrderPaymentType | '';
  payment_status?: AdminPaymentStatus | '';
  order_type?: AdminOrderType | '';
  per_page?: number;
  page?: number;
}

export interface UpdateAdminOrderRequest {
  payment_status?: AdminPaymentStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminOrdersApi {
  private readonly api = inject(ApiClient);

  list(filters: AdminOrdersFilters) {
    return this.api.get<PaginatedResponse<AdminOrder>>(
      '/admin/orders',
      filters as unknown as Record<string, string | number | boolean | null | undefined>
    );
  }

  get(id: number) {
    return this.api.get<AdminOrder>(`/admin/orders/${id}`);
  }

  update(id: number, payload: UpdateAdminOrderRequest) {
    return this.api.put<AdminOrder>(`/admin/orders/${id}`, payload);
  }
}
