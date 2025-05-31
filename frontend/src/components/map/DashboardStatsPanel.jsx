// src/components/dashboard/DashboardStatsPanel.jsx
import React from 'react';
import { useDisasterData } from '../../context/DisasterDataContext';
import { AlertTriangle, Users, UserCheck, UserCog, UserX, ListChecks, Loader2 as SpinnerIcon, CheckCircle2, ShieldEllipsis, Send } from 'lucide-react'; // Added Send for missions

const StatCard = ({ title, value, icon, colorClass, unit = "", isLoading = false }) => (
  <div className={`p-3 sm:p-4 rounded-lg shadow-lg border-l-4 ${colorClass} bg-white`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-xl sm:text-2xl font-semibold text-slate-800">
          {isLoading ? <SpinnerIcon className="animate-spin h-6 w-6" /> : value}
          {unit && !isLoading && <span className="text-xs sm:text-sm font-normal text-slate-500 ml-1">{unit}</span>}
        </p>
      </div>
      <div className={`p-2 rounded-full ${colorClass.replace('border-', 'bg-').replace('-500', '-100').replace('-600', '-100').replace('-700', '-100')}`}>
        {React.cloneElement(icon, { className: `w-5 h-5 sm:w-6 sm:h-6 ${colorClass.replace('border-', 'text-')}` })}
      </div>
    </div>
  </div>
);

const DashboardStatsPanel = () => {
  const { reports, volunteers, missions, loading: initialLoading } = useDisasterData();

  const activeSOSAlerts = reports.filter(r => r.filter === 'sos').length;

  const volunteerStats = {
    total: volunteers.length,
    available: volunteers.filter(v => v.status === 'available').length,
    assigned: volunteers.filter(v => v.status === 'assigned').length,
    on_break: volunteers.filter(v => v.status === 'on_break').length,
    // pending: volunteers.filter(v => v.status === 'pending_assignment').length, // if you add this status
  };

  const missionStats = {
    total: missions.length,
    pending: missions.filter(m => m.status === 'pending').length,
    in_progress: missions.filter(m => m.status === 'in_progress').length,
    completed: missions.filter(m => m.status === 'completed').length,
  };

  return (
    <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md shadow-2xl rounded-xl border border-slate-300/70 w-full">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-3 sm:mb-4 border-b border-slate-200 pb-2">
        Live Operations Dashboard
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        <StatCard title="Active SOS" value={activeSOSAlerts} icon={<AlertTriangle />} colorClass="border-red-500" isLoading={initialLoading && activeSOSAlerts === 0} />

        <StatCard title="Volunteers Available" value={volunteerStats.available} icon={<UserCheck />} colorClass="border-green-500" unit={`/ ${volunteerStats.total}`} isLoading={initialLoading && volunteerStats.total === 0} />
        <StatCard title="Volunteers Assigned" value={volunteerStats.assigned} icon={<UserCog />} colorClass="border-blue-500" isLoading={initialLoading && volunteerStats.total === 0} />

        <StatCard title="Missions Pending" value={missionStats.pending} icon={<ShieldEllipsis />} colorClass="border-amber-500" unit={`/ ${missionStats.total}`} isLoading={initialLoading && missionStats.total === 0} />
        <StatCard title="Missions Active" value={missionStats.in_progress} icon={<Send />} colorClass="border-sky-500" isLoading={initialLoading && missionStats.total === 0} />
        <StatCard title="Missions Done" value={missionStats.completed} icon={<CheckCircle2 />} colorClass="border-emerald-500" isLoading={initialLoading && missionStats.total === 0} />
      </div>
      {/* Potential future section: High priority SOS list, or assign volunteers quick actions */}
    </div>
  );
};

export default DashboardStatsPanel;