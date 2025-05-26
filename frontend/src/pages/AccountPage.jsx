import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Heart, MapPin, Phone, Shield, Edit3, Trash2, Save, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

const AccountPage = () => {
  const { currentUser, updateUserProfile, deleteUserAccount, isLoading, userRole } = useAuthContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        role: currentUser.role || '',
        age: currentUser.age || '',
        disabilities: currentUser.disabilities || '',
        phoneNumbers: currentUser.phoneNumbers?.length ? [...currentUser.phoneNumbers] : [''],
        addresses: currentUser.addresses?.length ? [...currentUser.addresses] : [''],
        // location is not typically edited directly here, but could be shown
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      // Filter out empty strings from arrays before submitting
      const dataToSubmit = {
        ...formData,
        phoneNumbers: formData.phoneNumbers.filter(p => p && p.trim() !== ""),
        addresses: formData.addresses.filter(a => a && a.trim() !== ""),
      };
      if (dataToSubmit.phoneNumbers.length === 0) dataToSubmit.phoneNumbers = [""]; // Ensure at least one empty for backend if all removed
      if (dataToSubmit.addresses.length === 0) dataToSubmit.addresses = [""];

      await updateUserProfile(dataToSubmit);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await deleteUserAccount();
      navigate('/'); // Redirect to home after deletion
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete account.');
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    if (role === 'citizen') return <User className="w-5 h-5 mr-2 text-blue-500" />;
    if (role === 'volunteer') return <Heart className="w-5 h-5 mr-2 text-green-500" />;
    if (role === 'admin') return <Shield className="w-5 h-5 mr-2 text-purple-500" />;
    return <User className="w-5 h-5 mr-2 text-gray-500" />;
  }


  if (isLoading || !formData) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
  }
  if (!currentUser) {
    navigate('/'); // Should be handled by protected route, but as a fallback
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl"> {/* Added py-24 for navbar offset */}
      <div className="bg-white shadow-xl rounded-xl p-6 md:p-10 border border-gray-200/80">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Account</h1>
            <div className="flex items-center mt-2 text-gray-600">
              {getRoleIcon(currentUser.role)}
              <span className="capitalize">{currentUser.role || 'User'}</span>
              {currentUser.onboarded && <CheckCircle className="w-4 h-4 ml-2 text-green-500" title="Profile Complete" />}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition duration-150 shadow-md hover:shadow-lg"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> {error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {success}</div>}

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Basic Info (from Clerk, generally not editable here directly) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-lg text-gray-800 p-2 bg-gray-50 rounded-md">{currentUser.fullName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-lg text-gray-800 p-2 bg-gray-50 rounded-md">{currentUser.email || 'N/A'}</p>
            </div>
          </div>

          {/* Citizen Specific */}
          {formData.role === 'citizen' && (
            <>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} disabled={!isEditing}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} />
              </div>
              <div>
                <label htmlFor="disabilities" className="block text-sm font-medium text-gray-700">Medical Conditions / Disabilities</label>
                <textarea name="disabilities" id="disabilities" value={formData.disabilities} onChange={handleChange} disabled={!isEditing} rows="3"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} />
              </div>
            </>
          )}

          {/* Shared Fields: Phone Numbers and Addresses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
            {formData.phoneNumbers.map((phone, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <input type="tel" value={phone} onChange={(e) => handleArrayChange('phoneNumbers', index, e.target.value)} disabled={!isEditing}
                  className={`flex-grow px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} />
                {isEditing && formData.phoneNumbers.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem('phoneNumbers', index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            {isEditing && <button type="button" onClick={() => addArrayItem('phoneNumbers')} className="text-sm text-blue-600 hover:underline">+ Add phone number</button>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {userRole === 'citizen' ? 'Frequent Addresses' : 'Service Areas'}
            </label>
            {formData.addresses.map((address, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input type="text" value={address} onChange={(e) => handleArrayChange('addresses', index, e.target.value)} disabled={!isEditing}
                  className={`flex-grow px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${!isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} />
                {isEditing && formData.addresses.length > 1 && (
                  <button type="button" onClick={() => removeArrayItem('addresses', index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            {isEditing && <button type="button" onClick={() => addArrayItem('addresses')} className="text-sm text-blue-600 hover:underline">+ Add {userRole === 'citizen' ? 'address' : 'area'}</button>}
          </div>

          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-150 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form to original currentUser data if changes were made
                  if (currentUser) {
                    setFormData({
                      role: currentUser.role || '', age: currentUser.age || '', disabilities: currentUser.disabilities || '',
                      phoneNumbers: currentUser.phoneNumbers?.length ? [...currentUser.phoneNumbers] : [''],
                      addresses: currentUser.addresses?.length ? [...currentUser.addresses] : [''],
                    });
                  }
                  setError(''); setSuccess('');
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition duration-150"
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {/* Delete Account Section */}
        <div className="mt-12 pt-8 border-t border-gray-300/70">
          <h2 className="text-xl font-semibold text-red-600 mb-3">Danger Zone</h2>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg transition duration-150 shadow-md hover:shadow-lg"
            >
              <Trash2 className="w-4 h-4" /> Delete My Account
            </button>
          ) : (
            <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-red-700 font-medium">Are you sure you want to delete your account? This action cannot be undone.</p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-4 h-4" />} Yes, Delete Account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;