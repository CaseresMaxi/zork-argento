import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LoginCredentials } from '../../types';
import { useAuth } from '../../hooks';
import { Input, Button } from '../../components';

const LoginScreen: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(credentials);
    if (result.success) {
      navigate('/home');
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
    <div className="login-screen">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          name="email"
          value={credentials.email}
          onChange={handleChange}
          label="Email"
          required
        />
        <Input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          label="Password"
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

export default LoginScreen;
