import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { SignupCredentials } from '../../types';
import { useAuth } from '../../hooks';
import { Input, Button } from '../../components';

const SignupScreen: React.FC = () => {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState<string>('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await signup(credentials);
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="signup-screen glass-effect">
      <div className="text-center mb-6">
        <h1 className="gradient-text">Create Account</h1>
        <p className="text-secondary">Join us and start your journey</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <Input
          type="text"
          name="name"
          value={credentials.name}
          onChange={handleChange}
          label="Full Name"
          placeholder="Enter your full name"
          required
          icon="👤"
        />
        <Input
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          label="Email Address"
          placeholder="Enter your email"
          required
          icon="📧"
        />
        <Input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          label="Password"
          placeholder="Create a strong password"
          required
          icon="🔒"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
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
