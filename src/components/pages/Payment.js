import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import Navbar from '../common/Navbar';
import './Payment.css';

// Initialize Stripe with error handling
let stripePromise;
try {
  const STRIPE_PUBLISHABLE_KEY = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Stripe publishable key is missing');
  }
  stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const product = location.state?.product;
    
    if (!product) {
      navigate('/');
      return;
    }

    if (!stripePromise) {
      setError('Payment system is not available. Please try again later.');
      setLoading(false);
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(
          'http://localhost:8000/api/payment/create-payment-intent',
          { 
            productId: product._id,
            quantity: 1
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setClientSecret(data.clientSecret);
        setAmount(data.amount);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize payment');
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [location.state, navigate]);

  if (loading) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="loading">Initializing payment...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="error">
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="retry-btn">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="error">
          <p>Payment system is not available. Please try again later.</p>
          <button onClick={() => navigate('/')} className="retry-btn">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-container">
        <h2>Complete Your Purchase</h2>
        <div className="payment-content">
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="product-details">
              <img 
                src={`http://localhost:8000${location.state.product.imageUrl}`} 
                alt={location.state.product.name} 
              />
              <div className="product-info">
                <h4>{location.state.product.name}</h4>
                <p className="price">₹{amount}</p>
              </div>
            </div>
          </div>
          
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm 
                product={location.state.product}
                amount={amount}
                clientSecret={clientSecret}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentForm = ({ product, amount, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Check order status
        const { data: order } = await axios.get(
          `http://localhost:8000/api/payment/order-status/${paymentIntent.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (order.status === 'completed') {
          navigate('/payment-success', {
            state: {
              orderId: order._id, // <-- FIXED
              amount: amount,
              product: product,
              paymentIntentId: paymentIntent.id, // <-- FIXED
            }
          });
        } else {
          setError('Payment successful but order processing failed. Please contact support.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    }

    setProcessing(false);
  };

  return (
    <div className="payment-form">
      <h3>Payment Details</h3>
      <form onSubmit={handleSubmit}>
        <div className="card-element-container">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          disabled={!stripe || processing}
          className="pay-button"
        >
          {processing ? 'Processing...' : `Pay ₹${amount}`}
        </button>
      </form>
    </div>
  );
};

export default Payment; 