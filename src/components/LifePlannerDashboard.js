import React, { useState, useEffect } from 'react';

// Your Lambda Function URL (already includes /items endpoint for all CRUD ops)
const LAMBDA_URL = 'https://je3r7euop3gwsiq62fe7ng3nfu0tuhtq.lambda-url.us-west-2.on.aws/items';

export default function LifePlannerDashboard() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch all items on load
  useEffect(() => {
    fetch(LAMBDA_URL)
      .then(res => res.json())
      .then(setItems)
      .catch(() => setError('Failed to load items.'))
      .finally(() => setLoading(false));
  }, []);

  // Handle form input change
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add new item
  const handleAdd = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to add item.');
      const newItem = await res.json();
      setItems(items => [...items, newItem]);
      setForm({ title: '', description: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 16, background: '#f7fafc', borderRadius: 8 }}>
      <h2>Life Planner</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleAdd} style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          style={{ flex: 1, padding: 6 }}
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ flex: 2, padding: 6 }}
        />
        <button type="submit" style={{ padding: '6px 16px' }}>Add</button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {items.length === 0 && <li>No items yet.</li>}
          {items.map(item => (
            <li key={item.id} style={{ padding: 8, background: '#fff', marginBottom: 6, borderRadius: 4 }}>
              <strong>{item.title}</strong>
              <span style={{ marginLeft: 8 }}>{item.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
