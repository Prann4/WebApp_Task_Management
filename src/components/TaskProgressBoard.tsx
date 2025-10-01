import React, { useState } from 'react';
import type { Task } from '../App';
import { Card, CardContent } from './ui/card';
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

const progressStatuses = [
  "Not Started",
  "In Progress", 
  "Waiting/In Review",
  "Completed"
];

// Define colors for each status
const statusColors = {
  "Not Started": {
    light: { bg: 'bg-white', border: 'border-gray-600', text: 'text-gray-500' }, // Gray theme
    dark: { bg: 'bg-slate-900', border: 'border-gray-600', text: 'text-gray-500' }
  },
  "In Progress": {
    light: { bg: 'bg-white', border: 'border-blue-500', text: 'text-blue-800' }, // Blue theme
    dark: { bg: 'bg-slate-900', border: 'border-blue-500', text: 'text-blue-300' }
  },
  "Waiting/In Review": {
    light: { bg: 'bg-white', border: 'border-yellow-500', text: 'text-yellow-500' }, // Yellow theme
    dark: { bg: 'bg-slate-900', border: 'border-yellow-500', text: 'text-yellow-300' }
  },
  "Completed": {
    light: { bg: 'bg-white', border: 'border-green-500', text: 'text-green-700' }, // Green theme
    dark: { bg: 'bg-slate-900', border: 'border-green-500', text: 'text-green-300' }
  }
};

// Card colors for each status
const cardColors = {
  "Not Started": {
    light: { bg: 'bg-white', border: 'border-gray-600' },
    dark: { bg: 'bg-slate-900', border: 'border-gray-600' }
  },
  "In Progress": {
    light: { bg: 'bg-white', border: 'border-blue-500' },
    dark: { bg: 'bg-slate-900', border: 'border-blue-500' }
  },
  "Waiting/In Review": {
    light: { bg: 'bg-white', border: 'border-yellow-500' },
    dark: { bg: 'bg-slate-900', border: 'border-yellow-500' }
  },
  "Completed": {
    light: { bg: 'bg-white', border: 'border-green-500' },
    dark: { bg: 'bg-slate-900', border: 'border-green-500' }
  }
};

const TaskProgressBoard: React.FC<Props> = ({ tasks, updateProgress, addTask, deleteTask, isDarkMode, user }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskDetail, setTaskDetail] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const handleProgressNavigation = async (taskId: number, currentProgress: string, direction: string) => {
    const progressLevels = ["Not Started", "In Progress", "Waiting/In Review", "Completed"];
    const currentIndex = progressLevels.indexOf(currentProgress);

    let newIndex = currentIndex;
    if (direction === '<') {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (direction === '>') {
      newIndex = Math.min(progressLevels.length - 1, currentIndex + 1);
    }

    await updateProgress(taskId, progressLevels[newIndex]);
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

  const handleAddTask = async () => {
    if (!taskName || !taskDueDate) {
      alert('Task Name and Due Date are required');
      return;
    }

    await addTask({
      taskName,
      detail: taskDetail,
      dueDate: taskDueDate,
      progress: selectedStatus
    });

    // Reset form
    setTaskName('');
    setTaskDetail('');
    setTaskDueDate('');
    setIsAddDialogOpen(false);
  };

  const openAddTaskDialog = (status: string) => {
    setSelectedStatus(status);
    setIsAddDialogOpen(true);
  };

  const getStatusColors = (status: string) => {
    const colors = statusColors[status as keyof typeof statusColors];
    return isDarkMode ? colors.dark : colors.light;
  };

  const getCardColors = (status: string) => {
    const colors = cardColors[status as keyof typeof cardColors];
    return isDarkMode ? colors.dark : colors.light;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-gray-500">Please log in to view tasks.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 pt-5 overflow-x-auto">
      {progressStatuses.map(status => {
        const filteredTasks = tasks.filter(task => task.progress === status);
        const statusColor = getStatusColors(status);
        
        return (
          <div 
            key={status} 
            className={`flex-1 min-w-[280px] rounded-xl p-4 min-h-[300px] shadow-sm border-2 ${statusColor.bg} ${statusColor.border}`}
          >
            <div className={`flex justify-between items-center mb-4 pb-3 border-b-2 ${statusColor.border}`}>
              <h4 className={`text-lg font-semibold m-0 ${statusColor.text}`}>
                {status}
                <span className="ml-2 text-sm font-normal opacity-75">
                  ({filteredTasks.length})
                </span>
              </h4>
              <Dialog open={isAddDialogOpen && selectedStatus === status} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <button
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap min-w-[100px] border-2 ${statusColor.border} ${statusColor.text}`}
                    onClick={() => openAddTaskDialog(status)}
                    title="Add task"
                    aria-label={`Add task to ${status}`}
                  >
                    ＋ Add Task
                  </button>
                </DialogTrigger>
                <DialogContent 
                  className={`sm:max-w-[500px] border-2 shadow-xl ${statusColor.bg} ${statusColor.border}`}
                >
                  {/* Header with status color styling */}
                  <DialogHeader className={`pb-6 border-b-2 ${statusColor.border}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className={`w-4 h-4 rounded-full ${statusColor.border}`}
                      ></div>
                      <DialogTitle 
                        className={`text-xl font-bold ${statusColor.text}`}
                      >
                        Add New Task
                      </DialogTitle>
                    </div>
                    <DialogDescription 
                      className={`text-sm ${statusColor.text} opacity-80`}
                    >
                      Create a new task for the <strong>"{status}"</strong> status. Fill in the details below.
                    </DialogDescription>
                  </DialogHeader>
  
                  {/* Form with card-like styling */}
                  <div 
                    className="grid gap-6 py-6 px-1 rounded-lg"
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'
                    }}
                  >
                    {/* Task Name Field */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="taskName" 
                        className={`block text-sm font-medium ${statusColor.text}`}
                      >
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                          Task Name *
                        </div>
                      </label>
                      <input
                        id="taskName"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        className={`w-full border-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 focus:scale-[1.02] focus:shadow-md ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-50' : 'border-gray-300 bg-white text-gray-900'}`}
                        placeholder="Enter a descriptive task name..."
                        required
                      />
                    </div>
  
                    {/* Task Detail Field */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="taskDetail" 
                        className={`block text-sm font-medium ${statusColor.text}`}
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
                        value={taskDetail}
                        onChange={(e) => setTaskDetail(e.target.value)}
                        className={`w-full border-2 rounded-lg px-4 py-3 text-sm transition-all duration-200 focus:scale-[1.02] focus:shadow-md resize-none ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-50' : 'border-gray-300 bg-white text-gray-900'}`}
                        placeholder="Describe the task requirements, goals, or additional information..."
                        rows={4}
                      />
                    </div>
  
                    {/* Due Date Field */}
                    <div className="space-y-2">
                      <label 
                        htmlFor="taskDueDate" 
                        className={`block text-sm font-medium ${statusColor.text}`}
                      >
                        <div className="flex items-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="opacity-70">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                          </svg>
                          Due Date *
                        </div>
                      </label>
                      <input
                        id="taskDueDate"
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className={`w-full border-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 focus:scale-[1.02] focus:shadow-md ${isDarkMode ? 'border-slate-600 bg-slate-800 text-slate-50' : 'border-gray-300 bg-white text-gray-900'}`}
                        required
                      />
                    </div>
                  </div>
  
                  {/* Action Buttons */}
                  <DialogFooter className={`pt-6 border-t-2 gap-3 ${statusColor.border}`}>
                    <button
                      type="button"
                      onClick={() => setIsAddDialogOpen(false)}
                      className={`px-6 py-3 border-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 bg-transparent ${statusColor.text} ${isDarkMode ? 'border-slate-600' : 'border-gray-300'}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-md text-white ${statusColor.border}`}
                    >
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
                        </svg>
                        Add Task
                      </div>
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {filteredTasks.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2 opacity-50">📝</div>
                  <p className="text-sm opacity-75" style={{ color: statusColor.text }}>
                    No tasks in this status
                  </p>
                </div>
              )}
              
              {filteredTasks.map(task => {
                const cardColor = getCardColors(status);
                
                return (
                  <Card
                    key={task.id}
                    className={`shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] border-2 ${cardColor.bg} ${cardColor.border}`}
                  >
                    <CardContent className="p-4">
                      {/* Header with title and delete button */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-2 flex-1">
                          {task.progress === 'Completed' && (
                            <div className="text-green-600 mt-0.5 flex-shrink-0" title="Completed">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                              </svg>
                            </div>
                          )}
                          <h5 className={`font-semibold text-base leading-tight break-words ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {task.taskName}
                          </h5>
                        </div>
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => handleDelete(task)}
                              className={`ml-2 p-1 text-red-500 rounded transition-colors flex-shrink-0 ${
                                isDarkMode 
                                  ? 'hover:text-red-400 hover:bg-red-900/30' 
                                  : 'hover:text-red-700 hover:bg-red-50'
                              }`}
                              title="Delete task"
                              aria-label={`Delete task ${task.taskName}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                              </svg>
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
                                This action cannot be undone. The task will be permanently removed from your board.
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
                                  <p className={`text-sm opacity-75 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {taskToDelete?.detail || 'No details provided'}
                                  </p>
                                  <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                                    </svg>
                                    Due: {taskToDelete?.dueDate}
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

                      {/* Task details */}
                      <div className="space-y-2 mb-4">
                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {task.detail || 'No details provided'}
                        </p>
                        <div className={`flex items-center gap-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="opacity-60">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                          </svg>
                          Due: {task.dueDate}
                        </div>
                      </div>

                      {/* Progress navigation */}
                      <div className="flex items-center justify-between rounded-lg p-2"
                           style={{
                             backgroundColor: isDarkMode ? cardColor.border + '30' : 'rgba(255, 255, 255, 0.5)'
                           }}>
                        <button
                          onClick={() => handleProgressNavigation(task.id, task.progress, '<')}
                          disabled={task.progress === "Not Started"}
                          className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: task.progress === "Not Started" ? '#9ca3af' : statusColor.border,
                            color: 'white'
                          }}
                        >
                          ←
                        </button>
                        
                        <span className="text-xs font-medium px-3 py-1 rounded-full"
                              style={{ 
                                backgroundColor: statusColor.border + '20',
                                color: statusColor.text,
                                border: `1px solid ${statusColor.border}40`
                              }}>
                          {task.progress}
                        </span>
                        
                        <button
                          onClick={() => handleProgressNavigation(task.id, task.progress, '>')}
                          disabled={task.progress === "Completed"}
                          className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: task.progress === "Completed" ? '#9ca3af' : statusColor.border,
                            color: 'white'
          }}
                        >
                          →
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskProgressBoard;