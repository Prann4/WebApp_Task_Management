import React from 'react';

type View = 'home' | 'taskList' | 'taskProgress';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, isDarkMode, toggleDarkMode }) => {
  const menuItems = [
    { 
      key: 'home', 
      label: 'Dashboard', 
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2} 
          width="20" 
          height="20"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      ) 
    },
    { 
      key: 'taskList', 
      label: 'Task List', 
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2} 
          width="20" 
          height="20"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7 7h10v10H7z" />
        </svg>
      )
    },
    { 
      key: 'taskProgress', 
      label: 'Progress Board', 
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2} 
          width="20" 
          height="20"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h18M3 12h12M3 8h6" />
        </svg>
      )
    },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Task Manager</h2>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="theme-toggle"
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          <div className="toggle-track">
          <div className="toggle-thumb">
          </div>
          </div>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.key} className="nav-item">
              <button
                onClick={() => setView(item.key as View)}
                className={`nav-button ${view === item.key ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="theme-info">
          <span className="theme-label">
            {isDarkMode ? 'Dark' : 'Light'} Mode
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;