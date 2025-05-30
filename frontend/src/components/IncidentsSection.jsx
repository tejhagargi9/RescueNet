import React, { useEffect, useContext, useState } from 'react';
import { IncidentContext } from '../context/IncidentContext';
import IncidentForm from './models/IncidentForm';
import { PlusCircle, Edit3, Trash2, FileText, Image as ImageIcon, MapPin } from 'lucide-react';

const IncidentsSection = () => {
  const {
    incidents,
    loading,
    error,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
    setCurrentIncident,
    currentIncident,
    fetchIncidentById,
    setError
  } = useContext(IncidentContext);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleCreateNew = () => {
    setError(null);
    setCurrentIncident(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = async (id) => {
    setError(null);
    const incidentData = await fetchIncidentById(id);
    if (incidentData) {
      setIsEditing(true);
      setShowForm(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this incident report? This action cannot be undone.')) {
      await deleteIncident(id);
    }
  };

  const handleFormSubmit = async (incidentData) => {
    let success;
    if (isEditing && currentIncident) {
      success = await updateIncident(currentIncident._id, incidentData);
    } else {
      success = await createIncident(incidentData);
    }
    if (success) {
      setShowForm(false);
      setIsEditing(false);
      setCurrentIncident(null);
      fetchIncidents();
    }
    return success;
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentIncident(null);
    setError(null);
  };

  return (
    <div className="p-6 bg-white shadow-xl rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <FileText className="mr-3 h-8 w-8 text-indigo-500" />
          Incident Reports Management
        </h2>
        {!showForm && (
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            New Incident
          </button>
        )}
      </div>

      {error && !showForm && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">Error: {error}</p>}

      {showForm && (
        <IncidentForm
          key={currentIncident ? currentIncident._id : 'create-incident'}
          incidentToEdit={currentIncident}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}

      {!showForm && (
        <>
          {loading && incidents.length === 0 && <p className="text-slate-500">Loading incidents...</p>}
          {!loading && incidents.length === 0 && <p className="text-slate-500">No incident reports found. Click "New Incident" to add one.</p>}

          {incidents.length > 0 && (
            <div className="space-y-4">
              {incidents.map(incident => (
                <div key={incident._id} className="bg-slate-50 p-4 rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-slate-700">{incident.title}</h3>
                      <p className="text-sm text-slate-600 mt-1 break-words">{incident.description}</p>
                      <div className="mt-2 text-sm text-slate-500 space-y-1">
                        <p className="flex items-center"><MapPin size={16} className="mr-2 text-green-500" /> <strong>Place:</strong> {incident.incidentPlace}</p>
                        <p className="text-xs text-gray-400">Reported: {new Date(incident.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {incident.imageUrl && (
                      <div className="mt-3 md:mt-0 md:ml-4 flex-shrink-0">
                        <img src={incident.imageUrl} alt={incident.title} className="w-32 h-32 object-cover rounded-md border border-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2 justify-end">
                    <button
                      onClick={() => handleEdit(incident._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                    >
                      <Edit3 className="h-4 w-4 mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(incident._id)}
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

export default IncidentsSection;