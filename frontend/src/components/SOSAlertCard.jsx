// frontend/src/components/volunteer/SOSAlertCard.jsx
import React, { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { MapPin, MessageSquare, Clock, User, Edit, Loader2, AlertCircle, CheckCircle, XCircle, Send as SendIcon } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext'; // Import your AuthContext

const SOSAlertCard = ({ alert, onAlertUpdate }) => {
  const { currentUser } = useAuthContext(); // Get the logged-in user
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Find the current logged-in volunteer's specific response within this alert
  const currentVolunteerSpecificResponse = React.useMemo(() => {
    if (!currentUser || !currentUser._id) return null;
    return alert.respondedVolunteers.find(
      v => v.volunteerId === currentUser._id
    );
  }, [alert.respondedVolunteers, currentUser]);

  const responseOptions = [
    { value: 'Acknowledged', label: 'Acknowledge', icon: <CheckCircle size={16} /> },
    { value: 'EnRoute', label: 'I\'m On My Way', icon: <SendIcon size={16} /> },
    { value: 'Assisting', label: 'Currently Assisting', icon: <User size={16} /> },
    { value: 'UnableToAssist', label: 'Unable to Assist', icon: <XCircle size={16} /> },
    { value: 'ResolvedByVolunteer', label: 'Issue Resolved (My End)', icon: <CheckCircle size={16} className="text-green-500" /> },
  ];

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      setUpdateError("Please select a status.");
      return;
    }
    setLoadingUpdate(true);
    setUpdateError('');
    try {
      // Backend route `/api/sos/alerts/:alertId/response` relies on auth middleware 
      // to identify the volunteer making the update via req.user
      const response = await apiClient.put(`/sos/alerts/${alert._id}/response`, {
        responseStatus: selectedStatus,
      });
      onAlertUpdate(response.data.alert);
      setSelectedStatus('');
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Notified': return 'bg-blue-100 text-blue-700';
      case 'Acknowledged': return 'bg-yellow-100 text-yellow-700';
      case 'EnRoute': return 'bg-indigo-100 text-indigo-700';
      case 'Assisting': return 'bg-purple-100 text-purple-700';
      case 'ResolvedByVolunteer': return 'bg-green-100 text-green-700';
      case 'UnableToAssist': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-5 mb-6 border-l-4 border-red-500">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-slate-800">SOS from: {alert.citizenName}</h3>
        {currentVolunteerSpecificResponse && (
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(currentVolunteerSpecificResponse.responseStatus)}`}>
            Your Status: {currentVolunteerSpecificResponse.responseStatus}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-slate-600 mb-4">
        <p className="flex items-center"><AlertCircle size={16} className="mr-2 text-red-500" /> Overall Alert Status: <span className="font-medium">{alert.status}</span></p>
        <p className="flex items-center"><Clock size={16} className="mr-2 text-gray-500" /> Reported: {new Date(alert.createdAt).toLocaleString()}</p>
        <p className="flex items-center"><MapPin size={16} className="mr-2 text-green-600" /> Location: Lat {alert.citizenLocation.coordinates[1].toFixed(4)}, Lng {alert.citizenLocation.coordinates[0].toFixed(4)}</p>
        {alert.message && <p className="flex items-start"><MessageSquare size={16} className="mr-2 text-blue-600 mt-0.5 flex-shrink-0" /> Message: <span className="italic">{alert.message}</span></p>}
      </div>

      {/* Only show update options if the current user is one of the responded volunteers */}
      {currentVolunteerSpecificResponse && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label htmlFor={`status-select-${alert._id}`} className="block text-sm font-medium text-gray-700 mb-1">Update Your Response:</label>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <select
              id={`status-select-${alert._id}`}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full sm:flex-grow p-2 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="" disabled>Select new status...</option>
              {responseOptions.map(opt => (
                <option
                  key={opt.value}
                  value={opt.value}
                  // Disable option if it's the current status
                  disabled={currentVolunteerSpecificResponse?.responseStatus === opt.value}
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={loadingUpdate || !selectedStatus || (currentVolunteerSpecificResponse?.responseStatus === selectedStatus)}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center"
            >
              {loadingUpdate ? <Loader2 className="animate-spin mr-1 h-4 w-4" /> : <Edit size={16} className="mr-1" />}
              {loadingUpdate ? 'Updating...' : 'Update'}
            </button>
          </div>
          {updateError && <p className="mt-2 text-xs text-red-500">{updateError}</p>}
        </div>
      )}
    </div>
  );
};

export default SOSAlertCard;