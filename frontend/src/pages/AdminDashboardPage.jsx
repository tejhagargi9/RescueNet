// AdminDashboardPage.jsx
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import AlertsSection from '../components/AlertsSection';
import IncidentsSection from '../components/IncidentsSection';
import AccountsSection from '../components/AccountsSection';
import { ShieldAlert, Bell, FileText, Users as UsersIcon, ShieldHalf, UserCircle } from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeSection, setActiveSection] = useState('alerts');

  const sidebarItems = [
    { id: 'alerts', label: 'Manage Alerts', icon: Bell },
    { id: 'incidents', label: 'Manage Incidents', icon: FileText },
    { id: 'accounts', label: 'Manage Accounts', icon: UsersIcon },
  ];

  const renderSection = () => {
    // ... (renderSection logic remains the same)
    switch (activeSection) {
      case 'alerts':
        return <AlertsSection />;
      case 'incidents':
        return <IncidentsSection />;
      case 'accounts':
        return <AccountsSection />;
      default:
        return <AlertsSection />;
    }
  };

  const currentSectionData = sidebarItems.find(item => item.id === activeSection) || { label: 'Dashboard', icon: ShieldAlert };

  // Assuming the external navbar is 5rem (h-20) high
  const globalNavbarHeight = "h-20"; // "5rem" or "20" if using Tailwind's spacing scale for rem

  return (
    // Add pt-20 to the main container to push everything down
    <div className={`flex h-screen bg-slate-50 font-sans antialiased pt-20`}>
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        items={sidebarItems}
        LogoIcon={ShieldHalf}
        // Pass the navbar height to the Sidebar to adjust its top position
        topOffset={globalNavbarHeight}
      />

      {/* Main Content Wrapper */}
      {/* The ml-64 is still correct as it's relative to its parent's padding box */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Top Bar / Header within content area - This is now positioned correctly below the global navbar */}
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-6 lg:px-8 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center">
            <currentSectionData.icon className="h-7 w-7 text-sky-600 mr-3" />
            <h1 className="text-2xl font-semibold text-slate-800">
              {currentSectionData.label}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-600 hidden sm:inline">Admin User</span>
            <UserCircle className="h-9 w-9 text-slate-400 hover:text-sky-500 cursor-pointer" />
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 p-6 lg:p-8">
          {renderSection()}
        </main>

        {/* Footer for the content area */}
        <footer className="bg-white border-t border-slate-200 p-4 text-center text-sm text-slate-600 flex-shrink-0">
          © {new Date().getFullYear()} Disaster & Incident Management Panel. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AdminDashboardPage;