import React, { useEffect, useContext, useState } from 'react';
import { AlertContext } from '../context/AlertContext';
import AlertForm from './AlertForm';
import { PlusCircle, Edit3, Trash2, AlertTriangle, Image as ImageIcon, Clock, MapPin } from 'lucide-react';

const AlertsSection = () => {
  const {
    alerts,
    loading,
    error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    setCurrentAlert,
    currentAlert,
    fetchAlertById,
    setError
  } = useContext(AlertContext);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleCreateNew = () => {
    setError(null);
    setCurrentAlert(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = async (id) => {
    setError(null);
    const alertData = await fetchAlertById(id);
    if (alertData) {
      setIsEditing(true);
      setShowForm(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      await deleteAlert(id);
    }
  };

  const handleFormSubmit = async (alertData) => {
    let success;
    if (isEditing && currentAlert) {
      success = await updateAlert(currentAlert._id, alertData);
    } else {
      success = await createAlert(alertData);
    }
    if (success) {
      setShowForm(false);
      setIsEditing(false);
      setCurrentAlert(null);
      fetchAlerts();
    }
    return success;
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentAlert(null);
    setError(null);
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <AlertTriangle className="mr-3 h-8 w-8 text-orange-500" />
          Disaster Alerts Management
        </h2>
        {!showForm && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Alert
          </button>
        )}
      </div>

      {error && !showForm && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">Error: {error}</p>}

      {showForm && (
        <AlertForm
          key={currentAlert ? currentAlert._id : 'create-alert'}
          alertToEdit={currentAlert}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}

      {!showForm && (
        <>
          {loading && alerts.length === 0 && <p className="text-slate-500">Loading alerts...</p>}
          {!loading && alerts.length === 0 && <p className="text-slate-500">No disaster alerts found. Click "New Alert" to add one.</p>}

          {alerts.length > 0 && (
            <div className="space-y-4">
              {alerts.map(alert => (
                <div key={alert._id} className="bg-slate-50 p-4 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-700">{alert.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 break-words">{alert.description}</p>
                      <div className="mt-2 text-sm text-slate-500 space-y-1">
                        <p className="flex items-center"><MapPin size={16} className="mr-2 text-blue-500" /> <strong>Places:</strong> {alert.places.join(', ')}</p>
                        <p className="flex items-center"><Clock size={16} className="mr-2 text-purple-500" /> <strong>Disaster Time:</strong> {new Date(alert.disasterDateTime).toLocaleString()}</p>
                      </div>
                    </div>
                    {alert.imageUrl && (
                      <div className="mt-3 md:mt-0 md:ml-4 flex-shrink-0">
                        <img src={alert.imageUrl} alt={alert.title} className="w-32 h-32 object-cover rounded-md border border-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2 justify-end">
                    <button
                      onClick={() => handleEdit(alert._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                    >
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(alert._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AlertsSection;