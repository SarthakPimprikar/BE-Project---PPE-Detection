import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Activity, Users, AlertTriangle, LogOut, Settings, Camera, 
  LayoutDashboard, ChevronRight, Download, Sliders, Bell 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './index.css';

const MOCK_API = "http://localhost:5000/api";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const playBeep = (durationMs, frequency = 440, volume = 0.1, isSiren = false) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = isSiren ? 'square' : 'sawtooth';
      oscillator.frequency.value = frequency;

      if (isSiren) {
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 5;
        lfoGain.gain.value = 100;
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

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

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
      if (data.success) onLogin();
      else setError(data.message || 'Invalid credentials');
    } catch (err) {
      if (username === 'admin' && password === 'admin') onLogin();
      else setError("System Offline. Check backend server.");
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
          <p>AI Safety Compliance Monitor v2.0</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="admin" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="login-button" type="submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ onLogout, playBeep }) {
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Real-time polling states
  const [liveStats, setLiveStats] = useState({
    total_detections: 0, helmet_violations: 0, vest_violations: 0,
    system_status: "Connecting...", compliance_rate: 100
  });
  
  const [analytics, setAnalytics] = useState({
    hourly_analytics: [], recent_violations: []
  });

  const [lastViolationCount, setLastViolationCount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          fetch(`${MOCK_API}/stats?_t=${Date.now()}`).catch(() => null),
          fetch(`${MOCK_API}/analytics?_t=${Date.now()}`).catch(() => null)
        ]);
        
        if (statsRes && statsRes.ok) {
          const s = await statsRes.json();
          setLiveStats(s);
          
          const currentViolations = s.helmet_violations + s.vest_violations;
          if (currentViolations > 0 && currentViolations > lastViolationCount) {
             // Only beep when a NEW violation registers instantly
             playBeep(2000, 330, 0.15, false);
          }
          setLastViolationCount(currentViolations);
        } else {
          setLiveStats(prev => ({ ...prev, system_status: "Offline" }));
        }

        if (analyticsRes && analyticsRes.ok) {
          const a = await analyticsRes.json();
          if (a.success) setAnalytics(a);
        }
      } catch (e) {
        console.warn("Polling error");
      }
    };
    
    fetchAll();
    const inv = setInterval(fetchAll, 2000);
    return () => clearInterval(inv);
  }, [lastViolationCount, playBeep]);

  const handleSOS = () => {
    playBeep(3000, 440, 0.4, true);
    alert("SOS ALARM ACTIVE: Security Personnel Notified.");
  };

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Incident Feed', icon: Bell },
    { name: 'Safety Analytics', icon: Activity },
    { name: 'AI Settings', icon: Settings },
  ];

  return (
    <div className="app-container animate-fade-in">
      <div className="sidebar">
        <div className="sidebar-header">
          <ShieldCheck color="var(--primary)" size={28} />
          <span>Vanguard AI</span>
        </div>
        
        <div className="sidebar-nav">
          {navItems.map(item => (
            <div 
              key={item.name} 
              className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon size={20} />
              {item.name}
            </div>
          ))}
        </div>
        
        <div style={{ padding: '0 12px' }}>
          <button onClick={handleSOS} style={{ 
              width: '100%', background: 'var(--danger)', marginBottom: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
              padding: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            <AlertTriangle size={20} /> SOS ALERT
          </button>
          <div className="nav-item" onClick={onLogout} style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
            <LogOut size={20} /> Sign Out
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <span>Dashboard</span> <ChevronRight size={16} />
            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{activeTab}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="status-dot" style={{ 
                background: liveStats.system_status === 'Online' ? 'var(--success)' : 'var(--danger)',
                animation: liveStats.system_status === 'Online' ? 'pulse 2s infinite' : 'none'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>System {liveStats.system_status}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-container" style={{ overflowY: 'auto', height: 'calc(100vh - 80px)'}}>
          {activeTab === 'Overview' && <OverviewTab liveStats={liveStats} analytics={analytics} />}
          {activeTab === 'Incident Feed' && <IncidentFeedTab analytics={analytics} />}
          {activeTab === 'Safety Analytics' && <AnalyticsTab analytics={analytics} />}
          {activeTab === 'AI Settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------
// OVERVIEW TAB: Live View & Feed
// ------------------------------------
function OverviewTab({ liveStats, analytics }) {
  // Use DB aggregation for dynamic totals since live totals represent instantaneous frame presence.
  const aggregatedProcessed = Math.max(...(analytics.hourly_analytics.map(h => h.max_detections)), liveStats.total_detections);
  const totalHelmetLoss = analytics.hourly_analytics.reduce((sum, item) => sum + item.total_helmet_violations, liveStats.helmet_violations);
  const totalVestLoss = analytics.hourly_analytics.reduce((sum, item) => sum + item.total_vest_violations, liveStats.vest_violations);
  const historicalComp = analytics.hourly_analytics.reduce((sum, item) => sum + item.avg_compliance, 0) / Math.max(1, analytics.hourly_analytics.length);
  const displayComp = Math.round((liveStats.compliance_rate + historicalComp) / 2) || 100;

  return (
    <>
      <div className="stats-grid glass-panel" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon primary"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Peak Persons Det.</h3>
            <p>{aggregatedProcessed.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><ShieldCheck size={24} /></div>
          <div className="stat-info">
            <h3>Total Compliance</h3>
            <p>{displayComp}%</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>Total Helmet Issues</h3>
            <p>{totalHelmetLoss}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon danger"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>Total Vest Issues</h3>
            <p>{totalVestLoss}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Live Video Player Stream */}
        <div className="video-section glass-panel">
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="var(--primary)" /> Smart Camera Center
          </h2>
          {liveStats.system_status === 'Online' ? (
            <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
               <img 
                 src="http://localhost:5000/video_feed" 
                 alt="Live Stream" 
                 style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '600px' }} 
                 onError={(e) => { e.target.style.display = 'none'; }}
               />
               <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                 <div className="status-dot"></div> <span style={{fontSize: '12px', color: '#fff'}}>LIVE: CAMERA-1</span>
               </div>
            </div>
          ) : (
            <div style={{ height: '300px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span>Stream Offline</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ------------------------------------
// INCIDENT FEED TAB
// ------------------------------------
function IncidentFeedTab({ analytics }) {
  return (
    <div className="glass-panel" style={{ minHeight: '80%' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
         <Bell size={28} color="var(--warning)" /> Global Incident Feed
      </h2>
      
      {analytics.recent_violations.length === 0 ? (
         <p style={{ color: 'var(--text-muted)' }}>No recent safety violations recorded.</p>
      ) : (
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {analytics.recent_violations.map((violation, idx) => (
              <div key={idx} style={{ 
                background: 'var(--surface)', padding: '16px', borderRadius: '12px', 
                borderLeft: '4px solid var(--danger)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {new Date(violation.timestamp).toLocaleString()}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--danger)'}}>
                    CAM {violation.camera_id}
                  </span>
                </div>
                
                <div style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 500 }}>
                   {violation.helmet_violations > 0 && <div>🛑 Missing Helmet ({violation.helmet_violations})</div>}
                   {violation.vest_violations > 0 && <div>🛑 Missing Vest ({violation.vest_violations})</div>}
                </div>

                {violation.snapshot && (
                  <img 
                    src={`data:image/jpeg;base64,${violation.snapshot}`} 
                    alt="Violation snapshot" 
                    style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                )}
              </div>
            ))}
         </div>
      )}
    </div>
  );
}


// ------------------------------------
// ANALYTICS TAB: Charts & PDF
// ------------------------------------
function AnalyticsTab({ analytics }) {
  const chartRef = useRef(null);
  
  const generatePDF = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: '#0A0A12' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.setFontSize(18);
    pdf.text("Vanguard Daily Safety Report", 15, 20);
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 28);
    pdf.addImage(imgData, 'PNG', 15, 35, pdfWidth - 30, pdfHeight - 30);
    pdf.save("Safety_Compliance_Report.pdf");
  };

  const chartData = analytics.hourly_analytics.map(h => ({
    time: `${h._id.hour}:00`,
    Compliance: Math.round(h.avg_compliance),
    Helmets_Missed: h.total_helmet_violations,
    Vests_Missed: h.total_vest_violations
  })).reverse(); // Charting oldest -> newest from pipeline output

  return (
    <div className="glass-panel" style={{ minHeight: '80%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Historical Analytics</h2>
        <button onClick={generatePDF} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div ref={chartRef} style={{ padding: '20px', borderRadius: '12px' }}>
        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '40px 0'}}>
             Not enough data yet. System is generating analytics...
          </div>
        ) : (
          <>
            <h3 style={{ marginBottom: '16px' }}>Hourly Compliance Trend (%)</h3>
            <div style={{ width: '100%', height: '300px', marginBottom: '40px' }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Compliance" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <h3 style={{ marginBottom: '16px' }}>Total Issues Detection Over Time</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="Helmets_Missed" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Vests_Missed" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ------------------------------------
// SETTINGS TAB: Remote App Controls
// ------------------------------------
function SettingsTab() {
  const [settings, setSettings] = useState({ conf_helmet: 0.5, conf_vest: 0.5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${MOCK_API}/settings`)
      .then(r => r.json())
      .then(d => { if(d.success) setSettings({conf_helmet: d.conf_helmet, conf_vest: d.conf_vest}); setLoading(false); });
  }, []);

  const handleSave = async () => {
    const res = await fetch(`${MOCK_API}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const d = await res.json();
    if(d.success) alert("AI Model Thresholds Updated Successfully!");
    else alert("Failed to update settings.");
  };

  if (loading) return <div>Loading config...</div>;

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <Sliders size={20} /> Remote AI Configuration
      </h2>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>
           Helmet Confidence Threshold ({settings.conf_helmet})
        </label>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-4px', marginBottom: '12px' }}>
           Increase if getting false positives (model thinks a plain hat is a helmet). Decrease if model is missing helmets.
        </p>
        <input 
          type="range" min="0.1" max="0.95" step="0.05" 
          value={settings.conf_helmet}
          onChange={(e) => setSettings({...settings, conf_helmet: parseFloat(e.target.value)})}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>
           Vest Confidence Threshold ({settings.conf_vest})
        </label>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '-4px', marginBottom: '12px' }}>
           Increase if getting false positives (model thinks a yellow shirt is a vest).
        </p>
        <input 
          type="range" min="0.1" max="0.95" step="0.05" 
          value={settings.conf_vest}
          onChange={(e) => setSettings({...settings, conf_vest: parseFloat(e.target.value)})}
          style={{ width: '100%' }}
        />
      </div>

      <button onClick={handleSave} style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
        Apply AI Settings To Backend
      </button>
    </div>
  );
}

export default App;
