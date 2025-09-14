import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginForm } from '../../hooks';
import { FormField, Button } from '../../components';

const LoginScreen: React.FC = () => {
  const {
    register,
    onSubmit,
    formState: { errors },
    isLoading,
    isSubmitting
  } = useLoginForm();


  return (
    <div className="login-screen glass-effect">
      <div className="text-center mb-6">
        <h1 className="gradient-text">¡Che, volviste!</h1>
        <p className="text-secondary">Entrá a tu cuenta, dale</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
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
        <FormField
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Tu contraseña, por favor"
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
          {isLoading || isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      
      <div className="form-links">
        <p>
          ¿No tenés cuenta? <Link to="/signup">Creá una acá</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
