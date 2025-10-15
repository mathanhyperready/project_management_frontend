import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useFormState } from '../../../hooks/useFormState';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { validateEmail, validatePassword, validateRequired } from '../../../utils/validators';

const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const { formData, errors, updateField, setError: setFieldError } = useFormState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'manager',
  });

  const validateForm = (): boolean => {
    let isValid = true;

    if (!validateRequired(formData.name)) {
      setFieldError('name', 'Name is required');
      isValid = false;
    }

    if (!validateEmail(formData.email)) {
      setFieldError('email', 'Please enter a valid email address');
      isValid = false;
    }

    if (!validatePassword(formData.password)) {
      setFieldError('password', 'Password must be at least 6 characters long');
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      setFieldError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900">Sign Up</h3>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              <Input
                label="Full Name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={errors.name}
                placeholder="Enter your full name"
              />

              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                placeholder="Enter your email"
              />

              <Select
                label="Role"
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value as 'user' | 'manager')}
                options={[
                  { value: 'user', label: 'User' },
                  { value: 'manager', label: 'Manager' },
                ]}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                error={errors.password}
                placeholder="Enter your password"
              />

              <Input
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="Confirm your password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Create Account
              </Button>

              <div className="text-sm text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  to="/auth/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;