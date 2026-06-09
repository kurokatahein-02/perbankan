import { useState, useEffect } from "react";
import { Wallet, Eye, EyeOff, ArrowRight, Shield, Fingerprint, ChevronRight, TrendingUp, Lock, Zap } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const STAGES = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" };

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [nik, setNik]           = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  
  const [showPass, setShowPass] = useState(false);
  const [showPassConf, setShowPassConf] = useState(false);
  
  const [stage, setStage]       = useState(STAGES.IDLE);
  const [errMsg, setErrMsg]     = useState("");
  const [mounted, setMounted]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleSubmit = async () => {
    setErrMsg(""); 
    setStage(STAGES.LOADING);
    
    if (password !== passwordConfirmation) {
      setStage(STAGES.ERROR);
      setErrMsg("Password dan Konfirmasi Password tidak cocok.");
      return;
    }
    
    try {
      const response = await api.post('/forgot-password', { 
        email, 
        nik, 
        password,
        password_confirmation: passwordConfirmation 
      });
      
      setStage(STAGES.SUCCESS);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStage(STAGES.ERROR);
      setErrMsg(error.response?.data?.message || "Terjadi kesalahan sistem");
    }
  };

  const isLoading = stage === STAGES.LOADING;
  const isSuccess = stage === STAGES.SUCCESS;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=Syne:wght@600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }

        @keyframes orb1   { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-40px) scale(1.08)} }
        @keyframes orb2   { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,30px) scale(1.05)} }
        @keyframes orb3   { 0%,100%{transform:translate(0,0)}60%{transform:translate(15px,-20px)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fade-in { from{opacity:0}to{opacity:1} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.8}70%{transform:scale(1.25);opacity:0}100%{transform:scale(1);opacity:0} }
        @keyframes check-draw { from{stroke-dashoffset:30}to{stroke-dashoffset:0} }
        @keyframes shimmer { 0%{transform:translateX(-100%)}100%{transform:translateX(200%)} }
        @keyframes ticker  { from{transform:translateX(0)}to{transform:translateX(-50%)} }
        @keyframes float   { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }

        .page {
          display: flex;
          min-height: 100vh;
          background: #020817;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .left {
          flex: 1.1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 48px;
          overflow: hidden;
          min-height: 100vh;
        }

        .left-bg {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(145deg, #0d0f2b 0%, #060818 60%, #0a0520 100%);
        }

        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .orb1 { width: 480px; height: 480px; top: -120px; left: -80px;
          background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%);
          animation: orb1 10s ease-in-out infinite; }
        .orb2 { width: 380px; height: 380px; bottom: -60px; right: -40px;
          background: radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%);
          animation: orb2 13s ease-in-out infinite 2s; }
        .orb3 { width: 260px; height: 260px; top: 40%; left: 30%;
          background: radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 70%);
          animation: orb3 8s ease-in-out infinite 1s; }

        .grid-overlay {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        .left-content { position: relative; z-index: 2; }

        .logo-row {
          display: flex; align-items: center; gap: 10px;
          animation: fade-up .5s ease both;
        }
        .logo-icon {
          width: 44px; height: 44px; border-radius: 13px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 24px rgba(99,102,241,.45);
        }
        .logo-name {
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px;
          color: #f1f5f9; letter-spacing: -.02em;
        }

        .left-hero { margin-top: 64px; animation: fade-up .55s ease .1s both; }
        .left-hero h1 {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: clamp(36px, 3.5vw, 52px); line-height: 1.12;
          letter-spacing: -.03em; color: #f8fafc; margin-bottom: 20px;
        }
        .left-hero h1 span {
          background: linear-gradient(90deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .left-hero p {
          font-size: 15px; line-height: 1.7; color: #475569; max-width: 380px;
        }

        /* Stat cards */
        .stat-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
          margin-top: 52px;
          animation: fade-up .6s ease .2s both;
        }
        .stat-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 18px 16px;
          position: relative; overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.04), transparent);
          animation: shimmer 3.5s ease infinite;
        }
        .stat-label { font-size: 11px; color: #475569; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
        .stat-value { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 22px; color: #f1f5f9; }
        .stat-delta { font-size: 11px; color: #34d399; margin-top: 4px; }

        /* Floating card mockup */
        .float-card {
          position: relative; z-index: 2;
          background: linear-gradient(135deg, rgba(99,102,241,.25) 0%, rgba(168,85,247,.15) 100%);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; padding: 24px;
          max-width: 340px;
          animation: fade-up .65s ease .3s both, float 5s ease-in-out 1s infinite;
          backdrop-filter: blur(12px);
        }
        .float-card-chip { width: 36px; height: 26px; background: rgba(255,255,255,.18); border-radius: 6px; margin-bottom: 20px; }
        .float-card-num { font-family: 'DM Mono', monospace; font-size: 13px; color: rgba(255,255,255,.6); letter-spacing: .2em; margin-bottom: 16px; }
        .float-card-footer { display: flex; justify-content: space-between; align-items: flex-end; }
        .float-card-holder { font-size: 12px; }
        .float-card-holder span { display: block; font-size: 10px; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .07em; margin-bottom: 3px; }
        .mc-circles { display: flex; }
        .mc-c { width: 26px; height: 26px; border-radius: 50%; }
        .mc-c:first-child { background: rgba(255,95,0,.8); margin-right: -10px; }
        .mc-c:last-child  { background: rgba(255,185,0,.7); }

        /* Ticker */
        .ticker-wrap {
          position: relative; z-index: 2;
          overflow: hidden; padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,.05);
          animation: fade-in .5s ease .4s both;
        }
        .ticker-inner {
          display: flex; gap: 40px; white-space: nowrap;
          animation: ticker 18s linear infinite;
        }
        .ticker-item { font-size: 12px; color: #334155; display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .ticker-dot  { width: 5px; height: 5px; border-radius: 50%; background: #6366f1; }

        /* ── RIGHT PANEL (FORM) ── */
        .right {
          width: 520px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(6,8,24,0.95);
          border-left: 1px solid rgba(255,255,255,0.05);
          padding: 48px 56px;
          position: relative; z-index: 10;
          animation: fade-in .4s ease both;
          overflow-y: auto;
        }
        .right::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(ellipse at 80% 10%, rgba(99,102,241,0.07) 0%, transparent 55%);
          pointer-events: none;
        }

        .form-wrap { width: 100%; position: relative; z-index: 1; }

        .form-eyebrow {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px; border-radius: 100px;
          background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.25);
          font-size: 11px; font-weight: 500; color: #818cf8;
          letter-spacing: .04em; margin-bottom: 20px;
          animation: fade-up .4s ease .05s both;
        }

        .form-title {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 30px; letter-spacing: -.03em; line-height: 1.15;
          color: #f8fafc; margin-bottom: 6px;
          animation: fade-up .45s ease .1s both;
        }
        .form-sub {
          font-size: 14px; color: #475569; margin-bottom: 32px;
          animation: fade-up .45s ease .12s both;
        }

        .field { margin-bottom: 16px; animation: fade-up .45s ease .15s both; }
        .field + .field { animation-delay: .18s; }
        .field label { display: block; font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 7px; letter-spacing: .02em; }

        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #334155; pointer-events: none; transition: color .2s; }
        .field-input {
          width: 100%; padding: 13px 14px 13px 42px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px; color: #f1f5f9;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color .2s, background .2s, box-shadow .2s;
          caret-color: #818cf8;
        }
        .field-input::placeholder { color: rgba(100,116,139,.5); }
        .field-input:focus {
          border-color: rgba(129,140,248,.45);
          background: rgba(99,102,241,.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,.1);
        }
        .field-input:focus ~ .input-icon, .input-wrap:focus-within .input-icon { color: #818cf8; }
        .eye-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #334155; padding: 4px; display: flex; align-items: center;
          transition: color .15s;
        }
        .eye-btn:hover { color: #64748b; }

        .error-box {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(239,68,68,.07); border: 1px solid rgba(239,68,68,.18);
          color: #f87171; font-size: 13px; margin-bottom: 16px;
          animation: fade-in .25s ease both;
        }

        .cta-btn {
          width: 100%; padding: 14px;
          border: none; border-radius: 12px;
          font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform .15s, box-shadow .15s, opacity .15s;
          position: relative; overflow: hidden;
          margin-top: 24px;
          animation: fade-up .45s ease .22s both;
        }
        .cta-btn:not(:disabled):hover { transform: translateY(-2px); }
        .cta-btn:not(:disabled):active { transform: scale(.98); }
        .cta-btn:disabled { opacity: .55; cursor: not-allowed; }
        .cta-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .form-footer {
          margin-top: 28px; text-align: center; font-size: 13px; color: #334155;
          animation: fade-up .45s ease .3s both;
        }

        .success-wrap {
          display: flex; flex-direction: column; align-items: center;
          gap: 16px; padding: 20px 0;
          animation: fade-in .4s ease both;
        }
        .success-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: rgba(16,185,129,.12); border: 2px solid rgba(16,185,129,.3);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .success-icon::after {
          content: '';
          position: absolute; inset: -6px; border-radius: 50%;
          border: 2px solid rgba(16,185,129,.2);
          animation: pulse-ring 1.8s ease-out infinite;
        }

        /* responsive hide */
        @media (max-width: 900px) {
          .left { display: none; }
          .right { width: 100%; border-left: none; padding: 40px 28px; }
        }
      `}</style>

      <div className="page" style={{ opacity: mounted ? 1 : 0, transition: "opacity .3s" }}>

        {/* ══ LEFT PANEL ══════════════════════════════════════════════════ */}
        <div className="left">
          <div className="left-bg" />
          <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
          <div className="grid-overlay" />

          {/* Logo */}
          <div className="left-content">
            <div className="logo-row">
              <div className="logo-icon">
                <Wallet size={20} color="white" />
              </div>
              <span className="logo-name">NeoBank</span>
            </div>

            {/* Hero copy */}
            <div className="left-hero">
              <h1>Pemulihan<br /><span>Akses Akun</span></h1>
              <p>Jangan khawatir. Kami akan membantu memulihkan akses ke akun perbankan kamu dengan proses verifikasi yang aman.</p>
            </div>
          </div>
          
          <div className="left-content" style={{ marginTop: "auto" }}>
              <div className="stat-grid" style={{ marginTop: '0', gridTemplateColumns: '1fr' }}>
                <div className="stat-card" style={{ maxWidth: '340px' }}>
                  <div className="stat-label">SISTEM KEAMANAN</div>
                  <div className="stat-value" style={{ fontSize: '16px' }}>Verifikasi Identitas Ganda</div>
                  <div className="stat-delta" style={{ color: '#64748b', marginTop: '8px' }}>Kami membutuhkan kombinasi Email dan NIK yang terdaftar untuk memastikan keamanan akun Anda.</div>
                </div>
              </div>
          </div>

          {/* Ticker */}
          <div className="ticker-wrap" style={{ marginTop: "24px" }}>
            <div className="ticker-inner">
              {[
                "Sistem Keamanan Berlapis","Verifikasi Real-time","Enkripsi End-to-End",
                "Sistem Keamanan Berlapis","Verifikasi Real-time","Enkripsi End-to-End",
                "Sistem Keamanan Berlapis","Verifikasi Real-time","Enkripsi End-to-End",
              ].map((t, i) => (
                <span key={i} className="ticker-item">
                  <span className="ticker-dot" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL (FORM) ══════════════════════════════════════════ */}
        <div className="right">
          <div className="form-wrap">

            {isSuccess ? (
              <div className="success-wrap">
                <div className="success-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M8 16 L13.5 21.5 L24 11" stroke="#10b981" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      strokeDasharray="30"
                      style={{ animation: "check-draw .4s ease .1s both forwards", strokeDashoffset: 30 }} />
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "20px", color: "#f1f5f9", marginBottom: "6px" }}>
                    Password Diperbarui!
                  </p>
                  <p style={{ fontSize: "14px", color: "#475569" }}>Mengarahkan ke halaman Login…</p>
                </div>
              </div>
            ) : (
              <>
                <div className="form-eyebrow">
                  <Lock size={10} />
                  Pemulihan Kata Sandi
                </div>

                <h2 className="form-title">Lupa Password?</h2>
                <p className="form-sub">Masukkan Email dan NIK yang terdaftar untuk membuat password baru.</p>

                {/* Email */}
                <div className="field">
                  <label>Alamat Email Terdaftar</label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input className="field-input" type="email" placeholder="nama@email.com"
                      value={email} onChange={e => { setEmail(e.target.value); setStage(STAGES.IDLE); }}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                  </div>
                </div>

                {/* NIK */}
                <div className="field">
                  <label>NIK (16 Digit)</label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                      <path d="M8 14h.01"/>
                      <path d="M12 14h.01"/>
                      <path d="M16 14h.01"/>
                      <path d="M8 18h.01"/>
                      <path d="M12 18h.01"/>
                      <path d="M16 18h.01"/>
                    </svg>
                    <input className="field-input" type="text" placeholder="16 Digit NIK Anda" maxLength="16"
                      value={nik} onChange={e => { setNik(e.target.value.replace(/[^0-9]/g, '')); setStage(STAGES.IDLE); }}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                  </div>
                </div>

                {/* New Password */}
                <div className="field">
                  <label>Password Baru</label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input className="field-input" type={showPass ? "text" : "password"}
                      placeholder="Minimal 8 karakter" style={{ paddingRight: "42px" }}
                      value={password} onChange={e => { setPassword(e.target.value); setStage(STAGES.IDLE); }}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    <button className="eye-btn" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="field">
                  <label>Konfirmasi Password Baru</label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input className="field-input" type={showPassConf ? "text" : "password"}
                      placeholder="Ketik ulang password baru" style={{ paddingRight: "42px" }}
                      value={passwordConfirmation} onChange={e => { setPasswordConfirmation(e.target.value); setStage(STAGES.IDLE); }}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    <button className="eye-btn" onClick={() => setShowPassConf(!showPassConf)}>
                      {showPassConf ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {stage === STAGES.ERROR && errMsg && (
                  <div className="error-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {errMsg}
                  </div>
                )}

                {/* CTA */}
                <button className="cta-btn" disabled={isLoading} onClick={handleSubmit}
                  style={{
                    background: isLoading
                      ? "rgba(99,102,241,.45)"
                      : "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                    color: "white",
                    boxShadow: isLoading ? "none" : "0 8px 28px rgba(99,102,241,.35)",
                  }}>
                  {isLoading ? (
                    <>
                      <svg style={{ animation: "spin .75s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                      Memproses…
                    </>
                  ) : (
                    <> Reset Password <ArrowRight size={15} /> </>
                  )}
                </button>


                <div className="form-footer">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/login');
                    }}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#818cf8', cursor: 'pointer', fontWeight: 500 }}
                  >
                    &lsaquo; Kembali ke Login
                  </button>
                </div>

              </>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
