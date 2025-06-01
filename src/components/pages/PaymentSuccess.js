import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [orderStatus, setOrderStatus] = useState('processing'); // processing, success, failed
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get parameters from both URL and location state
  const params = new URLSearchParams(location.search);
  const urlOrderId = params.get('orderId');
  const urlPaymentIntentId = params.get('paymentIntentId');
  
  // Fallback to location state if URL params are not available
  const stateData = location.state || {};
  const orderId = urlOrderId || stateData.orderId;
  const paymentIntentId = urlPaymentIntentId || stateData.paymentIntentId;

  useEffect(() => {
    const processOrder = async () => {
      // Log the incoming data
      console.log('Processing order with data:', {
        urlParams: {
          orderId: urlOrderId,
          paymentIntentId: urlPaymentIntentId
        },
        stateData: location.state,
        finalData: {
          orderId,
          paymentIntentId
        }
      });

      if (!orderId || !paymentIntentId) {
        console.error('Missing order information:', { 
          orderId, 
          paymentIntentId,
          locationState: location.state,
          urlParams: location.search
        });
        setError('Order information is missing. Please check your order history or contact support.');
        setOrderStatus('failed');
        return;
      }

      try {
        // Get the authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Authentication token missing');
          setError('Authentication required. Please log in again.');
          setOrderStatus('failed');
          return;
        }

        const verifyResponse = await axios.post(
          'http://localhost:8000/api/payment/verify',
          {
            paymentIntentId,
            orderId
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!verifyResponse.data.verified) {
          setOrderStatus('failed');
          setError('Payment verification failed. Please contact support.');
          return;
        }

        const response = await axios.post(
          'http://localhost:8000/api/order/process',
          {
            orderId,
            paymentIntentId
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setOrderStatus('success');
          localStorage.removeItem('pendingPurchase');
          setTimeout(() => {
            navigate('/orders');
          }, 3000);
        } else {
          setOrderStatus('failed');
          setError(response.data.message || 'Order processing failed. Please contact support.');
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
  }, [orderId, paymentIntentId, navigate]);

  const handleViewOrders = () => {
    navigate('/orders');
  };

  const handleContactSupport = () => {
    navigate('/contact');
  };

  return (
    <div className="payment-success-container">
      <div className="payment-success-content">
        <h2>Payment Status</h2>

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
            <p>There was an issue with your order:</p>
            <p>{error}</p>
            <div className="action-buttons">
              <button onClick={handleViewOrders} className="view-orders-btn">
                View Orders
              </button>
              <button onClick={handleContactSupport} className="contact-support-btn">
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
