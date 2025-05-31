// src/components/reports/ViewReportsMapPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'; // Added Circle
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ReactDOMServer from 'react-dom/server';

import { useDisasterData } from '../context/DisasterDataContext'; // UPDATED
import { useNotifications } from '../context/NotificationContext'; // NEW

import {
  Trash2, MapPin, MessageSquare, Clock, Loader2, AlertTriangle, Search, XCircle, Users, // Added Users
  Flame, Utensils, Home as ShelterIcon, RadioTower, UserSearch, HelpCircle, Eye, EyeOff, ListFilter, MapPinPlus,
  LayoutDashboard, // NEW For dashboard toggle
  ClipboardList, UserPlus, // For mission/volunteer actions in Popups
} from 'lucide-react';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Assuming CreateLocationModal exists and is imported
import CreateLocationModal from '../components/CreateLocationModal'; // Path might differ
import DashboardStatsPanel from '../components/map/DashboardStatsPanel'; // NEW
import { countNearbySOS, getSOSColorByDensity } from '../utils/mapUtils'; // NEW

// --- Leaflet Icon Fix & Custom Icons --- (Keep existing)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow,
});

export const SPECIFIC_FILTER_CATEGORIES = { /* Keep existing */
  danger: { label: 'Danger', icon: Flame, color: '#EF4444', description: "Reports indicating dangerous areas or hazards." },
  food: { label: 'Food/Water', icon: Utensils, color: '#22C55E', description: "Availability or need for food and water supplies." },
  shelter: { label: 'Shelters', icon: ShelterIcon, color: '#3B82F6', description: "Locations of safe shelters or temporary housing." },
  sos: { label: 'SOS', icon: RadioTower, color: '#F97316', description: "Urgent calls for help or emergency situations." },
  missing: { label: 'Missing Persons', icon: UserSearch, color: '#A855F7', description: "Reports related to missing persons." },
  other: { label: 'Other', icon: HelpCircle, color: '#6B7280', description: "General reports not fitting other categories." },
};

const createLucideIcon = (IconComponent, color, size = 24, borderColor = 'rgba(0,0,0,0.1)') => { /* Keep existing */
  const iconHtml = ReactDOMServer.renderToString(<IconComponent color={color || '#000000'} size={size} strokeWidth={2.5} />);
  return L.divIcon({
    html: `<div style="background-color: white; border-radius: 50%; padding: 5px; box-shadow: 0 2px 8px ${borderColor}; display: flex; align-items: center; justify-content: center; border: 2px solid ${color || borderColor};">
             ${iconHtml}
           </div>`,
    className: 'custom-leaflet-div-icon', iconSize: [size + 14, size + 14],
    iconAnchor: [(size + 14) / 2, (size + 14) / 2], popupAnchor: [0, -(size + 14) / 2]
  });
};

const LEAFLET_ICONS = {};
Object.keys(SPECIFIC_FILTER_CATEGORIES).forEach(key => { /* Keep existing */
  const category = SPECIFIC_FILTER_CATEGORIES[key];
  category.leafletIcon = createLucideIcon(category.icon, category.color, 20);
  LEAFLET_ICONS[key] = category.leafletIcon;
});
const DEFAULT_LEAFLET_ICON = LEAFLET_ICONS.other;

const getReportIcon = (reportFilterType) => { /* Keep existing */
  const categoryKey = reportFilterType && SPECIFIC_FILTER_CATEGORIES[reportFilterType] ? reportFilterType : 'other';
  return LEAFLET_ICONS[categoryKey] || DEFAULT_LEAFLET_ICON;
};

// --- Map Components ---
const ChangeView = ({ center, zoom }) => { /* Keep existing */
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && typeof center[0] === 'number' && typeof center[1] === 'number') {
      map.flyTo(center, zoom || map.getZoom(), { animate: true, duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
};

// --- Main Page Component ---
const ViewReportsMapPage = () => {
  const {
    reports, volunteers, missions, loading, error, fetchReports, removeReport, addReport, updateReport,
    addMission, assignVolunteerToMission // UPDATED to useDisasterData
  } = useDisasterData();
  const { addNotification } = useNotifications(); // NEW

  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set(Object.keys(SPECIFIC_FILTER_CATEGORIES)));

  const [isControlsPanelOpen, setIsControlsPanelOpen] = useState(false);
  const [isDashboardPanelOpen, setIsDashboardPanelOpen] = useState(false); // NEW
  const [isCreateLocationModalOpen, setIsCreateLocationModalOpen] = useState(false);

  const SOS_DENSITY_SEARCH_RADIUS_KM = 0.5; // 500 meters for SOS density calculation

  useEffect(() => {
    // fetchReports is called by DisasterDataProvider, so not strictly needed here unless for manual refresh
  }, []);

  const handleCreateReport = async (reportData) => {
    // Ensure people_affected and severity are numbers if provided
    if (reportData.filter === 'sos') {
      reportData.people_affected = reportData.people_affected ? parseInt(reportData.people_affected, 10) : 0;
      reportData.severity = reportData.severity ? parseInt(reportData.severity, 10) : 1;
    }
    const success = await addReport(reportData);
    if (success) {
      // fetchReports(); // Context handles state update
      console.log("Report added successfully via map page handler.");
    } else {
      console.error("Failed to add report via map page handler.");
    }
    return success;
  };

  const toggleFilter = useCallback((filterKey) => { /* Keep existing */
    setActiveFilters(prevFilters => {
      const newFilters = new Set(prevFilters);
      if (newFilters.has(filterKey)) newFilters.delete(filterKey);
      else newFilters.add(filterKey);
      return newFilters;
    });
  }, []);

  const filteredReports = useMemo(() => { /* Keep existing logic, ensure reports exist */
    if (!reports) return [];
    return reports.filter(report => {
      const categoryKey = (report.filter && SPECIFIC_FILTER_CATEGORIES[report.filter]) ? report.filter : 'other';
      const filterMatch = activeFilters.has(categoryKey);
      const searchNormalized = searchTerm.toLowerCase().trim();
      const searchMatch = searchNormalized === '' ||
        report.message.toLowerCase().includes(searchNormalized) ||
        (report.filter && report.filter.toLowerCase().includes(searchNormalized)) ||
        (report.city && report.city.toLowerCase().includes(searchNormalized)) || // Search by city
        categoryKey.toLowerCase().includes(searchNormalized);
      return filterMatch && searchMatch;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [reports, activeFilters, searchTerm]);

  useEffect(() => { /* Keep existing logic for map centering */
    if (filteredReports.length > 0) {
      const firstReport = filteredReports[0];
      if (firstReport.latitude && firstReport.longitude) {
        setMapCenter([firstReport.latitude, firstReport.longitude]);
        setMapZoom(filteredReports.length === 1 ? 14 : 10);
      }
    } else if (!loading && reports && reports.length > 0 && filteredReports.length === 0) {
      // setMapZoom(6);
    } else if (!loading && (!reports || reports.length === 0)) {
      setMapCenter([20.5937, 78.9629]);
      setMapZoom(5);
    }
  }, [filteredReports, loading, reports]);


  const handleDeleteReport = async (id) => { /* Keep existing */
    if (window.confirm('Are you sure you want to delete this report?')) {
      setDeletingId(id);
      try {
        await removeReport(id);
      } catch (e) { console.error("Failed to delete report:", e); }
      finally { setDeletingId(null); }
    }
  };

  const toggleAllFilters = () => { /* Keep existing */
    if (activeFilters.size === Object.keys(SPECIFIC_FILTER_CATEGORIES).length) setActiveFilters(new Set());
    else setActiveFilters(new Set(Object.keys(SPECIFIC_FILTER_CATEGORIES)));
  };

  const allSOSReports = useMemo(() => reports ? reports.filter(r => r.filter === 'sos') : [], [reports]);

  // Quick actions from Popups
  const handleCreateMissionFromSOS = (sosReport) => {
    const missionTitle = `Mission for SOS: ${sosReport.message.substring(0, 30)}...`;
    // For a real app, this would open a modal to confirm and add details
    addMission({
      title: missionTitle,
      type: 'rescue', // default for SOS
      related_report_ids: [sosReport._id],
      description: `Priority mission based on SOS: ${sosReport.message}`,
      priority: sosReport.severity || 3,
      location: { latitude: sosReport.latitude, longitude: sosReport.longitude }
    });
    addNotification({ title: "Mission Initiated", message: `New mission created for SOS at ${sosReport.city || 'location'}.`, type: 'info' });
  };

  const handleAssignVolunteerToSOS = (sosReport) => {
    // Find first available volunteer with rescue skills
    const availableRescueVolunteers = volunteers.filter(v => v.status === 'available' && v.skills.includes("Search & Rescue"));
    const availableGenericVolunteers = volunteers.filter(v => v.status === 'available');
    const volunteerToAssign = availableRescueVolunteers.length > 0 ? availableRescueVolunteers[0] : (availableGenericVolunteers.length > 0 ? availableGenericVolunteers[0] : null);

    if (volunteerToAssign) {
      // First, create a mission if one doesn't exist for this SOS
      let missionForSOS = missions.find(m => m.related_report_ids.includes(sosReport._id));
      if (!missionForSOS) {
        missionForSOS = addMission({ // Assuming addMission is synchronous or returns the mission for this mock
          title: `Auto-Mission for SOS: ${sosReport.message.substring(0, 20)}...`,
          type: 'rescue',
          related_report_ids: [sosReport._id],
          description: `Auto-created mission for SOS: ${sosReport.message}`,
          priority: sosReport.severity || 3,
          location: { latitude: sosReport.latitude, longitude: sosReport.longitude }
        });
      }
      if (missionForSOS && missionForSOS.id) { // check if mission creation was successful (mocked)
        assignVolunteerToMission(missionForSOS.id, volunteerToAssign.id);
      } else {
        addNotification({ title: "Assignment Error", message: `Could not auto-create mission for SOS.`, type: "error" });
      }
    } else {
      addNotification({ title: "No Volunteers", message: "No available volunteers to assign immediately.", type: "warning" });
    }
  };


  if (loading && (!reports || reports.length === 0)) { /* Keep existing loading state */
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-700">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-6" />
        <p className="text-2xl font-semibold">Loading Disaster Response Map...</p>
        <p className="text-slate-500">Fetching initial operational data.</p>
      </div>
    );
  }

  if (error) { /* Keep existing error state */
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-2xl font-semibold">Map Data Error</p>
        <p className="mb-4">Encountered issue: {error.message || String(error)}</p>
        <button onClick={() => fetchReports()} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Try Reloading Data
        </button>
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col">
      <div className="pt-20 flex-grow flex flex-col relative bg-slate-200"> {/* Adjust pt-20 if navbar height changes */}

        {/* Control Toggles: Positioned top-left for less clutter */}
        <div className="fixed z-[1001] top-24 left-4 flex flex-col space-y-2">
          <button
            onClick={() => setIsControlsPanelOpen(!isControlsPanelOpen)}
            className={`p-2.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all`}
            title={isControlsPanelOpen ? "Hide Filters/Search" : "Show Filters/Search"}
          >
            <ListFilter className="w-6 h-6 text-slate-700" />
          </button>
          <button
            onClick={() => setIsDashboardPanelOpen(!isDashboardPanelOpen)}
            className={`p-2.5 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all`}
            title={isDashboardPanelOpen ? "Hide Dashboard" : "Show Dashboard"}
          >
            <LayoutDashboard className="w-6 h-6 text-slate-700" />
          </button>
          <button
            onClick={() => setIsCreateLocationModalOpen(true)}
            className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all"
            title="Add New Location Report"
          >
            <MapPinPlus className="w-6 h-6" />
          </button>
        </div>


        {/* Controls Panel (Search and Filters) */}
        {isControlsPanelOpen && (
          <div className="absolute top-40 left-4 w-[calc(100%-2rem)] sm:w-[380px] z-[1000] p-3 sm:p-4 bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl border border-slate-200/50 transition-all duration-300 ease-in-out">
            {/* Search Bar - (Keep existing structure) */}
            <div>
              <label htmlFor="search-reports" className="sr-only">Search Reports</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text" id="search-reports" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by message, type, city..."
                  className="block w-full pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-2 flex items-center" title="Clear search">
                    <XCircle className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Buttons - (Keep existing structure) */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-slate-700">Filter by Category:</h3>
                <button onClick={toggleAllFilters} title={activeFilters.size === Object.keys(SPECIFIC_FILTER_CATEGORIES).length ? "Deselect All" : "Select All"}
                  className="p-1.5 rounded-md hover:bg-slate-100">
                  {activeFilters.size === Object.keys(SPECIFIC_FILTER_CATEGORIES).length ? <EyeOff className="h-5 w-5 text-slate-600" /> : <Eye className="h-5 w-5 text-slate-600" />}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(SPECIFIC_FILTER_CATEGORIES).map(([key, { label, icon: Icon, color }]) => (
                  <button key={key} onClick={() => toggleFilter(key)} title={SPECIFIC_FILTER_CATEGORIES[key].description}
                    className={`flex items-center justify-start text-left w-full px-2.5 py-2 rounded-md border text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-offset-1 ${activeFilters.has(key) ? 'text-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'}`}
                    style={activeFilters.has(key) ? { backgroundColor: color, borderColor: color, boxShadow: `0 4px 10px -2px ${color}70` } : { borderColor: color + '50' }}>
                    <Icon size={16} className={`mr-2 ${activeFilters.has(key) ? 'text-white' : ''}`} style={!activeFilters.has(key) ? { color: color } : {}} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Panel - NEW */}
        {isDashboardPanelOpen && (
          <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-lg z-[1000] transition-all duration-300 ease-in-out">
            <DashboardStatsPanel />
          </div>
        )}


        {isCreateLocationModalOpen && (
          <CreateLocationModal
            isOpen={isCreateLocationModalOpen}
            onClose={() => setIsCreateLocationModalOpen(false)}
            onReportSubmit={handleCreateReport}
            filterCategories={SPECIFIC_FILTER_CATEGORIES}
          // You'll need to modify CreateLocationModal to accept and show fields for 'people_affected' and 'severity' if filter is 'sos'
          />
        )}

        <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="flex-grow z-0" style={{ height: '100%', width: '100%' }}>
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors & RescueNet' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {filteredReports.map(report => {
            if (!report.latitude || !report.longitude) return null; // Skip if no coordinates

            if (report.filter === 'sos') {
              const density = countNearbySOS(report, allSOSReports, SOS_DENSITY_SEARCH_RADIUS_KM);
              const { fill: sosFillColor, stroke: sosStrokeColor, opacity: sosFillOpacity } = getSOSColorByDensity(density);
              const visualRadiusMeters = Math.min(500, 100 + (density * 40) + ((report.people_affected || 0) * 8) + ((report.severity || 1) * 20));

              return (
                <Circle
                  key={`${report._id}-sos-circle`}
                  center={[report.latitude, report.longitude]}
                  radius={visualRadiusMeters}
                  pathOptions={{ color: sosStrokeColor, fillColor: sosFillColor, fillOpacity: sosFillOpacity, weight: 2 }}
                >
                  <Popup minWidth={300}>
                    <div className="p-1 space-y-2">
                      <div className="flex items-center border-b pb-1.5 mb-1.5" style={{ borderColor: sosStrokeColor + '80' }}>
                        <div className="p-1.5 rounded-full mr-2" style={{ backgroundColor: sosFillColor + '30' }}>
                          <RadioTower size={20} style={{ color: sosStrokeColor }} />
                        </div>
                        <h3 className="text-base font-bold" style={{ color: sosStrokeColor }}>
                          SOS Alert! <span className="text-xs font-normal">(Density: {density})</span>
                        </h3>
                      </div>
                      <p className="text-sm text-slate-800 break-words leading-relaxed"><MessageSquare size={14} className="inline mr-1.5 mb-0.5 text-slate-500" />{report.message}</p>
                      {report.people_affected > 0 && <p className="text-sm text-slate-600"><Users size={14} className="inline mr-1.5 mb-0.5 text-slate-500" />People Affected: <strong>{report.people_affected}</strong></p>}
                      {report.severity && <p className="text-sm text-slate-600"><AlertTriangle size={14} className="inline mr-1.5 mb-0.5 text-orange-500" />Severity: <strong>{report.severity}/5</strong></p>}
                      <p className="text-xs text-slate-500 flex items-center"><MapPin size={12} className="mr-1.5 text-green-600" />{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)} {report.city && `(${report.city})`}</p>
                      <p className="text-xs text-slate-500 flex items-center"><Clock size={12} className="mr-1.5 text-sky-600" />{new Date(report.timestamp).toLocaleString()}</p>

                      {localStorage.getItem('adminAccess') === 'true' && (
                        <div className="mt-3 space-y-1.5">
                          <button onClick={() => handleCreateMissionFromSOS(report)} className="w-full text-xs flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"> <ClipboardList size={14} className="mr-1.5" />Create Mission</button>
                          <button onClick={() => handleAssignVolunteerToSOS(report)} className="w-full text-xs flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"> <UserPlus size={14} className="mr-1.5" />Quick Assign Volunteer</button>
                          <button onClick={() => handleDeleteReport(report._id)} disabled={deletingId === report._id} className="w-full text-xs flex items-center justify-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-60">
                            {deletingId === report._id ? <Loader2 className="animate-spin mr-1.5 h-4 w-4" /> : <Trash2 className="mr-1.5 h-4 w-4" />}Delete SOS
                          </button>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Circle>
              );
            } else { // Regular marker for other report types
              const categoryKey = (report.filter && SPECIFIC_FILTER_CATEGORIES[report.filter]) ? report.filter : 'other';
              const categoryInfo = SPECIFIC_FILTER_CATEGORIES[categoryKey];
              const CategoryIcon = categoryInfo.icon;
              return (
                <Marker key={report._id} position={[report.latitude, report.longitude]} icon={getReportIcon(report.filter)}>
                  <Popup minWidth={280}>
                    <div className="p-1 space-y-2.5">
                      <div className="flex items-center border-b pb-2 mb-2" style={{ borderColor: categoryInfo.color + '50' }}>
                        <div className="p-1.5 rounded-full mr-2.5" style={{ backgroundColor: categoryInfo.color + '20' }}>
                          <CategoryIcon size={20} style={{ color: categoryInfo.color }} />
                        </div>
                        <h3 className="text-base font-bold" style={{ color: categoryInfo.color }}>{categoryInfo.label} Report</h3>
                      </div>
                      <p className="text-sm text-slate-700 break-words leading-relaxed"><MessageSquare size={14} className="inline mr-1.5 mb-0.5 text-slate-500" />{report.message}</p>
                      <p className="text-xs text-slate-500 flex items-center"><MapPin size={12} className="mr-1.5 text-green-600" />{report.latitude.toFixed(4)}, {report.longitude.toFixed(4)} {report.city && `(${report.city})`}</p>
                      <p className="text-xs text-slate-500 flex items-center"><Clock size={12} className="mr-1.5 text-sky-600" />{new Date(report.timestamp).toLocaleString()}</p>
                      {localStorage.getItem('adminAccess') === 'true' && (
                        <button onClick={() => handleDeleteReport(report._id)} disabled={deletingId === report._id} className="mt-3 w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-60">
                          {deletingId === report._id ? (<Loader2 className="animate-spin mr-1.5 h-4 w-4" />) : (<Trash2 className="mr-1.5 h-4 w-4" />)}
                          {deletingId === report._id ? 'Deleting...' : 'Delete Report'}
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            }
          })}
        </MapContainer>

        {/* Overlays for No Results / No Reports (Keep existing) */}
        {filteredReports.length === 0 && !loading && reports && reports.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent z-[500] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl text-center max-w-xs mx-auto border"><Search className="h-12 w-12 text-slate-400 mx-auto mb-3" /><p className="text-slate-700 font-semibold text-lg mb-1">No Matching Reports</p><p className="text-sm text-slate-500">Try adjusting search or filters.</p></div>
          </div>
        )}
        {(!reports || reports.length === 0) && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent z-[500] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl text-center max-w-xs mx-auto border"><MapPin size={48} className="mx-auto text-slate-400 mb-3" /><p className="text-slate-700 font-semibold text-lg mb-1">No Reports Yet</p><p className="text-sm text-slate-500">New reports will appear here.</p></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReportsMapPage;