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
            <span className={`toggle-icon sun-icon ${isDarkMode ? 'hidden' : 'visible'}`} aria-hidden={!isDarkMode}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            </span>
            <span className={`toggle-icon moon-icon ${isDarkMode ? 'visible' : 'hidden'}`} aria-hidden={isDarkMode ? false : true}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </span>
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