import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Clock, 
  Calendar, 
  Users, 
  UserCog, 
  Building2 
} from 'lucide-react';
import { BiSolidReport } from "react-icons/bi";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Timesheet', href: '/timesheet', icon: Clock },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'User', href: '/user', icon: Users },
  { name: 'Role', href: '/role', icon: UserCog },
  { name: 'Client', href: '/client', icon: Building2 },
  { name: 'Report', href: '/report', icon: BiSolidReport },
  { name: 'Role Permission', href: '/rolepermission', icon: UserCog },
];

// const navigation = [
//   { name: 'Dashboard', href: '/', icon: '📊' },
//   { name: 'Projects', href: '/projects', icon: '📁' },
//   { name: 'Timesheet', href: '/', icon: '✅' },
//   { name: 'Calendar', href: '/calendar', icon: '📅' },
//   { name: 'User', href: '/user', icon: '👥' },
//   { name: 'Role', href: '/role', icon: '👤' },
//   { name: 'Client', href: '/client', icon: '🤝' },
// ];

const adminNavigation = [
  { name: 'Users', href: '/admin/users', icon: '👥' },
];

export const Sidebar: React.FC = () => {
  const { u_name } = useAuth();
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div style={{ width: "250px", backgroundColor: "#f8f9fa" }}>
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-primary-600">TaskFlow</h1>
          </div>
          <nav className="mt-5 flex-1 px-4 bg-white space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg"><item.icon className="w-5 h-5" /></span>
                {item.name}
              </Link>
            ))}
            
            {u_name?.role === 'admin' && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </p>
                </div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium">
                  {u_name?.user_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-700">{u_name?.email}</p>
              <p className="text-xs font-medium text-gray-500 capitalize">{u_name?.rolename}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
     </div>
  );
};