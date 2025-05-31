import React from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../common/SideBar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}</h1>
          <p>Here's an overview of your store</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
