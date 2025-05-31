import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [imageError, setImageError] = useState(false);

  const handleBuyNow = () => {
    if (!user) {
      // Store the product in localStorage before redirecting to login
      localStorage.setItem('pendingPurchase', JSON.stringify(product));
      navigate('/login');
      return;
    }
    navigate('/payment', { state: { product } });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {imageError ? (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        ) : (
          <img 
            src={`http://localhost:8000${product.imageUrl}`} 
            alt={product.name}
            onError={handleImageError}
          />
        )}
        {product.stock === 0 && (
          <div className="out-of-stock-badge">Out of Stock</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="price">{formatPrice(product.price)}</p>
        <p className="description">{product.description}</p>
        <div className="product-meta">
          <span className={`stock ${product.stock <= 5 ? 'low-stock' : ''}`}>
            {product.stock <= 5 && product.stock > 0 
              ? `Only ${product.stock} left!` 
              : `Stock: ${product.stock}`}
          </span>
          <button 
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className={`buy-now-btn ${product.stock === 0 ? 'disabled' : ''}`}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 