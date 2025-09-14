import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema, type LoginFormData } from '../schemas/validation';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

export const useLoginForm = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange', // Validate on change for better UX
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data);
      if (result.success) {
        navigate('/home');
      }
    } catch (error: unknown) {
      // The error is already a ValidationError from the context
      if (error && typeof error === 'object' && 'path' in error && 'message' in error) {
        form.setError(error.path as keyof LoginFormData, {
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
