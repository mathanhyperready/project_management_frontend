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
    user_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'manager',
  });

  const validateForm = (): boolean => {
    let isValid = true;

    if (!validateRequired(formData.user_name)) {
      setFieldError('user_name', 'Name is required');
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
        user_name: formData.user_name,
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
              <label>Full Name</label>
              <Input
                type="text"
                autoComplete="name"
                required
                value={formData.user_name}
                onChange={(e) => updateField('user_name', e.target.value)}
                placeholder="Enter your full name"
              />
              <div>
                {errors.user_name}
              </div>
              
              <label>
                Email address
              </label>
              <Input
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="Enter your email"
              />
              <div>
                {errors.email}
              </div>

              <Select
                label="Role"
                value={formData.role}
                onChange={(e) => updateField('role', e.target.value as 'user' | 'manager')}
                options={[
                  { value: 'user', label: 'User' },
                  { value: 'manager', label: 'Manager' },
                ]}
              />
              <label>Password</label>
              <Input
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                
                placeholder="Enter your password"
              />
              <div>
                {errors.password}
              </div>

              <label>
                Confirm Password
              </label>
              <Input
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
              />
              <div>
                {errors.confirmPassword}
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full bg-red-400"
              >
                Create Account
              </Button>

              <div className="text-sm text-center">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  to="/auth/login"
                  className="font-medium text-primary-600 hover:text-primary-500 "
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