import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SignupCredentials } from '../../types';
import { useAuth } from '../../hooks';
import { Input, Button } from '../../components';

const SignupScreen: React.FC = () => {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    email: '',
    password: '',
    name: ''
  });
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signup(credentials);
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
    <div className="signup-screen">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          name="name"
          value={credentials.name}
          onChange={handleChange}
          label="Name"
          required
        />
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
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignupScreen;
