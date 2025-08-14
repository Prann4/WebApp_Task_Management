import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Summary from './components/Summary';
import TaskList from './components/TaskList';
import TaskProgressBoard from './components/TaskProgressBoard';

// Definisi tipe task
export type Task = {
  id: number;
  taskName: string;
  detail: string;
  dueDate: string;
  progress: string;
};

type View = 'home' | 'taskList' | 'taskProgress';

const apiUrl = 'http://localhost:5000/tasks';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>('home');
  const [error, setError] = useState<string | null>(null);
  

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      setError(errorMessage);
      console.error("Error updating task:", error);
    }
  };

  const addTask = async (newTask: Omit<Task, 'id'>) => {
    try {
      console.log("Adding new task:", newTask);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error('Failed to add task');
      const addedTask = await res.json();
      console.log("Task added successfully:", addedTask);
      setTasks(prevTasks => [addedTask, ...prevTasks]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      setError(errorMessage);
      console.error("Error adding task:", error);
    }
  };
  
  const deleteTask = async (id: number) => {
    try {
      console.log(`Attempting to delete task with ID: ${id}`);
      
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
        console.warn(`Task ${id} not found on server, removing from local state`);
        setTasks(tasks.filter(task => task.id !== id));
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Gagal menghapus tugas: ${res.status} ${res.statusText} - ${errorData.error || 'Error server'}`);
      }
      
      const result = await res.json();
      console.log('Penghapusan berhasil:', result);

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar view={view} setView={setView} />
      <main style={{ flexGrow: 1, padding: '20px', color: '#1a2930' }}>
        {error ? (
          <div style={{ color: 'red', padding: '20px', border: '1px solid red', borderRadius: '5px' }}>
            <strong>Error:</strong> {error}
          </div>
        ) : (
          <>
            {view === 'home' && <Summary tasks={tasks} setView={setView} />}
            {view === 'taskList' && (
              <TaskList 
                tasks={tasks} 
                updateProgress={updateProgress} 
                addTask={addTask} 
                deleteTask={deleteTask}
              />
            )}
            {view === 'taskProgress' && (
              <TaskProgressBoard 
                tasks={tasks} 
                updateProgress={updateProgress} 
                addTask={addTask}
                deleteTask={deleteTask}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
