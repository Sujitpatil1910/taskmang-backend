// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// In-memory data
let tasks = [];

// Middleware for Authentication
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token === 'Bearer admin-token') {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Get all tasks with search, sort, filter
app.get('/tasks', authMiddleware, (req, res) => {
  const { search, status, sortBy = 'createdAt', order = 'asc' } = req.query;
  let result = [...tasks];

  if (search) {
    result = result.filter(task =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (status) {
    result = result.filter(task => task.status === status);
  }

  result.sort((a, b) => {
    if (order === 'desc') return new Date(b[sortBy]) - new Date(a[sortBy]);
    return new Date(a[sortBy]) - new Date(b[sortBy]);
  });

  res.json(result);
});

// Get task by ID
app.get('/tasks/:id', authMiddleware, (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// Create new task
app.post('/tasks', authMiddleware, (req, res) => {
  const { title, description } = req.body;
  if (!title || !description)
    return res.status(400).json({ message: 'Title and description are required' });

  const task = {
    id: uuidv4(),
    title,
    description,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  res.status(201).json(task);
});

// Update task
app.put('/tasks/:id', authMiddleware, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Task not found' });

  const { title, description, status } = req.body;
  if (!title || !description || !status)
    return res.status(400).json({ message: 'All fields are required' });

  tasks[index] = { ...tasks[index], title, description, status };
  res.json(tasks[index]);
});

// Delete task
app.delete('/tasks/:id', authMiddleware, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Task not found' });

  const deleted = tasks.splice(index, 1);
  res.json(deleted[0]);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
