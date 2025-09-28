import type { FieldError } from 'react-hook-form';

export const getFieldError = (error: FieldError | undefined): string | undefined => {
  return error?.message;
};

export const hasFieldError = (error: FieldError | undefined): boolean => {
  return !!error?.message;
};

export const getFormErrorClass = (error: FieldError | undefined): string => {
  return hasFieldError(error) ? 'border-red-400 focus:border-red-400' : '';
};

export const isFormValid = (errors: Record<string, FieldError | undefined>): boolean => {
  return Object.values(errors).every(error => !error?.message);
};

export const getFormSubmissionState = (isLoading: boolean, isSubmitting: boolean) => {
  return {
    isSubmitting: isLoading || isSubmitting,
    submitText: isLoading || isSubmitting ? 'Processing...' : 'Submit'
  };
};
