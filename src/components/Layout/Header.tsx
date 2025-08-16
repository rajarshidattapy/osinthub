import React from 'react';
import { Search, Bell, Settings, GitFork } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

interface HeaderProps {
  currentPage?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage = 'Repositories' }) => {
  const { user } = useUser();

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <GitFork className="w-8 h-8 text-white" />
            <span className="text-xl font-bold text-white">OSINT Hub</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 ml-8">
            <a href="#" className={`text-gray-300 hover:text-white transition-colors ${currentPage === 'Repositories' ? 'text-white font-medium' : ''}`}>
              Repositories
            </a>
            <a href="#" className={`text-gray-300 hover:text-white transition-colors ${currentPage === 'Issues' ? 'text-white font-medium' : ''}`}>
              Issues
            </a>
            <a href="#" className={`text-gray-300 hover:text-white transition-colors ${currentPage === 'Pull Requests' ? 'text-white font-medium' : ''}`}>
              Pull Requests
            </a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              className="bg-gray-800 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64"
            />
          </div>
          
          <button className="relative p-2 text-gray-300 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-2 text-gray-300 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
            {user && (
              <span className="text-white text-sm font-medium hidden sm:block">
                {user.username || user.firstName}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};