import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Summary from './components/Summary';
import TaskList from './components/TaskList';
import TaskProgressBoard from './components/TaskProgressBoard';
import AuthHeader from './components/AuthHeader';
import './styles/darkmode.css'; // Import CSS untuk dark mode
import './index.css';

// Definisi tipe task
export type Task = {
  id: number;
  taskName: string;
  detail: string;
  dueDate: string;
  progress: string;
};

type View = 'home' | 'taskList' | 'taskProgress';

type User = {
  id: number;
  username: string;
};

const apiUrl = 'http://localhost:5001/tasks';
const authUrl = 'http://localhost:5001/auth';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>('home');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');

  const login = async (username: string, password: string, isRegister: boolean) => {
    const endpoint = isRegister ? 'register' : 'login';
    const res = await fetch(`${authUrl}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Failed to ${isRegister ? 'register' : 'login'}`);
    }
    const { token: newToken, user: newUser } = await res.json();
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    // Refetch tasks
    await loadTasks();
  };

  const logout = () => {
    setUser(null);
    setToken('');
    setTasks([]);
    localStorage.removeItem('token');
    setError(null);
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  });

  const loadTasks = async () => {
    if (!token) {
      setTasks([]);
      return;
    }
    try {
      const res = await fetch(apiUrl, { headers: getHeaders() });
      if (res.status === 401) {
        logout();
        throw new Error('Session expired. Please log in again.');
      }
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      if (error instanceof Error && error.message.includes('401')) {
        logout();
      }
    }
  };

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

  // Check for saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // User will be set later if token is valid
    }
  }, []);

  // Load tasks when token changes
  useEffect(() => {
    loadTasks();
  }, [token]);

  const updateProgress = async (id: number, progress: string) => {
    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
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
        headers: getHeaders(),
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
        headers: getHeaders(),
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
      <AuthHeader user={user} login={login} logout={logout} />
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
            user={user}
          />
        )}
        {view === 'taskProgress' && (
          <TaskProgressBoard
            tasks={tasks}
            updateProgress={updateProgress}
            addTask={addTask}
            deleteTask={deleteTask}
            isDarkMode={isDarkMode}
            user={user}
          />
        )}
      </main>
    </div>
  );
};

export default App;