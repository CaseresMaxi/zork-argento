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
        <h1 className="gradient-text">Welcome Back</h1>
        <p className="text-secondary">Sign in to your account</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          name="email"
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          icon="📧"
          error={errors.email}
          register={register}
          required
        />
        <FormField
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
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
          {isLoading || isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      
      <div className="form-links">
        <p>
          Don't have an account? <Link to="/signup">Create one here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
