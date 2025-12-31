import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, LogOut, User, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, backLink, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors">
              <FileQuestion className="text-white" size={24} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title || 'DRP'}</h1>
              <p className="text-xs text-gray-500">Data Request Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {children}
            
            <div className="flex items-center gap-2 text-sm text-gray-600 border-l pl-4">
              <User size={16} />
              <span>{user?.firstName} {user?.lastName}</span>
            </div>
            
            <button 
              onClick={handleLogout} 
              className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
              title="Odhlásit se"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
