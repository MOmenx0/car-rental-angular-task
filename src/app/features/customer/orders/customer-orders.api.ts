import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../../../core/api/api-client.service';
import { PaginatedResponse } from '../../../shared/models/paginated-response';
import { Car } from '../cars/customer-cars.api';

export type PaymentType = 'cash' | 'visa' | 'tamara';
export type OrderType = 'full' | 'installments';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Installment {
  id: number;
  order_id: number;
  amount: string;
  due_date: string;
  status: 'pending' | 'paid';
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  car_id: number;
  delivery_date: string;
  receiving_date: string;
  days: number;
  total_price: string;
  points: number;
  payment_type: PaymentType;
  payment_status: PaymentStatus;
  order_type: OrderType;
  created_at: string;
  updated_at: string;
  car?: Car;
  installments?: Installment[];
}

export interface CreateOrderRequest {
  car_id: number;
  delivery_date: string; // YYYY-MM-DD
  receiving_date: string; // YYYY-MM-DD
  payment_type: PaymentType;
  order_type: OrderType;
  down_payment?: number;
  number_of_installments?: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerOrdersApi {
  private readonly api = inject(ApiClient);

  list(params: { per_page?: number; page?: number }) {
    return this.api.get<PaginatedResponse<Order>>('/customer/orders', params);
  }

  get(id: number) {
    return this.api.get<Order>(`/customer/orders/${id}`);
  }

  create(payload: CreateOrderRequest) {
    return this.api.post<Order>('/customer/orders', payload);
  }
}

