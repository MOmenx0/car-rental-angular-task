import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function nonWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string') return null;
    return value.trim().length > 0 ? null : { whitespace: true };
  };
}

export function dateOrderValidator(
  fromKey: string,
  toKey: string,
  errorKey = 'dateOrder'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const from = control.get(fromKey)?.value as string | null;
    const to = control.get(toKey)?.value as string | null;
    if (!from || !to) return null;

    return to >= from ? null : { [errorKey]: true };
  };
}

