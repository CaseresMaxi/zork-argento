import React from 'react';
import type { UseFormRegister, FieldError } from 'react-hook-form';
import { Input } from '../common';

interface FormFieldProps {
  name: string;
  type?: 'text' | 'email' | 'password' | 'number';
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: FieldError;
  register: UseFormRegister<any>;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  type = 'text',
  label,
  placeholder,
  icon,
  error,
  register,
  required = false
}) => {
  return (
    <Input
      type={type}
      label={label}
      placeholder={placeholder}
      icon={icon}
      error={error?.message}
      required={required}
      {...register(name)}
    />
  );
};
