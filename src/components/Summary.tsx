import React from 'react';
import type { Task } from '../App';

type Props = {
  tasks: Task[];
  setView: (view: 'home' | 'taskList' | 'taskProgress') => void;
};

const Summary: React.FC<Props> = ({ tasks, setView }) => {
  const completedCount = tasks.filter(t => t.progress === 'Completed').length;
  const remainingCount = tasks.length - completedCount;

  return (
    <section>
      <h2 className="text-teal-400 text-4xl font-bold mb-12">Summary of Your Tasks</h2>

      {/* First task summary card with margin bottom */}
      <div className="w-full max-w-3xl !mb-6 p-10 text-white bg-teal-500 rounded-lg font-bold text-2xl flex items-center">
        <span className="text-xl mr-6">✓</span>
        You have completed {completedCount} task{completedCount !== 1 ? 's' : ''}
      </div>

      {/* Second task summary card with margin bottom */}
      <div className="w-full max-w-3xl !mb-10">
        <div className="p-10 text-white bg-teal-500 bg-opacity-90 rounded-lg font-bold text-2xl flex items-center">
          <span className="text-xl mr-6">☰</span>
          You still have {remainingCount} task{remainingCount !== 1 ? 's' : ''} left
        </div>
      </div>

      {/* Buttons below with horizontal gap */}
      <div className="w-full max-w-3xl flex justify-between items-start !gap-x-10">
        <button
          className="bg-cyan-600 text-white font-semibold text-2xl px-15 py-4 border-none rounded-lg cursor-pointer hover:bg-cyan-700 transition-colors"
          onClick={() => setView('taskList')}
        >
          See Your Task List
        </button>

        <button
          className="bg-cyan-600 text-white font-semibold text-2xl px-15 py-4 border-none rounded-lg cursor-pointer hover:bg-cyan-700 transition-colors"
          onClick={() => setView('taskProgress')}
        >
          Manage Your Task Progress
        </button>
      </div>
    </section>
  );
};

export default Summary;