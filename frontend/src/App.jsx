import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Users, AlertTriangle, LogOut, Settings, Camera, LayoutDashboard, ChevronRight } from 'lucide-react';
import './index.css';

const MOCK_API = "http://localhost:5000/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper for generating aggressive danger/siren sounds via Web Audio API
  const playBeep = (durationMs, frequency = 440, volume = 0.1, isSiren = false) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = isSiren ? 'square' : 'sawtooth'; // Aggressive waveforms for danger
      oscillator.frequency.value = frequency;

      // Create a "warbling" siren effect if isSiren is true
      if (isSiren) {
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 5; // Warble 5 times per second
        lfoGain.gain.value = 100; // Frequency variation range
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        lfo.start();
      }

      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + durationMs/1000);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + durationMs/1000);
    } catch (e) {
      console.error("Audio block", e);
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setIsAuthenticated(false)} playBeep={playBeep} />;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const resp = await fetch(`${MOCK_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await resp.json();
      
      if (data.success) {
        onLogin();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.warn("Backend might not be running yet, attempting local validation.", err);
      // Fallback if backend is not running yet
      if (username === 'admin' && password === 'admin') onLogin();
      else setError("System Offline. Check 'app.py' server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="glass-panel login-box">
        <div className="login-header">
          <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
          <h1>Vanguard Secure</h1>
          <p>AI Safety Compliance Monitor</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter admin..." 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter admin..." 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          <button className="login-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In To Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ onLogout, playBeep }) {
  const [stats, setStats] = useState({
    total_detections: 0,
    helmet_violations: 0,
    vest_violations: 0,
    system_status: "Connecting...",
    active_cameras: 0,
    compliance_rate: 100
  });
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [lastViolationCount, setLastViolationCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await fetch(`${MOCK_API}/stats`);
        const data = await resp.json();
        setStats(data);
        
        // --- AUTO BEEP LOGIC ---
        // If violations increased, trigger a beep
        const currentViolations = (data.helmet_violations || 0) + (data.vest_violations || 0);
        if (currentViolations > 0 && currentViolations > lastViolationCount) {
          playBeep(3000, 330, 0.15, false); // 3 second harsh sawtooth buzz
        }
        setLastViolationCount(currentViolations);
        
      } catch (e) {
        console.error("Failed to fetch stats", e);
        setStats(prev => ({ ...prev, system_status: "Offline" }));
      }
    };
    
    // Poll every 2 seconds
    const interval = setInterval(fetchStats, 2000);
    fetchStats();
    
    return () => clearInterval(interval);
  }, [lastViolationCount, playBeep]);

  const handleSOS = () => {
    playBeep(3000, 440, 0.4, true); // 3 second emergency siren
    alert("SOS ALARM ACTIVE: Security Personnel Notified.");
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="sidebar">
        <div className="sidebar-header">
          <ShieldCheck color="var(--primary)" size={28} />
          <span>Vanguard AI</span>
        </div>
        
        <div className="sidebar-nav">
          <div className="nav-item active">
            <LayoutDashboard size={20} />
            Overview
          </div>
          <div className="nav-item">
            <Camera size={20} />
            Camera Feeds
          </div>
          <div className="nav-item">
            <Activity size={20} />
            Analytics
          </div>
          <div className="nav-item">
            <Settings size={20} />
            Settings
          </div>
        </div>
        
        <div style={{ padding: '0 12px' }}>
          <button 
            onClick={handleSOS}
            style={{ 
              width: '100%', 
              background: 'var(--danger)', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
            <AlertTriangle size={20} /> SOS ALERT
          </button>
          <div className="nav-item" onClick={onLogout} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
            <LogOut size={20} />
            Sign Out
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <span>Dashboard</span>
            <ChevronRight size={16} />
            <span style={{ color: 'var(--text-main)' }}>Live Monitor</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="status-dot" style={{ 
                background: stats.system_status === 'Online' ? 'var(--success)' : 'var(--danger)',
                animation: stats.system_status === 'Online' ? 'pulse 2s infinite' : 'none',
                boxShadow: stats.system_status === 'Online' ? '0 0 8px var(--success)' : 'none'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{stats.system_status}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-container">
          <div className="stats-grid glass-panel">
            <div className="stat-card">
              <div className="stat-icon primary"><Users size={24} /></div>
              <div className="stat-info">
                <h3>Total Processed</h3>
                <p>{stats.total_detections.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success"><ShieldCheck size={24} /></div>
              <div className="stat-info">
                <h3>Compliance Rate</h3>
                <p>{stats.compliance_rate}%</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning"><AlertTriangle size={24} /></div>
              <div className="stat-info">
                <h3>Helmet Issues</h3>
                <p>{stats.helmet_violations}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon danger"><AlertTriangle size={24} /></div>
              <div className="stat-info">
                <h3>Vest Issues</h3>
                <p>{stats.vest_violations}</p>
              </div>
            </div>
          </div>

          <div className="video-section glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="var(--primary)" />
                Zone A: Camera Control
              </h2>
              <button 
                onClick={() => setIsVideoModalOpen(true)}
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Camera size={16} /> Open Live Feed
              </button>
            </div>
            
            <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
              <div style={{ display: 'inline-flex', padding: '20px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', marginBottom: '16px' }}>
                <Camera size={48} color="var(--primary)" />
              </div>
              <h3 style={{ margin: '0 0 8px 0' }}>Camera is Standby</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                Video stream is paused. Click "Open Live Feed" to connect to the AI model.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isVideoModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="status-dot"></div> Live AI Analysis
              </h3>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                style={{ background: 'transparent', padding: '4px' }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              {stats.system_status === 'Offline' ? (
                <div style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#000' }}>
                  <Activity size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <p>Awaiting video stream on :5000/video_feed</p>
                </div>
              ) : (
                <img 
                  src="http://localhost:5000/video_feed" 
                  alt="Live Camera Feed" 
                  style={{ width: '100%', height: '500px', objectFit: 'contain', background: '#000', borderRadius: '8px' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
