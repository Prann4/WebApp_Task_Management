import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Summary from './components/Summary';
import TaskList from './components/TaskList';
import TaskProgressBoard from './components/TaskProgressBoard';
import './styles/darkmode.css'; // Import CSS untuk dark mode

// Definisi tipe task
export type Task = {
  id: number;
  taskName: string;
  detail: string;
  dueDate: string;
  progress: string;
};

type View = 'home' | 'taskList' | 'taskProgress';

const apiUrl = 'http://localhost:5001/tasks';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>('home');
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme to document root dan localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Enhanced toggle function
  const toggleDarkMode = () => {
    setIsDarkMode((prev: boolean) => !prev);
  };

  // Load tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };
    loadTasks();
  }, []);

  const updateProgress = async (id: number, progress: string) => {
    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ progress }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      const updatedTask = await res.json();
      setTasks(tasks.map(task => (task.id === id ? updatedTask : task)));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while updating the task';
      setError(errorMessage);
      console.error("Error updating task:", error);
    }
  };

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error('Failed to add task');
      const addedTask = await res.json();
      setTasks(prevTasks => [addedTask, ...prevTasks]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      setError(errorMessage);
      console.error("Error adding task:", error);
    }
  };
  
  const deleteTask = async (id: number) => {
    try {
      const taskExists = tasks.some(task => task.id === id);
      if (!taskExists) {
        setError(`Tugas dengan ID ${id} tidak ditemukan`);
        return;
      }
      
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.status === 404) {
        setTasks(tasks.filter(task => task.id !== id));
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Gagal menghapus tugas: ${res.status} ${res.statusText} - ${errorData.error || 'Error server'}`);
      }
      
      await res.json();
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus tugas';
      setError(errorMessage);
      console.error("Error menghapus tugas:", error);
      
      if (errorMessage.includes('Failed to fetch')) {
        setError('Tidak dapat terhubung ke server. Silakan periksa apakah backend sedang berjalan.');
      } else if (errorMessage.includes('404')) {
        setError('Tugas tidak ditemukan di server');
      }
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        view={view} 
        setView={setView} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
      />
      <main className="main-content">
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            <button 
              className="error-close"
              onClick={() => setError(null)}
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}
        
        {view === 'home' && <Summary tasks={tasks} setView={setView} />}
        {view === 'taskList' && (
          <TaskList 
            tasks={tasks} 
            updateProgress={updateProgress} 
            addTask={addTask} 
            deleteTask={deleteTask}
            isDarkMode={isDarkMode}
          />
        )}
        {view === 'taskProgress' && (
          <TaskProgressBoard 
            tasks={tasks} 
            updateProgress={updateProgress} 
            addTask={addTask}
            deleteTask={deleteTask}
            isDarkMode={isDarkMode}
          />
        )}
      </main>
    </div>
  );
};

export default App;