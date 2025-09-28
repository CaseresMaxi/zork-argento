import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { resetPasswordSchema, type ResetPasswordFormData } from '../schemas/validation';
import { useAuth } from './useAuth';

export const useForgotPasswordForm = () => {
  const { resetPassword, isLoading } = useAuth();

  const form = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data.email);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'path' in error && 'message' in error) {
        form.setError(error.path as keyof ResetPasswordFormData, {
          type: 'manual',
          message: error.message as string
        });
      }
    }
  };

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading,
    isSubmitting: form.formState.isSubmitting
  };
};


