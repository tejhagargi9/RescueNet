import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Home, Users, MapPin, AlertTriangle, User as UserIcon, LogOut, Settings, Lock } from 'lucide-react'; // Added Lock icon
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk } from '@clerk/clerk-react';

// Admin Authentication Modal Component (can be in a separate file or inline)
const AdminAuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin@123') {
      localStorage.setItem('adminAccess', 'true');
      onSuccess(); // Callback to navigate and close modal
      setError('');
      setPassword('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[100]">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Admin Access</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="admin-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              autoFocus
              placeholder="Enter admin password"
            />
          </div>
          {error && <p className="text-red-600 text-sm mb-3 animate-shake">{error}</p>}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const RescueNetNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const [activeItem, setActiveItem] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Ensure `admin` is correctly set as activeItem if on /admin page
    const currentPath = location.pathname.startsWith('/admin') ? 'admin' : (location.pathname.split('/')[1] || 'home');
    setActiveItem(currentPath);
  }, [location.pathname]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'communities', icon: Users, label: 'Communities', path: '/communities' },
    { id: 'track', icon: MapPin, label: 'Track', path: '/track' },
    { id: 'admin', icon: Settings, label: 'Admin Dashboard', path: '/admin' }, // Label for tooltip
  ];

  const handleSignOut = async () => {
    await signOut(() => navigate('/'));
  };

  const handleSOSClick = () => {
    navigate('/sos');
  };

  const handleAdminClick = () => {
    if (localStorage.getItem('adminAccess') === 'true') {
      navigate('/admin');
      setActiveItem('admin');
    } else {
      setIsAdminModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminModalOpen(false);
    navigate('/admin');
    setActiveItem('admin');
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center p-4 print:hidden">
        <nav className={`
          bg-white/95 backdrop-blur-xl border border-gray-200/50
          rounded-full px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6
          transition-all duration-300 ease-out
          shadow-xl shadow-gray-900/10
          ${isScrolled ? 'scale-95 bg-white/98 shadow-2xl' : 'scale-100'}
          hover:scale-100 sm:hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/15
        `}>

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 pr-2 sm:pr-4 sm:border-r border-gray-200/70">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
            </div>
            <span className="hidden sm:inline text-gray-800 font-bold text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RescueNet
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              if (item.id === 'admin') {
                return (
                  <button
                    key={item.id}
                    onClick={handleAdminClick}
                    className={`
                      relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2
                      transition-all duration-300 ease-out group
                      ${isActive
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-100 sm:scale-105'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                    title={item.label} // Tooltip: "Admin Dashboard"
                  >
                    <Lock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} /> {/* Lock Icon */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full -z-10"></div>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveItem(item.id)}
                  className={`
                    relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center gap-1.5 sm:gap-2
                    transition-all duration-300 ease-out group
                    ${isActive
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-100 sm:scale-105'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }
                  `}
                  title={item.label}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isActive ? 'scale-100 sm:scale-110' : 'group-hover:scale-110'}`} />
                  <span className="hidden md:inline text-xs sm:text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full -z-10"></div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* SOS Button (right side) */}
          <SignedIn>
            <div className="px-1 sm:px-2">
              <button
                onClick={handleSOSClick}
                className="
                bg-gradient-to-r from-red-500 to-pink-500 
                hover:from-red-600 hover:to-pink-600
                text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full
                flex items-center gap-1.5 sm:gap-2 font-semibold
                transition-all duration-300 ease-out
                hover:scale-105 sm:hover:scale-110 hover:shadow-xl hover:shadow-red-500/40
                active:scale-95 shadow-lg shadow-red-500/30
              ">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">SOS</span>
              </button>
            </div>
          </SignedIn>

          {/* Authentication Section */}
          <div className="pl-2 sm:pl-4 sm:border-l border-gray-200/70">
            <SignedOut>
              <SignInButton mode="modal" redirectUrl={location.pathname}>
                <span
                  className="
                  bg-gradient-to-r from-indigo-500 to-purple-500
                  hover:from-indigo-600 hover:to-purple-600
                  text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full
                  flex items-center gap-1.5 sm:gap-2 font-medium
                  transition-all duration-300 ease-out
                  hover:scale-105 sm:hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/30
                  active:scale-95 shadow-lg shadow-indigo-500/20
                "
                >
                  <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Sign In</span>
                </span>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center">
                <UserButton
                  userProfileUrl="/account"
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform duration-300",
                      userButtonPopoverCard: "shadow-xl border border-gray-200/50 backdrop-blur-xl bg-white/95 rounded-xl",
                      userButtonPopoverFooter: "hidden",
                      userButtonPopoverActionButton: "text-gray-700 hover:bg-gray-100/50 rounded-md",
                      userButtonPopoverActionButtonIcon: "text-gray-500",
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </nav>
      </div>
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </>
  );
};

export default RescueNetNavbar;