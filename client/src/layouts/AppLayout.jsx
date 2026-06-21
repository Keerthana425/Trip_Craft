import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Plan Trip', path: '/create-trip', icon: 'auto_awesome' },
    { name: 'Expense Tracker', path: '/expenses', icon: 'payments' },
    { name: 'AI Assistant', path: '/assistant', icon: 'chat' }
  ];

  return (
    <div className="min-h-screen bg-background text-on-background flex">
      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 w-full z-50 h-16 bg-surface-container-low border-b border-outline-variant/10 flex items-center justify-between px-6">
        <div className="flex flex-col">
          <span className="text-headline-md font-headline-md font-bold text-primary leading-none">TripCraft AI</span>
          <span className="text-[10px] text-on-surface-variant font-label-sm opacity-60">Travel Intelligence</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-6 
        transition-transform duration-300 md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="px-6 mb-10 hidden md:block">
          <h1 className="text-headline-md font-headline-md font-bold text-primary">TripCraft AI</h1>
          <p className="text-label-sm font-label-sm text-on-surface-variant mt-1 opacity-60 font-medium">Travel Intelligence</p>
        </div>

        {/* Mobile menu spacer */}
        <div className="h-10 md:hidden"></div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-150 font-label-sm text-label-sm
                ${isActive 
                  ? 'bg-primary-container text-on-primary-container font-semibold translate-x-1 shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
                }
              `}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info / Sign Out */}
        <div className="mt-auto border-t border-outline-variant/10 pt-4 px-4 mx-2">
          <div className="flex items-center gap-3 px-2 py-3 bg-surface-container-high/40 rounded-xl mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary font-headline-md">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-sm font-label-sm font-semibold truncate text-on-surface leading-tight">
                {user?.username}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate opacity-70">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-error hover:bg-error-container/20 rounded-lg px-4 py-2.5 transition-all text-label-sm font-label-sm"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-background/60 backdrop-blur-sm md:hidden"
        ></div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:pt-0 pt-16 h-screen overflow-y-auto custom-scrollbar flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
