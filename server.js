import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // In production, use environment variable

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

// ============== TASK ROUTES ==============

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
    ...req.body,
    createdAt: new Date().toISOString()
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

  tasks[taskIndex] = { 
    ...tasks[taskIndex], 
    ...req.body,
    updatedAt: new Date().toISOString()
  };
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

// ============== AUTH ROUTES ==============

// Register with full validation
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password, email, fullName } = req.body;

    // Validation: Check all required fields
    if (!username || !password || !email || !fullName) {
      return res.status(400).json({ 
        error: 'All fields are required (username, password, email, fullName)' 
      });
    }

    // Validation: Username length
    if (username.length < 3) {
      return res.status(400).json({ 
        error: 'Username must be at least 3 characters long' 
      });
    }

    // Validation: Password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validation: Full name length
    if (fullName.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Full name must be at least 2 characters long' 
      });
    }

    // Check if username already exists
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = users.find(u => u.email === email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: nextUserId++,
      username: username.trim(),
      password: hashedPassword,
      email: email.toLowerCase().trim(),
      fullName: fullName.trim(),
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    console.log('New user registered:', { id: newUser.id, username: newUser.username, email: newUser.email });

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { 
        id: newUser.id, 
        username: newUser.username,
        email: newUser.email 
      }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName
    };

    res.status(201).json({ 
      token, 
      user: userResponse,
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    console.log('User logged in:', { id: user.id, username: user.username });

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email 
      }, 
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email || '',
      fullName: user.fullName || username // Fallback for old users without fullName
    };

    res.json({ 
      token, 
      user: userResponse,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Return user data without password
  const userResponse = {
    id: user.id,
    username: user.username,
    email: user.email || '',
    fullName: user.fullName || user.username,
    createdAt: user.createdAt
  };

  res.json(userResponse);
});

// Update user profile
app.put('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { email, fullName, currentPassword, newPassword } = req.body;
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update email if provided
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Check if email is already used by another user
      const existingEmail = users.find(u => u.email === email && u.id !== req.user.id);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      user.email = email.toLowerCase().trim();
    }

    // Update fullName if provided
    if (fullName) {
      if (fullName.trim().length < 2) {
        return res.status(400).json({ 
          error: 'Full name must be at least 2 characters long' 
        });
      }
      user.fullName = fullName.trim();
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          error: 'Current password required to set new password' 
        });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Validate new password length
      if (newPassword.length < 6) {
        return res.status(400).json({ 
          error: 'New password must be at least 6 characters long' 
        });
      }

      // Hash and update password
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.updatedAt = new Date().toISOString();

    console.log('User profile updated:', { id: user.id, username: user.username });

    // Return updated user data
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName
    };

    res.json({ 
      message: 'Profile updated successfully', 
      user: userResponse 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal, but we can have a route for consistency)
app.post('/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// ============== UTILITY ROUTES ==============

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    users: users.length,
    tasks: tasks.length
  });
});

// Get server stats (for debugging - remove in production)
app.get('/stats', (req, res) => {
  res.json({
    totalUsers: users.length,
    totalTasks: tasks.length,
    userList: users.map(u => ({ 
      id: u.id, 
      username: u.username, 
      email: u.email,
      tasksCount: tasks.filter(t => t.userId === u.id).length 
    }))
  });
});

// ============== ERROR HANDLING ==============

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ============== START SERVER ==============

app.listen(PORT, () => {
  console.log('\n🚀 Server is running!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('\n📚 Available endpoints:');
  console.log('   Auth:');
  console.log('   - POST   /auth/register    (Register new user)');
  console.log('   - POST   /auth/login       (Login user)');
  console.log('   - GET    /auth/profile     (Get user profile)');
  console.log('   - PUT    /auth/profile     (Update user profile)');
  console.log('   - POST   /auth/logout      (Logout user)');
  console.log('   Tasks:');
  console.log('   - GET    /tasks            (Get all tasks)');
  console.log('   - POST   /tasks            (Create task)');
  console.log('   - GET    /tasks/:id        (Get task by ID)');
  console.log('   - PUT    /tasks/:id        (Update task)');
  console.log('   - DELETE /tasks/:id        (Delete task)');
  console.log('   Utility:');
  console.log('   - GET    /health           (Health check)');
  console.log('   - GET    /stats            (Server statistics)');
  console.log('\n');
})
.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use.`);
    console.error(`   Please stop the other process or use a different port.`);
  } else {
    console.error('❌ Server startup error:', err);
  }
  process.exit(1);
});