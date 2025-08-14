import React, { useState } from 'react';
import type { Task } from '../App';
import CheckmarkIcon from './CheckmarkIcon';

type Props = {
  tasks: Task[];
  updateProgress: (id: number, progress: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
};

type FilterType = 'all' | 'completed' | 'uncompleted';

const TaskList: React.FC<Props> = ({ tasks, updateProgress, addTask, deleteTask }) => {
  const [showForm, setShowForm] = useState(false);
  
  // State untuk formulir tugas baru
  const [taskName, setTaskName] = useState('');
  const [detail, setDetail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState('Not Started');

  const [filter, setFilter] = useState<FilterType>('all');

  const handleToggleComplete = (task: Task) => {
    const newProgress = task.progress === 'Completed' ? 'In Progress' : 'Completed';
    updateProgress(task.id, newProgress);
  };

  const handleUpdate = async (task: Task) => {
    const progress = prompt(
      "Update task progress (Not Started, In Progress, Waiting/In Review, Completed):",
      task.progress
    );
    if (progress && progress.trim()) {
      await updateProgress(task.id, progress.trim());
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTask(id);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !taskName.trim()) {
      alert('Task Name is required');
      return;
    }
    if (!dueDate || !dueDate.trim()) {
      alert('Due Date is required');
      return;
    }

    // Validasi format tanggal
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      alert("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    try {
      await addTask({ 
        taskName: taskName.trim(), 
        detail: detail.trim(), 
        dueDate: dueDate, 
        progress: progress 
      });
      // Reset dan sembunyikan formulir
      setTaskName('');
      setDetail('');
      setDueDate('');
      setProgress('Not Started');
      setShowForm(false);
    } catch {
      alert("Failed to add task. Please try again.");
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') {
      return task.progress === 'Completed';
    }
    if (filter === 'uncompleted') {
      return task.progress !== 'Completed';
    }
    return true;
  });

  return (
    <section>
      <h3 style={{ fontSize: '24px' }}>Your Tasks</h3>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={() => setShowForm(prev => !prev)}
          style={{
            backgroundColor: '#00a5cf',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : '+ Add task'}
        </button>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as FilterType)}
          style={{
            padding: '8px 12px',
            borderRadius: 3,
            border: '1px solid #ccc',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <option value="all">All Tasks</option>
          <option value="completed">Completed Tasks</option>
          <option value="uncompleted">Uncompleted Tasks</option>
        </select>
      </div>
      {showForm && (
        <form onSubmit={handleAddTask} style={{
          marginBottom: 20,
          padding: 15,
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
                style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                required
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Detail: <br />
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                style={{ width: '100%', padding: 8, boxSizing: 'border-box', minHeight: '60px' }}
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
                style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Progress: <br />
              <select value={progress} onChange={(e) => setProgress(e.target.value)} style={{width: '100%', padding: 8}}>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Waiting/In Review</option>
                <option>Completed</option>
              </select>
            </label>
          </div>
          <button type="submit" style={{
            backgroundColor: '#00a5cf', color: 'white', border: 'none',
            padding: '8px 15px', borderRadius: 3, cursor: 'pointer', marginRight: 10
          }}>Add Task</button>
          <button 
            type="button" 
            onClick={() => setShowForm(false)}
            style={{
              backgroundColor: '#e0e0e0', color: '#333', border: '1px solid #ccc',
              padding: '8px 15px', borderRadius: 3, cursor: 'pointer'
            }}
          >Cancel</button>
        </form>
      )}
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center', width: '50px', borderBottom: '2px solid #ccc', padding: 10 }}>Done</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: 10, fontSize: '18px' }}>Task Name</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: 10, fontSize: '18px' }}>Detail</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: 10, fontSize: '18px' }}>Due Date</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: 10, fontSize: '18px' }}>Progress</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid #ccc', padding: 10, fontSize: '18px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px 0', verticalAlign: 'middle', textAlign: 'center' }}>
                <CheckmarkIcon
                  completed={task.progress === 'Completed'}
                  onClick={() => handleToggleComplete(task)}
                />
              </td>
              <td style={{ padding: 8, fontSize: '16px' }}>{task.taskName}</td>
              <td style={{ padding: 8, fontSize: '16px' }}>{task.detail}</td>
              <td style={{ padding: 8, fontSize: '16px' }}>{task.dueDate}</td>
              <td style={{ padding: 8, fontSize: '16px' }}>{task.progress}</td>
              <td style={{ padding: 8, width: '150px' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => handleUpdate(task)} 
                    style={{
                      backgroundColor: '#00a5cf',
                      border: 'none',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: 3,
                      cursor: 'pointer'
                    }}
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    style={{
                      backgroundColor: '#e53e3e',
                      border: 'none',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: 3,
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

export default TaskList;
