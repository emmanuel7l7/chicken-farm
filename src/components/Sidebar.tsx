import React from 'react';
import { Home, Info, Phone, Settings, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  open?: boolean;
  onClose?: () => void;
  rightOnMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, open = true, onClose, rightOnMobile }) => {
  const { user, logout, isAuthenticated } = useAuth();

  const menuItems = [
    { id: 'farm', label: 'Farm', icon: Home },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact Us', icon: Phone },
  ];

  // Only show dashboard for admin users
  if (isAuthenticated && user?.role === 'admin') {
    menuItems.push({ id: 'dashboard', label: 'Dashboard', icon: Settings });
  }

  return (
    <div
      className={`
        fixed top-0 ${rightOnMobile ? 'right-0' : 'left-0'} z-20 w-64 bg-white shadow-lg h-screen
        transition-transform duration-300
        ${rightOnMobile
          ? open ? 'translate-x-0' : 'translate-x-full'
          : open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
      `}
      style={{ minWidth: '16rem' }}
    >
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-600">Chicken Farm</h2>
        {/* Close button for mobile */}
        {onClose && (
          <button
            className="md:hidden ml-2 p-1 rounded hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        )}
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-primary-50 transition-colors ${
                activeTab === item.id
                  ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-500'
                  : 'text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      {/* User Info and Logout */}
      {isAuthenticated && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center mb-3">
            <User className="w-8 h-8 text-gray-400 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;