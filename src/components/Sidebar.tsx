import React from 'react';

type Props = {
  view: string;
  setView: (view: 'home' | 'taskList' | 'taskProgress') => void;
};

const Sidebar: React.FC<Props> = ({ view, setView }) => {
  const linkStyle = (isActive: boolean) => ({
    background: isActive ? '#26eac2' : 'transparent',
    color: isActive ? '#000000ff' : '#ffffffff',
    fontWeight: 700,
    fontSize: 26,
    borderRadius: 8,
    padding: '12px 16px',
    marginBottom: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
    border: isActive ? '2.5px solid #26eac2' : 'none'
  });

  const iconStyle: React.CSSProperties = {
    marginRight: '12px',
    width: '24px',
    textAlign: 'center',
  };

  return (
    <aside style={{ backgroundColor: '#00bcd4', width: 250, padding: 20 }}>
      <nav>
        <a style={linkStyle(view === 'home')} onClick={() => setView('home')}>
          <span style={iconStyle} aria-hidden="true">⌂</span> Home
        </a>
        <a style={linkStyle(view === 'taskList')} onClick={() => setView('taskList')}>
          <span style={iconStyle} aria-hidden="true">☰</span> Task List
        </a>
        <a style={linkStyle(view === 'taskProgress')} onClick={() => setView('taskProgress')}>
          <span style={iconStyle} aria-hidden="true">✓</span> Task Progress
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;
