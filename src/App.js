import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import EditProduct from './components/pages/EditProduct';
import Payment from './components/pages/Payment';
import PaymentSuccess from './components/pages/PaymentSuccess';
import Orders from './components/pages/Orders';
import './App.css';
import AdminDashboard from './components/pages/AdminDashboard';
import AdminProductPage from './components/pages/AdminProduct';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  
  // if (!user) {
  //   return <Navigate to="/login" />;
  // }

  if (adminOnly && user.role !== 'Admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="/admin/product"  element={ <AdminProductPage />} />
        
        <Route 
          path="/admin/product/edit/:id" 
          element={
            <PrivateRoute adminOnly={true}>
              <EditProduct />
            </PrivateRoute>
          } 
        />
        
        {/* Protected User Routes */}
        <Route 
          path="/payment" 
          element={
            <PrivateRoute>
              <Payment />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/payment-success" 
          element={
            <PrivateRoute>
              <PaymentSuccess />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
