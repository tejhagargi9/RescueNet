import React, { useState, useEffect } from 'react';
import { 
  Shield, AlertTriangle, MapPin, Heart, Users, Phone, Clock, 
  Star, CheckCircle, Zap, Globe, Award, TrendingUp, ArrowRight,
  Play, Download, Smartphone, Wifi
} from 'lucide-react';

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100 
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const stats = [
    { icon: Users, number: '50K+', label: 'Lives Protected', color: 'from-blue-500 to-cyan-500' },
    { icon: Clock, number: '<30s', label: 'Response Time', color: 'from-green-500 to-emerald-500' },
    { icon: Globe, number: '150+', label: 'Cities Served', color: 'from-purple-500 to-pink-500' },
    { icon: Award, number: '99.9%', label: 'Success Rate', color: 'from-orange-500 to-red-500' }
  ];

  const features = [
    {
      icon: AlertTriangle,
      title: 'Emergency SOS',
      description: 'Instant alerts to emergency services and your emergency contacts with precise location data.',
      color: 'from-red-500 to-pink-500',
      delay: 0
    },
    {
      icon: MapPin,
      title: 'Live Tracking',
      description: 'Real-time GPS tracking ensures help finds you quickly, even in remote locations.',
      color: 'from-blue-500 to-indigo-500',
      delay: 100
    },
    {
      icon: Users,
      title: 'Community Shield',
      description: 'Connect with verified local volunteers and first responders in your neighborhood.',
      color: 'from-green-500 to-teal-500',
      delay: 200
    },
    {
      icon: Heart,
      title: 'Medical Support',
      description: 'Access to certified medical professionals and AI-powered first aid guidance.',
      color: 'from-purple-500 to-violet-500',
      delay: 300
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Emergency Responder",
      content: "RescueNet has revolutionized how we respond to emergencies. The precision and speed are incredible.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Community Volunteer",
      content: "Being part of the RescueNet community means I can help my neighbors when they need it most.",
      rating: 5
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Medical Professional",
      content: "The medical support features have saved countless lives. It's an essential safety tool.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-200 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Dynamic Gradient Orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/40 to-purple-600/40 rounded-full blur-3xl animate-pulse"
          style={{
            left: `${mousePosition.x * 0.02}%`,
            top: `${mousePosition.y * 0.02}%`,
            transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.0005})`
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-pink-500/35 to-red-600/35 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            right: `${mousePosition.x * 0.015}%`,
            bottom: `${mousePosition.y * 0.015}%`,
            transform: `translate(50%, 50%) scale(${1.2 + scrollY * 0.0003})`
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-green-500/40 to-teal-600/40 rounded-full blur-3xl animate-pulse delay-500"
          style={{
            left: `${50 + mousePosition.x * 0.01}%`,
            top: `${30 + mousePosition.y * 0.01}%`,
            transform: `translate(-50%, -50%) rotate(${scrollY * 0.1}deg)`
          }}
        />

        {/* Animated Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.6 }} />
              <stop offset="50%" style={{ stopColor: '#8B5CF6', stopOpacity: 0.4 }} />
              <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 0.6 }} />
            </linearGradient>
          </defs>
          <path
            d={`M 0,${100 + mousePosition.y * 0.5} Q ${50 + mousePosition.x * 0.2},${50 + mousePosition.y * 0.3} 100,${80 + mousePosition.y * 0.4}`}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
            vectorEffect="non-scaling-stroke"
            style={{ strokeDasharray: '10,5', strokeDashoffset: scrollY * 0.1 }}
          />
          <path
            d={`M 0,${200 + mousePosition.y * 0.3} Q ${30 + mousePosition.x * 0.15},${150 + mousePosition.y * 0.25} 100,${180 + mousePosition.y * 0.35}`}
            stroke="url(#lineGradient)"
            strokeWidth="1.5"
            fill="none"
            className="animate-pulse delay-300"
            vectorEffect="non-scaling-stroke"
            style={{ strokeDasharray: '15,8', strokeDashoffset: -scrollY * 0.15 }}
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            
            {/* Main Title */}
            <div className="mb-8 animate-fade-in">
              <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                RescueNet
              </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-8"></div>
              <p className="text-2xl md:text-3xl text-gray-700 font-light mb-4">
                Your Digital Lifeline
              </p>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Advanced emergency response platform connecting you to help when every second counts. 
                AI-powered, community-driven, and always ready.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-red-500/50 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                Emergency SOS
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-xl border border-gray-200/50 flex items-center gap-3">
                <Play className="w-6 h-6" />
                Watch Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-800 mb-6">
                Powerful Features for 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Ultimate Safety</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Advanced technology meets human compassion to create the most comprehensive emergency response system.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-105"
                  style={{ animationDelay: `${feature.delay}ms` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                  <button className="text-blue-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn More <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Trusted by Heroes</h2>
              <p className="text-xl text-gray-600">Real stories from real people who make a difference</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Stay Protected?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands who trust RescueNet for their safety and peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-3">
                  <Download className="w-5 h-5" />
                  Download App
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;