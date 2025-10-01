import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let users = [];
let tasks = [];
let nextTaskId = 1;
let nextUserId = 1;

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all tasks for the authenticated user
app.get('/tasks', authenticateToken, (req, res) => {
  console.log('GET /tasks'); // Log request
  const userTasks = tasks.filter(task => task.userId === req.user.id);
  res.json(userTasks.map(task => ({
    id: task.id,
    taskName: task.taskName,
    detail: task.detail,
    dueDate: task.dueDate,
    progress: task.progress
  })));
});

// Get task by ID (only if belongs to user)
app.get('/tasks/:id', authenticateToken, (req, res) => {
  console.log(`GET /tasks/${req.params.id}`); // Log request
  const task = tasks.find(t => t.id === parseInt(req.params.id) && t.userId === req.user.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Add new task
app.post('/tasks', authenticateToken, (req, res) => {
  console.log('POST /tasks', req.body); // Log request
  const newTask = {
    id: nextTaskId++,
    userId: req.user.id,
    ...req.body
  };
  tasks.push(newTask);
  console.log('New task added:', newTask); // Log new task
  res.status(201).json(newTask);
});

// Update task (only if belongs to user)
app.put('/tasks/:id', authenticateToken, (req, res) => {
  console.log(`PUT /tasks/${req.params.id}`, req.body); // Log request
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id) && t.userId === req.user.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  res.json(tasks[taskIndex]);
});

// Delete task (only if belongs to user)
app.delete('/tasks/:id', authenticateToken, (req, res) => {
  console.log(`DELETE /tasks/${req.params.id}`); // Log request
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id) && t.userId === req.user.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ message: 'Task deleted successfully', task: deletedTask });
});

// Auth routes
// Register
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: nextUserId++,
      username,
      password: hashedPassword
    };

    users.push(newUser);
    const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);

    res.status(201).json({ token, user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal, but we can have a route for consistency)
app.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
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
