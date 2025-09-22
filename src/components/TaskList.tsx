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

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';

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
      alert('Nama Task harus di isi');
      return;
    }
    if (!dueDate || !dueDate.trim()) {
      alert('Tanggal Jatuh Tempo harus di isi');
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
      
      <div className="flex items-center gap-2.5 mb-6">
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2 rounded-md h-10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showForm ? 'Cancel' : '+ Add task'}
        </button>
        <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
          <SelectTrigger className={`w-[180px] h-10 px-3 py-2 text-sm rounded-md border flex items-center justify-between ${
            isDarkMode 
              ? 'bg-[#2a2a2a] text-white border-[#404040]' 
              : 'bg-white text-black border-gray-300'
          }`}>
            <SelectValue placeholder="Select a filter" />
          </SelectTrigger>
          <SelectContent className={`min-w-[180px] rounded-md border shadow-lg ${
            isDarkMode 
              ? 'bg-[#2a2a2a] border-[#404040] shadow-black/50' 
              : 'bg-white border-gray-300 shadow-black/15'
          }`}>
            <SelectItem
              value="all"
              className={`px-3 py-2 mx-1.5 my-0.5 text-sm cursor-pointer rounded flex items-center justify-between transition-all duration-300 ease-out hover:translate-x-1 hover:scale-[1.02] hover:shadow-md bg-transparent ${
                isDarkMode 
                  ? 'text-white hover:bg-gray-600 focus:bg-gray-600 hover:shadow-black/30' 
                  : 'text-black hover:bg-gray-200 focus:bg-gray-200 hover:shadow-black/10'
              }`}
            >
              All Tasks
            </SelectItem>
            <SelectItem
              value="completed"
              className={`px-3 py-2 mx-1 my-0.5 text-sm cursor-pointer rounded flex items-center justify-between transition-all duration-300 ease-out hover:translate-x-1 hover:scale-[1.02] hover:shadow-md bg-transparent ${
                isDarkMode 
                  ? 'text-white hover:bg-gray-600 focus:bg-gray-600 hover:shadow-black/30' 
                  : 'text-black hover:bg-gray-200 focus:bg-gray-200 hover:shadow-black/10'
              }`}
            >
              Completed Tasks
            </SelectItem>
            <SelectItem
              value="uncompleted"
              className={`px-3 py-2 mx-1 my-0.5 text-sm cursor-pointer rounded flex items-center justify-between transition-all duration-300 ease-out hover:translate-x-1 hover:scale-[1.02] hover:shadow-md bg-transparent ${
                isDarkMode 
                  ? 'text-white hover:bg-gray-600 focus:bg-gray-600 hover:shadow-black/30' 
                  : 'text-black hover:bg-gray-200 focus:bg-gray-200 hover:shadow-black/10'
              }`}
            >
              Uncompleted Tasks
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add Task Form with Card Design */}
      {showForm && (
        <div className="mb-6">
          <Card className={`max-w-md ${isDarkMode ? 'bg-[rgb(42,42,42)] border-gray-600' : 'bg-white border-gray-200'}`}>
            <CardHeader className={isDarkMode ? 'bg-[rgb(42,42,42)]' : 'bg-white'}>
              <CardTitle className={`${isDarkMode ? 'text-white' : 'text-black'}`}>Add New Task</CardTitle>
            </CardHeader>
            <CardContent className={isDarkMode ? 'bg-[rgb(42,42,42)]' : 'bg-white'}>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    Task Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className={`w-full p-3 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isDarkMode
                        ? 'border-gray-600 bg-[rgb(42,42,42)] text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-800'
                        : 'border-gray-300 bg-white text-black placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="Enter task name"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    Detail
                  </label>
                  <textarea
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    className={`w-full p-3 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 resize-vertical min-h-[80px] ${
                      isDarkMode
                        ? 'border-gray-600 bg-[rgb(42,42,42)] text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-800'
                        : 'border-gray-300 bg-white text-black placeholder-gray-400 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    placeholder="Enter task details (optional)"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className={`w-full p-3 rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isDarkMode
                        ? 'border-gray-600 bg-[rgb(42,42,42)] text-white focus:border-blue-500 focus:ring-blue-800'
                        : 'border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    Progress
                  </label>
                  <Select value={progress} onValueChange={(value) => setProgress(value)}>
                    <SelectTrigger className={`w-full h-12 px-3 py-2 text-sm rounded-md border flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isDarkMode 
                        ? 'bg-[rgb(42,42,42)] text-white border-gray-600 focus:border-blue-500 focus:ring-blue-800' 
                        : 'bg-white text-black border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}>
                      <SelectValue placeholder="Select progress status" />
                    </SelectTrigger>
                    <SelectContent className={`min-w-full rounded-md border shadow-lg ${
                      isDarkMode 
                        ? 'bg-[#2a2a2a] border-gray-600 shadow-black/50' 
                        : 'bg-white border-gray-300 shadow-black/15'
                    }`}>
                      <SelectItem
                        value="Not Started"
                        className={`px-3 py-2 mx-1 my-0.5 text-sm cursor-pointer rounded transition-all duration-200 ease-out ${
                          isDarkMode 
                            ? 'text-white hover:bg-gray-600 focus:bg-gray-600' 
                            : 'text-black hover:bg-gray-100 focus:bg-gray-100'
                        }`}
                      >
                        Not Started
                      </SelectItem>
                      <SelectItem
                        value="In Progress"
                        className={`px-3 py-2 mx-1 my-0.5 text-sm cursor-pointer rounded transition-all duration-200 ease-out ${
                          isDarkMode 
                            ? 'text-white hover:bg-gray-600 focus:bg-gray-600' 
                            : 'text-black hover:bg-gray-100 focus:bg-gray-100'
                        }`}
                      >
                        In Progress
                      </SelectItem>
                      <SelectItem
                        value="Waiting/In Review"
                        className={`px-3 py-2 mx-1 my-0.5 text-sm cursor-pointer rounded transition-all duration-200 ease-out ${
                          isDarkMode 
                            ? 'text-white hover:bg-gray-600 focus:bg-gray-600' 
                            : 'text-black hover:bg-gray-100 focus:bg-gray-100'
                        }`}
                      >
                        Waiting/In Review
                      </SelectItem>
                      <SelectItem
                        value="Completed"
                        className={`px-3 py-2 mx-1 my-0.5 text-sm cursor-pointer rounded transition-all duration-200 ease-out ${
                          isDarkMode 
                            ? 'text-white hover:bg-gray-600 focus:bg-gray-600' 
                            : 'text-black hover:bg-gray-100 focus:bg-gray-100' 
                        }`}
                      >
                        Completed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </CardContent>
            <CardFooter className={isDarkMode ? 'bg-[rgb(42,42,42)]' : 'bg-white'}>
              <button 
                type="submit" 
                onClick={handleAddTask}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Task
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Table with proper Tailwind classes for light/dark mode */}
      <table className={`w-full border-collapse ${isDarkMode ? 'bg-[rgb(42,42,42)]' : 'bg-white'}`}>
        <thead>
          <tr>
            <th className={`text-center w-[50px] border-b-2 p-2.5 ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400 text-black'}`}>Done</th>
            <th className={`text-left border-b-2 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400 text-black'}`}>Task Name</th>
            <th className={`text-left border-b-2 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400 text-black'}`}>Detail</th>
            <th className={`text-left border-b-2 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400 text-black'}`}>Due Date</th>
            <th className={`text-left border-b-2 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400 text-black'}`}>Progress</th>
            <th className={`text-left border-b-2 p-2.5 text-lg ${isDarkMode ? 'border-gray-500 text-white' : 'border-gray-400 text-black'}`}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id} className={`border-b ${isDarkMode ? 'border-gray-500' : 'border-gray-400'}`}>
              <td className="py-2 px-0 align-middle text-center">
                <div className="flex flex-col items-center">
                  <CheckmarkIcon
                    completed={task.progress === 'Completed'}
                    onClick={() => handleToggleComplete(task)}
                  />
                </div>
              </td>
              <td className={`p-2 text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{task.taskName}</td>
              <td className={`p-2 text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{task.detail}</td>
              <td className={`p-2 text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{task.dueDate}</td>
              <td className={`p-2 text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>{task.progress}</td>
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