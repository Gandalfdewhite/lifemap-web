import React, { useEffect, useState } from 'react';

// Paste your Lambda Function URL here (NO /items at end)
const FUNCTION_URL = 'https://je3r7euop3gwsiq62fe7ng3nfu0tuhtq.lambda-url.us-west-2.on.aws/';

function LifePlannerDashboard() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch items on load
  useEffect(() => {
    setLoading(true);
    fetch(FUNCTION_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
          setError('');
        } else {
          setItems([]);
          setError(data?.error || 'Unknown error');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load: ' + err.message);
        setLoading(false);
      });
  }, []);

  // Add new item
  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { title, description, completed: false };
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.id) {
      setItems(items.concat(data));
      setTitle('');
      setDescription('');
    } else {
      setError(data.error || 'Failed to add item');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 16px #0002', padding: 24 }}>
      <h2>Dashboard Life Planner</h2>
      {loading ? <p>Loading...</p> : null}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      {/* List items */}
      <ul>
        {Array.isArray(items) && items.map(item => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <div>{item.description}</div>
            <div>Status: {item.completed ? 'Done' : 'Pending'}</div>
          </li>
        ))}
      </ul>

      {/* Add new item */}
      <form onSubmit={handleAdd} style={{ marginTop: 24 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={{ marginRight: 8 }}
        />
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description"
          required
          style={{ marginRight: 8 }}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default LifePlannerDashboard;
