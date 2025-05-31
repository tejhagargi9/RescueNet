// src/components/shared/NotificationToaster.jsx
import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const icons = {
  error: <AlertTriangle className="w-5 h-5 text-red-500" />,
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
};

const bgColor = {
  error: 'bg-red-50 border-red-300',
  success: 'bg-green-50 border-green-300',
  info: 'bg-blue-50 border-blue-300',
  warning: 'bg-yellow-50 border-yellow-300',
};

const textColor = {
  error: 'text-red-700',
  success: 'text-green-700',
  info: 'text-blue-700',
  warning: 'text-yellow-700',
}

const NotificationToaster = () => {
  const { notifications, removeNotification } = useNotifications();

  if (!notifications.length) return null;

  return (
    <div className="fixed top-20 right-4 z-[2000] w-full max-w-sm space-y-3">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`p-4 rounded-lg shadow-lg flex items-start border ${bgColor[notif.type] || bgColor.info} animate-fadeInRight`}
        >
          <div className="flex-shrink-0 mr-3">
            {icons[notif.type] || icons.info}
          </div>
          <div className={`flex-grow ${textColor[notif.type] || textColor.info}`}>
            {notif.title && <h4 className="font-semibold text-sm">{notif.title}</h4>}
            <p className="text-sm">{notif.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notif.id)}
            className={`ml-3 text-slate-400 hover:text-slate-600 transition-colors`}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToaster;