import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginUser, setUser } from '../redux/AuthSlice';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const res = await dispatch(loginUser(data));

      if (res.meta.requestStatus === 'fulfilled') {
        const { token, ...user } = res.payload;

        if (token) {
          // Store in localStorage for session persistence
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          dispatch(setUser(user));

          const decoded = jwtDecode(token);
          const role = decoded?.role;

          // Check for pending purchase
          const pendingPurchase = localStorage.getItem('pendingPurchase');
          if (pendingPurchase) {
            localStorage.removeItem('pendingPurchase');
            navigate('/payment', {
              state: {
                product: JSON.parse(pendingPurchase),
              },
            });
            return;
          }

          // Role-based navigation
          if (role === 'Admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } else {
          setServerError('Token missing in response');
        }
      } else {
        setServerError(res.payload || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setServerError('An unexpected error occurred');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)} className="login-form">
        <h2>Login</h2>
        {(error || serverError) && (
          <p className="error-message">{error || serverError}</p>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            type="email"
            placeholder="Enter your email"
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            {...register('password', {
              required: 'Password is required',
            })}
            type="password"
            placeholder="Enter your password"
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
