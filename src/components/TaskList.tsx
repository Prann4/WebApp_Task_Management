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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

type Props = {
  tasks: Task[];
  updateProgress: (id: number, progress: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  isDarkMode: boolean;
  user: { id: number; username: string } | null;
};

type FilterType = 'all' | 'completed' | 'uncompleted';

const TaskList: React.FC<Props> = ({ tasks, updateProgress, addTask, deleteTask, isDarkMode, user }) => {
  // State untuk dialog add task
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // State untuk formulir tugas baru
  const [taskName, setTaskName] = useState('');
  const [detail, setDetail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState('Not Started');

  const [filter, setFilter] = useState<FilterType>('all');

  // State untuk dialog update progress
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedProgress, setSelectedProgress] = useState('');

  // State untuk dialog delete task
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const handleToggleComplete = (task: Task) => {
    const newProgress = task.progress === 'Completed' ? 'In Progress' : 'Completed';
    updateProgress(task.id, newProgress);
  };

  const handleUpdate = (task: Task) => {
    setSelectedTask(task);
    setSelectedProgress(task.progress);
    setUpdateDialogOpen(true);
  };

  const handleUpdateProgress = async () => {
    if (selectedTask && selectedProgress) {
      await updateProgress(selectedTask.id, selectedProgress);
      setUpdateDialogOpen(false);
      setSelectedTask(null);
    }
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      setIsDeleteDialogOpen(false);
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
      setIsAddDialogOpen(false);
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Please log in to view tasks.</p>
      </div>
    );
  }

  return (
    <section>
      <h3 className={`text-xl mb-2.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>Your Tasks</h3>
      
      <div className="flex items-center gap-2.5 mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3.5 py-2 rounded-md h-10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + Add task
            </button>
          </DialogTrigger>
          <DialogContent 
            className="sm:max-w-[500px] border-2 shadow-xl"
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
              borderColor: '#3b82f6',
            }}
          >
            <DialogHeader className="pb-6 border-b-2" style={{ borderColor: '#3b82f6' }}>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-4 h-4 rounded-full bg-blue-600"
                ></div>
                <DialogTitle 
                  className="text-xl font-bold"
                  style={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}
                >
                  Add New Task
                </DialogTitle>
              </div>
              <DialogDescription 
                className="text-sm"
                style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
              >
                Create a new task and organize your work efficiently. Fill in the details below.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddTask}>
              <div 
                className="grid gap-6 py-6 px-1 rounded-lg"
                style={{ 
                  backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(59, 130, 246, 0.05)'
                }}
              >
                <div className="space-y-2">
                  <label 
                    htmlFor="taskName" 
                    className="block text-sm font-medium"
                    style={{ color: isDarkMode ? '#f9fafb' : '#1e293b' }}
                  >
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      </svg>
                      Task Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    id="taskName"
                    type="text"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full border-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                    style={{
                      borderColor: '#3b82f6',
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#f9fafb' : '#111827'
                    }}
                    placeholder="Enter a descriptive task name..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    htmlFor="taskDetail" 
                    className="block text-sm font-medium"
                    style={{ color: isDarkMode ? '#f9fafb' : '#1e293b' }}
                  >
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
                        <path d="M14,17H7V15H14M17,13H7V11H17M17,9H7V7H17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
                      </svg>
                      Task Details
                    </div>
                  </label>
                  <textarea
                    id="taskDetail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    className="w-full border-2 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:scale-[1.02] focus:shadow-md resize-none"
                    style={{
                      borderColor: '#3b82f6',
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#f9fafb' : '#111827'
                    }}
                    placeholder="Describe the task requirements, goals, or additional information..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    htmlFor="taskDueDate" 
                    className="block text-sm font-medium"
                    style={{ color: isDarkMode ? '#f9fafb' : '#1e293b' }}
                  >
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </svg>
                      Due Date <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    id="taskDueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 focus:scale-[1.02] focus:shadow-md"
                    style={{
                      borderColor: '#3b82f6',
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      color: isDarkMode ? '#f9fafb' : '#111827'
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    htmlFor="taskProgress" 
                    className="block text-sm font-medium"
                    style={{ color: isDarkMode ? '#f9fafb' : '#1e293b' }}
                  >
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
                        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/>
                      </svg>
                      Progress Status
                    </div>
                  </label>
                  <Select value={progress} onValueChange={(value) => setProgress(value)}>
                    <SelectTrigger 
                      className="w-full border-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 focus:scale-[1.02] focus:shadow-md flex items-center justify-between"
                      style={{
                        borderColor: '#3b82f6',
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        color: isDarkMode ? '#f9fafb' : '#111827'
                      }}
                    >
                      <SelectValue placeholder="Select progress status" />
                    </SelectTrigger>
                    <SelectContent className={`min-w-full rounded-md border shadow-lg ${
                      isDarkMode 
                        ? 'bg-[#1f2937] border-gray-600 shadow-black/50' 
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
              </div>

              <DialogFooter className="pt-6 border-t-2 gap-3" style={{ borderColor: '#3b82f6' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'transparent',
                    color: isDarkMode ? '#d1d5db' : '#374151',
                    borderColor: isDarkMode ? '#6b7280' : '#d1d5db'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-blue-700 shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                    </svg>
                    Add Task
                  </div>
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                  <Dialog open={isDeleteDialogOpen && taskToDelete?.id === task.id} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <button
                        onClick={() => handleDelete(task)}
                        className="bg-red-600 border-none text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </DialogTrigger>
                    <DialogContent 
                      className="sm:max-w-[400px] border-2 shadow-xl"
                      style={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        borderColor: '#ef4444',
                      }}
                    >
                      <DialogHeader className="pb-4 border-b-2" style={{ borderColor: '#ef4444' }}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red-600">
                              <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
                            </svg>
                          </div>
                          <DialogTitle 
                            className="text-xl font-bold text-red-600"
                          >
                            Delete Task
                          </DialogTitle>
                        </div>
                        <DialogDescription 
                          className="text-sm"
                          style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
                        >
                          This action cannot be undone. The task will be permanently removed from your list.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-4">
                        <div 
                          className="p-4 rounded-lg border-2 border-dashed"
                          style={{ 
                            borderColor: '#ef4444',
                            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
                          }}
                        >
                          <div className="space-y-2">
                            <h4 
                              className="font-semibold text-base"
                              style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}
                            >
                              {taskToDelete?.taskName}
                            </h4>
                            <p 
                              className="text-sm opacity-75"
                              style={{ color: isDarkMode ? '#d1d5db' : '#6b7280' }}
                            >
                              {taskToDelete?.detail || 'No details provided'}
                            </p>
                            <div 
                              className="flex items-center gap-1 text-xs"
                              style={{ color: isDarkMode ? '#9ca3af' : '#6b7280' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                              </svg>
                              Due: {taskToDelete?.dueDate}
                            </div>
                            <div 
                              className="text-xs font-medium px-2 py-1 rounded-full inline-block"
                              style={{
                                backgroundColor: taskToDelete?.progress === 'Completed' ? '#10b981' : 
                                                taskToDelete?.progress === 'In Progress' ? '#3b82f6' :
                                                taskToDelete?.progress === 'Waiting/In Review' ? '#ec4899' : '#f59e0b',
                                color: 'white'
                              }}
                            >
                              {taskToDelete?.progress}
                            </div>
                          </div>
                        </div>
                      </div>

                      <DialogFooter className="pt-4 border-t-2 gap-3" style={{ borderColor: '#ef4444' }}>
                        <button
                          type="button"
                          onClick={() => setIsDeleteDialogOpen(false)}
                          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: 'transparent',
                            color: isDarkMode ? '#d1d5db' : '#374151'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={confirmDelete}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-red-700 shadow-md"
                        >
                          <div className="flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            Delete Task
                          </div>
                        </button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Update Progress Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className={`max-w-md ${isDarkMode ? 'bg-[rgb(42,42,42)] border-gray-600' : 'bg-white border-gray-200'}`}>
          <DialogHeader>
            <DialogTitle className={`${isDarkMode ? 'text-white' : 'text-black'}`}>
              Update Task Progress
            </DialogTitle>
            <DialogDescription className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {selectedTask && `Update progress for: ${selectedTask.taskName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                Progress Status
              </label>
              <Select value={selectedProgress} onValueChange={setSelectedProgress}>
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
          </div>

          <DialogFooter className="flex gap-2">
            <button
              onClick={() => setUpdateDialogOpen(false)}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium px-4 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProgress}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Update Progress
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TaskList;