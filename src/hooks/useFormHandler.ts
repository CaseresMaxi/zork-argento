import { useForm, type FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ObjectSchema } from 'yup';

interface UseFormHandlerOptions<T extends FieldValues> {
  schema: ObjectSchema<any>;
  defaultValues?: T;
  onSubmit: (data: T) => Promise<void>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}

export const useFormHandler = <T extends FieldValues = FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  mode = 'onChange'
}: UseFormHandlerOptions<T>) => {
  const form = useForm<T>({
    resolver: yupResolver(schema) as any,
    mode,
    defaultValues: defaultValues as any
  });

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    try {
      await form.handleSubmit(onSubmit as any)(e);
    } catch (error: unknown) {
      // Handle validation errors from the onSubmit function
      if (error && typeof error === 'object' && 'path' in error && 'message' in error) {
        form.setError(error.path as any, {
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
