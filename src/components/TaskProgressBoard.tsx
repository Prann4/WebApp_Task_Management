import React from 'react';
import type { Task } from '../App';

type Props = {
  tasks: Task[];
  updateProgress: (id: number, progress: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  isDarkMode: boolean;
};

const progressStatuses = [
  "Not Started",
  "In Progress",
  "Waiting/In Review",
  "Completed"
];

const TaskProgressBoard: React.FC<Props> = ({ tasks, updateProgress, addTask, deleteTask, isDarkMode }) => {
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

  const handleDelete = (id: number, taskName: string) => {
    if (window.confirm(`Are you sure you want to delete the task "${taskName}"?`)) {
      deleteTask(id);
    }
  };

  return (
    <div className="flex gap-4 pt-5">
      {progressStatuses.map(status => {
        const filteredTasks = tasks.filter(task => task.progress === status);
        return (
            <div key={status} className="flex-1 rounded-lg p-2.5 min-h-[200px]" style={{ backgroundColor: isDarkMode ? 'rgb(42, 42, 42)' : '#a7f3d0' }}>
            <h4 className={`pb-2.5 mb-4 text-lg flex justify-between items-center border-b-2 ${isDarkMode ? 'text-white border-white' : 'text-emerald-700 border-emerald-700'}`}>
              <span>{status}</span>
              <button
                className="bg-cyan-600 text-white border-none rounded cursor-pointer px-2.5 py-1 text-base flex-shrink-0 hover:bg-cyan-700 transition-colors"
                onClick={async () => {
                  const newTaskName = prompt(`New task name for '${status}':`);
                  if (!newTaskName) return;

                  const newTaskDetail = prompt("Detail (optional):") || '';
                  const newTaskDueDate = prompt("Due Date (YYYY-MM-DD):");
                  if (newTaskDueDate) {
                    await addTask({ taskName: newTaskName, detail: newTaskDetail, dueDate: newTaskDueDate, progress: status });
                  } else {
                    alert("A due date is required to create a task.");
                  }
                }}
                title="Add task"
                aria-label={`Add task to ${status}`}
              >＋</button>
            </h4>
            {filteredTasks.length === 0 && (
              <p className={`italic text-base ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No tasks</p>
            )}
            {filteredTasks.map(task => (
              <div key={task.id} className={`rounded-lg p-4 mb-3 shadow-md border-4 ${isDarkMode ? 'bg-slate-700' : 'bg-white/70'}`} style={{ borderColor: isDarkMode ? 'rgb(42, 42, 42)' : '#d1d5db' }}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {task.progress === 'Completed' && (
                      <div className="text-green-600" title="Completed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                        </svg>
                      </div>
                    )}
                    <h5 className={`m-0 text-base ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {task.taskName}
                    </h5>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id, task.taskName)}
                    className="bg-none border-none text-red-600 cursor-pointer text-xl p-0 px-1.5 leading-none ml-2 hover:text-red-700 transition-colors"
                    title="Delete task"
                    aria-label={`Delete task ${task.taskName}`}
                  >&times;</button>
                </div>
                <p className={`text-sm m-0 mb-1.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {task.detail || 'No details provided'}
                </p>
                <p className={`text-xs m-0 ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Due on {task.dueDate}
                </p>

                {/* Navigation buttons with centered progress text */}
                <div className="flex justify-between items-center mt-2.5">
                  <button
                    onClick={() => handleProgressNavigation(task.id, task.progress, '<')}
                    className="px-10 py-4 bg-cyan-600 text-white border-none rounded cursor-pointer text-lg hover:bg-cyan-700 transition-colors"
                  >
                    {'<'}
                  </button>
                  <span className={`text-lg font-bold text-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
                    {task.progress}
                  </span>
                  <button
                    onClick={() => handleProgressNavigation(task.id, task.progress, '>')}
                    className="px-10 py-4 bg-cyan-600 text-white border-none rounded cursor-pointer text-lg hover:bg-cyan-700 transition-colors"
                  >
                    {'>'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default TaskProgressBoard;