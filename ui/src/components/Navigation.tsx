import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../store/authStore';
import { Users, FolderOpen, Calendar, BarChart3, LogOut, User, Menu, X } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const allNavigationItems = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Engineers', href: '/engineers', icon: Users, managerOnly: true },
    { name: 'Projects', href: '/projects', icon: FolderOpen, managerOnly: true },
    { name: 'Assignments', href: '/assignments', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User, engineerOnly: true },
  ];

  const navigationItems = allNavigationItems.filter(item => {
    if (item.managerOnly && user?.role !== 'manager') return false;
    if (item.engineerOnly && user?.role !== 'engineer') return false;
    return true;
  });

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">Engineering Resource Manager</span>
                <span className="sm:hidden">ERM</span>
              </h1>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4 lg:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    <span className="hidden lg:inline">{item.name}</span>
                    <span className="lg:hidden">{item.name.split(' ')[0]}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - User info and Mobile menu button */}
          <div className="flex items-center space-x-2">
            {/* Desktop User Info */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-xs sm:text-sm text-gray-700 truncate max-w-32 lg:max-w-none">
                <span className="hidden lg:inline">{user?.name}</span>
                <span className="lg:hidden">{user?.name?.split(' ')[0]}</span>
                <span className="text-gray-500"> ({user?.role})</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>

            {/* Mobile User Info - Just logout button */}
            <div className="sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMobileMenuToggle}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleMobileLinkClick}
                    className={`flex items-center px-3 py-2 text-base font-medium ${
                      isActive(item.href)
                        ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-gray-200 mt-2">
                <div className="flex items-center">
                  <User className="w-5 h-5 mr-3 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-800">{user?.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{user?.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}