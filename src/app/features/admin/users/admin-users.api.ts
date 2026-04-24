import { Injectable, inject } from '@angular/core';

import { ApiClient } from '../../../core/api/api-client.service';
import { PaginatedResponse } from '../../../shared/models/paginated-response';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  wallet: string;
  role: string;
  created_at: string;
  updated_at: string;
  orders?: Array<{ id: number }>;
}

export interface AdminUsersFilters {
  search?: string;
  role?: string;
  country?: string;
  per_page?: number;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUsersApi {
  private readonly api = inject(ApiClient);

  list(filters: AdminUsersFilters) {
    return this.api.get<PaginatedResponse<AdminUser>>(
      '/admin/users',
      filters as unknown as Record<string, string | number | boolean | null | undefined>
    );
  }

  get(id: number) {
    return this.api.get<AdminUser>(`/admin/users/${id}`);
  }
}
