import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Activity, Users, AlertTriangle, LogOut, Settings, Camera, 
  LayoutDashboard, ChevronRight, Download, Sliders, Bell, Package, Edit2, Trash2, Plus, Zap 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
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
    { name: 'Safety Score', icon: Zap },
    { name: 'Inventory', icon: Package },
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
          {activeTab === 'Safety Score' && <SafetyScoreTab liveStats={liveStats} />}
          {activeTab === 'Inventory' && <InventoryTab />}
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

  const compColor = displayComp >= 80 ? 'var(--success)' : displayComp >= 50 ? 'var(--warning)' : 'var(--danger)';
  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (displayComp / 100) * circumference;

  return (
    <>
      {/* Compliance Hero Card */}
      <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '32px', padding: '28px 36px' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <circle cx="65" cy="65" r="54" fill="none" stroke={compColor} strokeWidth="10"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeOffset}
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: 800, color: compColor, lineHeight: 1 }}>{displayComp}%</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>SCORE</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            Safety Compliance Today
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', lineHeight: 1.5 }}>
            {displayComp >= 80
              ? '✅ Excellent! Your site is meeting safety standards. Keep it up!'
              : displayComp >= 50
              ? '⚠️ Moderate compliance. Some workers are missing safety gear — review the incident feed.'
              : '🚨 Critical! Compliance is dangerously low. Immediate action required.'}
          </p>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Peak Persons: <strong style={{ color: '#fff' }}>{aggregatedProcessed}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Helmet Issues: <strong style={{ color: 'var(--warning)' }}>{totalHelmetLoss}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Vest Issues: <strong style={{ color: 'var(--danger)' }}>{totalVestLoss}</strong></span>
          </div>
        </div>
      </div>

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

// ------------------------------------
// SAFETY SCORE TAB: Live Per-Person Scoring
// ------------------------------------
function SafetyScoreTab({ liveStats }) {
  const persons = liveStats.person_scores || [];
  const avgScore = persons.length > 0 
    ? Math.round(persons.reduce((sum, p) => sum + p.score, 0) / persons.length) 
    : 0;
  
  const getScoreColor = (score) => {
    if (score === 100) return '#10b981';
    if (score >= 70) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  };
  
  const getScoreLabel = (score) => {
    if (score === 100) return 'Fully Protected';
    if (score >= 70) return 'Partially Safe';
    if (score >= 30) return 'At Risk';
    return 'Unsafe';
  };

  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (avgScore / 100) * circumference;
  const avgColor = getScoreColor(avgScore);

  return (
    <div className="animate-fade-in">
      {/* Top Row: Score Gauge + Legend */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '32px', padding: '28px 36px' }}>
          <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
              <circle cx="65" cy="65" r="54" fill="none" stroke={avgColor} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeOffset}
                transform="rotate(-90 65 65)"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 800, color: avgColor, lineHeight: 1 }}>{avgScore}%</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>AVG SCORE</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
              <Zap size={22} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
              Live Safety Score
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>
              {persons.length === 0 
                ? 'No workers detected in the current camera frame.' 
                : `Monitoring ${persons.length} worker${persons.length > 1 ? 's' : ''} in real-time.`}
            </p>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
              <span style={{ color: '#10b981' }}>● 100% = Helmet + Vest</span>
              <span style={{ color: '#eab308' }}>● 70% = Helmet Only</span>
              <span style={{ color: '#f97316' }}>● 30% = Vest Only</span>
              <span style={{ color: '#ef4444' }}>● 0% = No PPE</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '180px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.3)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{persons.filter(p => p.score === 100).length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fully Safe</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(234,179,8,0.05))', border: '1px solid rgba(234,179,8,0.3)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#eab308' }}>{persons.filter(p => p.score === 70).length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Helmet Only</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.3)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{persons.filter(p => p.score <= 30).length}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>At Risk / Unsafe</div>
          </div>
        </div>
      </div>

      {/* Live Person Table */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--primary)" /> Live Worker Scores
        </h3>
        {persons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Zap size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p>No workers currently detected in the camera frame.</p>
            <p style={{ fontSize: '13px' }}>Scores will appear here in real-time as people enter the view.</p>
          </div>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px' }}>Worker ID</th>
                <th style={{ padding: '12px' }}>Helmet</th>
                <th style={{ padding: '12px' }}>Vest</th>
                <th style={{ padding: '12px' }}>Safety Score</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {persons.map(person => (
                <tr key={person.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: 600 }}>Person #{person.id}</td>
                  <td style={{ padding: '12px' }}>
                    {person.has_helmet 
                      ? <span style={{ color: '#10b981' }}>✅ Detected</span> 
                      : <span style={{ color: '#ef4444' }}>❌ Missing</span>}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {person.has_vest 
                      ? <span style={{ color: '#10b981' }}>✅ Detected</span> 
                      : <span style={{ color: '#ef4444' }}>❌ Missing</span>}
                  </td>
                  <td style={{ padding: '12px', width: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${person.score}%`, height: '100%', 
                          background: getScoreColor(person.score), 
                          borderRadius: '4px',
                          transition: 'width 0.5s ease-out'
                        }} />
                      </div>
                      <span style={{ fontWeight: 700, color: getScoreColor(person.score), minWidth: '40px' }}>{person.score}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                      background: `${getScoreColor(person.score)}22`, 
                      color: getScoreColor(person.score),
                      border: `1px solid ${getScoreColor(person.score)}44`
                    }}>
                      {getScoreLabel(person.score)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ------------------------------------
// INVENTORY TAB: CRUD Operations
// ------------------------------------
function InventoryTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', type: 'Helmet', status: 'Available', assigned_to: '' });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Pie Chart Data
  const helmetInUse = items.filter(i => i.type === 'Helmet' && i.status === 'In Use').length;
  const helmetAvail = items.filter(i => i.type === 'Helmet' && i.status === 'Available').length;
  const vestInUse = items.filter(i => i.type === 'Safety Vest' && i.status === 'In Use').length;
  const vestAvail = items.filter(i => i.type === 'Safety Vest' && i.status === 'Available').length;

  const helmetData = [
    { name: 'In Use', value: helmetInUse, color: 'var(--warning)' },
    { name: 'Available', value: helmetAvail, color: 'var(--success)' }
  ];
  const vestData = [
    { name: 'In Use', value: vestInUse, color: 'var(--warning)' },
    { name: 'Available', value: vestAvail, color: 'var(--success)' }
  ];

  const filteredItems = items.filter(i => 
    (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.assigned_to || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchItems = () => {
    fetch(`${MOCK_API}/inventory`)
      .then(r => r.json())
      .then(d => { if (d.success) setItems(d.items); })
      .catch(e => console.error("Filter/fetch error:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = `${MOCK_API}/inventory${editingId ? `/${editingId}` : ''}`;
    
    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setFormData({ name: '', type: 'Helmet', status: 'Available', assigned_to: '' });
    setEditingId(null);
    fetchItems();
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, type: item.type, status: item.status, assigned_to: item.assigned_to });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this item?")) {
      await fetch(`${MOCK_API}/inventory/${id}`, { method: 'DELETE' });
      fetchItems();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }} className="animate-fade-in">
      <div className="glass-panel" style={{ flex: 1 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Package size={20} color="var(--primary)" /> Equipment Inventory
        </h2>
        
        {/* Summary Cards */}
        {!loading && items.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))', border: '1px solid rgba(99,102,241,0.25)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)' }}>{items.filter(i => i.type === 'Helmet').length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Total Helmets</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))', border: '1px solid rgba(234,179,8,0.25)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--warning)' }}>{helmetInUse}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Helmets In Use</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(16,185,129,0.25)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--success)' }}>{items.filter(i => i.type === 'Safety Vest').length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Total Vests</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))', border: '1px solid rgba(234,179,8,0.25)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--warning)' }}>{vestInUse}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Vests In Use</div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        {!loading && items.length > 0 && (
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Helmets Status</h3>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={helmetData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      {helmetData.map((e, index) => <Cell key={index} fill={e.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
                <span style={{ color: 'var(--warning)'}}>● In Use ({helmetInUse})</span>
                <span style={{ color: 'var(--success)'}}>● Available ({helmetAvail})</span>
              </div>
            </div>
            
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-muted)' }}>Vests Status</h3>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={vestData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      {vestData.map((e, index) => <Cell key={index} fill={e.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', border: 'none', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
                <span style={{ color: 'var(--warning)'}}>● In Use ({vestInUse})</span>
                <span style={{ color: 'var(--success)'}}>● Available ({vestAvail})</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
           <input 
              type="text" 
              placeholder="Search by Equipment Name or Assigned Person..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} 
           />
        </div>
        
        {loading ? <p>Loading...</p> : (
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Name/ID</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Type</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Assigned To</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>{item.name}</td>
                    <td style={{ padding: '12px' }}>{item.type}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="status-dot" style={{ background: item.status === 'Available' ? 'var(--success)' : item.status === 'In Use' ? 'var(--warning)' : 'var(--danger)', marginRight: '8px', display: 'inline-block' }}></span>
                      {item.status}
                    </td>
                    <td style={{ padding: '12px' }}>{item.assigned_to || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button onClick={() => handleEdit(item)} className="icon-btn" style={{ background: 'transparent', padding: '6px', color: 'var(--primary)', border: 'none', cursor: 'pointer' }}><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(item._id)} className="icon-btn" style={{ background: 'transparent', padding: '6px', color: 'var(--danger)', border: 'none', cursor: 'pointer', marginLeft: '8px' }}><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No equipment found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ width: '300px' }}>
        <h3 style={{ marginBottom: '20px' }}>{editingId ? 'Edit Equipment' : 'Add Equipment'}</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
             <label>Equipment ID / Name</label>
             <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%' }} />
          </div>
          <div className="form-group">
             <label>Type</label>
             <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', outline: 'none' }}>
                <option>Helmet</option>
                <option>Safety Vest</option>
                <option>Boots</option>
                <option>Gloves</option>
             </select>
          </div>
          <div className="form-group">
             <label>Status</label>
             <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', outline: 'none' }}>
                <option>Available</option>
                <option>In Use</option>
                <option>Lost/Damaged</option>
                <option>Maintenance</option>
             </select>
          </div>
          <div className="form-group">
             <label>Assigned To (Name/ID)</label>
             <input type="text" value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} placeholder="Optional..." style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', type:'Helmet', status:'Available', assigned_to:''})}} style={{ flex: 1, background: 'var(--surface)', padding: '10px', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer' }}>Cancel</button>
            )}
            <button type="submit" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--primary)', padding: '10px', borderRadius: '8px', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              {editingId ? 'Update' : <><Plus size={16} /> Add Item</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
