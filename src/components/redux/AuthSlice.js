import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.withCredentials = true;

const API = 'http://localhost:8000/api/auth';

const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || storedUser === 'undefined') return null;
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const initialState = {
  user: getInitialUser(),
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (data, thunkAPI) => {
  try {
    const res = await axios.post(`${API}/login`, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data, thunkAPI) => {
  try {
    const res = await axios.post(`${API}/register`, data);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await axios.post(`${API}/logout`);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Logout failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { token, ...user } = action.payload;
        state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        state.loading = false;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        const { token, ...user } = action.payload;
        state.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        state.loading = false;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        state.loading = false;
        state.error = null;
      })
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { setUser } = authSlice.actions;

export default authSlice.reducer;
