import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-th-large', path: '/admin/dashboard' },
    { id: 'transactions', label: 'Transactions', icon: 'fa-wallet', path: '/admin/transactions' },
    { id: 'users', label: 'Users', icon: 'fa-users', path: '/admin/users' },
    { id: 'lotto', label: 'Lottery Types', icon: 'fa-tags', path: '/admin/lottery-types' },
    { id: 'results', label: 'Results', icon: 'fa-trophy', path: '/admin/results' },
    { id: 'settings', label: 'Settings', icon: 'fa-cogs', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('th_lotto_user');
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-kanit">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-center border-b h-20">
           {sidebarOpen ? <span className="font-bold text-xl text-brand-dark">TH-ADMIN</span> : <span className="font-bold text-brand-dark">TH</span>}
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center p-3 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-brand-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <i className={`fas ${item.icon} ${sidebarOpen ? 'mr-3' : 'mx-auto text-xl'}`}></i>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition">
             <i className={`fas fa-sign-out-alt ${sidebarOpen ? 'mr-3' : 'mx-auto text-xl'}`}></i>
             {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-8">
           <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-800">
             <i className="fas fa-bars text-xl"></i>
           </button>
           <div className="flex items-center gap-4">
             <span className="font-bold text-sm text-gray-700">Admin</span>
             <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><i className="fas fa-user"></i></div>
           </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-50">
           {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
