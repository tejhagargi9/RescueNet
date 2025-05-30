// src/components/reports/ViewReportsMapPage.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ReactDOMServer from 'react-dom/server'; // For rendering Lucide icons to string for Leaflet

import { useReports } from '../context/ReportContext'; // Assuming this context provides reports
import {
  Trash2, MapPin, MessageSquare, Clock, Loader2, AlertTriangle, Search, XCircle,
  Flame, Utensils, Home as ShelterIcon, RadioTower, UserSearch, HelpCircle, Eye, EyeOff, ListFilter
} from 'lucide-react';

// --- Leaflet Icon Fix & Custom Icons ---
delete L.Icon.Default.prototype._getIconUrl;
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const SPECIFIC_FILTER_CATEGORIES = {
  danger: { label: 'Danger', icon: Flame, color: '#EF4444', description: "Reports indicating dangerous areas or hazards." }, // Red-500
  food: { label: 'Food/Water', icon: Utensils, color: '#22C55E', description: "Availability or need for food and water supplies." }, // Green-500
  shelter: { label: 'Shelters', icon: ShelterIcon, color: '#3B82F6', description: "Locations of safe shelters or temporary housing." }, // Blue-500
  sos: { label: 'SOS', icon: RadioTower, color: '#F97316', description: "Urgent calls for help or emergency situations." }, // Orange-500
  missing: { label: 'Missing', icon: UserSearch, color: '#A855F7', description: "Reports related to missing persons." }, // Purple-500
  other: { label: 'Other', icon: HelpCircle, color: '#6B7280', description: "General reports not fitting other categories." }, // Gray-500
};

const createLucideIcon = (IconComponent, color, size = 24, borderColor = 'rgba(0,0,0,0.1)') => {
  const iconHtml = ReactDOMServer.renderToString(<IconComponent color={color || '#000000'} size={size} strokeWidth={2.5} />);
  return L.divIcon({
    html: `<div style="background-color: white; border-radius: 50%; padding: 5px; box-shadow: 0 2px 8px ${borderColor}; display: flex; align-items: center; justify-content: center; border: 2px solid ${color || borderColor};">
             ${iconHtml}
           </div>`,
    className: 'custom-leaflet-div-icon',
    iconSize: [size + 14, size + 14], // Adjust size based on padding and border
    iconAnchor: [(size + 14) / 2, (size + 14) / 2],
    popupAnchor: [0, -(size + 14) / 2]
  });
};

const LEAFLET_ICONS = {};
Object.keys(SPECIFIC_FILTER_CATEGORIES).forEach(key => {
  const category = SPECIFIC_FILTER_CATEGORIES[key];
  category.leafletIcon = createLucideIcon(category.icon, category.color, 20);
  LEAFLET_ICONS[key] = category.leafletIcon;
});
const DEFAULT_LEAFLET_ICON = LEAFLET_ICONS.other;

const getReportIcon = (reportFilterType) => {
  const categoryKey = reportFilterType && SPECIFIC_FILTER_CATEGORIES[reportFilterType] ? reportFilterType : 'other';
  return LEAFLET_ICONS[categoryKey] || DEFAULT_LEAFLET_ICON;
};

// --- Map Components ---
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && typeof center[0] === 'number' && typeof center[1] === 'number') {
      map.flyTo(center, zoom || map.getZoom(), {
        animate: true,
        duration: 1.0
      });
    }
  }, [center, zoom, map]);
  return null;
};

// --- Main Page Component ---
const ViewReportsMapPage = () => {
  const { reports, loading, error, fetchReports, removeReport } = useReports();

  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India
  const [mapZoom, setMapZoom] = useState(5);
  const [deletingId, setDeletingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(new Set(Object.keys(SPECIFIC_FILTER_CATEGORIES)));
  const [isControlsPanelOpen, setIsControlsPanelOpen] = useState(true);


  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const toggleFilter = useCallback((filterKey) => {
    setActiveFilters(prevFilters => {
      const newFilters = new Set(prevFilters);
      if (newFilters.has(filterKey)) {
        newFilters.delete(filterKey);
      } else {
        newFilters.add(filterKey);
      }
      return newFilters;
    });
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const categoryKey = (report.filter && SPECIFIC_FILTER_CATEGORIES[report.filter]) ? report.filter : 'other';
      const filterMatch = activeFilters.has(categoryKey);

      const searchNormalized = searchTerm.toLowerCase().trim();
      const searchMatch = searchNormalized === '' ||
        report.message.toLowerCase().includes(searchNormalized) ||
        (report.filter && report.filter.toLowerCase().includes(searchNormalized)) ||
        categoryKey.toLowerCase().includes(searchNormalized); // Search in resolved category label too
      return filterMatch && searchMatch;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Ensure newest are first for flyTo logic
  }, [reports, activeFilters, searchTerm]);

  useEffect(() => {
    if (filteredReports.length > 0) {
      const firstReport = filteredReports[0];
      setMapCenter([firstReport.latitude, firstReport.longitude]);
      // Optionally adjust zoom, e.g., if only one report, zoom in more.
      setMapZoom(filteredReports.length === 1 ? 14 : 10);
    } else if (!loading && reports.length > 0 && filteredReports.length === 0) {
      // Filters applied, no results, but there are reports. Keep current view or zoom out.
      // setMapZoom(6); // Example: zoom out slightly
    } else if (!loading && reports.length === 0) { // No reports at all
      setMapCenter([20.5937, 78.9629]);
      setMapZoom(5);
    }
  }, [filteredReports, loading, reports.length]);


  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        await removeReport(id); // This should trigger a re-fetch or update `reports` in context
      } catch (e) {
        console.error("Failed to delete report:", e);
        // Optionally show an error toast/message to the user
      } finally {
        setDeletingId(null);
      }
    }
  };

  const toggleAllFilters = () => {
    if (activeFilters.size === Object.keys(SPECIFIC_FILTER_CATEGORIES).length) {
      setActiveFilters(new Set()); // Deselect all
    } else {
      setActiveFilters(new Set(Object.keys(SPECIFIC_FILTER_CATEGORIES))); // Select all
    }
  };


  if (loading && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-slate-700">
        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-6" />
        <p className="text-2xl font-semibold">Loading Disaster Reports Map...</p>
        <p className="text-slate-500">Fetching latest updates for you.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-6 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <p className="text-2xl font-semibold">Map Data Error</p>
        <p className="mb-4">We encountered an issue loading the report data: {error.message || error}</p>
        <button
          onClick={() => { fetchReports(); /* Optionally clear error state here */ }}
          className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Try Reloading Data
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col"> {/* Main container, occupies full screen */}
      {/* This div handles the navbar offset and contains map + controls */}
      <div className="pt-20 flex-grow flex flex-col relative bg-slate-200"> {/* Adjust pt-20 if navbar height changes */}

        {/* Controls Panel Toggler */}
        <button
          onClick={() => setIsControlsPanelOpen(!isControlsPanelOpen)}
          className={`fixed z-[1001] top-24 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-all
                      ${isControlsPanelOpen ? 'rotate-180' : ''}`}
          title={isControlsPanelOpen ? "Hide Controls" : "Show Controls"}
        >
          <ListFilter className="w-6 h-6 text-slate-700" />
        </button>

        {/* Controls Panel (Search and Filters) */}
        {isControlsPanelOpen && (
          <div className="absolute top-40 left-4 right-4 md:left-auto md:w-[380px] z-[1000] p-3 sm:p-4 bg-white/95 backdrop-blur-lg shadow-2xl rounded-xl border border-slate-200/50 transition-all duration-300 ease-in-out">
            <div className="space-y-3 sm:space-y-4">
              {/* Search Bar */}
              <div>
                <label htmlFor="search-reports" className="sr-only">Search Reports</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="search-reports"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search messages, types..."
                    className="block w-full pl-10 pr-8 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder-slate-400 bg-white focus:bg-white"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-2 flex items-center" title="Clear search">
                      <XCircle className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Buttons */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Filter by Category:</h3>
                  <button
                    onClick={toggleAllFilters}
                    title={activeFilters.size === Object.keys(SPECIFIC_FILTER_CATEGORIES).length ? "Deselect All" : "Select All"}
                    className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    {activeFilters.size === Object.keys(SPECIFIC_FILTER_CATEGORIES).length ?
                      <EyeOff className="h-5 w-5 text-slate-600" /> :
                      <Eye className="h-5 w-5 text-slate-600" />
                    }
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(SPECIFIC_FILTER_CATEGORIES).map(([key, { label, icon: Icon, color }]) => (
                    <button
                      key={key}
                      onClick={() => toggleFilter(key)}
                      title={SPECIFIC_FILTER_CATEGORIES[key].description}
                      className={`
                        flex items-center justify-start text-left w-full px-2.5 py-2 rounded-md border text-xs sm:text-sm font-medium
                        transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1
                        ${activeFilters.has(key)
                          ? 'text-white shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                        }
                      `}
                      style={activeFilters.has(key) ? { backgroundColor: color, borderColor: color, boxShadow: `0 4px 10px -2px ${color}70` } : { borderColor: color + '50' }}
                    >
                      <Icon size={16} className={`mr-2 ${activeFilters.has(key) ? 'text-white' : ''}`} style={!activeFilters.has(key) ? { color: color } : {}} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="flex-grow z-0" // Ensure map is below controls
          style={{ height: '100%', width: '100%' }} // MapContainer itself fills the flex-grow space
        >
          <ChangeView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & RescueNet'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredReports.map(report => {
            const categoryKey = (report.filter && SPECIFIC_FILTER_CATEGORIES[report.filter]) ? report.filter : 'other';
            const categoryInfo = SPECIFIC_FILTER_CATEGORIES[categoryKey];
            const CategoryIcon = categoryInfo.icon;

            return (
              <Marker key={report._id} position={[report.latitude, report.longitude]} icon={getReportIcon(report.filter)}>
                <Popup minWidth={280} autoPanPaddingTopLeft={[10, 10]} autoPanPaddingBottomRight={[10, 10]}>
                  <div className="p-1 space-y-2.5">
                    <div className="flex items-center border-b pb-2 mb-2" style={{ borderColor: categoryInfo.color + '50' }}>
                      <div className="p-1.5 rounded-full mr-2.5" style={{ backgroundColor: categoryInfo.color + '20' }}>
                        <CategoryIcon size={20} style={{ color: categoryInfo.color }} />
                      </div>
                      <h3 className="text-base font-bold" style={{ color: categoryInfo.color }}>
                        {categoryInfo.label} Report
                      </h3>
                    </div>

                    <p className="text-sm text-slate-700 break-words leading-relaxed">
                      <MessageSquare size={14} className="inline mr-1.5 mb-0.5 text-slate-500" />
                      {report.message}
                    </p>

                    <p className="text-xs text-slate-500 flex items-center">
                      <MapPin size={12} className="mr-1.5 text-green-600" />
                      Lat: {report.latitude.toFixed(4)}, Lng: {report.longitude.toFixed(4)}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center">
                      <Clock size={12} className="mr-1.5 text-sky-600" />
                      {new Date(report.timestamp).toLocaleString()}
                    </p>

                    {/* Admin action: Delete button */}
                    {localStorage.getItem('adminAccess') === 'true' && ( // Only show if admin
                      <button
                        onClick={() => handleDeleteReport(report._id)}
                        disabled={deletingId === report._id}
                        className="mt-3 w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-60"
                      >
                        {deletingId === report._id ? (
                          <Loader2 className="animate-spin mr-1.5 h-4 w-4" />
                        ) : (
                          <Trash2 className="mr-1.5 h-4 w-4" />
                        )}
                        {deletingId === report._id ? 'Deleting...' : 'Delete Report'}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Overlay for No Filtered Results */}
        {filteredReports.length === 0 && !loading && reports.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent z-[500] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl text-center max-w-xs mx-auto border border-slate-200/80">
              <Search className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-700 font-semibold text-lg mb-1">No Matching Reports</p>
              <p className="text-sm text-slate-500">
                Try adjusting your search term or filter selections to find what you're looking for.
              </p>
            </div>
          </div>
        )}
        {/* Overlay for No Reports at All */}
        {reports.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-transparent z-[500] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-xl text-center max-w-xs mx-auto border border-slate-200/80">
              <MapPin size={48} className="mx-auto text-slate-400 mb-3" />
              <p className="text-slate-700 font-semibold text-lg mb-1">No Reports Yet</p>
              <p className="text-sm text-slate-500">As new reports are submitted, they will appear on the map.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReportsMapPage;