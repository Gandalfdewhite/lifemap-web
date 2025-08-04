import React, { useState, useEffect } from 'react';

const LAMBDA_URL = 'https://your-lambda-url.on.aws/items';

export default function LifePlannerDashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });

  // Fetch all items on load
  useEffect(() => {
    fetch(LAMBDA_URL)
      .then(res => res.json())
      .then(setItems);
  }, []);

  // Handle input change
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add new item
  const handleAdd = async e => {
    e.preventDefault();
    const res = await fetch(LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const newItem = await res.json();
    setItems(items => [...items, newItem]);
    setForm({ title: '', description: '' });
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto' }}>
      <h2>Life Planner</h2>
      <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
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
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <strong>{item.title}</strong>: {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
