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
      <h3 className={`text-xl mb-2.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>Your Tasks</h3>
      <div className="flex items-center gap-2.5 mb-2.5">
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="bg-blue-600 text-white border-none px-3.5 py-2 rounded cursor-pointer hover:bg-blue-700 transition-colors"
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
                ? "hover:bg-gray-60 focus:bg-gray-600 hover:shadow-md hover:transform hover:scale-[1.02]" 
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
        <form onSubmit={handleAddTask} className={`mb-5 p-3.5 border rounded max-w-md ${isDarkMode ? 'border-gray-500' : 'bg-gray-100 border-gray-300'}`} style={{ backgroundColor: isDarkMode ? 'rgb(42, 42, 42)' : undefined }}>
          <div className="mb-2.5">
            <label className={`block ${isDarkMode ? 'text-white' : ''}`}>Task Name: <br />
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className={`w-full p-2 box-border ${isDarkMode ? 'text-white' : ''}`}
                style={{ backgroundColor: isDarkMode ? 'rgb(42, 42, 42)' : undefined }}
                required
              />
            </label>
          </div>
          <div className="mb-2.5">
            <label className={`block ${isDarkMode ? 'text-white' : ''}`}>Detail: <br />
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                className={`w-full p-2 box-border min-h-[60px] ${isDarkMode ? 'text-white' : ''}`}
                style={{ backgroundColor: isDarkMode ? 'rgb(42, 42, 42)' : undefined }}
              />
            </label>
          </div>
          <div className="mb-2.5">
            <label className={`block ${isDarkMode ? 'text-white' : ''}`}>Due Date: <br />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className={`w-full p-2 box-border ${isDarkMode ? 'text-white' : ''}`}
                style={{ backgroundColor: isDarkMode ? 'rgb(42, 42, 42)' : undefined }}
              />
            </label>
          </div>
          <div className="mb-2.5">
            <label className={`block ${isDarkMode ? 'text-white' : ''}`}>Progress: <br />
              <select value={progress} onChange={(e) => setProgress(e.target.value)} className={`w-full p-2 ${isDarkMode ? 'text-white' : ''}`} style={{ backgroundColor: isDarkMode ? 'rgb(42, 42, 42)' : undefined }}>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Waiting/In Review</option>
                <option>Completed</option>
              </select>
            </label>
          </div>
          <button type="submit" className="bg-blue-600 text-white border-none px-3.5 py-2 rounded cursor-pointer mr-2.5 hover:bg-blue-700 transition-colors">Add Task</button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className={`px-3.5 py-2 rounded cursor-pointer border ${isDarkMode ? 'bg-gray-700 text-white border-gray-500' : 'bg-gray-200 text-black border-gray-300'} hover:bg-gray-300 transition-colors`}
          >Cancel</button>
        </form>
      )}
      <table className={`w-full border-collapse ${isDarkMode ? '' : 'bg-white'}`} style={{ backgroundColor: isDarkMode ? 'rgb(42, 42, 42)' : undefined }}>
          <thead>
          <tr>
            <th className={`text-center w-[50px] border-b-2 border-gray-400 p-2.5 ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400'}`}>Done</th>
            <th className={`text-left border-b-2 border-gray-400 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400'}`}>Task Name</th>
            <th className={`text-left border-b-2 border-gray-400 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400'}`}>Detail</th>
            <th className={`text-left border-b-2 border-gray-400 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400'}`}>Due Date</th>
            <th className={`text-left border-b-2 border-gray-400 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400'}`}>Progress</th>
            <th className={`text-left border-b-2 border-gray-400 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400'}`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id} className={`border-b border-gray-400 ${isDarkMode ? 'border-gray-500' : 'border-gray-400'}`}>
                <td className="py-2 px-0 align-middle text-center">
                  <div className="flex flex-col items-center">
                    <CheckmarkIcon
                      completed={task.progress === 'Completed'}
                      onClick={() => handleToggleComplete(task)}
                    />
                  </div>
                </td>
              <td className={`p-2 text-base ${isDarkMode ? 'text-white' : ''}`}>{task.taskName}</td>
              <td className={`p-2 text-base ${isDarkMode ? 'text-white' : ''}`}>{task.detail}</td>
              <td className={`p-2 text-base ${isDarkMode ? 'text-white' : ''}`}>{task.dueDate}</td>
              <td className={`p-2 text-base ${isDarkMode ? 'text-white' : ''}`}>{task.progress}</td>
              <td className="p-2 w-[150px]">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleUpdate(task)}
                    className="bg-blue-600 border-none text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="bg-red-600 border-none text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-red-700 transition-colors"
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