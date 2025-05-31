import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../redux/productSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../common/SideBar';
import './AdminProduct.css';

const AdminProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading, error } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    image: null,
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/login');
      return;
    }
    dispatch(fetchProducts());
  }, [dispatch, user, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      setFormError('Image is required');
      return;
    }

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, val]) => form.append(key, val));

      const token = localStorage.getItem('token');
      if (!token) {
        setFormError('Authentication token missing');
        return;
      }

      const res = await axios.post('http://localhost:8000/api/product', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(fetchProducts());
      setFormData({ name: '', price: '', description: '', stock: '', image: null });
      setFormError('');
      setShowAddForm(false);
      alert(res.data.message || 'Product added successfully');
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Error adding product');
    }
  };

  const handleDelete = async (productId) => {
    if (!user || user.role !== 'Admin') {
      setFormError('Admin access required');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      await dispatch(deleteProduct(productId)).unwrap();
      dispatch(fetchProducts());
    } catch (err) {
      setFormError(err.message || 'Failed to delete product');
    }
  };

  const handleEdit = (productId) => {
    navigate(`/admin/product/edit/${productId}`);
  };

  if (!user || user.role !== 'Admin') {
    return null;
  }

  return (
    <div className="admin-product-page">
      <Sidebar />
      <div className="product-content">
        <div className="product-header">
          <h2>Manage Products</h2>
          <button 
            className="add-product-btn"
            onClick={() => setShowAddForm(true)}
          >
            Add New Product
          </button>
        </div>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Product</h3>
                <button 
                  className="close-button"
                  onClick={() => setShowAddForm(false)}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="product-form">
                {formError && <p className="error-message">{formError}</p>}
                <div className="form-group">
                  <input
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    name="stock"
                    type="number"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    name="image"
                    type="file"
                    onChange={handleChange}
                    accept="image/*"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    Add Product
                  </button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && <p>Loading products...</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Image</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>₹{product.price}</td>
                  <td>
                    {product.imageUrl && (
                      <img
                        src={`http://localhost:8000${product.imageUrl}`}
                        alt={product.name}
                        width="50"
                      />
                    )}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(product._id)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products?.length === 0 && (
                <tr>
                  <td colSpan="5">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProduct;
