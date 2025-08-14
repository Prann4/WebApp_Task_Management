import React, { useState } from 'react';
import type { Task } from '../App';

type Props = {
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  onClose: () => void;
};

const TaskForm: React.FC<Props> = ({ addTask, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [detail, setDetail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState('Not Started');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !dueDate) {
      alert('Task Name and Due Date are required');
      return;
    }
    await addTask({ taskName, detail, dueDate, progress });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} style={{
      marginBottom: 20,
      padding: 10,
      border: '1px solid #ccc',
      borderRadius: 5,
      maxWidth: 400,
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ marginBottom: 10 }}>
        <label>Task Name: <br />
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            style={{ width: '100%', padding: 5 }}
            required
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Detail: <br />
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            style={{ width: '100%', padding: 5 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Due Date: <br />
          <input 
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            required 
            style={{ width: '100%', padding: 5 }}
          />
        </label>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Progress: <br />
          <select value={progress} onChange={(e) => setProgress(e.target.value)} style={{width: '100%', padding: 5}}>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Waiting/In Review</option>
            <option>Completed</option>
          </select>
        </label>
      </div>
      <button type="submit" style={{
        backgroundColor: '#00a5cf',
        color: 'white',
        border: 'none',
        padding: '8px 15px',
        borderRadius: 3,
        cursor: 'pointer',
        marginRight: 10
      }}>Add Task</button>
      <button 
        type="button" 
        onClick={onClose}
        style={{
          backgroundColor: '#cc0000',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          borderRadius: 3,
          cursor: 'pointer'
        }}
      >Cancel</button>
    </form>
  );
};

export default TaskForm;
