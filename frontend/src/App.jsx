import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Activity, Users, AlertTriangle, LogOut, Settings, Camera, User, 
  LayoutDashboard, ChevronRight, Download, Sliders, Bell, Package, Edit2, Trash2, Plus, Zap, Search, FileText, CheckCircle, Megaphone, Mail, Phone, MapPin, Calendar, Hash, UserCircle, Play, Pause, Power, Aperture, Eye, EyeOff 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import './index.css';

const MOCK_API = "http://localhost:5000/api";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [view, setView] = useState('landing'); // 'landing', 'login', 'dashboard'

  useEffect(() => {
    if (userRole) setView('dashboard');
  }, [userRole]);

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

  if (view === 'landing') return <LandingPage onLaunch={() => setView('login')} />;
  if (!userRole) return <Login onLogin={(role) => setUserRole(role)} onBack={() => setView('landing')} />;

  return <Dashboard userRole={userRole} onLogout={() => { setUserRole(null); setView('landing'); }} playBeep={playBeep} />;
}

function LandingPage({ onLaunch }) {
  return (
    <div className="landing-page" style={{ background: 'var(--bg-color)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: 'var(--font-family)' }}>
      {/* Navbar */}
      <nav style={{ 
        height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '0 5%', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, 
        background: 'rgba(11, 15, 20, 0.8)', backdropFilter: 'blur(10px)', zIndex: 1000 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-white)' }}>
          <ShieldCheck color="var(--primary)" size={32} />
          <span>VANGUARD <span style={{ color: 'var(--primary)' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          {[
            { label: 'Safety Modules', id: 'features' },
            { label: 'AI Architecture', id: 'solutions' },
            { label: 'Biometric Fusion', id: 'analytics' }
          ].map(item => (
            <a key={item.id} href={`#${item.id}`} style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>{item.label}</a>
          ))}
          <button 
            onClick={onLaunch}
            style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)' }}
          >
            Launch System
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 5% 120px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
        <div className="animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '20px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '24px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <Zap size={14} />
            NEXT-GEN WORKPLACE SAFETY
          </div>
          <h1 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px', color: 'var(--text-white)' }}>
            Empower Your Site with <span style={{ color: 'var(--primary)' }}>Autonomous</span> Oversight
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px', maxWidth: '540px' }}>
            Vanguard AI integrates advanced computer vision and real-time biometric analytics to ensure 100% compliance. Protect your workforce with the industry's most advanced PPE monitoring system.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={onLaunch}
              style={{ padding: '18px 36px', background: 'var(--primary)', color: 'white', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              Start Monitoring Now <ChevronRight size={20} />
            </button>
            <button style={{ padding: '18px 36px', background: 'var(--panel-bg)', color: 'var(--text-main)', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, border: '1px solid var(--border-color)', cursor: 'pointer' }}>
              View Case Studies
            </button>
          </div>
          <div style={{ marginTop: '48px', display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-white)' }}>95.4%</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detection Accuracy</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }}></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-white)' }}>&lt;50ms</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time Latency</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }}></div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-white)' }}>24/7</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Autonomous Audit</div>
            </div>
          </div>
        </div>
        <div className="animate-fade-in" style={{ position: 'relative' }}>
          <div style={{ 
            position: 'absolute', top: '-20px', left: '-20px', right: '20px', bottom: '20px', 
            background: 'linear-gradient(135deg, var(--primary), transparent)', opacity: 0.1, borderRadius: '24px', zIndex: -1 
          }}></div>
          <img 
            src="/hero.png" 
            alt="Vanguard AI Dashboard" 
            style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }} 
          />
          {/* Floating UI Card */}
          <div style={{ position: 'absolute', bottom: '40px', left: '-30px', background: 'var(--panel-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', width: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={18} color="var(--primary)" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Safety Verified</span>
            </div>
            <div style={{ height: '4px', background: 'var(--muted-bg)', borderRadius: '2px', width: '100%', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--primary)', width: '85%' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Compliance Rate</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>85%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 5%', background: 'var(--sidebar-bg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '16px' }}>Industrial-Grade Safety Modules</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>Deploy comprehensive safety coverage with specialized AI modules designed for high-risk industrial environments.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {[
            { icon: Camera, title: 'PPE Detection', desc: 'Real-time monitoring of helmets, vests, and eyewear with advanced YOLO architecture.' },
            { icon: Users, title: 'Biometric Access', desc: 'Integrated facial recognition to link safety performance with individual worker identities.' },
            { icon: Activity, title: 'Health & Intensity', desc: 'Monitor site activity levels and worker fatigue through behavioral pattern analysis.' },
            { icon: FileText, title: 'Automated Audits', desc: 'Generate professional compliance reports and safety scores with zero manual input.' },
            { icon: Bell, title: 'Instant Alerts', desc: 'Multi-channel notifications for PPE violations and unauthorized area access.' },
            { icon: LayoutDashboard, title: 'Command Center', desc: 'A unified dashboard for multi-site monitoring and enterprise safety analytics.' }
          ].map((feature, i) => (
            <div key={i} className="glass-panel" style={{ padding: '40px', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--primary)' }}>
                <feature.icon size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '12px' }}>{feature.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Anatomical Safety Architecture Section */}
      <section id="solutions" style={{ padding: '100px 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '20px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '24px' }}>
              <Aperture size={14} /> PRECISION GATING
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '24px' }}>Anatomical Safety <br/><span style={{ color: 'var(--primary)' }}>Architecture</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px' }}>
              Standard AI often fails due to background noise. Vanguard AI solves this through <strong>Regional Gating</strong>—a unique spatial algorithm that maps PPE detections to specific anatomical zones of the human body.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {[
                { title: 'Head Gating', desc: 'Top 26% box ratio for helmet verification.' },
                { title: 'Torso Gating', desc: 'Middle 52% box ratio for safety vest mapping.' },
                { title: 'IoU Thresholding', desc: 'Strict spatial overlap gates for high precision.' },
                { title: 'Aspect Ratio Guard', desc: 'Filters skinny/wide boxes to eliminate clutter.' }
              ].map((gate, i) => (
                <div key={i} style={{ padding: '20px', background: 'var(--panel-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: 'var(--text-white)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>{gate.title}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{gate.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '40px', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
             {/* Body Scan Visualization */}
             <div style={{ position: 'relative', width: '240px', height: '400px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '20px', background: 'rgba(255,255,255,0.02)' }}>
                {/* Head Gate */}
                <div style={{ position: 'absolute', top: '0', left: '10%', right: '10%', height: '26%', border: '2px solid var(--primary)', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <div style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 900 }}>HEAD ZONE [26%]</div>
                </div>
                {/* Torso Gate */}
                <div style={{ position: 'absolute', top: '26%', left: '5%', right: '5%', height: '52%', border: '2px solid #3b82f6', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <div style={{ fontSize: '0.6rem', color: '#3b82f6', fontWeight: 900 }}>TORSO ZONE [52%]</div>
                </div>
                {/* Legs (Inactive) */}
                <div style={{ position: 'absolute', top: '78%', left: '15%', right: '15%', height: '22%', border: '1px dashed var(--text-muted)', borderRadius: '8px', opacity: 0.3 }}></div>
                
                {/* Connection Lines */}
                <div style={{ position: 'absolute', right: '-40px', top: '13%', width: '40px', height: '1px', background: 'var(--border-color)' }}></div>
                <div style={{ position: 'absolute', right: '-120px', top: '13%', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 700 }}>HELMET VERIFIED</div>
                
                <div style={{ position: 'absolute', right: '-40px', top: '52%', width: '40px', height: '1px', background: 'var(--border-color)' }}></div>
                <div style={{ position: 'absolute', right: '-120px', top: '52%', color: '#3b82f6', fontSize: '0.7rem', fontWeight: 700 }}>VEST VERIFIED</div>
             </div>
          </div>
        </div>
      </section>

      {/* Biometric Identity Fusion Section */}
      <section id="analytics" style={{ padding: '100px 5%', background: 'var(--sidebar-bg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px', alignItems: 'center' }}>
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
            {/* Identity Match Mockup */}
            <div style={{ position: 'relative', borderRadius: '20px', background: '#000', height: '320px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.3, background: 'radial-gradient(circle at center, var(--primary) 0%, transparent 70%)' }}></div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: '120px', border: '2px solid var(--primary)', borderRadius: '12px' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', width: '20px', height: '20px', borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)' }}></div>
              </div>
              <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', textAlign: 'center' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '2px' }}>SCANNING IDENTITY...</div>
              </div>
            </div>
            
            <div style={{ position: 'absolute', top: '60px', right: '60px', background: 'var(--panel-bg)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', width: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <CheckCircle size={16} color="var(--primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Match Found</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)' }}>John Doe</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: #EMP-9921</div>
            </div>
          </div>

          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '20px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '24px' }}>
              <Users size={14} /> BIOMETRIC FUSION
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-white)', marginBottom: '24px' }}>Identity-Linked <br/><span style={{ color: 'var(--primary)' }}>Safety Intelligence</span></h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '32px' }}>
              Unlike generic monitoring systems, Vanguard AI merges object detection with facial biometrics. 
              We don't just detect a violation; we identify the individual responsible, allowing for personalized safety coaching and accountability.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { title: 'Zero-Touch Enrolment', desc: 'Auto-syncs with your HR worker directory photos.' },
                { title: 'Privacy-First Matching', desc: 'Local-only 128-bit biometric encoding vectors.' },
                { title: 'Smart Score History', desc: 'Track safety performance per worker over time.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></div>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-white)', fontWeight: 700, margin: 0 }}>{item.title}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer style={{ padding: '60px 5%', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-white)', marginBottom: '24px' }}>
          <ShieldCheck color="var(--primary)" size={24} />
          <span>VANGUARD AI</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 Vanguard Safety AI Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}

function Login({ onLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // 2FA OTP State
  const [otpStep, setOtpStep] = useState(false);
  const [sessionKey, setSessionKey] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!otpStep || countdown <= 0) return;
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [otpStep, countdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

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
      if (data.success && data.requires_otp) {
        setSessionKey(data.session_key);
        setMaskedEmail(data.masked_email);
        setOtpStep(true);
        setCountdown(300);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      } else if (data.success && data.role) {
        onLogin(data.role);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError("System Offline. Check credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || '';
      setOtpDigits(newDigits);
      const focusIdx = Math.min(pasted.length, 5);
      otpRefs[focusIdx].current?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setError('');
    setIsLoading(true);
    try {
      const resp = await fetch(`${MOCK_API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_key: sessionKey, otp })
      });
      const data = await resp.json();
      if (data.success) {
        onLogin(data.role);
      } else {
        setError(data.message || 'Invalid OTP');
        setOtpDigits(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      const resp = await fetch(`${MOCK_API}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_key: sessionKey })
      });
      const data = await resp.json();
      if (data.success) {
        setCountdown(300);
        setResendCooldown(30);
        setOtpDigits(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      } else {
        setError(data.message);
        if (data.message?.includes('expired')) { setOtpStep(false); }
      }
    } catch (err) {
      setError("Failed to resend code.");
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const inputStyle = {
    width: '100%', padding: '14px 16px 14px 48px', background: 'var(--muted-bg)',
    border: '1px solid var(--border-color)', borderRadius: '12px', fontSize: '15px', color: 'var(--text-main)',
    outline: 'none', transition: 'border-color 0.2s'
  };

  const btnStyle = {
    width: '100%', padding: '16px', background: 'var(--primary)', color: '#fff',
    border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700,
    cursor: isLoading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)', marginTop: '8px'
  };

  // ---- OTP Verification Screen ----
  if (otpStep) {
    return (
      <div className="login-container animate-fade-in" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <div className="login-box-v2" style={{
          width: '100%', maxWidth: '440px', padding: '48px', background: 'var(--panel-bg)',
          borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', margin: '20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 16px',
              background: 'rgba(34, 197, 94, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.15)'
            }}>
              <Mail size={28} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-white)', marginBottom: '8px' }}>Verify Your Identity</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              We've sent a 6-digit verification code to<br />
              <strong style={{ color: 'var(--text-main)' }}>{maskedEmail}</strong>
            </p>
          </div>

          {error && <div style={{ color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #fee2e2', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleVerifyOtp}>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  style={{
                    width: '48px', height: '56px', textAlign: 'center', fontSize: '22px', fontWeight: 700,
                    border: digit ? '2px solid #2563eb' : '2px solid #e2e8f0', borderRadius: '12px',
                    background: digit ? '#eff6ff' : '#f8fafc', color: '#1e293b', outline: 'none',
                    transition: 'all 0.2s', caretColor: '#2563eb'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = digit ? '#2563eb' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                />
              ))}
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              {countdown > 0 ? (
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Code expires in <strong style={{ color: countdown <= 60 ? '#ef4444' : '#2563eb' }}>{formatTime(countdown)}</strong>
                </span>
              ) : (
                <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: 600 }}>Code has expired. Please resend.</span>
              )}
            </div>

            <button type="submit" disabled={isLoading || countdown <= 0} style={{
              ...btnStyle, opacity: (isLoading || countdown <= 0) ? 0.6 : 1,
              cursor: (isLoading || countdown <= 0) ? 'not-allowed' : 'pointer'
            }}
              onMouseOver={(e) => { if (!isLoading && countdown > 0) e.target.style.background = '#0052cc'; }}
              onMouseOut={(e) => { if (!isLoading && countdown > 0) e.target.style.background = '#0061f2'; }}
            >
              {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              style={{
                background: 'none', border: 'none', color: resendCooldown > 0 ? '#94a3b8' : '#2563eb',
                fontSize: '14px', fontWeight: 600, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => { setOtpStep(false); setError(''); setOtpDigits(['','','','','','']); onBack(); }}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: '13px', cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              ← Back to Product Info
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Credentials Screen (Step 1) ----
  return (
    <div className="login-container animate-fade-in" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
      <div className="login-box-v2" style={{ 
        width: '100%', maxWidth: '440px', padding: '48px', background: 'var(--panel-bg)', 
        borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)',
        margin: '20px'
      }}>
        {/* Back Link */}
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
        >
          <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Product
        </button>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-white)', marginBottom: '8px' }}>Vanguard AI Safety</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>Secure access to real-time workplace compliance and PPE monitoring.</p>
        </div>

        {/* Role Selector Segmented Control */}
        <div style={{ 
          background: 'var(--muted-bg)', padding: '4px', borderRadius: '12px', 
          display: 'flex', marginBottom: '32px', position: 'relative', border: '1px solid var(--border-color)'
        }}>
          <div 
            onClick={() => setRole('admin')}
            style={{ 
              flex: 1, padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', zIndex: 2, color: role === 'admin' ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.3s', borderRadius: '8px',
              background: 'transparent'
            }}
          >
            Admin
          </div>
          <div 
            onClick={() => setRole('supervisor')}
            style={{ 
              flex: 1, padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', zIndex: 2, color: role === 'supervisor' ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.3s', borderRadius: '8px',
              background: 'transparent'
            }}
          >
            Supervisor
          </div>
          <div style={{ 
            position: 'absolute', top: '4px', bottom: '4px', 
            left: role === 'admin' ? '4px' : 'calc(50% + 2px)',
            width: 'calc(50% - 6px)', background: 'rgba(34, 197, 94, 0.1)', 
            borderRadius: '9px', border: '1px solid var(--primary)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1
          }} />
        </div>

        {error && <div style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="form-group-v2">
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Employee</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Enter Employee" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
          </div>

          <div className="form-group-v2">
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showPass ? "text" : "password"} 
                placeholder="Enter password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ ...inputStyle, padding: '14px 48px 14px 48px' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              <div 
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={btnStyle}
            onMouseOver={(e) => { if(!isLoading) e.target.style.background = '#0052cc' }}
            onMouseOut={(e) => { if(!isLoading) e.target.style.background = '#0061f2' }}
          >
            {isLoading ? 'Authenticating...' : 'Continue'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#94a3b8' }}>
          🔐 Protected by Two-Factor Authentication
        </p>
      </div>
    </div>
  );
}

function Dashboard({ userRole, onLogout, playBeep }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showSOSModal, setShowSOSModal] = useState(false);
  
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
        const queryParams = new URLSearchParams({
          _t: Date.now(),
          range: timeRange
        });
        if (timeRange === 'month') {
          queryParams.append('month', selectedMonth);
          queryParams.append('year', selectedYear);
        }

        const [statsRes, analyticsRes, dailyRes] = await Promise.all([
          fetch(`${MOCK_API}/stats?_t=${Date.now()}`).catch(() => null),
          fetch(`${MOCK_API}/analytics?${queryParams.toString()}`).catch(() => null),
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
  }, [lastViolationCount, playBeep, timeRange, selectedMonth, selectedYear]);

  const handleSOS = async (emergencyType) => {
    setShowSOSModal(false);
    playBeep(3000, 440, 0.4, true);
    try {
      await fetch('http://localhost:5000/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ by: 'Admin', type: emergencyType })
      });
      alert(`SOS ALARM ACTIVE: Security Personnel Notified (${emergencyType}).`);
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
      {showSOSModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'var(--panel-bg)', padding: '32px', borderRadius: '12px', 
            width: '400px', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)'
          }}>
            <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
            <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-white)' }}>Select Emergency Type</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>Please specify the nature of the emergency to notify supervisors appropriately.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Fire/Explosion', 'Medical Emergency', 'Structural Collapse', 'Equipment Failure', 'Other'].map(type => (
                <button 
                  key={type}
                  onClick={() => handleSOS(type)}
                  style={{
                    padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px', color: 'var(--danger)', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s', width: '100%'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
                >
                  {type}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowSOSModal(false)}
              style={{
                marginTop: '24px', background: 'transparent', border: 'none', 
                color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
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
            <button onClick={() => setShowSOSModal(true)} style={{ 
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
          {activeTab === 'Overview' && (
            <OverviewTab 
              liveStats={liveStats} 
              analytics={analytics} 
              isAIPaused={isAIPaused} 
              onToggleAI={toggleAI} 
              onCapture={handleCapture} 
              timeRange={timeRange} 
              setTimeRange={setTimeRange}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          )}
          {activeTab === 'Incident Feed' && <IncidentFeedTab analytics={analytics} manualIncidents={manualIncidents} />}
          {activeTab === 'Safety Analytics' && (
            <AnalyticsTab 
              analytics={analytics} 
              timeRange={timeRange} 
              setTimeRange={setTimeRange}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          )}
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
function OverviewTab({ 
  liveStats, analytics, isAIPaused, onToggleAI, onCapture, 
  timeRange, setTimeRange, 
  selectedMonth, setSelectedMonth, 
  selectedYear, setSelectedYear 
}) {
  // Use DB aggregation for dynamic totals since live totals represent instantaneous frame presence.
  const aggregatedProcessed = Math.max(...(analytics.hourly_analytics.map(h => h.max_detections)), liveStats.total_detections);
  const totalHelmetLoss = analytics.hourly_analytics.reduce((sum, item) => sum + item.total_helmet_violations, liveStats.helmet_violations);
  const totalVestLoss = analytics.hourly_analytics.reduce((sum, item) => sum + item.total_vest_violations, liveStats.vest_violations);
  const hasHistoricalData = analytics.hourly_analytics && analytics.hourly_analytics.length > 0;
  const historicalComp = hasHistoricalData 
    ? analytics.hourly_analytics.reduce((sum, item) => sum + item.avg_compliance, 0) / analytics.hourly_analytics.length
    : liveStats.compliance_rate;

  const displayComp = Math.round((liveStats.compliance_rate + historicalComp) / 2);

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
      <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '32px', padding: '28px 36px', position: 'relative' }}>
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
            Safety Compliance {timeRange === 'today' ? 'Today' : timeRange === 'week' ? 'This Week' : 'This Month'}
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

        {/* Time Range Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', alignSelf: 'flex-start', marginLeft: 'auto' }}>
          <div style={{ 
            background: 'var(--muted-bg)', padding: '4px', borderRadius: '10px', 
            display: 'flex', border: '1px solid var(--border-color)'
          }}>
            {['month', 'week', 'today'].map((range) => (
              <div 
                key={range}
                onClick={() => setTimeRange(range)}
                style={{ 
                  padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: timeRange === range ? 'var(--panel-hover)' : 'transparent',
                  color: timeRange === range ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: timeRange === range ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </div>
            ))}
          </div>

          {timeRange === 'month' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                style={{ 
                  padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-main)',
                  border: '1px solid var(--border-color)', background: 'var(--muted-bg)', outline: 'none'
                }}
              >
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                style={{ 
                  padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-main)',
                  border: '1px solid var(--border-color)', background: 'var(--muted-bg)', outline: 'none'
                }}
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          )}
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
                  background: 'var(--panel-hover)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
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
              background: 'var(--panel-hover)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.2s'
            }}>
              <div style={{ position: 'relative', paddingTop: '75%' }}>
                {incident.snapshot ? (
                  <img 
                    src={`data:image/jpeg;base64,${incident.snapshot}`} 
                    alt="Incident Feed" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
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
                  <div style={{ background: 'var(--muted-bg)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>COM-RATE</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--success)' }}>{incident.compliance_rate}%</p>
                  </div>
                  <div style={{ background: 'var(--muted-bg)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)' }}>DETECTIONS</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>{incident.total_detections}</p>
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
function AnalyticsTab({ 
  analytics,
  timeRange, setTimeRange,
  selectedMonth, setSelectedMonth,
  selectedYear, setSelectedYear 
}) {
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

  const chartData = (analytics.hourly_analytics || []).map(h => {
    const date = h.latest_timestamp ? new Date(h.latest_timestamp) : new Date();
    let label = "";
    if (h._id.hour !== undefined) {
      label = `${h._id.hour}:00`;
    } else if (h._id.day !== undefined) {
      label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else if (h._id.week !== undefined) {
      label = `Wk ${h._id.week}, ${date.toLocaleDateString(undefined, { month: 'short' })}`;
    } else {
      label = date.toLocaleDateString();
    }
    
    return {
      time: label,
      Compliance: Math.round(h.avg_compliance),
      Helmets_Missed: h.total_helmet_violations,
      Vests_Missed: h.total_vest_violations,
      Peak_Persons: h.max_detections || 0
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} ref={chartRef}>
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Safety Performance Analytics</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {/* Time Range Selector */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ 
                background: 'var(--muted-bg)', padding: '4px', borderRadius: '10px', 
                display: 'flex', border: '1px solid var(--border-color)'
              }}>
                {['month', 'week', 'today'].map((range) => (
                  <div 
                    key={range}
                    onClick={() => setTimeRange(range)}
                    style={{ 
                      padding: '6px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: timeRange === range ? 'var(--panel-hover)' : 'transparent',
                      color: timeRange === range ? 'var(--primary)' : 'var(--text-muted)',
                      boxShadow: timeRange === range ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </div>
                ))}
              </div>

              {timeRange === 'month' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    style={{ 
                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-main)',
                      border: '1px solid var(--border-color)', background: 'var(--muted-bg)', outline: 'none'
                    }}
                  >
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select 
                    value={selectedYear} 
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{ 
                      padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: 'var(--text-main)',
                      border: '1px solid var(--border-color)', background: 'var(--muted-bg)', outline: 'none'
                    }}
                  >
                    {[2024, 2025, 2026].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button onClick={generatePDF} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div>
          {chartData.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '40px 0'}}>
              Not enough data yet. System is generating analytics...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div className="glass-panel">
                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Compliance Trend (%)</h3>
                <div style={{ width: '100%', height: '320px' }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                      <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                        itemStyle={{ color: 'var(--text-main)', fontSize: '12px' }}
                        labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="Compliance" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="glass-panel">
                <h3 style={{ marginBottom: '16px', textAlign: 'center', fontSize: '1rem' }}>Issues Breakdown</h3>
                <div style={{ width: '100%', height: '320px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Helmet Issues', value: chartData.reduce((a, b) => a + b.Helmets_Missed, 0) },
                          { name: 'Vest Issues', value: chartData.reduce((a, b) => a + b.Vests_Missed, 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        <Cell fill="var(--warning)" />
                        <Cell fill="var(--danger)" />
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                        itemStyle={{ color: 'var(--text-main)', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="bottom" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
      </div>

      {chartData.length > 0 && (
        <>
          <div className="glass-panel">
            <h3 style={{ marginBottom: '24px', fontSize: '1rem' }}>Incident Volume Over Time</h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                  <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                    itemStyle={{ color: 'var(--text-main)', fontSize: '12px' }}
                    labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }}
                  />
                  <Legend />
                  <Bar dataKey="Helmets_Missed" name="Helmet Violations" fill="var(--warning)" radius={[6, 6, 0, 0]} barSize={40} />
                  <Bar dataKey="Vests_Missed" name="Vest Violations" fill="var(--danger)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div className="glass-panel">
              <h3 style={{ marginBottom: '24px', fontSize: '1rem' }}>Workforce Activity Trend</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPersons" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
                    <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                      itemStyle={{ color: 'var(--text-main)', fontSize: '12px' }}
                      labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="Peak_Persons" name="Personnel Count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPersons)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel">
              <h3 style={{ marginBottom: '24px', fontSize: '1rem' }}>Safety Issue Intensity</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis dataKey="time" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                      itemStyle={{ color: 'var(--text-main)', fontSize: '12px' }}
                    />
                    <Legend />
                    <Bar dataKey="Helmets_Missed" name="Helmet Risk" stackId="a" fill="var(--warning)" radius={[0, 0, 0, 0]} barSize={20} />
                    <Bar dataKey="Vests_Missed" name="Vest Risk" stackId="a" fill="var(--danger)" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
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
              Daily Safety Score
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
          <Users size={18} color="var(--primary)" /> Daily Worker List
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
            <div style={{ flex: 1, background: 'var(--muted-bg)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
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
            
            <div style={{ flex: 1, background: 'var(--muted-bg)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
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
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none' }} 
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
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Equipment ID / Name</label>
             <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }} />
          </div>
          <div className="form-group">
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Type</label>
             <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }}>
                <option value="Helmet">Helmet</option>
                <option value="Safety Vest">Safety Vest</option>
                <option value="Boots">Boots</option>
                <option value="Gloves">Gloves</option>
             </select>
          </div>
          <div className="form-group">
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Status</label>
             <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }}>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Lost/Damaged">Lost/Damaged</option>
                <option value="Maintenance">Maintenance</option>
             </select>
          </div>
          <div className="form-group">
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Assigned To (Name/ID)</label>
             <input type="text" value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} placeholder="Optional..." style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', type:'Helmet', status:'Available', assigned_to:''})}} style={{ flex: 1, background: 'var(--muted-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-main)', cursor: 'pointer' }}>Cancel</button>
            )}
            <button type="submit" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--primary)', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
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
              style={{ padding: '10px 10px 10px 40px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '20px', width: '250px', outline: 'none' }}
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
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--muted-bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
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
              style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--muted-bg)', margin: '0 auto 12px', cursor: 'pointer', overflow: 'hidden', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
            >
              {formData.photo ? <img src={formData.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={32} color="#94a3b8" />}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formData.photo ? 'Click to change photo' : 'Upload Profile Photo'}</span>
          </div>
           <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Employee ID</label>
              <input type="text" value={formData.emp_id} onChange={e => setFormData({...formData, emp_id: e.target.value})} placeholder="Auto-generated if empty" style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }} />
           </div>
           <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Full Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" required style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }} />
           </div>
           <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Department</label>
              <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }}>
                 <option value="General">General</option>
                 <option value="Construction">Construction</option>
                 <option value="Maintenance">Maintenance</option>
                 <option value="Safety">Safety</option>
                 <option value="Admin">Admin</option>
              </select>
           </div>
           <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Position</label>
              <input type="text" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} placeholder="e.g. Supervisor" style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }} />
           </div>
           <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Contact (Email/Phone)</label>
              <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="e.g. @company.com" style={{ width: '100%', padding: '10px', background: 'var(--muted-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', outline: 'none' }} />
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
                <th>Type</th>
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
                  <td style={{ fontWeight: 600, color: 'var(--danger)' }}>{alert.type || 'General Emergency'}</td>
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
