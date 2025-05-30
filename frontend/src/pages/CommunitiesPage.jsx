// src/components/communities/CommunitiesPage.jsx
import React, { useEffect, useContext, useState, useMemo } from 'react';
import { IncidentContext } from '../context/IncidentContext'; // Adjust path
import { useAuthContext } from '../context/AuthContext'; // Using the mock auth

import PostCard from '../components/communities/PostCard';
import PostFormModal from '../components/communities/PostFormModal';
import { PlusCircle, Users, Search, Filter, ArrowDownUp, AlertTriangle, Loader2, ListChecks, UserCheck } from 'lucide-react';

const CommunitiesPage = () => {
  const {
    incidents,
    loading: contextLoading,
    error: contextError,
    fetchIncidents,
    createIncident,
    updateIncident,
    deleteIncident,
    setCurrentIncident: setContextCurrentIncident, // Renaming to avoid conflict
    currentIncident: contextCurrentIncident,
    setError: setContextError
  } = useContext(IncidentContext);

  const { currentUser, isSignedIn } = useAuthContext();

  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostToEdit, setCurrentPostToEdit] = useState(null);
  const [formKey, setFormKey] = useState(Date.now()); // To reset form

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' or 'my'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'oldest'

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const handleCreateNew = () => {
    if (!isSignedIn) {
      alert("Please log in to create a post."); // Or redirect to login
      return;
    }
    setContextError(null);
    setCurrentPostToEdit(null);
    setContextCurrentIncident(null); // Clear context's currentIncident
    setIsEditing(false);
    setFormKey(Date.now()); // Reset form by changing key
    setShowFormModal(true);
  };

  const handleEdit = (post) => {
    setContextError(null);
    setCurrentPostToEdit(post);
    setContextCurrentIncident(post); // Set context's currentIncident for the form
    setIsEditing(true);
    setFormKey(Date.now()); // Reset form with new data
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      await deleteIncident(id);
      // Optionally, refresh incidents or rely on context's state update
      // fetchIncidents(); // if deleteIncident doesn't optimistically update or re-fetch
    }
  };

  const handleFormSubmit = async (incidentData) => {
    let success;
    // CRITICAL: Add userId if creating new post
    const dataWithUser = { ...incidentData, userId: currentUser?._id };

    if (isEditing && currentPostToEdit) {
      success = await updateIncident(currentPostToEdit._id, incidentData); // Backend should verify ownership
    } else {
      // Ensure createIncident in context can handle/pass userId to backend
      success = await createIncident(dataWithUser);
    }

    if (success) {
      setShowFormModal(false);
      setIsEditing(false);
      setCurrentPostToEdit(null);
      setContextCurrentIncident(null);
      // fetchIncidents(); // Re-fetch to see changes, or rely on optimistic updates in context
    }
    return success; // Important for the form to know if it should clear itself
  };

  const handleCancelForm = () => {
    setShowFormModal(false);
    setIsEditing(false);
    setCurrentPostToEdit(null);
    setContextCurrentIncident(null);
    setContextError(null);
  };

  const filteredAndSortedIncidents = useMemo(() => {
    let processedIncidents = [...incidents];

    // Filter by type (All or My Posts)
    if (filterType === 'my' && currentUser) {
      processedIncidents = processedIncidents.filter(inc => inc.userId === currentUser._id);
    }

    // Filter by search term (title, description, place)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      processedIncidents = processedIncidents.filter(inc =>
        inc.title.toLowerCase().includes(lowerSearchTerm) ||
        inc.description.toLowerCase().includes(lowerSearchTerm) ||
        inc.incidentPlace.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Sort
    processedIncidents.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else { // oldest
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

    return processedIncidents;
  }, [incidents, searchTerm, filterType, sortBy, currentUser]);

  // Enhanced loading state: true if context is loading and no incidents yet, or if form is submitting
  const isLoading = contextLoading && incidents.length === 0;


  return (
    <div className="min-h-screen !pt-28 bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center py-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 flex items-center mb-4 sm:mb-0">
            <Users className="mr-3 h-10 w-10" />
            Community Hub
          </h1>
          {isSignedIn && (
            <button
              onClick={handleCreateNew}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-base font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Report an Alert
            </button>
          )}
          {!isSignedIn && (
            <p className="text-sm text-indigo-700 bg-indigo-100 p-3 rounded-md">Please log in to post alerts.</p>
          )}
        </div>
      </header>

      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto mb-8 p-4 bg-white/80 backdrop-blur-md rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Search Input */}
          <div className="md:col-span-1">
            <label htmlFor="search-posts" className="block text-sm font-medium text-slate-700 mb-1">
              <Search size={16} className="inline mr-1" /> Search Alerts
            </label>
            <input
              id="search-posts"
              type="text"
              placeholder="Search by keyword, place..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Type (All/My) */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <Filter size={16} className="inline mr-1" /> Show
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterType('all')}
                disabled={!isSignedIn && filterType === 'my'}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                  ${filterType === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                <ListChecks size={16} className="mr-2" /> All Alerts
              </button>
              <button
                onClick={() => setFilterType('my')}
                disabled={!isSignedIn}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center
                  ${filterType === 'my' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'}`}
              >
                <UserCheck size={16} className="mr-2" /> My Alerts
              </button>
            </div>
          </div>

          {/* Sort By (Newest/Oldest) */}
          <div className="md:col-span-1">
            <label htmlFor="sort-by" className="block text-sm font-medium text-slate-700 mb-1">
              <ArrowDownUp size={16} className="inline mr-1" /> Sort By
            </label>
            <select
              id="sort-by"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Display Area */}
      <main className="max-w-7xl mx-auto">
        {contextError && !showFormModal && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <p className="font-bold">Error</p>
                <p>{contextError}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center text-slate-600 h-64">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-xl font-semibold">Loading Community Alerts...</p>
            <p>Please wait a moment.</p>
          </div>
        )}

        {!isLoading && !contextError && filteredAndSortedIncidents.length === 0 && (
          <div className="text-center text-slate-600 py-16 bg-white/50 rounded-xl shadow">
            <Users size={48} className="mx-auto mb-4 text-indigo-400" />
            <h3 className="text-2xl font-semibold mb-2">No Alerts Found</h3>
            <p className="text-md">
              {searchTerm || filterType === 'my'
                ? "No alerts match your current filters. Try adjusting them or "
                : "There are no community alerts yet. "}
              {isSignedIn && (
                <button onClick={handleCreateNew} className="text-indigo-600 hover:underline font-semibold">
                  be the first to post one!
                </button>
              )}
            </p>
          </div>
        )}

        {!isLoading && filteredAndSortedIncidents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {filteredAndSortedIncidents.map(post => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={currentUser?._id}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <PostFormModal
        show={showFormModal}
        onClose={handleCancelForm}
        incidentToEdit={currentPostToEdit}
        onFormSubmit={handleFormSubmit}
        formKey={formKey} // Pass key to modal then to form
      />
    </div>
  );
};

export default CommunitiesPage;