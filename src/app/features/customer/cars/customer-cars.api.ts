import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../../../core/api/api-client.service';
import { PaginatedResponse } from '../../../shared/models/paginated-response';

export interface Car {
  id: number;
  name: string;
  brand: string;
  model: string;
  kilometers: number;
  price_per_day: string;
  created_at: string;
  updated_at: string;
}

export interface CarsFilters {
  search?: string;
  brand?: string;
  min_price?: number | string;
  max_price?: number | string;
  per_page?: number;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerCarsApi {
  private readonly api = inject(ApiClient);

  list(filters: CarsFilters) {
    return this.api.get<PaginatedResponse<Car>>(
      '/customer/cars',
      filters as unknown as Record<string, string | number | boolean | null | undefined>
    );
  }

  get(id: number) {
    return this.api.get<Car>(`/customer/cars/${id}`);
  }
}

