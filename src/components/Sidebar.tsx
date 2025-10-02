import React, { useState, useRef, useEffect } from 'react';

type View = 'home' | 'taskList' | 'taskProgress';

interface User {
  id: number;
  username: string;
}

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  logout: () => void;
}

// Lucide React Icons as inline SVG
const ChevronDown: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const LogOut: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ 
  view, 
  setView, 
  isDarkMode, 
  toggleDarkMode,
  user,
  logout
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
        {/* User Account Section */}
        {user && (
          <div className="user-section" style={{ marginBottom: '20px' }} ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="user-button animate-fade-in"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'var(--text-primary)',
                }}
              >
                {/* Avatar */}
                <div 
                  className="animate-scale-hover"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                  }}
                >
                  {getUserInitials(user.username)}
                </div>
              
              {/* User Info */}
              <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {user.username}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--text-muted)',
                }}>
                  ID: {user.id}
                </div>
              </div>
              
              {/* Chevron Icon */}
              <ChevronDown 
                style={{
                  width: '16px',
                  height: '16px',
                  color: 'var(--text-secondary)',
                  transition: 'transform 0.2s',
                  transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="animate-slide-down"
                style={{
                  marginTop: '8px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-md)',
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--accent-error)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}

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