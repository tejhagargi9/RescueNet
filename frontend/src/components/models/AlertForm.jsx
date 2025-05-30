import React, { useState, useEffect, useContext } from 'react';
import { AlertContext } from '../../context/AlertContext';
import { UploadCloud, X, Image as ImageIcon, RotateCcw } from 'lucide-react';

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
    setError(null);
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
      setExistingImageUrl('');
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview('');
    setExistingImageUrl('');
    const fileInput = document.getElementById('alert-image-upload');
    if (fileInput) fileInput.value = ""; // Reset file input
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const alertData = {
      title,
      description,
      places,
      disasterDateTime,
      image,
    };

    if (alertToEdit) {
      if (!image && !existingImageUrl) {
        alertData.imageUrl = "";
      } else if (!image && existingImageUrl) {
        alertData.imageUrl = existingImageUrl;
      }
    }

    const success = await onFormSubmit(alertData);
    if (success && !alertToEdit) {
      setTitle('');
      setDescription('');
      setPlaces('');
      setDisasterDateTime('');
      setImage(null);
      setImagePreview('');
      setExistingImageUrl('');
      const fileInput = document.getElementById('alert-image-upload');
      if (fileInput) fileInput.value = "";
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
  const labelClass = "block text-sm font-medium text-slate-700";

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-2xl font-semibold mb-6 text-slate-700">{alertToEdit ? 'Edit Disaster Alert' : 'Create New Disaster Alert'}</h3>
      {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md mb-4">Error: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <label htmlFor="alert-title" className={labelClass}>Title:</label>
          <input id="alert-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="alert-datetime" className={labelClass}>Date and Time of Disaster:</label>
          <input id="alert-datetime" type="datetime-local" value={disasterDateTime} onChange={(e) => setDisasterDateTime(e.target.value)} required className={inputClass} />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="alert-places" className={labelClass}>Affected Places (comma-separated):</label>
        <input id="alert-places" type="text" value={places} onChange={(e) => setPlaces(e.target.value)} required className={inputClass} placeholder="e.g., City A, Town B, Region C" />
      </div>

      <div className="mb-4">
        <label htmlFor="alert-description" className={labelClass}>Description:</label>
        <textarea id="alert-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" className={inputClass}></textarea>
      </div>

      <div className="mb-6">
        <label className={labelClass}>Image (Optional):</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {!(imagePreview || existingImageUrl) && <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />}
            {(imagePreview || existingImageUrl) ? (
              <>
                <img src={imagePreview || existingImageUrl} alt="Preview" className="mx-auto h-32 w-auto object-contain rounded-md" />
                <button type="button" onClick={removeImage} className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  <X className="mr-1 h-4 w-4" /> Remove Image
                </button>
              </>
            ) : (
              <div className="flex text-sm text-slate-600">
                <label htmlFor="alert-image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500">
                  <span>Upload a file</span>
                  <input id="alert-image-upload" name="image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
            )}
            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        {onCancel &&
          <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50">
            Cancel
          </button>
        }
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50">
          {loading ? (
            <RotateCcw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
          ) : (alertToEdit ? 'Update Alert' : 'Create Alert')}
          {loading && 'Processing...'}
        </button>
      </div>
    </form>
  );
};

export default AlertForm;