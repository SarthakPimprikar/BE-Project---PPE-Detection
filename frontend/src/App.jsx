import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Activity, Users, AlertTriangle, LogOut, Settings, Camera, User, 
  LayoutDashboard, ChevronRight, Download, Sliders, Bell, Package, Edit2, Trash2, Plus, Zap, Search, FileText, CheckCircle, Megaphone, Mail, Phone, MapPin, Calendar, Hash, UserCircle, Play, Pause, Power, Aperture, Eye, EyeOff 
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
  const [userRole, setUserRole] = useState(null);

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

  if (!userRole) return <Login onLogin={(role) => setUserRole(role)} />;

  return <Dashboard userRole={userRole} onLogout={() => setUserRole(null)} playBeep={playBeep} />;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const resp = await fetch(`${MOCK_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      const data = await resp.json();
      if (data.success) {
        onLogin(data.role);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      if (username === 'admin' && password === 'admin' && role === 'admin') onLogin('admin');
      else if (username === (role === 'supervisor' ? 'supervisor' : 'admin') && password === (role === 'supervisor' ? 'supervisor' : 'admin')) onLogin(role);
      else setError("System Offline. Check credentials and role.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in" style={{ background: '#f8fafc', color: '#1e293b' }}>
      <div className="login-box-v2" style={{ 
        width: '100%', maxWidth: '440px', padding: '48px', background: '#fff', 
        borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
        margin: '20px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#00204a', marginBottom: '8px' }}>Vanguard AI Safety</h1>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6 }}>Secure access to real-time workplace compliance and PPE monitoring.</p>
        </div>

        {/* Role Selector Segmented Control */}
        <div style={{ 
          background: '#f1f5f9', padding: '4px', borderRadius: '12px', 
          display: 'flex', marginBottom: '32px', position: 'relative' 
        }}>
          <div 
            onClick={() => setRole('admin')}
            style={{ 
              flex: 1, padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', zIndex: 2, color: role === 'admin' ? '#2563eb' : '#64748b',
              transition: 'all 0.3s'
            }}
          >
            Admin
          </div>
          <div 
            onClick={() => setRole('supervisor')}
            style={{ 
              flex: 1, padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', zIndex: 2, color: role === 'supervisor' ? '#2563eb' : '#64748b',
              transition: 'all 0.3s'
            }}
          >
            Supervisor
          </div>
          <div style={{ 
            position: 'absolute', top: '4px', bottom: '4px', 
            left: role === 'admin' ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)', background: '#fff', 
            borderRadius: '9px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1
          }} />
        </div>

        {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #fee2e2' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-group-v2">
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>Employee</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Enter Employee" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                style={{ 
                  width: '100%', padding: '14px 16px 14px 48px', background: '#f8fafc', 
                  border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', color: '#1e293b',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div className="form-group-v2">
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#334155' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ 
                  width: '100%', padding: '14px 48px 14px 48px', background: '#f8fafc', 
                  border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', color: '#1e293b',
                  outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <div 
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              width: '100%', padding: '16px', background: '#0061f2', color: '#fff', 
              border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, 
              cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0, 97, 242, 0.2)',
              marginTop: '8px'
            }}
            onMouseOver={(e) => { if(!isLoading) e.target.style.background = '#0052cc' }}
            onMouseOut={(e) => { if(!isLoading) e.target.style.background = '#0061f2' }}
          >
            {isLoading ? 'Processing...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ userRole, onLogout, playBeep }) {
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Real-time polling states
  const [liveStats, setLiveStats] = useState({
    total_detections: 0, helmet_violations: 0, vest_violations: 0,
    system_status: "Connecting...", compliance_rate: 100
  });
  
  const [analytics, setAnalytics] = useState({
    hourly_analytics: [], recent_violations: []
  });
  const [dailyScores, setDailyScores] = useState([]);

  const [lastViolationCount, setLastViolationCount] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, analyticsRes, dailyRes] = await Promise.all([
          fetch(`${MOCK_API}/stats?_t=${Date.now()}`).catch(() => null),
          fetch(`${MOCK_API}/analytics?_t=${Date.now()}`).catch(() => null),
          fetch(`${MOCK_API}/daily_scores?_t=${Date.now()}`).catch(() => null)
        ]);
        
        if (statsRes && statsRes.ok) {
          const s = await statsRes.json();
          setLiveStats(s);
          if (s.ai_active !== undefined) setAIPaused(!s.ai_active);
          
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

        if (dailyRes && dailyRes.ok) {
          const d = await dailyRes.json();
          setDailyScores(d);
        }
      } catch (e) {
        console.warn("Polling error");
      }
    };
    
    fetchAll();
    const inv = setInterval(fetchAll, 2000);
    return () => clearInterval(inv);
  }, [lastViolationCount, playBeep]);

  const handleSOS = async () => {
    playBeep(3000, 440, 0.4, true);
    try {
      await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ by: 'Admin' })
      });
      alert("SOS ALARM ACTIVE: Security Personnel Notified.");
    } catch (error) {
      console.error("Alert failed", error);
    }
  };

  // Global toggle for AI Detection
  const [isAIPaused, setAIPaused] = useState(true);

  // Manual Captures (Local Session)
  const [manualIncidents, setManualIncidents] = useState([]);

  const toggleAI = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/toggle_ai', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setAIPaused(!data.ai_active);
      }
    } catch (e) {
      console.error("Toggle AI fail", e);
    }
  };

  const handleCapture = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/capture', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setManualIncidents(prev => [data.incident, ...prev]);
        alert("Snapshot Captured! Added to Incident Feed.");
      }
    } catch (e) {
      console.error("Capture fail", e);
    }
  };

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Incident Feed', icon: Bell },
    { name: 'Safety Analytics', icon: Activity },
    { name: 'Safety Score', icon: Zap },
    { name: 'Inventory', icon: Package },
    { name: 'AI Settings', icon: Settings },
  ];

  if (userRole === 'supervisor') {
    navItems.push({ name: 'Worker Directory', icon: Users });
    navItems.push({ name: 'Alert List', icon: Megaphone, Mail, Phone, MapPin, Calendar, Hash, UserCircle, Play, Pause, Power, Aperture, Eye, EyeOff });
    navItems.push({ name: 'Export & Reports', icon: Download });
  }

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
          {userRole === 'admin' && (
            <button onClick={handleSOS} style={{ 
                width: '100%', background: 'var(--danger)', color: '#fff', marginBottom: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                padding: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              <AlertTriangle size={20} /> SOS ALERT
            </button>
          )}
          {userRole === 'supervisor' && (
            <div 
              className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('Profile')}
              style={{ marginBottom: '8px' }}
            >
              <User size={20} /> Profile
            </div>
          )}
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
          {activeTab === 'Overview' && <OverviewTab liveStats={liveStats} analytics={analytics} isAIPaused={isAIPaused} onToggleAI={toggleAI} onCapture={handleCapture} />}
          {activeTab === 'Incident Feed' && <IncidentFeedTab analytics={analytics} manualIncidents={manualIncidents} />}
          {activeTab === 'Safety Analytics' && <AnalyticsTab analytics={analytics} />}
          {activeTab === 'Safety Score' && <SafetyScoreTab dailyScores={dailyScores} />}
          {activeTab === 'Inventory' && <InventoryTab />}
          {activeTab === 'AI Settings' && <SettingsTab />}
          {activeTab === 'Worker Directory' && <WorkerDirectoryTab />}
          {activeTab === 'Alert List' && <AlertListTab />}
          {activeTab === 'Profile' && <ProfileTab role={userRole} />}
          {activeTab === 'Export & Reports' && <ReportsTab dailyScores={dailyScores} liveStats={liveStats} analytics={analytics} />}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------
// OVERVIEW TAB: Live View & Feed
// ------------------------------------
function OverviewTab({ liveStats, analytics, isAIPaused, onToggleAI, onCapture }) {
  // Use DB aggregation for dynamic totals since live totals represent instantaneous frame presence.
  const aggregatedProcessed = Math.max(...(analytics.hourly_analytics.map(h => h.max_detections)), liveStats.total_detections);
  const totalHelmetLoss = analytics.hourly_analytics.reduce((sum, item) => sum + item.total_helmet_violations, liveStats.helmet_violations);
  const totalVestLoss = analytics.hourly_analytics.reduce((sum, item) => sum + item.total_vest_violations, liveStats.vest_violations);
  const historicalComp = analytics.hourly_analytics.reduce((sum, item) => sum + item.avg_compliance, 0) / Math.max(1, analytics.hourly_analytics.length);
  const displayComp = Math.round((liveStats.compliance_rate + historicalComp) / 2) || 100;

  const compColor = displayComp >= 80 ? 'var(--success)' : displayComp >= 50 ? 'var(--warning)' : 'var(--danger)';
  const circumference = 2 * Math.PI * 54;
  const strokeOffset = circumference - (displayComp / 100) * circumference;

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

  const persons = liveStats.person_scores || [];

  return (
    <>
      {/* Compliance Hero Card */}
      <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '32px', padding: '28px 36px' }}>
        <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10" />
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
            <span style={{ color: 'var(--text-muted)' }}>Peak Persons: <strong style={{ color: 'var(--text-main)' }}>{aggregatedProcessed}</strong></span>
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

      {/* Row layout: Camera Feed (left) + Live Scores List (right) */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        {/* Live Video Player Stream */}
        <div className="video-section glass-panel" style={{ flex: 1.5 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={20} color="var(--primary)" /> Smart Camera Center
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={onCapture}
                disabled={isAIPaused}
                style={{
                  background: '#f1f5f9',
                  color: 'var(--text-main)',
                  border: '1px solid #e2e8f0',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: isAIPaused ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isAIPaused ? 0.5 : 1
                }}
              >
                <Aperture size={14} /> CAPTURE
              </button>
              <button 
                onClick={onToggleAI}
                style={{
                  background: isAIPaused ? 'var(--primary)' : 'var(--danger)',
                  color: 'var(--text-main)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isAIPaused ? '0 0 15px rgba(59,130,246,0.2)' : '0 0 15px rgba(239,68,68,0.2)',
                  transition: 'all 0.3s'
                }}
              >
                {isAIPaused ? <><Play size={14} fill="currentColor" /> START DETECTION</> : <><Pause size={14} fill="currentColor" /> STOP DETECTION</>}
              </button>
            </div>
          </div>

          {liveStats.system_status === 'Online' ? (
            <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
               {isAIPaused && (
                 <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
                    <Power size={48} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.8 }} />
                    <p style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}>AI Monitoring Paused</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Click Start to begin real-time analysis</p>
                 </div>
               )}
               <img 
                 src="http://localhost:5000/video_feed" 
                 alt="Live Stream" 
                 style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '600px', opacity: isAIPaused ? 0.3 : 1 }} 
                 onError={(e) => { e.target.style.display = 'none'; }}
               />
               <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                 <div className={isAIPaused ? "status-dot offline" : "status-dot"}></div> 
                 <span style={{fontSize: '12px', color: 'var(--text-main)'}}>{isAIPaused ? 'STANDBY' : 'LIVE FEED'}</span>
               </div>
            </div>
          ) : (
            <div style={{ height: '300px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ color: 'var(--text-muted)' }}>AI Stream Offline</span>
            </div>
          )}
        </div>

        {/* Live People Scoring List right next to Camera */}
        <div className="glass-panel" style={{ flex: 1, maxHeight: '675px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="var(--warning)" /> Live Safety Scores
          </h2>
          {persons.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Zap size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>No workers in camera view.</p>
            </div>
          ) : (
            <div style={{ overflowY: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid #e2e8f0' }}>Worker</th>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid #e2e8f0' }}>Safety Score</th>
                    <th style={{ padding: '12px 8px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map(person => (
                    <tr key={person.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {person.photo ? <img src={person.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={16} />}
                          </div>
                          <span style={{ fontWeight: 600 }}>{person.name || `#${person.id}`}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: getScoreColor(person.score), minWidth: '35px' }}>{person.score}%</span>
                          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${person.score}%`, height: '100%', 
                              background: getScoreColor(person.score), borderRadius: '3px',
                              transition: 'width 0.5s ease-out'
                            }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ 
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                          background: `${getScoreColor(person.score)}22`, 
                          color: getScoreColor(person.score),
                          border: `1px solid ${getScoreColor(person.score)}44`,
                          whiteSpace: 'nowrap'
                        }}>
                          {getScoreLabel(person.score)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
function IncidentFeedTab({ analytics, manualIncidents = [] }) {
  const allIncidents = [...manualIncidents, ...(analytics.recent_violations || [])];
  
  return (
    <div className="glass-panel" style={{ minHeight: '80%' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Bell size={28} color="var(--primary)" /> Incident & Audit Log
      </h2>
      
      {allIncidents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <ShieldCheck size={64} style={{ opacity: 0.1, marginBottom: '16px' }} />
          <p>No incidents detected in current session.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {allIncidents.map((incident, idx) => (
            <div key={idx} className="incident-card" style={{ 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              border: '1px solid #f1f5f9',
              transition: 'transform 0.2s hover'
            }}>
              <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                {incident.snapshot ? (
                  <img 
                    src={`data:image/jpeg;base64,${incident.snapshot}`} 
                    alt="Incident Feed" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Camera size={40} color="var(--text-muted)" />
                  </div>
                )}
                <div style={{ position: 'absolute', top: 12, right: 12, background: incident.type === 'Manual Audit' ? 'var(--primary)' : 'var(--danger)', color: 'var(--text-main)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                  {incident.type || 'Violation'}
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>TIMESTAMP</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>{new Date(incident.timestamp).toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>LOCATION</p>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>CAM-{incident.camera_id}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>COM-RATE</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>{incident.compliance_rate}%</p>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>DETECTIONS</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>{incident.total_detections}</p>
                  </div>
                </div>
              </div>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '24px' }}>
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
// SAFETY SCORE TAB: Daily Per-Person Scoring (Max 50)
// ------------------------------------
function SafetyScoreTab({ dailyScores }) {
  const persons = dailyScores || [];
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
              <circle cx="65" cy="65" r="54" fill="none" stroke="#f1f5f9" strokeWidth="10" />
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
              Daily Safety Score (Top 50)
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '12px' }}>
              {persons.length === 0 
                ? 'No workers tracked today.' 
                : `Accumulated daily scores for ${persons.length} worker${persons.length > 1 ? 's' : ''} (up to 50 max).`}
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

      {/* Daily Person Table */}
      <div className="glass-panel">
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--primary)" /> Daily Worker List (Max 50)
        </h3>
        {persons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Zap size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p>No workers tracked today.</p>
            <p style={{ fontSize: '13px' }}>Scores will appear here as people enter the view.</p>
          </div>
        ) : (
          <div className="pro-table-container">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Worker Identity</th>
                  <th>Helmet Status</th>
                  <th>Vest Status</th>
                  <th>Global Safety Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {persons.map(person => (
                  <tr key={person.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          {person.photo ? <img src={person.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={16} color="#94a3b8" />}
                        </div>
                        <span style={{ fontWeight: 700 }}>{person.name || `Person #${person.id}`}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${person.has_helmet ? 'success' : 'danger'}`}>
                        {person.has_helmet ? 'PROTECTED' : 'MISSING'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${person.has_vest ? 'success' : 'danger'}`}>
                        {person.has_vest ? 'PROTECTED' : 'MISSING'}
                      </span>
                    </td>
                    <td style={{ width: '250px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          <div style={{ 
                            width: `${person.score}%`, height: '100%', 
                            background: getScoreColor(person.score), 
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                          }} />
                        </div>
                        <span style={{ fontWeight: 800, color: getScoreColor(person.score), minWidth: '40px', fontSize: '13px' }}>{person.score}%</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ 
                        background: `${getScoreColor(person.score)}15`, 
                        color: getScoreColor(person.score)
                      }}>
                        {getScoreLabel(person.score)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
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
            
            <div style={{ flex: 1, background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
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
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-main)', outline: 'none' }} 
           />
        </div>
        
        {loading ? <p>Loading inventory...</p> : (
          <div className="pro-table-container">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Equipment Name/ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td>{item.type}</td>
                    <td>
                      <span className={`badge ${item.status === 'Available' ? 'success' : item.status === 'In Use' ? 'warning' : 'danger'}`}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.assigned_to || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(item)} className="icon-btn" title="Edit Item"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item._id)} className="icon-btn danger" title="Remove Item"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No equipment found matching criteria.</td></tr>
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
             <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }}>
                <option>Helmet</option>
                <option>Safety Vest</option>
                <option>Boots</option>
                <option>Gloves</option>
             </select>
          </div>
          <div className="form-group">
             <label>Status</label>
             <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }}>
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
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', type:'Helmet', status:'Available', assigned_to:''})}} style={{ flex: 1, background: 'var(--surface)', padding: '10px', borderRadius: '8px', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>Cancel</button>
            )}
            <button type="submit" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--primary)', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
              {editingId ? 'Update' : <><Plus size={16} /> Add Item</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;

// ------------------------------------
// WORKER DIRECTORY TAB (Supervisor Only)
// ------------------------------------
function WorkerDirectoryTab() {
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    emp_id: '',
    name: '',
    department: 'General',
    position: 'Worker',
    contact: '',
    photo: ''
  });
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch(`${MOCK_API}/workers`);
      const data = await resp.json();
      if (data.success) setWorkers(data.items);
    } catch (e) {
      console.error("Fetch workers error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${MOCK_API}/workers/${editingId}` : `${MOCK_API}/workers`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await resp.json();
      if (data.success) {
        setFormData({ emp_id: '', name: '', department: 'General', position: 'Worker', contact: '', photo: '' });
        setEditingId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchWorkers();
      }
    } catch (e) {
      console.error("Save worker error", e);
    }
  };

  const handleEdit = (worker) => {
    setEditingId(worker._id);
    setFormData({
      emp_id: worker.emp_id,
      name: worker.name,
      department: worker.department,
      position: worker.position,
      contact: worker.contact,
      photo: worker.photo || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee?")) return;
    try {
      const resp = await fetch(`${MOCK_API}/workers/${id}`, { method: 'DELETE' });
      const data = await resp.json();
      if (data.success) fetchWorkers();
    } catch (e) {
      console.error("Delete worker error", e);
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.emp_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
      <div className="glass-panel" style={{ minHeight: '80%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={28} color="var(--primary)" /> Employee Directory
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search workers..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '10px 10px 10px 40px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: 'var(--text-main)', borderRadius: '20px', width: '250px', outline: 'none' }}
            />
          </div>
        </div>

        {isLoading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading workforce data...</p>
        ) : filteredWorkers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No employees found.</p>
        ) : (
          <div className="pro-table-container">
            <table className="pro-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map(w => (
                  <tr key={w._id}>
                    <td>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                        {w.photo ? <img src={w.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={18} color="#94a3b8" />}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '13px' }}>{w.emp_id}</td>
                    <td style={{ fontWeight: 600 }}>{w.name}</td>
                    <td><span className="badge info">{w.department}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{w.position}</td>
                    <td style={{ fontSize: '13px' }}>{w.contact}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleEdit(w)} className="icon-btn" title="Edit Worker"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(w._id)} className="icon-btn danger" title="Remove Worker"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ height: 'fit-content' }}>
        <h3 style={{ marginBottom: '20px' }}>{editingId ? 'Edit Employee' : 'Add New Employee'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group" style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f1f5f9', margin: '0 auto 12px', cursor: 'pointer', overflow: 'hidden', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
            >
              {formData.photo ? <img src={formData.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={32} color="#94a3b8" />}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formData.photo ? 'Click to change photo' : 'Upload Profile Photo'}</span>
          </div>
          <div className="form-group">
             <label>Employee ID</label>
             <input type="text" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} placeholder="Auto-generated if empty" style={{ width: '100%' }} />
          </div>
          <div className="form-group">
             <label>Full Name</label>
             <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" required style={{ width: '100%' }} />
          </div>
          <div className="form-group">
             <label>Department</label>
             <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-main)', borderRadius: '8px' }}>
                <option>General</option>
                <option>Construction</option>
                <option>Maintenance</option>
                <option>Safety</option>
                <option>Admin</option>
             </select>
          </div>
          <div className="form-group">
             <label>Position</label>
             <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="e.g. Supervisor" style={{ width: '100%' }} />
          </div>
          <div className="form-group">
             <label>Contact (Email/Phone)</label>
             <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="e.g. @company.com" style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({emp_id:'', name:'', department:'General', position:'Worker', contact:'', photo:''}); if(fileInputRef.current) fileInputRef.current.value=''}} style={{ flex: 1, background: 'var(--surface)', padding: '10px', borderRadius: '8px', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>Cancel</button>
            )}
            <button type="submit" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--primary)', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>
              {editingId ? 'Update' : <><Plus size={16} /> Register</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------
// REPORTS TAB (Supervisor Only)
// ------------------------------------
function ReportsTab({ dailyScores, liveStats, analytics }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    setReportSuccess(false);
    
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();
      
      // Header
      doc.setFillColor(31, 41, 55); // var(--surface) equivalent
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("VANGUARD AI SAFETY AUDIT", 15, 25);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${timestamp}`, 15, 33);
      
      // System Performance Section
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(16);
      doc.text("System Performance Summary", 15, 55);
      
      doc.setDrawColor(229, 231, 235);
      doc.line(15, 58, 195, 58);
      
      doc.setFontSize(12);
      doc.text(`Total Compliance Rate: ${liveStats.compliance_rate}%`, 15, 70);
      doc.text(`Total Workers Detected Today: ${dailyScores.length}`, 15, 80);
      doc.text(`Total PPE Violations: ${liveStats.helmet_violations + liveStats.vest_violations}`, 15, 90);
      
      // Safety Scores Table
      doc.setFontSize(16);
      doc.text("Daily Safety Scoreboard (Top Workers)", 15, 110);
      doc.line(15, 113, 195, 113);
      
      doc.setFontSize(10);
      let yPos = 125;
      
      // Table Headers
      doc.setFillColor(243, 244, 246);
      doc.rect(15, yPos-5, 180, 8, 'F');
      doc.text("Worker Identity", 20, yPos);
      doc.text("Helmet", 80, yPos);
      doc.text("Vest", 110, yPos);
      doc.text("Score", 140, yPos);
      doc.text("Last Seen", 165, yPos);
      
      yPos += 10;
      
      dailyScores.slice(0, 20).forEach((p, idx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 30;
        }
        
        doc.text(`${p.name || '#' + p.id}`, 20, yPos);
        doc.text(p.has_helmet ? "CHECKED" : "MISSING", 80, yPos);
        doc.text(p.has_vest ? "CHECKED" : "MISSING", 110, yPos);
        doc.text(`${p.score}%`, 140, yPos);
        doc.text(new Date().toLocaleTimeString(), 165, yPos);
        
        yPos += 8;
      });

      // Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Vanguard AI Workplace Safety - Confidential - Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });
      }

      doc.save(`Safety_Audit_${new Date().toISOString().split('T')[0]}.pdf`);
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 5000);
    } catch (e) {
      console.error("PDF Fail", e);
      alert("Error generating PDF: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Worker ID", "Name", "Helmet", "Vest", "Score"];
    const rows = dailyScores.map(p => [
      p.id, p.name || 'Unidentified', p.has_helmet, p.has_vest, p.score
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `safety_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
      <div className="glass-panel" style={{ minHeight: '80%' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Download size={28} color="var(--warning)" /> Safety Reports & Export
        </h2>
        
        <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', padding: '20px', borderRadius: '12px', marginBottom: '32px' }}>
          <h4 style={{ color: 'var(--warning)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> Data Compliance Note
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Reports generated here are snapshots of your local real-time buffer. Ensure the AI monitor is active to capture the latest workforce safety data.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={generatePDF}>
            <div className="stat-icon primary"><FileText size={24} /></div>
            <div className="stat-info">
              <h3>Generate PDF Audit</h3>
              <p>Professional Compliance Report</p>
            </div>
          </div>
          
          <div className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={exportCSV}>
            <div className="stat-icon success"><Package size={24} /></div>
            <div className="stat-info">
              <h3>Export Raw CSV</h3>
              <p>Download full scoring data</p>
            </div>
          </div>
        </div>

        {reportSuccess && (
          <div style={{ marginTop: '24px', padding: '12px', background: 'var(--success)', color: '#fff', color: 'var(--text-main)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', animation: 'fadeIn 0.5s' }}>
            <CheckCircle size={20} /> Report Saved Successfully!
          </div>
        )}
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '20px' }}>Audit Preview</h3>
        <div style={{ background: '#fff', color: '#1f2937', padding: '20px', borderRadius: '4px', fontSize: '12px', minHeight: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <div style={{ borderBottom: '2px solid #1f2937', paddingBottom: '10px', marginBottom: '15px' }}>
             <h4 style={{ margin: 0 }}>VANGUARD AI SAFETY</h4>
             <span>{(new Date()).toLocaleDateString()}</span>
          </div>
          <p><strong>Compliance Rate:</strong> {liveStats.compliance_rate}%</p>
          <p><strong>Daily Violations:</strong> {liveStats.helmet_violations + liveStats.vest_violations}</p>
          <div style={{ height: '1px', background: '#e5e7eb', margin: '15px 0' }}></div>
          <p><strong>Top Inspected Personnel:</strong></p>
          {dailyScores.slice(0, 5).map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span>{p.name || '#' + p.id}</span>
              <span>{p.score}% Safe</span>
            </div>
          ))}
          {dailyScores.length > 5 && <p style={{ textAlign: 'center', marginTop: '10px', fontStyle: 'italic' }}>+ {dailyScores.length - 5} more...</p>}
          <div style={{ marginTop: '40px', borderTop: '1px dashed #ccc', paddingTop: '10px', fontSize: '10px', color: '#666' }}>
             Generated by Vanguard AI Workplace Monitoring System
          </div>
        </div>
        <button 
          onClick={generatePDF}
          disabled={isGenerating}
          style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'var(--primary)', color: '#fff', color: 'var(--text-main)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          {isGenerating ? 'Drafting Report...' : 'Download Full Audit PDF'}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------
// ALERT LIST TAB (Supervisor Only)
// ------------------------------------
function AlertListTab() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/alerts');
      const data = await res.json();
      if (data.success) setAlerts(data.items);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();
    // Simple polling for real-time feel (could use socket.on('new_alert'))
    const timer = setInterval(fetchAlerts, 5000);
    return () => clearInterval(timer);
  }, []);

  const resolveAlert = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      fetchAlerts();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="glass-panel" style={{ minHeight: '80%' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Megaphone size={28} color="var(--danger)" /> Emergency SOS Alerts
      </h2>

      {loading ? <p>Loading alerts...</p> : (
        <div className="pro-table-container">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Alert By</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No emergency alerts found.</td></tr>
              ) : alerts.map((alert, index) => (
                <tr key={alert._id} style={{ background: alert.status === 'Alerted' ? '#fff1f2' : 'transparent' }}>
                  <td style={{ fontWeight: 600 }}>{index + 1}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                      <ShieldCheck size={16} color="var(--primary)" /> {alert.by}
                    </span>
                  </td>
                  <td>{alert.date}</td>
                  <td style={{ fontWeight: 500 }}>{alert.time}</td>
                  <td>
                    <span className={`badge ${alert.status === 'Alerted' ? 'danger' : 'success'}`}>
                      {alert.status === 'Alerted' ? <Zap size={10} /> : <CheckCircle size={10} />}
                      {alert.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {alert.status === 'Alerted' ? (
                      <button 
                        onClick={() => resolveAlert(alert._id)}
                        style={{ padding: '8px 16px', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Resolve
                      </button>
                    ) : <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '13px' }}>Resolved</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ------------------------------------
// PROFILE TAB (Supervisor/Admin)
// ------------------------------------
function ProfileTab({ role }) {
  const [profileData] = useState({
    fullName: role === 'supervisor' ? 'Marcus Vance' : 'Vanguard Administrator',
    photo: null,
    empId: role === 'supervisor' ? 'SUP-8842' : 'ADM-0001',
    gender: 'Male',
    dob: '1995-03-24',
    mobile: '9876543210',
    email: 'pimprikarsarthak.synture@gmail.com',
    address: 'Pune, Maharashtra, 411001'
  });

  const InfoRow = ({ icon: Icon, label, value, color = "var(--primary)" }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
        <Icon size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>{value}</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
      {/* Left Column: Avatar & Quick Actions */}
      <div className="glass-panel" style={{ textAlign: 'center', height: 'fit-content' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <User size={60} color="#fff" />
          </div>
          <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--success)', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', border: '4px solid var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{profileData.fullName}</h2>
        <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', margin: 0, textTransform: 'uppercase' }}>{role}</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Clearance: Level 4 • Active</p>
        
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button style={{ width: '100%', padding: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', cursor: 'pointer' }}>Change Password</button>
          <button style={{ width: '100%', padding: '10px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Edit Account</button>
        </div>
      </div>

      {/* Right Column: Detailed Info Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Basic Information Section */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCircle size={20} color="var(--primary)" /> 🔹 Basic Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <InfoRow icon={User} label="Full Name" value={profileData.fullName} />
            <InfoRow icon={Hash} label="ID Number" value={profileData.empId} />
            <InfoRow icon={UserCircle} label="Gender" value={profileData.gender} />
            <InfoRow icon={Calendar} label="Date of Birth" value={profileData.dob} />
          </div>
        </div>

        {/* Contact Details Section */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={20} color="var(--success)" /> 🔹 Contact Details
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <InfoRow icon={Phone} label="Mobile Number" value={profileData.mobile} color="var(--success)" />
              <InfoRow icon={Mail} label="Email Address" value={profileData.email} color="var(--success)" />
            </div>
            <InfoRow icon={MapPin} label="Permanent Address" value={profileData.address} color="var(--success)" />
          </div>
        </div>

        {/* System & Security Footer */}
        <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '11px' }}>
          <span>Last Login: Today at 09:12 AM</span>
          <span>System Version: v2.4.0-Stable</span>
        </div>
      </div>
    </div>
  );
}
