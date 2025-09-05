import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, BarChart3, MapPin, Home, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Header = () => {
  const location = useLocation();
  const { isAuthenticated, admin, logout } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname === '/admin/login';

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="h-16 w-16" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Noor, Arial, sans-serif' }}>
                اسواق سبت المركزية
              </h1>
              <p className="text-sm text-gray-600">
                {isAdminRoute ? 'لوحة تحكم الإدارة' : 'خدمة العملاء'}
              </p>
            </div>
          </div>
          
          {isAdminRoute && !isLoginPage ? (
            // Admin Navigation
            <div className="flex items-center space-x-6">
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm font-medium">لوحة التحكم</span>
              </Link>
              <Link 
                to="/admin/branches" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">إدارة الفروع</span>
              </Link>
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="text-sm font-medium">واجهة العملاء</span>
              </Link>
              
              {/* Admin User Info & Logout */}
              {isAuthenticated && admin && (
                <div className="flex items-center space-x-4 border-r pr-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{admin.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : !isLoginPage ? (
            // Customer Navigation
            <div className="flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-medium">تقديم شكوى</span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
