// src/components/AccountsSection.js
import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit, Trash2, ShieldCheck, ShieldOff, User, Users, AlertTriangle, RotateCw, Search } from 'lucide-react';
import AccountEditModal from './AccountEditModal';
import apiClient from '../api/axiosConfig';
import { useAuthContext } from '../context/AuthContext';

// --- AccountCard component (remains unchanged as per instruction, but will not be used for list display) ---
const AccountCard = ({ account, type, onEdit, onDelete, onToggleStatus }) => {
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
            onError={(e) => {
              console.warn(`Image failed to load for ${account.email}: ${e.target.src}.`);
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
          className={`p-2 rounded-md text-slate-500 transition-all duration-200 ${account.accountStatus === 'active'
            ? 'hover:text-white hover:bg-orange-500'
            : 'hover:text-white hover:bg-green-500'
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


// --- AccountRow component ---
const AccountRow = ({ account, onEdit, onDelete, onToggleStatus }) => {
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
    <tr className="hover:bg-slate-50 transition-colors duration-150">
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              src={account.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.fullName || account.email)}&background=random&color=fff&font-size=0.5`}
              alt={account.fullName || account.email}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
              onError={(e) => {
                console.warn(`Image failed to load for ${account.email}: ${e.target.src}.`);
              }}
            />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900 truncate" title={account.fullName || account.email}>
              {account.fullName || account.email}
            </div>
            <div className="text-xs text-slate-500 truncate" title={account.email}>
              {account.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-sm text-slate-700">{userRoleDisplay}</div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[account.accountStatus] || 'bg-slate-100 text-slate-700'}`}>
          {statusText[account.accountStatus] || account.accountStatus}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap max-w-xs">
        <div className="text-sm text-slate-700 truncate" title={account.phoneNumbers?.join(', ')}>
          {(account.phoneNumbers && account.phoneNumbers.length > 0) ? account.phoneNumbers.join(', ') : <span className="text-slate-400 italic text-xs">N/A</span>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 max-w-md">
        <div className="space-y-0.5">
          {account.role === 'citizen' ? (
            <>
              {account.age && <p className="truncate" title={`Age: ${account.age}`}><strong>Age:</strong> {account.age}</p>}
              {account.disabilities && <p className="truncate" title={`Disabilities: ${account.disabilities}`}><strong>Disabilities:</strong> {account.disabilities}</p>}
              {!account.age && !account.disabilities && <span className="text-slate-400 text-xs italic">No specific details</span>}
            </>
          ) : account.role === 'volunteer' ? (
            <>
              {account.addresses && account.addresses.length > 0 ? (
                <p className="truncate" title={`Service Areas: ${account.addresses.join(', ')}`}><strong>Areas:</strong> {account.addresses.join(', ')}</p>
              ) : (
                <span className="text-slate-400 text-xs italic">No service areas</span>
              )}
            </>
          ) : (
            <span className="text-slate-400 text-xs italic">N/A</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        {account.onboarded ?
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Onboarded</span> :
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Not Onboarded</span>
        }
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
        {new Date(account.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-1">
        <button
          onClick={() => onEdit(account)}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-yellow-100 transition-all duration-200"
          title="Edit Account"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onToggleStatus(account)}
          className={`p-1.5 rounded-md text-slate-500 transition-all duration-200 ${account.accountStatus === 'active'
            ? 'hover:text-slate-700 hover:bg-orange-100'
            : 'hover:text-slate-700 hover:bg-green-100'
            }`}
          title={account.accountStatus === 'active' ? "Suspend Account" : "Activate Account"}
        >
          {account.accountStatus === 'active' ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
        </button>
        <button
          onClick={() => onDelete(account._id, account.fullName || account.email)}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 hover:bg-red-100 transition-all duration-200"
          title="Delete Account"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};
// --- End AccountRow component ---


const AccountsSection = () => {
  const { currentUser, fetchAllUsers: fetchAllUsersFromContext } = useAuthContext();
  const [activeTab, setActiveTab] = useState('citizens');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);

  const fetchUsersCallback = useCallback(async () => {
    setIsLoadingUsers(true);
    setErrorUsers(null);
    try {
      const usersData = await fetchAllUsersFromContext();
      setAllUsers(usersData || []);
    } catch (err) {
      console.error("AccountsSection: Failed to fetch users:", err);
      setErrorUsers(err.message || (err.response?.data?.message) || "Failed to load user data.");
      setAllUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [fetchAllUsersFromContext]);

  useEffect(() => {
    fetchUsersCallback();
  }, [currentUser, fetchUsersCallback]);

  useEffect(() => {
    let roleToFilter = '';
    if (activeTab === 'citizens') roleToFilter = 'citizen';
    else if (activeTab === 'volunteers') roleToFilter = 'volunteer';

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

  const handleOpenEditModal = (account) => { setAccountToEdit(account); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setAccountToEdit(null); };

  const handleSaveAccount = async (updatedAccountData) => {
    if (!accountToEdit?._id) return false;
    try {
      const response = await apiClient.put(`/admin/users/${accountToEdit._id}`, updatedAccountData);
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
  const authContextLoading = useAuthContext().isLoading;

  if (authContextLoading) {
    return (
      <div className="text-center py-10">
        <RotateCw size={32} className="mx-auto text-sky-500 animate-spin mb-4" />
        <p className="text-slate-500">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="p-1">
      <div className="mb-6 pb-4 border-b border-slate-300">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <nav className="flex space-x-2 sm:space-x-4" aria-label="Tabs">
            {[
              { id: 'citizens', label: 'Citizens', icon: User },
              { id: 'volunteers', label: 'Volunteers', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                    flex items-center space-x-2 pb-3 px-1 border-b-2 font-semibold text-sm
                    transition-colors duration-200 ease-in-out focus:outline-none
                    ${activeTab === tab.id
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
              onClick={fetchUsersCallback}
              disabled={isLoadingUsers}
              className="p-2 text-slate-600 hover:text-sky-600 disabled:text-slate-400"
              title="Refresh Users"
            >
              <RotateCw size={18} className={isLoadingUsers ? 'animate-spin' : ''} />
            </button>
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

      {isLoadingUsers && (
        <div className="text-center py-10">
          <RotateCw size={32} className="mx-auto text-sky-500 animate-spin mb-4" />
          <p className="text-slate-500">Loading user accounts...</p>
        </div>
      )}
      {!isLoadingUsers && errorUsers && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-md text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-700 font-medium">Error loading accounts</p>
          <p className="text-sm text-red-600">{errorUsers}</p>
          <button
            onClick={fetchUsersCallback}
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-400 text-xs font-medium rounded shadow-sm text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      )}
      {!isLoadingUsers && !errorUsers && filteredUsers.length > 0 && (
        <div className="overflow-x-auto shadow-md sm:rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Onboarded</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map(acc => (
                <AccountRow
                  key={acc._id}
                  account={acc}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteAccount}
                  onToggleStatus={handleToggleAccountStatus}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoadingUsers && !errorUsers && filteredUsers.length === 0 && (
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