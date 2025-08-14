import React from 'react';
import type { Task } from '../App';

type Props = {
  tasks: Task[];
  updateProgress: (id: number, progress: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
};

const progressStatuses = [
  "Not Started",
  "In Progress",
  "Waiting/In Review",
  "Completed"
];

const TaskProgressBoard: React.FC<Props> = ({ tasks, updateProgress, addTask, deleteTask }) => {
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
    <div style={{ display: 'flex', gap: 16, paddingTop: 20 }}>
      {progressStatuses.map(status => {
        const filteredTasks = tasks.filter(task => task.progress === status);
        return (
          <div key={status} style={{
            flex: 1,
            backgroundColor: '#a0f2d9',
            borderRadius: 8,
            padding: 10,
            minHeight: 200
          }}>
            <h4 style={{
              color: '#00aa75',
              borderBottom: '2px solid #00aa75',
              paddingBottom: 10,
              fontSize: '18px',
              marginBottom: 15
            }}>
              {status}
              <button
                style={{
                  float: 'right',
                  backgroundColor: '#00a5cf',
                  color: 'white',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer',
                  padding: '4px 10px',
                  fontSize: '16px',
                }}
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
              <p style={{ fontStyle: 'italic', color: '#004c3f', fontSize: '16px' }}>No tasks</p>
            )}
            {filteredTasks.map(task => (
              <div key={task.id} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {task.progress === 'Completed' && (
                      <div style={{ color: '#28a745' }} title="Completed">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                        </svg>
                      </div>
                    )}
                    <h5 style={{ margin: 0, color: '#00796b', fontSize: '16px' }}>
                      {task.taskName}
                    </h5>
                  </div>
                  <button
                    onClick={() => handleDelete(task.id, task.taskName)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      fontSize: '20px',
                      padding: '0 5px',
                      lineHeight: '1',
                      marginLeft: '8px'
                    }}
                    title="Delete task"
                    aria-label={`Delete task ${task.taskName}`}
                  >&times;</button>
                </div>
                <p style={{ fontSize: 14, margin: '0 0 6px 0' }}>
                  {task.detail || 'No details provided'}
                </p>
                <p style={{ fontSize: 12, margin: 0, color: '#004c3f' }}>
                  Due on {task.dueDate}
                </p>
                
                {/* Navigation buttons with centered progress text */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <button
                    onClick={() => handleProgressNavigation(task.id, task.progress, '<')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#00a5cf',
                      color: 'white',
                      border: 'none',
                      borderRadius: 5,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {'<'}
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                    {task.progress}
                  </span>
                  <button
                    onClick={() => handleProgressNavigation(task.id, task.progress, '>')}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#00a5cf',
                      color: 'white',
                      border: 'none',
                      borderRadius: 5,
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
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
