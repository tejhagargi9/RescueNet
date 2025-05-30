import React, { useEffect, useContext, useState } from 'react';
import { AlertContext } from '../context/AlertContext';
import AlertForm from '../components/AlertForm';

const AdminPage = () => {
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
    fetchAlertById
  } = useContext(AlertContext);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleCreateNew = () => {
    setCurrentAlert(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = async (id) => {
    const alertData = await fetchAlertById(id);
    if (alertData) {
      setIsEditing(true);
      setShowForm(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
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
      fetchAlerts(); // Refresh list
    }
    return success;
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setCurrentAlert(null);
  };

  if (loading && alerts.length === 0) return <p>Loading alerts...</p>;

  return (
    <div style={{ padding: '20px', marginTop: '100px' }}>
      <h1>Disaster Alert Admin Panel</h1>
      {error && !showForm && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!showForm && <button onClick={handleCreateNew}>Create New Alert</button>}

      {showForm && (
        <AlertForm
          key={currentAlert ? currentAlert._id : 'create'}
          alertToEdit={currentAlert}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}

      <h2>All Alerts</h2>
      {alerts.length === 0 && !loading && <p>No alerts found.</p>}
      {alerts && alerts.length > 0 && !loading && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {alerts.map(alert => (
            <li key={alert._id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px' }}>
              <h3>{alert.title}</h3>
              <p>{alert.description}</p>
              <p><strong>Places:</strong> {alert.places.join(', ')}</p>
              <p><strong>Disaster Time:</strong> {new Date(alert.disasterDateTime).toLocaleString()}</p>
              {alert.imageUrl && <img src={alert.imageUrl} alt={alert.title} style={{ maxWidth: '200px', maxHeight: '200px', display: 'block', margin: '10px 0' }} />}
              <button onClick={() => handleEdit(alert._id)} style={{ marginRight: '10px' }}>Edit</button>
              <button onClick={() => handleDelete(alert._id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}

    </div>
  );
};

export default AdminPage;