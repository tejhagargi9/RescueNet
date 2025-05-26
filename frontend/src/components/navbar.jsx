import React, { useState, useEffect } from 'react';
import { Shield, Home, Users, MapPin, Heart, AlertTriangle, User } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { useAuth, useUser } from '@clerk/clerk-react';

const RescueNetNavbar = () => {
  const [activeItem, setActiveItem] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const { isSignedIn } = useAuth(); // detects sign-in state
  const { user } = useUser(); // gets user object when signed in

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSignedIn && user) {
      localStorage.setItem('isUser', 'true');
    } else {
      localStorage.removeItem('isUser');
      localStorage.removeItem('userInfo');  
    }
  }, [isSignedIn, user]); 

  useEffect(() => {
  if (isSignedIn && user) {
    localStorage.setItem('isUser', 'true');

    // Extract user info
    const userInfo = {
      id: user.id,
      fullName: user.fullName,
      email: user.primaryEmailAddress?.emailAddress || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };

    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  } else {
    localStorage.removeItem('isUser');
    localStorage.removeItem('userInfo');
  }
}, [isSignedIn, user]);

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'communities', icon: Users, label: 'Communities' },
    { id: 'track', icon: MapPin, label: 'Track' },
    { id: 'help', icon: Heart, label: 'Help' }
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <nav className={`
        bg-white/95 backdrop-blur-xl border border-gray-200/50
        rounded-full px-6 py-3 flex items-center gap-6
        transition-all duration-300 ease-out
        shadow-xl shadow-gray-900/10
        ${isScrolled ? 'scale-95 bg-white/98 shadow-2xl' : 'scale-100'}
        hover:scale-105 hover:shadow-2xl hover:shadow-gray-900/15
      `}>
        
        {/* Logo Section */}
        <div className="flex items-center gap-3 pr-4 border-r border-gray-200">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
          </div>
          <span className="text-gray-800 font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RescueNet
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`
                  relative px-4 py-2 rounded-full flex items-center gap-2
                  transition-all duration-300 ease-out group
                  ${isActive 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm font-medium">{item.label}</span>
                
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* SOS Button */}
        <div className="px-2">
          <button className="
            bg-gradient-to-r from-red-500 to-pink-500 
            hover:from-red-600 hover:to-pink-600
            text-white px-4 py-2 rounded-full
            flex items-center gap-2 font-semibold
            transition-all duration-300 ease-out
            hover:scale-110 hover:shadow-xl hover:shadow-red-500/40
            active:scale-95 shadow-lg shadow-red-500/30
          ">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">SOS</span>
          </button>
        </div>

        {/* Authentication Section */}
        <div className="pl-4 border-l border-gray-200">
          <SignedOut>
            <SignInButton>
              <button className="
                bg-gradient-to-r from-indigo-500 to-purple-500
                hover:from-indigo-600 hover:to-purple-600
                text-white px-4 py-2 rounded-full
                flex items-center gap-2 font-medium
                transition-all duration-300 ease-out
                hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/30
                active:scale-95 shadow-lg shadow-indigo-500/20
              ">
                <User className="w-4 h-4" />
                <span className="text-sm">Sign In</span>
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <div className="flex items-center">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform duration-300",
                    userButtonPopoverCard: "shadow-xl border border-gray-200/50 backdrop-blur-xl bg-white/95",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default RescueNetNavbar;