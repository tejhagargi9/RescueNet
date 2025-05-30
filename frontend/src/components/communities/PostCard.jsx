// src/components/communities/PostCard.jsx
import React from 'react';
import { MapPin, Clock, Edit3, Trash2, UserCircle } from 'lucide-react';

const PostCard = ({ post, currentUserId, onEdit, onDelete }) => {
  const isOwner = post.userId === currentUserId;

  // Fallback if post.userId is not available for display
  const authorDisplay = post.authorName || (isOwner ? "You" : `User ${post.userId ? post.userId.slice(-6) : 'Unknown'}`);


  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col">
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-56 object-cover"
        />
      )}
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">{post.title}</h3>
        <div className="flex items-center text-sm text-slate-500 mb-1">
          <UserCircle size={16} className="mr-2 text-blue-500" />
          <span>Posted by: {authorDisplay}</span>
        </div>
        <div className="flex items-center text-sm text-slate-500 mb-3">
          <MapPin size={16} className="mr-2 text-green-500" />
          <span>{post.incidentPlace}</span>
        </div>
        <p className="text-slate-600 text-sm mb-4 flex-grow break-words">
          {post.description.length > 150 ? `${post.description.substring(0, 147)}...` : post.description}
        </p>
        <div className="border-t border-slate-200 pt-4 mt-auto">
          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-400 flex items-center">
              <Clock size={14} className="mr-1" />
              {new Date(post.createdAt).toLocaleString()}
            </div>
            {isOwner && currentUserId && ( // Only show buttons if owner and logged in
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(post)}
                  className="p-2 text-xs font-medium rounded-md text-yellow-600 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                  aria-label="Edit post"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onDelete(post._id)}
                  className="p-2 text-xs font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  aria-label="Delete post"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;