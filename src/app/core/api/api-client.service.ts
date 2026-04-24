import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE_URL } from '../constants/api.constants';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);

  get<T>(path: string, params?: Record<string, string | number | boolean | null | undefined>) {
    return this.http.get<T>(this.toUrl(path), { params: this.toParams(params) });
  }

  post<T>(path: string, body?: unknown) {
    return this.http.post<T>(this.toUrl(path), body ?? {});
  }

  put<T>(path: string, body?: unknown) {
    return this.http.put<T>(this.toUrl(path), body ?? {});
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.toUrl(path));
  }

  private toUrl(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  private toParams(params?: Record<string, string | number | boolean | null | undefined>) {
    let httpParams = new HttpParams();
    if (!params) return httpParams;
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) continue;

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) continue;
        httpParams = httpParams.set(key, trimmed);
        continue;
      }

      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }
}

