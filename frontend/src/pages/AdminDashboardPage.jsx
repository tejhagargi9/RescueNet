import React from 'react';
import AlertsSection from '../components/AlertsSection';
import IncidentsSection from '../components/IncidentsSection';
import { ShieldAlert } from 'lucide-react';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <header className="mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <ShieldAlert className="h-10 w-10 text-sky-600 mr-3" />
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="space-y-12">
          <section id="alerts-management">
            <AlertsSection />
          </section>

          <hr className="my-12 border-slate-300" />

          <section id="incidents-management">
            <IncidentsSection />
          </section>
        </div>
      </main>

      <footer className="mt-16 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Disaster & Incident Management Panel. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboardPage;