import React from 'react';
import { Home, Info, Phone, Settings, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  open?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, open = true, onClose }) => {
  const menuItems = [
    { id: 'farm', label: 'Farm', icon: Home },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact Us', icon: Phone },
    { id: 'dashboard', label: 'Dashboard', icon: Settings },
  ];

  return (
    <div
      className={`
        fixed left-0 top-0 z-20 w-64 bg-white shadow-lg h-screen
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
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
    </div>
  );
};

export default Sidebar;