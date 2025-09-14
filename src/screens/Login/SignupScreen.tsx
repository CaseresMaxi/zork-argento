import React from 'react';
import { Link } from 'react-router-dom';
import { useSignupForm } from '../../hooks';
import { FormField, Button } from '../../components';

const SignupScreen: React.FC = () => {
  const {
    register,
    onSubmit,
    formState: { errors },
    isLoading,
    isSubmitting
  } = useSignupForm();

  return (
    <div className="signup-screen glass-effect">
      <div className="text-center mb-6">
        <h1 className="gradient-text">¡Dale, sumate!</h1>
        <p className="text-secondary">Creá tu cuenta y empezá la aventura</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          name="name"
          type="text"
          label="Nombre completo"
          placeholder="Cómo te llamás vos"
          icon="👤"
          error={errors.name}
          register={register}
          required
        />
        <FormField
          name="email"
          type="email"
          label="Email"
          placeholder="Tu email, dale"
          icon="📧"
          error={errors.email}
          register={register}
          required
        />
        <FormField
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Una contraseña copada, eh"
          icon="🔒"
          error={errors.password}
          register={register}
          required
        />
        <Button 
          type="submit" 
          disabled={isLoading || isSubmitting}
          size="lg"
        >
          {isLoading || isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
      
      <div className="form-links">
        <p>
          ¿Ya tenés cuenta? <Link to="/login">Entrá acá</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;
