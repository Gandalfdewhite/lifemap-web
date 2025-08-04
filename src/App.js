import React from 'react';
import LifePlannerDashboard from './components/LifePlannerDashboard'; // ← Add this import

function App() {
  return (
    <div className="app-container">
      <h1>Welcome to Lifemap fellow Farmers</h1>
      <LifePlannerDashboard /> {/* ← Add the dashboard component here */}
    </div>
  );
}

export default App;
