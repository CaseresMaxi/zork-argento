import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginCredentials } from '../../types';
import { useAuth } from '../../hooks';
import { Input, Button } from '../../components';

const LoginScreen: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await login(credentials);
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error || 'Login failed');
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
    <div className="login-screen glass-effect">
      <div className="text-center mb-6">
        <h1 className="gradient-text">Welcome Back</h1>
        <p className="text-secondary">Sign in to your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
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
          placeholder="Enter your password"
          required
          icon="🔒"
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          size="lg"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
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
