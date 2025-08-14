import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for tasks
let tasks = [
  {
    id: 1,
    taskName: 'Sample Task 1',
    detail: 'This is a sample task',
    dueDate: '2024-12-31',
    progress: 'todo'
  },
  {
    id: 2,
    taskName: 'Sample Task 2',
    detail: 'Another sample task',
    dueDate: '2024-12-25',
    progress: 'in-progress'
  }
];

// A more robust way to generate IDs for an in-memory store
let nextTaskId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

// Get all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Get task by ID
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Add new task
app.post('/tasks', (req, res) => {
  console.log("Received request to add task:", req.body);
  const newTask = {
    id: nextTaskId++,
    ...req.body
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task
app.put('/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ message: 'Task deleted successfully', task: deletedTask });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: Port ${PORT} is already in use. Please choose another port.`);
    } else {
      console.error('Server startup error:', err);
    }
    process.exit(1);
  });
