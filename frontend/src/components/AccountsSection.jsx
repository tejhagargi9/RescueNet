// src/components/AccountsSection.js
import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit, Trash2, ShieldCheck, ShieldOff, User, Users, AlertTriangle, RotateCw, Search } from 'lucide-react';
import AccountEditModal from './AccountEditModal';
import apiClient from '../api/axiosConfig'; // Ensure this path is correct
import { useAuthContext } from '../context/AuthContext'; // Assuming your AuthContext path

// --- AccountCard component (unchanged, assuming it's correct) ---
const AccountCard = ({ account, type, onEdit, onDelete, onToggleStatus }) => {
  // `type` prop might be redundant if account.role is reliable
  // console.log("AccountCard received:", account); // Keep this for debugging specific cards
  const userRoleDisplay = account.role.charAt(0).toUpperCase() + account.role.slice(1);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-orange-100 text-orange-700',
    pending_review: 'bg-yellow-100 text-yellow-700',
  };
  const statusText = {
    active: 'Active',
    suspended: 'Suspended',
    pending_review: 'Pending Review',
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-5 hover:shadow-2xl transition-all duration-300 border border-slate-200 flex flex-col justify-between">
      <div>
        <div className="flex items-start space-x-4 mb-4">
          <img
            src={account.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.fullName || account.email)}&background=random&color=fff&font-size=0.5`}
            alt={account.fullName || account.email}
            className="w-16 h-16 rounded-full object-cover border-2 border-sky-300 shadow-md flex-shrink-0"
            // Add onError handler for debugging image load failures
            onError={(e) => {
              console.warn(`Image failed to load for ${account.email}: ${e.target.src}. Falling back if primary src was account.imageUrl.`);
              // Optionally, if the primary src was account.imageUrl, you could force the fallback here,
              // but the OR condition in src should handle it if account.imageUrl was just a bad link.
              // This is more for logging or if the fallback itself can fail.
              // Example: if (e.target.src === account.imageUrl) e.target.src = `https://ui-avatars.com/api/...`; (already handled by ||)
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-800 truncate" title={account.fullName || account.email}>
              {account.fullName || account.email}
            </h3>
            <p className="text-sm text-sky-600 font-medium truncate" title={account.email}>{account.email}</p>
            <p className="text-xs text-slate-500 mt-0.5">Role: {userRoleDisplay}</p>
            <p className="text-xs text-slate-500 mt-0.5">Joined: {new Date(account.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`self-start mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusColors[account.accountStatus] || 'bg-slate-100 text-slate-700'}`}>
            {statusText[account.accountStatus] || account.accountStatus}
          </span>
        </div>

        {account.role === 'citizen' && (
          <div className="text-xs text-slate-600 space-y-1 mb-3">
            {account.age && <p><strong>Age:</strong> {account.age}</p>}
            {account.disabilities && <p><strong>Disabilities:</strong> {account.disabilities}</p>}
          </div>
        )}
        {account.role === 'volunteer' && (
           <div className="text-xs text-slate-600 space-y-1 mb-3">
            {account.addresses && account.addresses.length > 0 && (
                <p><strong>Service Areas:</strong> {account.addresses.join(', ')}</p>
            )}
           </div>
        )}
         <div className="text-xs text-slate-600 space-y-1 mb-3">
            {account.phoneNumbers && account.phoneNumbers.length > 0 && (
                <p><strong>Phone:</strong> {account.phoneNumbers.join(', ')}</p>
            )}
            {account.onboarded ? 
                <span className="text-green-600 font-medium">Onboarded</span> : 
                <span className="text-yellow-600 font-medium">Not Onboarded</span>
            }
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(account)}
          className="p-2 rounded-md text-slate-500 hover:text-white hover:bg-yellow-500 transition-all duration-200"
          title="Edit Account"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={() => onToggleStatus(account)}
          className={`p-2 rounded-md text-slate-500 transition-all duration-200 ${
            account.accountStatus === 'active'
            ? 'hover:text-white hover:bg-orange-500' // To suspend
            : 'hover:text-white hover:bg-green-500'   // To activate
          }`}
          title={account.accountStatus === 'active' ? "Suspend Account" : "Activate Account"}
        >
          {account.accountStatus === 'active' ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}
        </button>
        <button
          onClick={() => onDelete(account._id, account.fullName || account.email)}
          className="p-2 rounded-md text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-200"
          title="Delete Account"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
// --- End AccountCard component ---


const AccountsSection = () => {
  const { currentUser, fetchAllUsers } = useAuthContext();
  const [activeTab, setActiveTab] = useState('citizens');
  
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);

  const fetchUsersCallback = useCallback(async () => { // Renamed to avoid conflict with outer scope `fetchUsers` if it existed
    if (currentUser?.role !== 'admin') {
      setError("Access Denied: You are not authorized to view this section.");
      setIsLoading(false);
      setAllUsers([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await fetchAllUsers(); 
      setAllUsers(usersData || []);
    } catch (err) {
      console.error("Failed to fetch users in AccountsSection:", err);
      setError(err.message || (err.response?.data?.message) || "Failed to load user data.");
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.role, fetchAllUsers]);

  useEffect(() => {
    fetchUsersCallback();
  }, [fetchUsersCallback]);

  useEffect(() => {
    let roleToFilter = '';
    if (activeTab === 'citizens') {
      roleToFilter = 'citizen';
    } else if (activeTab === 'volunteers') {
      roleToFilter = 'volunteer';
    }
    // Extend with other roles if you add more tabs

    let usersToDisplay = allUsers;
    if (roleToFilter) {
        usersToDisplay = allUsers.filter(user => user.role === roleToFilter);
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      usersToDisplay = usersToDisplay.filter(user =>
        (user.fullName && user.fullName.toLowerCase().includes(lowerSearchTerm)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearchTerm))
      );
    }
    setFilteredUsers(usersToDisplay);
  }, [allUsers, activeTab, searchTerm]);


  const handleOpenEditModal = (account) => {
    setAccountToEdit(account);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setAccountToEdit(null);
  };

  const handleSaveAccount = async (updatedAccountData) => {
    if (!accountToEdit?._id) return false;
    try {
      const response = await apiClient.put(`/admin/users/${accountToEdit._id}`, updatedAccountData);
      // Ensure response.data contains full user object, including imageUrl
      setAllUsers(prevUsers =>
        prevUsers.map(u => (u._id === response.data._id ? response.data : u))
      );
      handleCloseEditModal();
      return true;
    } catch (err) {
      console.error("Failed to update account by admin:", err);
      alert(`Error updating account: ${err.response?.data?.message || err.message}`);
      return false;
    }
  };

  const handleDeleteAccount = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to permanently delete the account for "${userName}"? This action cannot be undone.`)) {
      try {
        await apiClient.delete(`/admin/users/${userId}`);
        setAllUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
        alert(`Account for "${userName}" deleted successfully.`);
      } catch (err) {
        console.error("Failed to delete account by admin:", err);
        alert(`Error deleting account: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleToggleAccountStatus = async (account) => {
    const newStatus = account.accountStatus === 'active' ? 'suspended' : 'active';
    const actionText = newStatus === 'suspended' ? 'suspend' : 'activate';

    if (window.confirm(`Are you sure you want to ${actionText} the account for "${account.fullName || account.email}"?`)) {
      try {
        const response = await apiClient.put(`/admin/users/${account._id}/status`, { accountStatus: newStatus });
        // Ensure response.data contains full user object, including imageUrl
        setAllUsers(prevUsers =>
          prevUsers.map(u => (u._id === response.data._id ? response.data : u))
        );
        alert(`Account for "${account.fullName || account.email}" has been ${newStatus}.`);
      } catch (err) {
        console.error(`Failed to ${actionText} account:`, err);
        alert(`Error ${actionText}ing account: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const accountTypeLabel = activeTab === 'citizens' ? 'Citizen' : activeTab === 'volunteers' ? 'Volunteer' : 'User';

  if (currentUser?.role !== 'admin' && !isLoading && !error) {
    return (
      <div className="p-6 bg-white shadow-xl rounded-lg text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-700">Access Denied</h2>
        <p className="text-slate-600 mt-2">You do not have permission to manage accounts.</p>
      </div>
    );
  }
  
  return (
    <div className="p-1"> {/* Reduced padding here for container, card has its own */}
      <div className="mb-6 pb-4 border-b border-slate-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
            {[
                { id: 'citizens', label: 'Citizens', icon: User },
                { id: 'volunteers', label: 'Volunteers', icon: Users }
                // Add more tabs here if needed, e.g., for 'admins'
            ].map((tab) => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                    flex items-center space-x-2 pb-3 px-1 border-b-2 font-semibold text-sm
                    transition-colors duration-200 ease-in-out focus:outline-none
                    ${
                    activeTab === tab.id
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-400'
                    }
                `}
                >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-sky-500' : 'text-slate-400'} />
                <span>{tab.label}</span>
                </button>
            ))}
            </nav>
            <div className="flex items-center gap-2">
                <button
                    onClick={fetchUsersCallback} // Use the renamed callback
                    disabled={isLoading}
                    className="p-2 text-slate-600 hover:text-sky-600 disabled:text-slate-400"
                    title="Refresh Users"
                >
                    <RotateCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
                {/* Add UserPlus button if you intend to have an "Add Account" feature here */}
                {/* <button
                  // onClick={handleOpenAddModal} // You'd need to implement this
                  className="p-2 rounded-md text-white bg-sky-500 hover:bg-sky-600 transition-all duration-200 flex items-center space-x-1"
                  title="Add New Account"
                >
                  <UserPlus size={18} />
                  <span className="text-sm hidden sm:inline">Add</span>
                </button> */}
            </div>
        </div>
        <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
                type="text"
                placeholder={`Search ${accountTypeLabel}s by name or email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
            />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-10">
          <RotateCw size={32} className="mx-auto text-sky-500 animate-spin mb-4" />
          <p className="text-slate-500">Loading user accounts...</p>
        </div>
      )}
      {!isLoading && error && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-md text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-700 font-medium">Error loading accounts</p>
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchUsersCallback} // Use the renamed callback
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-400 text-xs font-medium rounded shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      )}
      {!isLoading && !error && filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map(acc => (
            <AccountCard
              key={acc._id}
              account={acc}
              type={acc.role} // Pass role as type, though AccountCard might not use it if acc.role is reliable
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteAccount}
              onToggleStatus={handleToggleAccountStatus}
            />
          ))}
        </div>
      )}
      {!isLoading && !error && filteredUsers.length === 0 && (
         <div className="text-center py-12">
          <Users size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-500 text-lg font-medium">No {accountTypeLabel.toLowerCase()} accounts found{searchTerm && " matching your search"}.</p>
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="mt-2 text-sm text-sky-600 hover:underline">Clear search</button>
          )}
        </div>
      )}

      <AccountEditModal
        isOpen={isEditModalOpen}
        account={accountToEdit}
        onClose={handleCloseEditModal}
        onSave={handleSaveAccount}
      />
    </div>
  );
};

export default AccountsSection;