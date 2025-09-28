import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField, Button } from '../../components';
import { useForgotPasswordForm } from '../../hooks';

const ForgotPasswordScreen: React.FC = () => {
  const {
    register,
    onSubmit,
    formState: { errors, isSubmitSuccessful },
    isLoading,
    isSubmitting
  } = useForgotPasswordForm();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e as any);
    setSubmitted(true);
  };

  return (
    <div className="login-screen glass-effect">
      <div className="text-center mb-6">
        <h1 className="gradient-text">Recuperar contraseña</h1>
        <p className="text-secondary">Te mandamos un mail si el usuario existe</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          name="email"
          type="email"
          label="Email"
          placeholder="Poné tu email acá"
          icon="📧"
          error={errors.email}
          register={register}
          required
        />
        <Button type="submit" disabled={isLoading || isSubmitting} size="lg">
          {isLoading || isSubmitting ? 'Enviando...' : 'Enviar enlace'}
        </Button>
      </form>

      {(isSubmitSuccessful || submitted) && (
        <div className="mt-4 text-green-500 text-center">
          Si el email existe, te mandamos un enlace para resetear la contraseña.
        </div>
      )}

      <div className="form-links mt-4">
        <p>
          ¿Te acordaste? <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;


