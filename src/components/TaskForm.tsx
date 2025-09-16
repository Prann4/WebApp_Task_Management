import React, { useState } from 'react';
import type { Task } from '../App';

type Props = {
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  onClose: () => void;
};

const TaskForm: React.FC<Props> = ({ addTask, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [detail, setDetail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [progress, setProgress] = useState('Not Started');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !dueDate) {
      alert('Task Name and Due Date are required');
      return;
    }
    await addTask({ taskName, detail, dueDate, progress });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-5 p-2.5 border border-gray-300 rounded max-w-md bg-gray-50">
      <div className="mb-2.5">
        <label className="block">Task Name: <br />
          <input
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className="w-full p-1.5 border border-gray-300 dark:border-gray-500"
            required
          />
        </label>
      </div>
      <div className="mb-2.5">
        <label className="block">Detail: <br />
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            className="w-full p-1.5 border border-gray-300 dark:border-gray-500"
          />
        </label>
      </div>
      <div className="mb-2.5">
        <label className="block">Due Date: <br />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="w-full p-1.5 border border-gray-300 dark:border-gray-500"
          />
        </label>
      </div>
      <div className="mb-2.5">
        <label className="block">Progress: <br />
          <select value={progress} onChange={(e) => setProgress(e.target.value)} className="w-full p-1.5 border border-gray-300 dark:border-gray-500">
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Waiting/In Review</option>
            <option>Completed</option>
          </select>
        </label>
      </div>
      <button type="submit" className="bg-cyan-600 text-white border-none px-3.5 py-2 rounded cursor-pointer mr-2.5 hover:bg-cyan-700 transition-colors">Add Task</button>
      <button
        type="button"
        onClick={onClose}
        className="bg-red-600 text-white border-none px-3.5 py-2 rounded cursor-pointer hover:bg-red-700 transition-colors"
      >Cancel</button>
    </form>
  );
};

export default TaskForm;