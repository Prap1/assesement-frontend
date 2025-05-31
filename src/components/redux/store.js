import { configureStore } from '@reduxjs/toolkit';
import authReducer from './AuthSlice';
import productReducer from './productSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
  },
});
