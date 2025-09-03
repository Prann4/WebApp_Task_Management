import React, { useState } from 'react';
import type { Task } from '../App';
import CheckmarkIcon from './CheckmarkIcon';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select';

type Props = {
  tasks: Task[];
  updateProgress: (id: number, progress: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  isDarkMode: boolean;
};

type FilterType = 'all' | 'completed' | 'uncompleted';

const TaskList: React.FC<Props> = ({ tasks, updateProgress, addTask, deleteTask, isDarkMode }) => {
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
    
    // Validasi input
    if (!taskName || !taskName.trim()) {
      alert('Nama Task harus diisi');
      return;
    }
    if (!dueDate || !dueDate.trim()) {
      alert('Tanggal Jatuh Tempo harus diisi');
      return;
    }

    // Validasi format tanggal
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      alert("Mohon masukkan format tanggal yang valid (YYYY-MM-DD).");
      return;
    }

    // Validasi tanggal tidak boleh di masa lalu
    const today = new Date();
    const selectedDate = new Date(dueDate);
    today.setHours(0, 0, 0, 0); // Reset waktu untuk perbandingan yang akurat
    
    if (selectedDate < today) {
      alert("Tanggal jatuh tempo tidak boleh di masa lalu.");
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
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Gagal menambahkan task. Pastikan server backend sedang berjalan.");
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
      <h3 style={{ fontSize: '24px', color: isDarkMode ? '#ffffff' : '#000000' }}>Your Tasks</h3>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={() => setShowForm(prev => !prev)}
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--text-inverse)',
            border: 'none',
            padding: '8px 15px',
            borderRadius: 3,
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : '+ Add task'}
        </button>
        <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
          <SelectTrigger
            className="w-[180px]"
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
              border: isDarkMode ? '1px solid #404040' : '1px solid #d1d5db',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '14px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <SelectValue placeholder="Select a filter" />
          </SelectTrigger>
          <SelectContent
            style={{
              backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
              border: isDarkMode ? '1px solid #404040' : '1px solid #d1d5db',
              borderRadius: '6px',
              boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
              minWidth: '180px'
            }}
          >
            <SelectItem
              value="all"
              style={{
                color: isDarkMode ? '#ffffff' : '#000000',
                backgroundColor: 'transparent',
                padding: '8px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '4px',
                margin: '2px 6px'
              }}
              className={isDarkMode 
                ? "hover:bg-gray-600 focus:bg-gray-600 hover:shadow-md hover:transform hover:scale-[1.02]" 
                : "hover:bg-gray-300 focus:bg-gray-300 hover:shadow-md hover:transform hover:scale-[1.02]"
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px) scale(1.02)';
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0px) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              All Tasks
            </SelectItem>
            <SelectItem
              value="completed"
              style={{
                color: isDarkMode ? '#ffffff' : '#000000',
                backgroundColor: 'transparent',
                padding: '8px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '4px',
                margin: '2px 4px'
              }}
              className={isDarkMode 
                ? "hover:bg-gray-600 focus:bg-gray-600 hover:shadow-md hover:transform hover:scale-[1.02]" 
                : "hover:bg-gray-200 focus:bg-gray-200 hover:shadow-md hover:transform hover:scale-[1.02]"
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px) scale(1.02)';
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0px) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Completed Tasks
            </SelectItem>
            <SelectItem
              value="uncompleted"
              style={{
                color: isDarkMode ? '#ffffff' : '#000000',
                backgroundColor: 'transparent',
                padding: '8px 12px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '4px',
                margin: '2px 4px'
              }}
              className={isDarkMode 
                ? "hover:bg-gray-600 focus:bg-gray-600 hover:shadow-md hover:transform hover:scale-[1.02]" 
                : "hover:bg-gray-200 focus:bg-gray-200 hover:shadow-md hover:transform hover:scale-[1.02]"
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px) scale(1.02)';
                e.currentTarget.style.boxShadow = isDarkMode 
                  ? '0 4px 8px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 8px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0px) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Uncompleted Tasks
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      {showForm && (
        <form onSubmit={handleAddTask} style={{
          marginBottom: 20,
          padding: 15,
          border: '1px solid var(--border-primary)',
          borderRadius: 5,
          maxWidth: 400,
          backgroundColor: isDarkMode ? '#444' : 'var(--bg-secondary)'
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
            backgroundColor: 'var(--accent-primary)', color: 'var(--text-inverse)', border: 'none',
            padding: '8px 15px', borderRadius: 3, cursor: 'pointer', marginRight: 10
          }}>Add Task</button>
          <button 
            type="button" 
            onClick={() => setShowForm(false)}
            style={{
              backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)',
              padding: '8px 15px', borderRadius: 3, cursor: 'pointer'
            }}
          >Cancel</button>
        </form>
      )}
      <table style={{ borderCollapse: 'collapse', width: '100%', backgroundColor: isDarkMode ? '#333' : '#fff' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center', width: '50px', borderBottom: '2px solid var(--border-primary)', padding: 10 }}>Done</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid var(--border-primary)', padding: 10, fontSize: '18px' }}>Task Name</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid var(--border-primary)', padding: 10, fontSize: '18px' }}>Detail</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid var(--border-primary)', padding: 10, fontSize: '18px' }}>Due Date</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid var(--border-primary)', padding: 10, fontSize: '18px' }}>Progress</th>
            <th style={{ textAlign: 'left', borderBottom: '2px solid var(--border-primary)', padding: 10, fontSize: '18px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td style={{ padding: '8px 0', verticalAlign: 'middle', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CheckmarkIcon
                      completed={task.progress === 'Completed'}
                      onClick={() => handleToggleComplete(task)}
                    />
                  </div>
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
                      backgroundColor: 'var(--accent-primary)',
                      border: 'none',
                      color: '#ffffff',
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
                      backgroundColor: 'var(--accent-error)',
                      border: 'none',
                      color: '#ffffff',
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