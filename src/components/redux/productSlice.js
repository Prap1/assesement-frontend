import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = 'http://localhost:8000/api/product';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Get token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return { Authorization: `Bearer ${token}` };
};

// Fetch all products
export const fetchProducts = createAsyncThunk('product/fetchAll', async () => {
  const res = await axios.get(`${API}/get`);
  return res.data;
});

// Add new product with image
export const addProduct = createAsyncThunk('product/add', async (productData, thunkAPI) => {
  try {
    const headers = {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeader(),
    };
    
    const res = await axios.post(API, productData, { headers });
    return res.data.product;
  } catch (err) {
    console.error('Add product error:', err.response?.data);
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add product');
  }
});

// Update product
export const updateProduct = createAsyncThunk('product/update', async ({ id, productData }, thunkAPI) => {
  try {
    const headers = {
      'Content-Type': 'multipart/form-data',
      ...getAuthHeader(),
    };
    
    const res = await axios.put(`${API}/${id}`, productData, { headers });
    return res.data.product;
  } catch (err) {
    console.error('Update product error:', err.response?.data);
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to update product');
  }
});

// Delete product
export const deleteProduct = createAsyncThunk('product/delete', async (id, thunkAPI) => {
  try {
    const headers = getAuthHeader();
    const res = await axios.delete(`${API}/${id}/delete`, { headers });
    return id;
  } catch (err) {
    console.error('Delete error:', err.response?.data);
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to delete product');
  }
});

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })

      // Add
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
        state.loading = false;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Update
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Delete
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default productSlice.reducer;
