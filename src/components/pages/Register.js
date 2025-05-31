import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register as registerUser } from '../redux/AuthSlice';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const userData = { 
        ...data, 
        role: 'User' // Force role as "User"
      };
      const res = await dispatch(registerUser(userData));
      if (res.meta.requestStatus === 'fulfilled') {
        navigate('/login');
      } else if (res.error) {
        setServerError(res.error.message || 'Registration failed');
      }
    } catch (err) {
      setServerError('An unexpected error occurred');
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit(onSubmit)} className="register-form">
        <h2>Register</h2>
        {(error || serverError) && (
          <p className="error-message">{error || serverError}</p>
        )}
        
        <div className="form-group">
          <label>Name</label>
          <input 
            {...register('name', { 
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })} 
            placeholder="Enter your name" 
          />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input 
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
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
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters'
              }
            })} 
            type="password" 
            placeholder="Enter your password" 
          />
          {errors.password && <span className="error">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label>Address</label>
          <input 
            {...register('address')} 
            placeholder="Enter your address" 
          />
        </div>

        <div className="form-group">
          <label>City</label>
          <input 
            {...register('city')} 
            placeholder="Enter your city" 
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input 
            {...register('state')} 
            placeholder="Enter your state" 
          />
        </div>

        <div className="form-group">
          <label>Postal Code</label>
          <input 
            {...register('postalCode', {
              pattern: {
                value: /^[0-9]{6}$/,
                message: 'Postal code must be 6 digits'
              }
            })} 
            placeholder="Enter your postal code" 
          />
          {errors.postalCode && <span className="error">{errors.postalCode.message}</span>}
        </div>

        <button type="submit" disabled={loading} className="register-button">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
