import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { signupSchema, type SignupFormData } from '../schemas/validation';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

export const useSignupForm = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: 'onChange', // Validate on change for better UX
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const result = await signup(data);
      if (result.success) {
        navigate('/home');
      }
    } catch (error: unknown) {
      // The error is already a ValidationError from the context
      if (error && typeof error === 'object' && 'path' in error && 'message' in error) {
        form.setError(error.path as keyof SignupFormData, {
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
