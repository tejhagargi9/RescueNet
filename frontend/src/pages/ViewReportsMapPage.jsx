// src/components/reports/ViewReportsMapPage.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet'; // Import Leaflet library
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

import { useReports } from '../context/ReportContext';
import { Trash2, MapPin, MessageSquare, Clock, Loader2, AlertTriangle } from 'lucide-react';

// Fix for default marker icon issue with webpack/bundlers
delete L.Icon.Default.prototype._getIconUrl;
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// Custom hook to fly to a location when reports change
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, zoom || map.getZoom(), {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, zoom, map]);
  return null;
};


const ViewReportsMapPage = () => {
  const { reports, loading, error, fetchReports, removeReport } = useReports();
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India
  const [mapZoom, setMapZoom] = useState(5); // Default zoom
  const [deletingId, setDeletingId] = useState(null);


  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    // If reports are loaded and there's at least one, center map on the latest report
    if (reports.length > 0) {
      const latestReport = reports[0]; // Assuming sorted by newest
      setMapCenter([latestReport.latitude, latestReport.longitude]);
      setMapZoom(13); // Zoom in closer to the report
    } else if (!loading && reports.length === 0) {
      // If no reports, keep default or reset to a wider view
      setMapCenter([20.5937, 78.9629]);
      setMapZoom(5);
    }
  }, [reports, loading]);


  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      setDeletingId(id);
      await removeReport(id);
      setDeletingId(null);
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-700">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-xl font-semibold">Loading Reports Map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 text-red-700 p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-xl font-semibold">Error Loading Reports</p>
        <p className="text-center">{error}</p>
        <button
          onClick={fetchReports}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Try Again
        </button>
      </div>
    );
  }


  return (
    <div className="h-screen pt-20 w-screen flex flex-col">

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        style={{ height: 'calc(100vh - 64px)', width: '100%' }} // Adjust height if header size changes
        className="flex-grow"
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map(report => (
          <Marker key={report._id} position={[report.latitude, report.longitude]}>
            <Popup minWidth={250}>
              <div className="p-1 space-y-2">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center">
                  <MessageSquare size={18} className="mr-2 text-blue-500" />
                  Report Details
                </h3>
                <p className="text-sm text-slate-600 break-words">
                  <strong>Message:</strong> {report.message}
                </p>
                {report.userName && (
                  <p className="text-xs text-slate-500"><strong>Reported by:</strong> {report.userName}</p>
                )}
                <p className="text-xs text-slate-500 flex items-center">
                  <MapPin size={12} className="mr-1 text-green-500" />
                  Lat: {report.latitude.toFixed(4)}, Lng: {report.longitude.toFixed(4)}
                </p>
                <p className="text-xs text-slate-500 flex items-center">
                  <Clock size={12} className="mr-1 text-gray-500" />
                  Time: {new Date(report.timestamp).toLocaleString()}
                </p>
                <button
                  onClick={() => handleDeleteReport(report._id)}
                  disabled={deletingId === report._id}
                  className="mt-2 w-full inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50"
                >
                  {deletingId === report._id ? (
                    <Loader2 className="animate-spin mr-1 h-4 w-4" />
                  ) : (
                    <Trash2 className="mr-1 h-4 w-4" />
                  )}
                  {deletingId === report._id ? 'Deleting...' : 'Delete Report'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {reports.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-20 pointer-events-none">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <MapPin size={40} className="mx-auto text-slate-400 mb-2" />
            <p className="text-slate-600 font-semibold">No reports available to display on the map.</p>
            <p className="text-sm text-slate-500">New reports will appear here automatically.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReportsMapPage;