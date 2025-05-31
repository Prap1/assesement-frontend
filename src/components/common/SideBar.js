import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../redux/AuthSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const activeStyle = {
    backgroundColor: '#007bff',
    color: 'white',
  };

  return (
    <div style={{
      width: '220px',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <h2 style={{ marginBottom: '30px' }}>Admin Panel</h2>
      <nav style={{ flexGrow: 1 }}>
        <NavLink
          to="/admin/product"
          style={({ isActive }) => ({
            display: 'block',
            padding: '10px',
            marginBottom: '10px',
            textDecoration: 'none',
            color: '#333',
            borderRadius: '4px',
            ...(isActive ? activeStyle : {})
          })}
        >
          Products
        </NavLink>
      </nav>
      <button
        onClick={handleLogout}
        style={{
          marginTop: 'auto',
          padding: '10px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
