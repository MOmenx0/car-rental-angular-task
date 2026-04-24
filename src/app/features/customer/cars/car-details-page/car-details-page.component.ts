import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs/operators';

import { PageShellComponent } from '../../../../shared/components/page-shell/page-shell.component';
import { DataStateComponent } from '../../../../shared/components/data-state/data-state.component';
import { CustomerCarsApi, Car } from '../customer-cars.api';
import { CustomerOrdersApi, Order, PaymentType, OrderType } from '../../orders/customer-orders.api';
import { applyBackendValidationErrors, extractBackendErrorMessage } from '../../../../shared/utils/backend-errors';
import { dateOrderValidator } from '../../../../shared/utils/form-validators';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    PageShellComponent,
    DataStateComponent,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    InputNumberModule,
    DialogModule
  ],
  templateUrl: './car-details-page.component.html',
  styleUrls: ['./car-details-page.component.scss']
})
export class CarDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly carsApi = inject(CustomerCarsApi);
  private readonly ordersApi = inject(CustomerOrdersApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);
  private readonly t = inject(TranslateService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly car = signal<Car | null>(null);
  readonly orderDialogVisible = signal(false);

  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly createdOrder = signal<Order | null>(null);
  readonly demoCarImage =
    'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=80';

  readonly carId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  readonly paymentOptions = [
    { label: 'cash', value: 'cash' },
    { label: 'visa', value: 'visa' },
    { label: 'tamara', value: 'tamara' }
  ];

  readonly orderTypeOptions = [
    { label: 'full', value: 'full' },
    { label: 'installments', value: 'installments' }
  ];

  readonly form = this.fb.nonNullable.group(
    {
      delivery_date: ['', [Validators.required]],
      receiving_date: ['', [Validators.required]],
      payment_type: ['cash' as PaymentType, [Validators.required]],
      order_type: ['full' as OrderType, [Validators.required]],
      down_payment: [0],
      number_of_installments: [0]
    },
    { validators: [dateOrderValidator('delivery_date', 'receiving_date', 'receivingBeforeDelivery')] }
  );

  ngOnInit() {
    this.applyOrderTypeValidators(this.form.controls.order_type.value);

    this.form.controls.order_type.valueChanges.subscribe(orderType => {
      this.applyOrderTypeValidators(orderType);
    });

    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set(null);
    this.carsApi.get(this.carId()).subscribe({
      next: res => this.car.set(res),
      error: () => {
        const msg = this.t.instant('common.networkError');
        this.error.set(msg);
        this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: msg });
      },
      complete: () => this.loading.set(false)
    });
  }

  openOrderDialog() {
    this.submitError.set(null);
    this.orderDialogVisible.set(true);
  }

  closeOrderDialog() {
    this.orderDialogVisible.set(false);
  }

  onOrderDialogVisibleChange(visible: boolean) {
    this.orderDialogVisible.set(visible);
  }

  createOrder() {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.submitError.set(null);
    this.createdOrder.set(null);
    this.form.disable();

    this.ordersApi
      .create({
        car_id: this.carId(),
        ...this.toCreateOrderPayload()
      })
      .pipe(
        finalize(() => {
          this.form.enable();
          this.submitting.set(false);
        })
      )
      .subscribe({
        next: order => {
          this.createdOrder.set(order);
          this.toast.add({ severity: 'success', summary: this.t.instant('toast.successTitle'), detail: this.t.instant('customer.orders.created') });
          this.router.navigateByUrl(`/orders/${order.id}`);
        },
        error: err => {
          applyBackendValidationErrors(this.form, err);
          const message = extractBackendErrorMessage(err, this.t.instant('common.networkError'));
          this.submitError.set(message);
          this.toast.add({ severity: 'error', summary: this.t.instant('toast.errorTitle'), detail: message });
        }
      });
  }

  private applyOrderTypeValidators(orderType: OrderType) {
    const downPayment = this.form.controls.down_payment;
    const installments = this.form.controls.number_of_installments;

    if (orderType === 'installments') {
      downPayment.setValidators([Validators.required, Validators.min(1)]);
      installments.setValidators([Validators.required, Validators.min(1)]);
      if (downPayment.value <= 0) downPayment.setValue(0);
      if (installments.value <= 0) installments.setValue(0);
    } else {
      downPayment.clearValidators();
      installments.clearValidators();
      downPayment.setValue(0);
      installments.setValue(0);
      downPayment.setErrors(null);
      installments.setErrors(null);
    }

    downPayment.updateValueAndValidity({ emitEvent: false });
    installments.updateValueAndValidity({ emitEvent: false });
  }

  private toCreateOrderPayload() {
    const v = this.form.getRawValue();

    return {
      delivery_date: v.delivery_date,
      receiving_date: v.receiving_date,
      payment_type: v.payment_type,
      order_type: v.order_type,
      down_payment: v.order_type === 'installments' ? Number(v.down_payment) : undefined,
      number_of_installments: v.order_type === 'installments' ? Number(v.number_of_installments) : undefined
    };
  }
}
