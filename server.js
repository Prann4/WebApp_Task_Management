import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory task storage
let tasks = [];
let nextTaskId = 1;

// Get all tasks
app.get('/tasks', (req, res) => {
  console.log('GET /tasks'); // Log request
  res.json(tasks.map(task => ({
    id: task.id,
    taskName: task.taskName,
    detail: task.detail,
    dueDate: task.dueDate,
    progress: task.progress
  })));
});

// Get task by ID
app.get('/tasks/:id', (req, res) => {
  console.log(`GET /tasks/${req.params.id}`); // Log request
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Add new task
app.post('/tasks', (req, res) => {
  console.log('POST /tasks', req.body); // Log request
  const newTask = {
    id: nextTaskId++,
    ...req.body
  };
  tasks.push(newTask);
  console.log('New task added:', newTask); // Log new task
  res.status(201).json(newTask);
});

// Update task
app.put('/tasks/:id', (req, res) => {
  console.log(`PUT /tasks/${req.params.id}`, req.body); // Log request
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
  console.log(`DELETE /tasks/${req.params.id}`); // Log request
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ message: 'Task deleted successfully', task: deletedTask });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
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
