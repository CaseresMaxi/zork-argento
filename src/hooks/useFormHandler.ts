import { useForm, UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ObjectSchema } from 'yup';

interface UseFormHandlerOptions<T> {
  schema: ObjectSchema<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<void>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

export const useFormHandler = <T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
  mode = 'onChange'
}: UseFormHandlerOptions<T>): UseFormReturn<T> & {
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
} => {
  const form = useForm<T>({
    resolver: yupResolver(schema),
    mode,
    defaultValues
  });

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    try {
      await form.handleSubmit(onSubmit)(e);
    } catch (error: unknown) {
      // Handle validation errors from the onSubmit function
      if (error && typeof error === 'object' && 'path' in error && 'message' in error) {
        form.setError(error.path as keyof T, {
          type: 'manual',
          message: error.message as string
        });
      }
    }
  };

  return {
    ...form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting
  };
};
