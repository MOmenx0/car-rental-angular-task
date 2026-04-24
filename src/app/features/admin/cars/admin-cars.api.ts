import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../../../core/api/api-client.service';
import { PaginatedResponse } from '../../../shared/models/paginated-response';

export interface AdminCar {
  id: number;
  name: string;
  brand: string;
  model: string;
  kilometers: number;
  price_per_day: string;
  created_at: string;
  updated_at: string;
}

export interface AdminCarsFilters {
  search?: string;
  brand?: string;
  min_price?: number | string;
  max_price?: number | string;
  per_page?: number;
  page?: number;
}

export interface UpsertAdminCarRequest {
  name: string;
  brand: string;
  model: string;
  kilometers: number;
  price_per_day: number;
}

@Injectable({ providedIn: 'root' })
export class AdminCarsApi {
  private readonly api = inject(ApiClient);

  list(filters: AdminCarsFilters) {
    return this.api.get<PaginatedResponse<AdminCar>>(
      '/admin/cars',
      filters as unknown as Record<string, string | number | boolean | null | undefined>
    );
  }

  get(id: number) {
    return this.api.get<AdminCar>(`/admin/cars/${id}`);
  }

  create(payload: UpsertAdminCarRequest) {
    return this.api.post<AdminCar>('/admin/cars', payload);
  }

  update(id: number, payload: UpsertAdminCarRequest) {
    return this.api.put<AdminCar>(`/admin/cars/${id}`, payload);
  }

  delete(id: number) {
    return this.api.delete<{ message?: string }>(`/admin/cars/${id}`);
  }
}
