
import React from 'react';
import { Link } from 'react-router-dom';
import { UserTier, UserSession } from '../types';

interface HeaderProps {
  session: UserSession;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ session, onLogout }) => {
  const isPremium = session.tier === UserTier.PREMIUM;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline">SmartFile</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Tool</Link>
          <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</Link>
          
          {isPremium ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase tracking-wider">
                Premium
              </span>
              <button 
                onClick={onLogout}
                className="text-sm font-medium text-red-500 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/pricing" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition-all"
            >
              Go Premium
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
