import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, BarChart3, MapPin, Home, LogOut, User, LogIn, Building2 } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-2 sm:py-4">
        {/* Mobile Layout - Two Lines - Force Mobile */}
        <div className="flex flex-col md:hidden py-2">
          {/* First Line: Logo + Company Name */}
          <div className="flex items-center justify-center space-x-3 mb-2">
            <img src="/logo.png" alt="Logo" className="h-24 w-24" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight" style={{ fontFamily: 'Noor, Arial, sans-serif' }}>
                اسواق سبت المركزية
              </h1>
            </div>
          </div>
          
          {/* Second Line: Service Text */}
          <div className="text-center">
            <p className="text-base text-gray-600 font-medium">
              {isAdminRoute ? 'لوحة تحكم الإدارة' : 'خدمة العملاء'}
            </p>
          </div>
        </div>

        {/* Desktop Layout - Single Line */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Logo" className="h-24 w-24" />
            <div>
              <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Noor, Arial, sans-serif' }}>
                اسواق سبت المركزية
              </h1>
            </div>
          </div>
          
          {/* Centered Service Text */}
          <div className="flex-1 flex justify-center">
            <p className="text-sm text-gray-600 font-medium">
              {isAdminRoute ? 'لوحة تحكم الإدارة' : 'خدمة العملاء'}
            </p>
          </div>
          
          {isAdminRoute && !isLoginPage ? (
            // Admin Navigation
            <div className="flex items-center space-x-3">
              <Link 
                to="/admin" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm font-medium">التحكم</span>
              </Link>
              <Link 
                to="/admin/branches" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">إدارة</span>
              </Link>
              <Link 
                to="/admin/branch-dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">الفروع</span>
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
                     
                     {/* Admin Login Button */}
                     <Link
                       to="/admin"
                       className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                     >
                       <LogIn className="h-4 w-4" />
                       <span className="text-sm font-medium">دخول الإدارة</span>
                     </Link>
                   </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
