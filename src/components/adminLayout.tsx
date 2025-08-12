import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNav from './AdminNav';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 p-4 border-r">
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;