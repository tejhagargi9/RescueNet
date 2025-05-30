import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Home, Users, MapPin, Heart, AlertTriangle, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk } from '@clerk/clerk-react';
// No need to import useAuth and useUser directly if AuthContext handles the core logic,
// but UserButton and Clerk hooks are fine.

const RescueNetNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk(); // For custom sign out action if needed

  const [activeItem, setActiveItem] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set active navigation item based on current path
  useEffect(() => {
    const currentPath = location.pathname.split('/')[1] || 'home';
    setActiveItem(currentPath);
  }, [location.pathname]);

  // Your localStorage logic from the original component is fine for Clerk's basic info.
  // The AuthContext provides the enriched backend user profile.
  // No need to re-add it here if it's already in your original component logic and working.
  // For brevity in this example, I'll omit the direct localStorage manipulation here,
  // assuming your App's AuthContext setup is handling the main user state.
  // If you want to keep your exact localStorage logic from the original, you can.

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' },
    { id: 'communities', icon: Users, label: 'Communities', path: '/communities' }, // Example path
    { id: 'track', icon: MapPin, label: 'Track', path: '/track' }, // Example path
    { id: 'sos', icon: Heart, label: 'SOS', path: '/sos' }, // Example path
    { id: 'admin', icon: Heart, label: 'Admin', path: '/admin' }, // Example path
  ];

  const handleSignOut = async () => {
    await signOut(() => navigate('/')); // Redirect to home after sign out
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex justify-center p-4 print:hidden"> {/* z-index higher than onboarding */}
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

        {/* SOS Button (visible only if signed in and onboarded, for example) */}
        <SignedIn>
          {/* You might want to check isOnboarded from AuthContext here too */}
          <div className="px-1 sm:px-2">
            <button className="
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
                userProfileUrl="/account" // This directs "Manage account" to your /account page
                afterSignOutUrl="/" // Redirect to home page after sign out
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform duration-300",
                    userButtonPopoverCard: "shadow-xl border border-gray-200/50 backdrop-blur-xl bg-white/95 rounded-xl",
                    userButtonPopoverFooter: "hidden", // Hides default footer
                    userButtonPopoverActionButton: "text-gray-700 hover:bg-gray-100/50 rounded-md",
                    userButtonPopoverActionButtonIcon: "text-gray-500",
                  }
                }}
              >
                {/* You can add custom items if needed, though Clerk provides Manage Account and Sign Out by default */}
                {/* For example, if you wanted a different "My Profile" link that's always visible */}
                {/* <UserButton.UserProfilePage label="My Profile" url="/account" labelIcon={<Settings className="w-4 h-4" />} /> */}
                {/* <UserButton.Action label="Sign Out" navigate="/" action={handleSignOut} labelIcon={<LogOut className="w-4 h-4"/>} /> */}
              </UserButton>
            </div>
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default RescueNetNavbar;