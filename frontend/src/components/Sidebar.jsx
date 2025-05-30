// Sidebar.jsx
import React from 'react';

const Sidebar = ({ activeSection, setActiveSection, items, LogoIcon, topOffset = "top-0" }) => {
  // Determine the effective height of the sidebar, considering the top offset
  // If topOffset is 'h-20' (5rem), then height should be 'calc(100vh - 5rem)'
  // Tailwind can handle this with dynamic classes if you construct them, or use style prop for calc.
  // For simplicity with Tailwind, we can adjust the `h-full` and `top` property.

  // If topOffset is "h-20", the top class will be "top-20"
  const topClass = topOffset.startsWith('h-') ? `top-${topOffset.substring(2)}` : topOffset;
  // Adjust height to be 100vh minus the offset. This is tricky with pure Tailwind `h-screen` or `h-full`.
  // `h-screen` refers to viewport height, `h-full` to parent.
  // For a fixed element, `h-screen` combined with `top-20` will mean it extends 5rem below the viewport.
  // We need its height to be `calc(100vh - 5rem)`.
  // A common way is to set bottom-0.

  return (
    <div 
      className={`w-64 bg-white text-slate-700 flex flex-col fixed ${topClass} left-0 bottom-0 z-50 shadow-lg border-r border-slate-200`}
      // Alternatively, for precise height control if topOffset is dynamic in pixels:
      // style={topOffsetInPixels ? { top: `${topOffsetInPixels}px`, height: `calc(100vh - ${topOffsetInPixels}px)` } : {}}
    >
      {/* Logo/Title - This is fine as its height is relative to the sidebar itself */}
      <div className="p-5 flex items-center space-x-3 border-b border-slate-200 h-20 flex-shrink-0">
        {LogoIcon && <LogoIcon className="h-9 w-9 text-sky-500 flex-shrink-0" />}
        <span className="text-xl font-semibold text-slate-800 tracking-tight truncate">Admin Panel</span>
      </div>

      {/* Navigation Links */}
      <nav className="mt-4 flex-1 px-3 space-y-1.5 overflow-y-auto">
        {/* ... (items.map logic remains the same) ... */}
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`
              group w-full flex items-center space-x-3 px-3 py-3 text-left text-[15px] rounded-lg
              transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sky-500
              ${
                activeSection === item.id
                  ? 'bg-sky-500 text-white shadow-md font-semibold' // Active state
                  : 'text-slate-600 hover:bg-slate-100 hover:text-sky-600 font-medium' // Default state
              }
            `}
          >
            <item.icon
              className={`h-5 w-5 mr-2 flex-shrink-0 transition-colors duration-200 
                ${activeSection === item.id ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'}`}
              aria-hidden="true"
            />
            <span className="truncate">{item.label}</span>
            {activeSection === item.id && (
              <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full mr-1.5 opacity-75"></span>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-200 mt-auto flex-shrink-0">
        <p className="text-xs text-slate-500 text-center">Panel v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;