import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateProduct, fetchProducts } from '../redux/productSlice';
import Sidebar from '../common/SideBar';
import './AdminProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((state) => state.product);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    image: null,
  });
  const [currentImage, setCurrentImage] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const product = products.find(p => p._id === id);
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        stock: product.stock.toString(),
        image: null,
      });
      setCurrentImage(product.imageUrl);
    }
  }, [products, id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      // Ensure numeric values are properly handled
      if (name === 'price' || name === 'stock') {
        const numValue = value === '' ? '' : Number(value);
        setFormData({ ...formData, [name]: numValue });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      
      // Convert numeric values to strings for FormData
      const dataToSubmit = {
        ...formData,
        price: formData.price.toString(),
        stock: formData.stock.toString()
      };

      // Append all form data
      Object.entries(dataToSubmit).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          form.append(key, value);
        }
      });

      await dispatch(updateProduct({ id, productData: form })).unwrap();
      navigate('/admin/product');
    } catch (err) {
      setFormError(err.message || 'Failed to update product');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-product-page">
      <Sidebar />
      <div className="product-content">
        <div className="product-header">
          <h2>Edit Product</h2>
        </div>

        <div className="modal-overlay" style={{ position: 'relative', display: 'block' }}>
          <div className="modal-content" style={{ position: 'relative', margin: '0 auto' }}>
            <div className="modal-header">
              <h3>Edit Product Details</h3>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              {formError && <p className="error-message">{formError}</p>}
              
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Current Image:</label>
                {currentImage && (
                  <div className="current-image">
                    <img 
                      src={`http://localhost:8000${currentImage}`} 
                      alt="Current product" 
                      style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '0.5rem' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>New Image (optional):</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/*"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Update Product
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => navigate('/admin/product')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct; 