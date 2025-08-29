import React from 'react';
import type { Task } from '../App';

type Props = {
  tasks: Task[];
  setView: (view: 'home' | 'taskList' | 'taskProgress') => void;
};

const Summary: React.FC<Props> = ({ tasks, setView }) => {
  const completedCount = tasks.filter(t => t.progress === 'Completed').length;
  const remainingCount = tasks.length - completedCount;

  return (
    <section>
     <h2 style={{ color: '#1abc9c', fontSize: '28px', fontWeight: 700, marginBottom: 24 }}>Summary of Your Tasks</h2>
      <div style={{
        width: '100%',
        maxWidth: '650px',
        margin: '10px 0 20px 0',
        padding: '20px',
        color: 'white',
        backgroundColor: '#44cea2',
        fontWeight: 600,
        borderRadius: 7,
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '22px', marginRight: '12px' }}>✓</span>
        You have completed {completedCount} task{completedCount !== 1 ? 's' : ''}
      </div>
      <div style={{
        width: '100%',
        maxWidth: '650px',
        margin: '10px 0 20px 0',
        padding: '20px',
        color: 'white',
        backgroundColor: '#44cea2',
        opacity: 0.92,
        fontWeight: 600,
        borderRadius: 7,
        fontSize: '18px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '22px', marginRight: '12px' }}>☰</span>
        You still have {remainingCount} task{remainingCount !== 1 ? 's' : ''} left
      </div>

      {/* Tombol-tombol seperti di gambar */}
      <div style={{ display: 'flex', gap: 28, marginTop: 28 ,}}>
        <button
          style={{
            backgroundColor: '#00a5cf',
            color: 'white',
            fontWeight: 600,
            fontSize: 22,
            padding: '16px 32px',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            marginRight: 10
          }}
          onClick={() => setView('taskList')}
        >See Your Task List</button>
        <button
          style={{
            backgroundColor: '#00a5cf',
            color: 'white',
            fontWeight: 600,
            fontSize: 22,
            padding: '16px 32px',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer'
          }}
          onClick={() => setView('taskProgress')}
        >Manage Your Task Progress</button>
      </div>
    </section>
  );
};

export default Summary;
