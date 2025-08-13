import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, BarChart, Grid, Settings } from 'lucide-react';

const AdminNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  return (
    <nav className="bg-white shadow-sm rounded-lg p-4">
      <ul className="space-y-2">
        <li>
          <Link
            to="/admin/dashboard"
            className={`flex items-center p-2 rounded-lg transition ${isActive('dashboard') ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
          >
            <Grid className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/admin/orders"
            className={`flex items-center p-2 rounded-lg transition ${isActive('orders') ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
          >
            <Package className="w-5 h-5 mr-3" />
            Orders
          </Link>
        </li>
        <li>
          <Link
            to="/admin/analytics"
            className={`flex items-center p-2 rounded-lg transition ${isActive('analytics') ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
          >
            <BarChart className="w-5 h-5 mr-3" />
            Analytics
          </Link>
        </li>
        <li>
          <Link
            to="/admin/settings"
            className={`flex items-center p-2 rounded-lg transition ${isActive('settings') ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNav;