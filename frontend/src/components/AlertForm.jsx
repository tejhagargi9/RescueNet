import React, { useState, useEffect, useContext } from 'react';
import { AlertContext } from '../context/AlertContext';

const AlertForm = ({ alertToEdit, onFormSubmit, onCancel }) => {
  const { loading, error, setError } = useContext(AlertContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [places, setPlaces] = useState('');
  const [disasterDateTime, setDisasterDateTime] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImageUrl, setExistingImageUrl] = useState('');


  useEffect(() => {
    setError(null); // Clear previous errors when form mounts or alertToEdit changes
    if (alertToEdit) {
      setTitle(alertToEdit.title);
      setDescription(alertToEdit.description);
      setPlaces(alertToEdit.places.join(', '));
      setDisasterDateTime(alertToEdit.disasterDateTime ? new Date(alertToEdit.disasterDateTime).toISOString().substring(0, 16) : '');
      setImage(null);
      setImagePreview('');
      setExistingImageUrl(alertToEdit.imageUrl || '');
    } else {
      setTitle('');
      setDescription('');
      setPlaces('');
      setDisasterDateTime('');
      setImage(null);
      setImagePreview('');
      setExistingImageUrl('');
    }
  }, [alertToEdit, setError]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExistingImageUrl(''); // Clear existing image if new one is selected
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setExistingImageUrl(''); // This will signal backend to remove image if desired, or handle via 'imageUrl' field
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const alertData = {
      title,
      description,
      places, // Keep as comma-separated string for backend
      disasterDateTime,
      image,
    };

    if (!alertToEdit) { // For create
      // Image is already in alertData.image
    } else { // For update
      if (!image && !existingImageUrl) { // If image cleared and no new one uploaded
        alertData.imageUrl = ""; // Signal to remove image
      } else if (!image && existingImageUrl) {
        alertData.imageUrl = existingImageUrl; // Keep existing image
      }
      // If new image, it's in alertData.image
    }

    const success = await onFormSubmit(alertData);
    if (success) {
      if (!alertToEdit) { // Reset form only on successful create
        setTitle('');
        setDescription('');
        setPlaces('');
        setDisasterDateTime('');
        setImage(null);
        setImagePreview('');
        setExistingImageUrl('');
        e.target.reset(); // Reset file input
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc' }}>
      <h3>{alertToEdit ? 'Edit Alert' : 'Create New Alert'}</h3>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <div>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label>Description:</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div>
        <label>Places (comma-separated):</label>
        <input type="text" value={places} onChange={(e) => setPlaces(e.target.value)} required />
      </div>
      <div>
        <label>Date and Time of Disaster:</label>
        <input type="datetime-local" value={disasterDateTime} onChange={(e) => setDisasterDateTime(e.target.value)} required />
      </div>
      <div>
        <label>Image:</label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>
      {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />}
      {!imagePreview && existingImageUrl && <img src={existingImageUrl} alt="Current" style={{ width: '100px', marginTop: '10px' }} />}
      {(imagePreview || existingImageUrl) && <button type="button" onClick={removeImage} style={{ marginLeft: '10px' }}>Remove Image</button>}

      <div style={{ marginTop: '10px' }}>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (alertToEdit ? 'Update Alert' : 'Create Alert')}
        </button>
        {onCancel && <button type="button" onClick={onCancel} disabled={loading} style={{ marginLeft: '10px' }}>Cancel</button>}
      </div>
    </form>
  );
};

export default AlertForm;