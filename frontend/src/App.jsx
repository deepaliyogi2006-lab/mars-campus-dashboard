import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nodeStatus, setNodeStatus] = useState({ library: false, cafeteria: false, events: false });

  // Admin Form State Variables
  const [selectedService, setSelectedService] = useState('cafeteria');
  const [foodItem, setFoodItem] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookFloor, setBookFloor] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLoc, setEventLoc] = useState('');

  const checkSystemHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setNodeStatus(data);
    } catch (err) {
      setNodeStatus({ library: false, cafeteria: false, events: false });
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    setLoading(true); setReply(''); setPayload(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await response.json();
      setReply(data.assistantReply);
      setPayload(data.liveDataFetched);
    } catch (error) {
      setReply("🚨 Network error connecting to orchestrator hub.");
    } finally { setLoading(false); checkSystemHealth(); }
  };

  // Submit new data block to backend database cluster arrays
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    let bodyPayload = {};

    if (selectedService === 'cafeteria') {
      if (!foodItem.trim()) return;
      bodyPayload = { newItem: foodItem };
    } else if (selectedService === 'library') {
      if (!bookTitle.trim() || !bookFloor.trim()) return;
      bodyPayload = { title: bookTitle, floor: bookFloor, status: "Available" };
    } else if (selectedService === 'events') {
      if (!eventName.trim() || !eventTime.trim() || !eventLoc.trim()) return;
      bodyPayload = { name: eventName, time: eventTime, location: eventLoc };
    }

    try {
      const res = await fetch('/api/update-grid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetService: selectedService, payload: bodyPayload })
      });
      const result = await res.json();
      if (result.success) {
        alert(`Successfully injected data inside ${selectedService.toUpperCase()} Node Array!`);
        // Reset inputs
        setFoodItem(''); setBookTitle(''); setBookFloor(''); setEventName(''); setEventTime(''); setEventLoc('');
      }
    } catch (err) {
      alert("Error uploading parameters to data mesh grid network.");
    }
  };

  const renderVisualCard = () => {
    if (!payload) return null;
    if (payload.todaysSpecial) {
      return (
        <div className="rendered-card card-cafeteria">
          <div className="card-header">🍳 Live Cafeteria Hub Menu</div>
          <div className="card-body">
            <p><strong>Today's Special:</strong> <span className="highlight-text">{payload.todaysSpecial}</span></p>
            <p><strong>Vegetarian Options List:</strong></p>
            <ul className="card-list">
              {payload.vegOptions.map((item, idx) => <li key={idx}>🥗 {item}</li>)}
            </ul>
            <div className="card-footer">Operating Hours: {payload.hours}</div>
          </div>
        </div>
      );
    }
    if (payload.booksAvailable) {
      return (
        <div className="rendered-card card-library">
          <div className="card-header">📚 Live Library Inventory Node</div>
          <div className="card-body">
            {payload.booksAvailable.map((book, idx) => (
              <div key={idx} className="sub-item-row">
                <p style={{ margin: '0 0 4px 0' }}><strong>Title:</strong> {book.title}</p>
                <p style={{ margin: '0 0 4px 0' }}><strong>Location:</strong> {book.floor}</p>
                <span className={`badge ${book.status === 'Available' ? 'badge-green' : 'badge-red'}`}>{book.status}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (payload.upcomingEvents) {
      return (
        <div className="rendered-card card-events">
          <div className="card-header">📅 Live Campus Events Coordinator</div>
          <div className="card-body">
            {payload.upcomingEvents.map((event, idx) => (
              <div key={idx} className="sub-item-row">
                <p style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#60a5fa' }}><strong>{event.name}</strong></p>
                <p style={{ margin: '0 0 4px 0' }}>⏰ <strong>Time:</strong> {event.time} | 📍 <strong>Location:</strong> {event.location}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <header style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.6rem', color: '#818cf8', margin: '0 0 8px 0', fontWeight: 'bold' }}>MARS Campus Intelligence</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', margin: 0 }}>Distributed System Data Injection & Routing Matrix</p>
      </header>

      {/* Network health track bars */}
      <div className="status-bar">
        <div className="status-indicator"><span className="dot" style={{ backgroundColor: nodeStatus.library ? '#22c55e' : '#ef4444' }}></span> Library (Port 4001)</div>
        <div className="status-indicator"><span className="dot" style={{ backgroundColor: nodeStatus.cafeteria ? '#22c55e' : '#ef4444' }}></span> Cafeteria (Port 4002)</div>
        <div className="status-indicator"><span className="dot" style={{ backgroundColor: nodeStatus.events ? '#22c55e' : '#ef4444' }}></span> Events (Port 4003)</div>
      </div>
      
      {/* ⚡ OPTION A: Quick Query Suggestions Autocomplete Strip */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
        <button className="suggest-btn" onClick={() => { setInput("What's for lunch today?"); handleSendMessage("What's for lunch today?"); }}>🍔 Ask Cafeteria</button>
        <button className="suggest-btn" onClick={() => { setInput("Look for algorithms books"); handleSendMessage("Look for algorithms books"); }}>📖 Ask Library</button>
        <button className="suggest-btn" onClick={() => { setInput("Are there any workshops scheduled?"); handleSendMessage("Are there any workshops scheduled?"); }}>🎟️ Ask Events</button>
      </div>

      <div className="chat-card">
        <div className="input-group">
          <input 
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Query node endpoints using natural phrases..." className="custom-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={() => handleSendMessage()} className="custom-button" disabled={loading}>
            {loading ? 'Routing...' : 'Send Query'}
          </button>
        </div>
      </div>

      {reply && (
        <div className="response-bubble">
          <h3 style={{ margin: '0 0 8px 0', color: '#c7d2fe', fontSize: '0.95rem', textTransform: 'uppercase' }}>🤖 Assistant Analysis Response</h3>
          <p style={{ color: '#e0e7ff', margin: 0, fontSize: '1.1rem' }}>{reply}</p>
        </div>
      )}

      {renderVisualCard()}

      {/* 🛠️ OPTION B: Live Data Management Injection Form Panel */}
      <div className="chat-card" style={{ marginTop: '30px', borderColor: '#334155' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#cbd5e1' }}>⚙️ Grid Management: Dynamic Payload Data Injection</h3>
        <form onSubmit={handleAdminSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#94a3b8' }}>Target Microservice Sub-Node:</label>
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="custom-input" style={{ width: '100%', background: '#0f172a' }}>
              <option value="cafeteria">Cafeteria Node Cluster (Port 4002)</option>
              <option value="library">Library Inventory Node Cluster (Port 4001)</option>
              <option value="events">Calendar Events Cluster (Port 4003)</option>
            </select>
          </div>

          {selectedService === 'cafeteria' && (
            <input type="text" value={foodItem} onChange={(e) => setFoodItem(e.target.value)} placeholder="Add dish (e.g., Veg Hakka Noodles)" className="custom-input" style={{ width: '100%', marginBottom: '15px' }} />
          )}
          {selectedService === 'library' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="Book Title (e.g., Clean Code)" className="custom-input" style={{ width: '50%' }} />
              <input type="text" value={bookFloor} onChange={(e) => setBookFloor(e.target.value)} placeholder="Shelf Spot (e.g., 2nd Floor - Row C)" className="custom-input" style={{ width: '50%' }} />
            </div>
          )}
          {selectedService === 'events' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Event Name" className="custom-input" style={{ width: '31%', flexGrow: 1 }} />
              <input type="text" value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="Time (e.g., 2:00 PM)" className="custom-input" style={{ width: '31%', flexGrow: 1 }} />
              <input type="text" value={eventLoc} onChange={(e) => setEventLoc(e.target.value)} placeholder="Location Auditorium" className="custom-input" style={{ width: '31%', flexGrow: 1 }} />
            </div>
          )}

          <button type="submit" className="custom-button" style={{ width: '100%', padding: '12px 0' }}>Inject Data to Live Network Mesh</button>
        </form>
      </div>

      {payload && (
        <div className="payload-bubble">
          <h3 style={{ margin: '0 0 4px 0', color: '#a7f3d0', fontSize: '#0.85rem' }}>📡 Debug Log: Raw Node Payload Metadata</h3>
          <pre className="payload-pre">{JSON.stringify(payload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;