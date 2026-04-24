import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs/operators';

import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { PaginatedResponse } from '../../../../shared/models/paginated-response';
import { UiLanguageService } from '../../../../shared/services/ui-language.service';
import { applyBackendValidationErrors } from '../../../../shared/utils/backend-errors';
import { nonWhitespaceValidator } from '../../../../shared/utils/form-validators';
import { AdminCar, AdminCarsApi, UpsertAdminCarRequest } from '../admin-cars.api';

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
    TableModule,
    DialogModule
  ],
  templateUrl: './admin-cars-page.component.html'
})
export class AdminCarsPageComponent {
  private readonly api = inject(AdminCarsApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  private readonly t = inject(TranslateService);
  readonly uiLang = inject(UiLanguageService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly result = signal<PaginatedResponse<AdminCar> | null>(null);

  readonly carFormSubmitting = signal(false);
  readonly carFormError = signal<string | null>(null);
  readonly editingCarId = signal<number | null>(null);
  readonly carDialogVisible = signal(false);

  readonly deletingCarId = signal<number | null>(null);

  readonly filtersForm = this.fb.nonNullable.group({
    search: [''],
    brand: [''],
    min_price: [0],
    max_price: [0],
    per_page: [10]
  });

  readonly carForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, nonWhitespaceValidator()]],
    brand: ['', [Validators.required, nonWhitespaceValidator()]],
    model: ['', [Validators.required, nonWhitespaceValidator()]],
    kilometers: [0, [Validators.required, Validators.min(0)]],
    price_per_day: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.load(1);
  }

  applyFilters() {
    this.load(1);
  }

  load(page: number) {
    this.loading.set(true);
    this.error.set(null);

    const v = this.filtersForm.getRawValue();
    this.api
      .list({
        search: v.search || undefined,
        brand: v.brand || undefined,
        min_price: v.min_price || undefined,
        max_price: v.max_price || undefined,
        per_page: Number(v.per_page) || 10,
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

  startCreate() {
    this.editingCarId.set(null);
    this.carFormError.set(null);
    this.carForm.enable();
    this.carForm.reset({
      name: '',
      brand: '',
      model: '',
      kilometers: 0,
      price_per_day: 0
    });
  }

  openCreateDialog() {
    this.startCreate();
    this.carDialogVisible.set(true);
  }

  closeCarDialog() {
    this.carDialogVisible.set(false);
  }

  onCarDialogVisibleChange(visible: boolean) {
    this.carDialogVisible.set(visible);
  }

  startEdit(id: number) {
    this.editingCarId.set(id);
    this.carDialogVisible.set(true);
    this.carFormError.set(null);
    this.carFormSubmitting.set(true);
    this.carForm.disable();

    this.api
      .get(id)
      .pipe(
        finalize(() => {
          this.carForm.enable();
          this.carFormSubmitting.set(false);
        })
      )
      .subscribe({
        next: car => {
          this.carForm.reset({
            name: car.name,
            brand: car.brand,
            model: car.model,
            kilometers: car.kilometers,
            price_per_day: Number(car.price_per_day)
          });
        },
        error: () => {
          const msg = this.t.instant('common.networkError');
          this.carFormError.set(msg);
          this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
        }
      });
  }

  submitCar() {
    if (this.carForm.invalid) return;

    this.carFormSubmitting.set(true);
    this.carFormError.set(null);
    this.carForm.disable();

    const v = this.carForm.getRawValue();
    const payload: UpsertAdminCarRequest = {
      name: v.name.trim(),
      brand: v.brand.trim(),
      model: v.model.trim(),
      kilometers: Number(v.kilometers),
      price_per_day: Number(v.price_per_day)
    };

    const editingId = this.editingCarId();
    const request$ = editingId ? this.api.update(editingId, payload) : this.api.create(payload);

    request$
      .pipe(
        finalize(() => {
          this.carForm.enable();
          this.carFormSubmitting.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.load(this.result()?.current_page ?? 1);
          this.toast.add({
            severity: 'success',
            summary: this.t.instant('toast.successTitle'),
            detail: editingId ? this.t.instant('admin.cars.updated') : this.t.instant('admin.cars.created')
          });
          this.startCreate();
          this.carDialogVisible.set(false);
        },
        error: err => {
          applyBackendValidationErrors(this.carForm, err);
          const msg = this.t.instant('common.networkError');
          this.carFormError.set(msg);
          this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
        }
      });
  }

  confirmDeleteCar(id: number) {
    this.confirm.confirm({
      header: this.t.instant('dialog.deleteCarTitle'),
      message: this.t.instant('dialog.deleteCarMessage'),
      acceptLabel: this.t.instant('common.delete'),
      rejectLabel: this.t.instant('common.cancel'),
      acceptButtonStyleClass: 'p-button-danger',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteCar(id)
    });
  }

  private deleteCar(id: number) {
    this.deletingCarId.set(id);
    this.api.delete(id).subscribe({
      next: () => {
        const currentPage = this.result()?.current_page ?? 1;
        this.load(currentPage);
        if (this.editingCarId() === id) {
          this.startCreate();
          this.carDialogVisible.set(false);
        }
        this.toast.add({ severity: 'success', summary: this.t.instant('toast.successTitle'), detail: this.t.instant('admin.cars.deleted') });
      },
      error: () => {
        const msg = this.t.instant('common.networkError');
        this.error.set(msg);
        this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
      },
      complete: () => this.deletingCarId.set(null)
    });
  }
}
