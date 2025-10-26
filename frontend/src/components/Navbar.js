import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/theme';
import AutoCompleteSearch from './Search';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="bg-dark-card border-b border-dark-border shadow-lg fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '100rem' }}>
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group transition-transform duration-200 hover:scale-105"
          >
            <svg className="h-10 w-10 logo-svg" viewBox="0 0 400 560" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="400" height="560" rx="20" fill="#5D001E"/>
              <text x="200" y="200" fontSize="240" fontWeight="bold" textAnchor="middle" fill="#F5F1E8">A</text>
              <text x="60" y="400" fontSize="80" fill="#F5F1E8">♠</text>
              <text x="300" y="480" fontSize="80" fill="#F5F1E8">♠</text>
            </svg>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-bold text-beige-light group-hover:text-maroon transition-colors">
                Course Explorer
              </span>
              <span className="text-xs text-beige-dark">
                Find Your Perfect Class
              </span>
            </div>
          </Link>

          {/* Left - Navigation Links */}
          <div className="flex items-center space-x-4 sm:space-x-6 flex-1 ml-12 justify-center">
            <Link
              to="/"
              className="lm-bright flex items-center space-x-2 px-3 py-2 rounded-full text-beige-light hover:bg-maroon hover:text-beige-light transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Home</span>
            </Link>
            
            <div className="flex-1 max-w-md">
              <AutoCompleteSearch navbarMode={true} />
            </div>
          </div>

          {/* Right - Theme Toggle & Planner Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="lm-bright flex items-center space-x-2 px-3 py-2 rounded-full text-beige-light hover:bg-maroon hover:text-beige-light transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            
            <Link
              to="/planner"
              className="lm-bright flex items-center space-x-2 px-3 py-2 rounded-full text-beige-light hover:bg-maroon hover:text-beige-light transition-all duration-200"
            >
              <Calendar className="h-4 w-4" />
              <span className="hidden xl:inline font-medium">Planner</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
