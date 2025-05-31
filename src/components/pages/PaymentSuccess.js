import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [orderStatus, setOrderStatus] = useState('processing');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, paymentId, sessionId } = location.state || {};

  useEffect(() => {
    const processOrder = async () => {
      if (!orderId || !sessionId) {
        setError('Order information is missing');
        return;
      }

      try {
        // First verify the payment session
        const verifyResponse = await axios.post('http://localhost:8000/api/payments/verify', {
          sessionId,
          orderId
        });

        if (!verifyResponse.data.verified) {
          setOrderStatus('failed');
          setError('Payment verification failed');
          return;
        }

        // Then process the order
        const response = await axios.post('http://localhost:8000/api/orders/process', {
          orderId,
          sessionId
        });

        if (response.data.success) {
          setOrderStatus('success');
          // Clear any pending purchase data
          localStorage.removeItem('pendingPurchase');
          // Redirect after 3 seconds
          setTimeout(() => {
            navigate('/orders');
          }, 3000);
        } else {
          setOrderStatus('failed');
          setError(response.data.message || 'Order processing failed');
        }
      } catch (err) {
        console.error('Order processing error:', err);
        setOrderStatus('failed');
        setError(
          err.response?.data?.message || 
          'There was an issue processing your order. Please contact support with your order ID: ' + orderId
        );
      }
    };

    processOrder();
  }, [orderId, sessionId, navigate]);

  return (
    <div className="payment-success-container">
      <div className="payment-success-content">
        <h2>Payment Successful!</h2>
        {orderStatus === 'processing' && (
          <div className="processing-message">
            <p>Processing your order...</p>
            <div className="loading-spinner"></div>
          </div>
        )}
        {orderStatus === 'success' && (
          <div className="success-message">
            <p>Your order has been successfully processed!</p>
            <p>Redirecting to your orders...</p>
          </div>
        )}
        {orderStatus === 'failed' && (
          <div className="error-message">
            <p>Payment was successful, but there was an issue processing your order.</p>
            <p>{error}</p>
            <div className="action-buttons">
              <button onClick={() => navigate('/orders')} className="view-orders-btn">
                View Orders
              </button>
              <button onClick={() => navigate('/contact')} className="contact-support-btn">
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess; 