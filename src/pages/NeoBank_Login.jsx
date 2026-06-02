import { useState, useEffect } from "react";
import { Wallet, Eye, EyeOff, ArrowRight, Shield, Fingerprint, ChevronRight, TrendingUp, Lock, Zap } from "lucide-react";

const STAGES = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" };

export default function LoginPage({ onLogin, onNavigateRegister }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [stage, setStage]       = useState(STAGES.IDLE);
  const [errMsg, setErrMsg]     = useState("");
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleSubmit = () => {
    setErrMsg(""); 
    setStage(STAGES.LOADING);
    
    // Simulasi loading sebentar lalu masuk
    setTimeout(() => {
      setStage(STAGES.SUCCESS);
      setTimeout(() => {
        if (onLogin) onLogin();
      }, 800);
    }, 1200);
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
          width: 480px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(6,8,24,0.95);
          border-left: 1px solid rgba(255,255,255,0.05);
          padding: 48px 56px;
          position: relative; z-index: 10;
          animation: fade-in .4s ease both;
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

        .row-opts {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
          animation: fade-up .45s ease .2s both;
        }
        .check-row { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .check-box {
          width: 17px; height: 17px; border-radius: 5px;
          border: 1.5px solid rgba(255,255,255,.12);
          background: transparent; display: flex; align-items: center; justify-content: center;
          transition: background .15s, border-color .15s; flex-shrink: 0;
        }
        .check-box.on { background: #6366f1; border-color: #6366f1; }
        .check-label { font-size: 13px; color: #475569; }
        .forgot { font-size: 12px; color: #6366f1; text-decoration: none; transition: color .15s; }
        .forgot:hover { color: #a5b4fc; }

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

        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0;
          animation: fade-up .45s ease .25s both;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.05); }
        .divider-text { font-size: 12px; color: #1e293b; white-space: nowrap; }

        .social-row { display: flex; gap: 10px; animation: fade-up .45s ease .27s both; }
        .social-btn {
          flex: 1; padding: 11px;
          background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07);
          border-radius: 11px; color: #64748b; font-size: 13px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: background .2s, border-color .2s, color .2s;
        }
        .social-btn:hover { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.13); color: #94a3b8; }

        .form-footer {
          margin-top: 28px; text-align: center; font-size: 13px; color: #334155;
          animation: fade-up .45s ease .3s both;
        }
        .form-footer a { color: #818cf8; text-decoration: none; font-weight: 500; transition: color .15s; }
        .form-footer a:hover { color: #a5b4fc; }

        .trust-row {
          display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;
          margin-top: 32px;
          animation: fade-up .45s ease .35s both;
        }
        .trust-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #1e293b; }

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
              <h1>Kelola Uang<br /><span>Lebih Cerdas</span><br />Setiap Hari</h1>
              <p>Platform perbankan digital generasi berikutnya. Transfer, investasi, dan pantau keuangan kamu dalam satu dashboard.</p>
            </div>

            {/* Stats */}
            <div className="stat-grid">
              {[
                { label: "Pengguna Aktif", value: "2.4M+", delta: "↑ 18% bulan ini" },
                { label: "Transaksi / Hari", value: "850K", delta: "↑ 24% bulan ini" },
                { label: "Saldo Dikelola", value: "Rp 92T", delta: "↑ 31% YoY" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-delta">{s.delta}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating card */}
          <div className="left-content" style={{ marginTop: "auto", paddingTop: "40px" }}>
            <div className="float-card">
              <div className="float-card-chip" />
              <div className="float-card-num">**** **** **** 3842</div>
              <div className="float-card-footer">
                <div className="float-card-holder">
                  <span>Card Holder</span>
                  Budi Santoso
                </div>
                <div className="mc-circles">
                  <div className="mc-c" />
                  <div className="mc-c" />
                </div>
              </div>
            </div>
          </div>

          {/* Ticker */}
          <div className="ticker-wrap" style={{ marginTop: "24px" }}>
            <div className="ticker-inner">
              {[
                "Transfer Instan 24/7","Bebas Biaya Admin","QRIS Terintegrasi",
                "Investasi Reksa Dana","Asuransi Digital","Kartu Virtual Gratis",
                "Transfer Instan 24/7","Bebas Biaya Admin","QRIS Terintegrasi",
                "Investasi Reksa Dana","Asuransi Digital","Kartu Virtual Gratis",
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
                    Login Berhasil!
                  </p>
                  <p style={{ fontSize: "14px", color: "#475569" }}>Mengarahkan ke dashboard kamu…</p>
                </div>
              </div>
            ) : (
              <>
                <div className="form-eyebrow">
                  <Shield size={10} />
                  Aman & Terenkripsi SSL
                </div>

                <h2 className="form-title">Masuk ke Akun</h2>
                <p className="form-sub">Halo! Masukkan kredensial kamu untuk melanjutkan.</p>

                {/* Email */}
                <div className="field">
                  <label>Alamat Email</label>
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

                {/* Password */}
                <div className="field">
                  <label>Password</label>
                  <div className="input-wrap">
                    <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <input className="field-input" type={showPass ? "text" : "password"}
                      placeholder="••••••••" style={{ paddingRight: "42px" }}
                      value={password} onChange={e => { setPassword(e.target.value); setStage(STAGES.IDLE); }}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()} />
                    <button className="eye-btn" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Options row */}
                <div className="row-opts">
                  <div className="check-row" onClick={() => setRemember(!remember)}>
                    <div className={`check-box ${remember ? "on" : ""}`}>
                      {remember && <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6 L5 9 L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>}
                    </div>
                    <span className="check-label">Ingat saya</span>
                  </div>
                  <a href="#" className="forgot">Lupa password?</a>
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
                      Memverifikasi…
                    </>
                  ) : (
                    <> Masuk ke NeoBank <ArrowRight size={15} /> </>
                  )}
                </button>

                {/* Divider */}
                <div className="divider">
                  <div className="divider-line" />
                  <span className="divider-text">atau masuk dengan</span>
                  <div className="divider-line" />
                </div>

                {/* Social */}
                <div className="social-row">
                  <button className="social-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>
                  <button className="social-btn">
                    <Fingerprint size={15} style={{ color: "#818cf8" }} />
                    Biometrik
                  </button>
                </div>

                {/* Footer */}
                <div className="form-footer">
                  Belum punya akun?{" "}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (onNavigateRegister) onNavigateRegister();
                    }}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#818cf8', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Daftar Sekarang &rsaquo;
                  </button>
                </div>

                {/* Trust badges */}
                <div className="trust-row">
                  {[["🏦","Terdaftar OJK"],["🔒","SSL 256-bit"],["🛡️","Jaminan LPS"]].map(([ic, tx]) => (
                    <div key={tx} className="trust-item">
                      <span>{ic}</span>{tx}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
