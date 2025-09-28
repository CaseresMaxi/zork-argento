import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginForm } from '../../hooks';
import { useAuth } from '../../hooks';
import { FormField, Button } from '../../components';

const LoginScreen: React.FC = () => {
  const {
    register,
    onSubmit,
    formState: { errors },
    isLoading,
    isSubmitting
  } = useLoginForm();
  const { loginWithGoogle } = useAuth();


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
        <Button 
          onClick={loginWithGoogle}
          variant="google"
          disabled={isLoading || isSubmitting}
          size="lg"
          className="mt-2"
        >
          <svg className="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
            s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.082,4,24,4C12.955,4,4,12.955,4,24
            s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039
            l5.657-5.657C33.64,6.053,29.082,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.167,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
            c-5.188,0-9.594-3.317-11.258-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.093,5.571
            c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Continuar con Google
        </Button>
      </form>
      
      <div className="form-links">
        <p>
          ¿No tenés cuenta? <Link to="/signup">Creá una acá</Link>
        </p>
        <p className="mt-2">
          ¿Te olvidaste la contraseña? <Link to="/forgot-password">Recuperala acá</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
