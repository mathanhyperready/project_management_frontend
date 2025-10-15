import React from 'react';
import { useAuth } from '../../hooks/useAuth';

export const Topbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="md:ml-64 flex-shrink-0 flex h-16 bg-white shadow">
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <button
            onClick={logout}
            className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="sr-only">Logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};