import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../common/Navbar';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:8000/api/order/my-orders', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(data);
        setFilteredOrders(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc'
          ? b.totalAmount - a.totalAmount
          : a.totalAmount - b.totalAmount;
      }
      return 0;
    });

    setFilteredOrders(result);
  }, [orders, statusFilter, sortBy, sortOrder]);

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  if (loading) {
    return (
      <div className="orders-page">
        <Navbar />
        <div className="orders-container">
          <div className="loading">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <Navbar />
        <div className="orders-container">
          <div className="error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <Navbar />
      <div className="orders-container">
        <h2>My Orders</h2>
        
        {orders.length > 0 && (
          <div className="orders-controls">
            <div className="filter-control">
              <label htmlFor="status-filter">Filter by Status:</label>
              <select 
                id="status-filter" 
                value={statusFilter} 
                onChange={handleStatusFilter}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="sort-control">
              <label htmlFor="sort-by">Sort by:</label>
              <select 
                id="sort-by" 
                value={sortBy} 
                onChange={handleSort}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
              </select>
              <button 
                onClick={toggleSortOrder} 
                className="sort-order-btn"
                title={sortOrder === 'desc' ? 'Sort Descending' : 'Sort Ascending'}
              >
                {sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <p className="order-id">Order ID: {order._id}</p>
                    <p className="order-date">
                      Date: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status ${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item._id} className="order-item">
                      <img
                        src={`http://localhost:8000${item.product.imageUrl}`}
                        alt={item.product.name}
                      />
                      <div className="item-details">
                        <h4>{item.product.name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ₹{item.price}</p>
                        <p>Subtotal: ₹{item.quantity * item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <p className="total-amount">
                    Total Amount: ₹{order.totalAmount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 