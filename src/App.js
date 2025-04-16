// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:3000/tasks';
const AUTH_HEADER = {
  headers: {
    Authorization: 'Bearer admin-token',
  },
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending' });
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', sortBy: 'createdAt', order: 'asc' });

  const fetchTasks = async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`${API_URL}?${query}`, AUTH_HEADER);
      setTasks(res.data);
    } catch (err) {
      alert('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, form, AUTH_HEADER);
      } else {
        await axios.post(API_URL, form, AUTH_HEADER);
      }
      setForm({ title: '', description: '', status: 'pending' });
      setEditId(null);
      fetchTasks();
    } catch (err) {
      alert('Error saving task');
    }
  };

  const handleEdit = (task) => {
    setEditId(task.id);
    setForm({ title: task.title, description: task.description, status: task.status });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, AUTH_HEADER);
      fetchTasks();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="App">
      <h1>Task Manager</h1>

      {/* Filter Bar */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select onChange={(e) => setFilters({ ...filters, status: e.target.value })} value={filters.status}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} value={filters.sortBy}>
          <option value="createdAt">Date</option>
          <option value="title">Title</option>
        </select>
        <select onChange={(e) => setFilters({ ...filters, order: e.target.value })} value={filters.order}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="task-form">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <select name="status" onChange={handleChange} value={form.status}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button type="submit">{editId ? 'Update' : 'Add'} Task</button>
      </form>

      {/* Task List */}
      <ul className="task-list">
        {tasks.length === 0 && <p>No tasks found.</p>}
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
            <div className="task-buttons">
              <button onClick={() => handleEdit(task)}>Edit</button>
              <button onClick={() => handleDelete(task.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
