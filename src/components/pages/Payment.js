// File: src/pages/Payment.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import Navbar from '../common/Navbar';
import './Payment.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const product = location.state?.product;
    if (!product) {
      navigate('/');
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.post(
          'http://localhost:8000/api/payment/create-payment-intent',
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClientSecret(data.clientSecret);
        setAmount(data.amount);
        setOrderId(data.orderId); // ✅ orderId returned from backend
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
        <div className="error">{error}</div>
        <button onClick={() => navigate('/')} className="retry-btn">Return to Home</button>
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
            <img src={`http://localhost:8000${location.state.product.imageUrl}`} alt="product" />
            <h4>{location.state.product.name}</h4>
            <p className="price">₹{amount}</p>
          </div>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                product={location.state.product}
                amount={amount}
                clientSecret={clientSecret}
                orderId={orderId}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentForm = ({ product, amount, clientSecret, orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) return;

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        const token = localStorage.getItem('token');

        // ✅ Step 1: Process the order (marks it as completed)
        await axios.post(
          'http://localhost:8000/api/order/process',
          {
            orderId: orderId,
            paymentIntentId: paymentIntent.id,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // ✅ Step 2: Fetch the processed order
        const { data: order } = await axios.get(
          `http://localhost:8000/api/payment/order-status/${paymentIntent.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (order.status === 'completed') {
          navigate('/payment-success', {
            state: {
              orderId: order._id,
              amount,
              product,
              paymentIntentId: paymentIntent.id,
            },
          });
        } else {
          setError('Payment succeeded, but order processing failed.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed.');
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <CardElement className="card-element" />
      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={!stripe || processing} className="pay-button">
        {processing ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </form>
  );
};

export default Payment;
