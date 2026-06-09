import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, Eye, EyeOff, ArrowRight, Shield, Mail, Lock, Phone, Calendar, AlertCircle, CheckCircle2, User } from "lucide-react";
import api from '../utils/api';

const STAGES = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" };
const STEPS = { ACCOUNT: 0, PERSONAL: 1, SECURITY: 2 };

function StrengthBar({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Lemah", "Cukup", "Kuat", "Sangat Kuat"];
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "2px",
            background: i < score ? colors[score - 1] : "rgba(255,255,255,0.07)",
            transition: "background .3s",
          }} />
        ))}
      </div>
      {password && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: score > 0 ? colors[score - 1] : "#475569" }}>
            {score > 0 ? labels[score - 1] : ""}
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {[[checks[0], "≥8"], [checks[1], "A-Z"], [checks[2], "0-9"], [checks[3], "!?#"]].map(([ok, t], i) => (
              <span key={i} style={{ fontSize: "10px", color: ok ? "#22c55e" : "#334155" }}>
                {ok ? "✓" : "·"} {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = (hasErr) => ({
  width: "100%", padding: "12px 14px 12px 40px",
  background: hasErr ? "rgba(239,68,68,.05)" : "rgba(255,255,255,0.03)",
  border: `1px solid ${hasErr ? "rgba(239,68,68,.35)" : "rgba(255,255,255,0.07)"}`,
  borderRadius: "11px", color: "#f1f5f9",
  fontSize: "14px", outline: "none", transition: "all .2s",
});

const IconInput = ({ icon: Icon, type = "text", placeholder, value, onChange, error, rightEl, setStage }) => (
  <div style={{ position: "relative" }}>
    <Icon size={15} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: error ? "#f87171" : "#334155" }} />
    <input
      type={type} placeholder={placeholder} value={value}
      onClick={(e) => {
        if (type === 'date' && e.target.showPicker) {
          try { e.target.showPicker(); } catch (err) {}
        }
      }}
      onChange={e => { 
        onChange(e.target.value); 
        if (setStage) setStage("idle"); 
      }}
      style={{ ...inputStyle(!!error), ...(rightEl ? { paddingRight: "40px" } : {}), colorScheme: 'dark' }}
    />
    {rightEl && <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>{rightEl}</div>}
  </div>
);

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(STEPS.ACCOUNT);
  const [stage, setStage]     = useState(STAGES.IDLE);
  const [mounted, setMounted] = useState(false);

  const [email, setEmail]         = useState("");
  const [username, setUsername]   = useState("");
  const [fullname, setFullname]   = useState("");
  const [phone, setPhone]         = useState("");
  const [dob, setDob]             = useState("");
  const [nik, setNik]             = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [pin, setPin]             = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [errors, setErrors]       = useState({});

  useEffect(() => { setMounted(true); }, []);

  const validate = () => {
    const e = {};
    if (step === STEPS.ACCOUNT) {
      if (!email.includes("@")) e.email = "Format email tidak valid";
      if (username.length < 4)  e.username = "Username minimal 4 karakter";
    }
    if (step === STEPS.PERSONAL) {
      if (fullname.trim().length < 3) e.fullname = "Nama lengkap terlalu pendek";
      if (phone.replace(/\D/g,"").length < 10) e.phone = "Nomor HP tidak valid";
      if (!dob) e.dob = "Tanggal lahir wajib diisi";
      if (nik.replace(/\D/g,"").length !== 16) e.nik = "NIK harus 16 digit";
    }
    if (step === STEPS.SECURITY) {
      if (password.length < 8) e.password = "Password minimal 8 karakter";
      if (confirm !== password) e.confirm = "Konfirmasi password tidak cocok";
      if (pin.replace(/\D/g,"").length !== 6) e.pin = "PIN harus 6 digit angka";
      if (!agreed) e.agreed = "Kamu harus menyetujui syarat & ketentuan";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) { setStage(STAGES.ERROR); return; }
    setStage(STAGES.IDLE);
    if (step < STEPS.SECURITY) { setStep(s => s + 1); return; }
    
    setStage(STAGES.LOADING);
    try {
      const payload = { email, username, fullname, phone, dob, nik, password, pin };
      const response = await api.post('/register', payload);
      setStage(STAGES.SUCCESS);
    } catch (error) {
      setStage(STAGES.ERROR);
      setErrors({ agreed: error.response?.data?.message || "Registrasi gagal, coba lagi." });
    }
  };

  const isLoading = stage === STAGES.LOADING;
  const isSuccess = stage === STAGES.SUCCESS;

  return (
    <div className="main-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .main-container { 
          min-height: 100vh; 
          background: #020817; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-family: 'DM Sans', sans-serif;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .bg-glow {
          position: absolute; width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          filter: blur(60px); z-index: 0; top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .form-card {
          width: 100%; max-width: 440px;
          background: rgba(6, 8, 24, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px; padding: 40px;
          position: relative; z-index: 1;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          animation: fadeUp 0.6s ease-out;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .logo-box { display: flex; flex-direction: column; align-items: center; margin-bottom: 30px; }
        .logo-icon { width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #818cf8); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(99,102,241,0.3); }
        .logo-text { font-family: 'Syne', sans-serif; font-weight: 800; color: #f1f5f9; font-size: 24px; }
        
        .title { font-family: 'Syne', sans-serif; font-size: 24px; color: #fff; margin-bottom: 8px; text-align: center; }
        .subtitle { font-size: 14px; color: #64748b; text-align: center; margin-bottom: 28px; line-height: 1.5; }
        
        .field-label { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 8px; font-weight: 500; }
        .field-group { margin-bottom: 18px; }
        .error-text { font-size: 11px; color: #f87171; margin-top: 6px; display: flex; align-items: center; gap: 4px; }

        .cta-btn { width: 100%; padding: 14px; border: none; border-radius: 12px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; margin-top: 10px; box-shadow: 0 4px 15px rgba(99,102,241,0.3); }
        .cta-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .cta-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .back-btn { width: 100%; padding: 12px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #64748b; font-size: 13px; cursor: pointer; margin-top: 12px; transition: all 0.2s; }
        .back-btn:hover { background: rgba(255,255,255,0.05); color: #94a3b8; }

        .pin-input { width: 100%; padding: 14px; text-align: center; font-size: 20px; letter-spacing: 0.5em; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; outline: none; }
        .check-row { display: flex; gap: 10px; cursor: pointer; margin-top: 15px; }
        .check-box { width: 18px; height: 18px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .check-box.active { background: #6366f1; border-color: #6366f1; }
      `}</style>

      <div className="bg-glow" />

      <div className="form-card" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.5s" }}>
        {isSuccess ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ width: 64, height: 64, background: "rgba(16,185,129,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyCenter: "center", margin: "0 auto 20px", border: "1px solid rgba(16,185,129,0.2)" }}>
              <CheckCircle2 color="#10b981" size={32} style={{ margin: "auto" }} />
            </div>
            <h2 className="title">Pendaftaran Berhasil!</h2>
            <p className="subtitle">Selamat datang {fullname}, akun NeoBank kamu telah siap digunakan.</p>
            <button className="cta-btn" onClick={() => navigate('/login')}>Masuk Sekarang</button>
          </div>
        ) : (
          <>
            <div className="logo-box">
              <div className="logo-icon"><Wallet color="white" size={24} /></div>
              <div className="logo-text">NeoBank</div>
            </div>

            {step === STEPS.ACCOUNT && (
              <div>
                <h2 className="title">Buat Akun</h2>
                <p className="subtitle">Mulai perjalanan finansial kamu hari ini.</p>
                <div className="field-group">
                  <span className="field-label">Email</span>
                  <IconInput icon={Mail} type="email" placeholder="email@anda.com" value={email} onChange={setEmail} error={errors.email} setStage={setStage} />
                  {errors.email && <span className="error-text"><AlertCircle size={12}/> {errors.email}</span>}
                </div>
                <div className="field-group">
                  <span className="field-label">Username</span>
                  <IconInput icon={User} placeholder="username_anda" value={username} onChange={setUsername} error={errors.username} setStage={setStage} />
                  {errors.username && <span className="error-text"><AlertCircle size={12}/> {errors.username}</span>}
                </div>
              </div>
            )}

            {step === STEPS.PERSONAL && (
              <div>
                <h2 className="title">Data Diri</h2>
                <p className="subtitle">Lengkapi data sesuai KTP untuk verifikasi.</p>
                <div className="field-group">
                  <span className="field-label">Nama Lengkap</span>
                  <IconInput icon={User} placeholder="Nama sesuai identitas" value={fullname} onChange={setFullname} error={errors.fullname} setStage={setStage} />
                  {errors.fullname && <span className="error-text"><AlertCircle size={12}/> {errors.fullname}</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="field-group">
                    <span className="field-label">No. HP</span>
                    <IconInput icon={Phone} placeholder="0812..." value={phone} onChange={setPhone} error={errors.phone} setStage={setStage} />
                  </div>
                  <div className="field-group">
                    <span className="field-label">Tgl Lahir</span>
                    <IconInput icon={Calendar} type="date" value={dob} onChange={setDob} error={errors.dob} setStage={setStage} />
                  </div>
                </div>
                <div className="field-group">
                  <span className="field-label">NIK KTP (16 Digit)</span>
                  <IconInput icon={Shield} placeholder="3201..." value={nik} onChange={v => setNik(v.replace(/\D/g,"").slice(0,16))} error={errors.nik} setStage={setStage} />
                </div>
              </div>
            )}

            {step === STEPS.SECURITY && (
              <div>
                <h2 className="title">Keamanan</h2>
                <p className="subtitle">Lindungi akun kamu dengan enkripsi kuat.</p>
                <div className="field-group">
                  <span className="field-label">Password</span>
                  <IconInput icon={Lock} type={showPass ? "text" : "password"} placeholder="Min. 8 karakter" value={password} onChange={setPassword} error={errors.password} setStage={setStage}
                    rightEl={<button onClick={()=>setShowPass(!showPass)} style={{background:"none",border:"none",color:"#475569"}}>{showPass?<EyeOff size={14}/>:<Eye size={14}/>}</button>}
                  />
                  <StrengthBar password={password} />
                </div>
                <div className="field-group">
                  <span className="field-label">Konfirmasi Password</span>
                  <IconInput icon={Lock} type={showConf ? "text" : "password"} placeholder="Ulangi password" value={confirm} onChange={setConfirm} error={errors.confirm} setStage={setStage}
                    rightEl={<button onClick={()=>setShowConf(!showConf)} style={{background:"none",border:"none",color:"#475569"}}>{showConf?<EyeOff size={14}/>:<Eye size={14}/>}</button>}
                  />
                  {errors.confirm && <span className="error-text"><AlertCircle size={12}/> {errors.confirm}</span>}
                </div>
                <div className="field-group">
                  <span className="field-label">PIN Transaksi (6 Digit)</span>
                  <input className="pin-input" type="password" maxLength={6} placeholder="••••••" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))} />
                  {errors.pin && <span className="error-text"><AlertCircle size={12}/> {errors.pin}</span>}
                </div>
                <div className="check-row" onClick={() => setAgreed(!agreed)}>
                  <div className={`check-box ${agreed ? 'active' : ''}`}>{agreed && <CheckCircle2 size={12} color="white"/>}</div>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Saya setuju dengan Syarat & Ketentuan NeoBank.</span>
                </div>
                {errors.agreed && <span className="error-text" style={{marginTop:'10px'}}><AlertCircle size={12}/> {errors.agreed}</span>}
              </div>
            )}

            <button className="cta-btn" onClick={next} disabled={isLoading}>
              {isLoading ? (
                <div style={{ width: 18, height: 18, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
              ) : (
                <> {step === STEPS.SECURITY ? "Selesaikan Pendaftaran" : "Lanjutkan"} <ArrowRight size={16} /> </>
              )}
            </button>

            {step > 0 && <button className="back-btn" onClick={() => setStep(s => s - 1)}>Kembali</button>}
            
            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#475569" }}>
              Sudah punya akun? <button 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: '#818cf8', cursor: 'pointer', fontWeight: 500 }}
              >
                Masuk
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}