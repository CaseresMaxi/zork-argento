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
        <h1 className="gradient-text">Create Account</h1>
        <p className="text-secondary">Join us and start your journey</p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          name="name"
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          icon="👤"
          error={errors.name}
          register={register}
          required
        />
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
          placeholder="Create a strong password"
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
          {isLoading || isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      
      <div className="form-links">
        <p>
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupScreen;
