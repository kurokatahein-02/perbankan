import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  Settings2, 
  Eye, 
  EyeOff, 
  Copy, 
  ShieldAlert,
  Snowflake,
  Wifi
} from 'lucide-react';
import api from '../utils/api';

export default function Cards() {
  const [userData, setUserData] = useState(null);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Modals state
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitAmount, setLimitAmount] = useState('');

  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/user');
      setUserData(response.data.user);
      setIsFrozen(response.data.user.is_frozen === 1 || response.data.user.is_frozen === true);
      setLimitAmount(response.data.user.transaction_limit || 5000000);
    } catch (error) {
      console.error("Gagal mengambil data profil", error);
    }
  };

  const toggleFreeze = async () => {
    try {
      const newState = !isFrozen;
      setIsFrozen(newState);
      await api.put('/card/freeze', { is_frozen: newState });
    } catch (e) {
      setIsFrozen(isFrozen); // revert on error
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    try {
      await api.put('/card/pin', { old_pin: oldPin, new_pin: newPin });
      setStatusMsg('PIN berhasil diubah');
      setTimeout(() => { setShowPinModal(false); setStatusMsg(''); setOldPin(''); setNewPin(''); }, 1500);
    } catch (e) {
      setStatusMsg(e.response?.data?.message || 'Gagal mengubah PIN');
    }
  };

  const handleUpdateLimit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/card/limit', { transaction_limit: limitAmount });
      setStatusMsg('Batas transaksi berhasil diubah');
      setTimeout(() => { setShowLimitModal(false); setStatusMsg(''); }, 1500);
    } catch (e) {
      setStatusMsg('Gagal mengubah batas');
    }
  };

  const cardNumber = userData?.nomor_kartu || 'XXXX XXXX XXXX XXXX';
  const maskedCardNumber = "**** **** **** " + cardNumber.slice(-4);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 p-6 font-sans selection:bg-indigo-500/30">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="p-2 bg-[#161b2d] rounded-full border border-slate-800 hover:bg-[#1e243b] transition-colors text-slate-300"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-slate-100">Manajemen Kartu</h1>
          </div>
        </header>

        {/* Visual Kartu */}
        <section className="relative">
          {/* Efek Glow di belakang kartu */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/20 blur-[100px] rounded-full z-0 pointer-events-none"></div>
          
          <div className={`relative z-10 w-full max-w-sm mx-auto aspect-[1.586/1] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-500 ${isFrozen ? 'opacity-80 grayscale-[30%] border-blue-400/50' : 'hover:scale-[1.02]'}`}>
            
            {/* Hiasan background kartu */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl"></div>

            {isFrozen && (
              <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-blue-200">
                <Snowflake size={48} className="mb-2 opacity-80" />
                <span className="font-bold tracking-widest uppercase text-sm">Kartu Dibekukan</span>
              </div>
            )}

            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-2 text-white">
                <div className="w-10 h-7 bg-white/20 rounded-md backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <div className="w-6 h-4 bg-yellow-400/40 rounded-[3px] border border-yellow-400/50"></div>
                </div>
                <Wifi className="w-5 h-5 text-white/70 transform rotate-90" />
              </div>
              
              <div className="opacity-80">
                <svg width="48" height="30" viewBox="0 0 40 24">
                  <circle cx="12" cy="12" r="12" fill="#ff5f00" fillOpacity="0.8"/>
                  <circle cx="28" cy="12" r="12" fill="#ffb900" fillOpacity="0.8"/>
                </svg>
              </div>
            </div>

            <div className="relative z-10 mt-auto">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[22px] tracking-[0.15em] font-mono text-white/90 drop-shadow-md">
                  {showCardNumber ? cardNumber : maskedCardNumber}
                </p>
                <button 
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="p-1.5 text-white/50 hover:text-white transition-colors"
                  title="Lihat Nomor Kartu"
                >
                  {showCardNumber ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1 font-semibold">Card Holder</p>
                  <p className="text-sm font-medium text-white/90 tracking-wide">{userData?.fullname || 'Budi Santoso'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1 font-semibold">Expires</p>
                  <p className="text-sm font-medium text-white/90">12/28</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Copy Number) */}
          <div className="flex justify-center mt-6">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 bg-[#161b2d] border border-[#232942] hover:bg-[#1e243b] px-4 py-2 rounded-full text-sm text-slate-300 font-medium transition-colors"
            >
              {copied ? <span className="text-emerald-400 flex items-center gap-2"><CreditCard size={16}/>Tersalin!</span> : <><Copy size={16}/> Salin Nomor Kartu</>}
            </button>
          </div>
        </section>

        {/* Menu Pengaturan Kartu */}
        <section className="bg-[#161b2d] rounded-3xl border border-[#232942] shadow-xl overflow-hidden mt-8">
          <div className="p-6 border-b border-[#232942]">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Pengaturan Kartu</h2>
          </div>
          <div className="divide-y divide-[#232942]">
            
            {/* Freeze Card Option */}
            <div className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${isFrozen ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                  <Snowflake size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-200">Bekukan Kartu</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Kunci kartu sementara dari transaksi</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isFrozen}
                  onChange={toggleFreeze}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Change PIN Option */}
            <div onClick={() => setShowPinModal(true)} className="p-5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-800 text-slate-400 rounded-xl group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-200">Ubah PIN Kartu</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Perbarui PIN ATM/Kartu Debit Anda</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-slate-500 rotate-180" />
            </div>

            {/* Limits Option */}
            <div onClick={() => setShowLimitModal(true)} className="p-5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-slate-800 text-slate-400 rounded-xl group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                  <Settings2 size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-slate-200">Batas Transaksi</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Atur limit harian dan penarikan tunai</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-slate-500 rotate-180" />
            </div>

          </div>
        </section>

      </div>

      {/* PIN Change Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b2d] border border-[#232942] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6">
            <h2 className="text-lg font-bold text-white mb-4">Ubah PIN Kartu</h2>
            <form onSubmit={handleChangePin} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">PIN Lama</label>
                <input type="password" value={oldPin} onChange={e => setOldPin(e.target.value)} maxLength={6} className="w-full bg-[#0a0f1d] border border-[#232942] rounded-xl p-3 text-white text-center tracking-[0.5em] text-lg" required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">PIN Baru (6 Angka)</label>
                <input type="password" value={newPin} onChange={e => setNewPin(e.target.value)} maxLength={6} className="w-full bg-[#0a0f1d] border border-[#232942] rounded-xl p-3 text-white text-center tracking-[0.5em] text-lg" required />
              </div>
              {statusMsg && <p className="text-indigo-400 text-xs text-center">{statusMsg}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowPinModal(false); setStatusMsg(''); }} className="flex-1 py-3 bg-[#1e243b] text-white rounded-xl font-medium">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b2d] border border-[#232942] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6">
            <h2 className="text-lg font-bold text-white mb-4">Batas Transaksi Harian</h2>
            <form onSubmit={handleUpdateLimit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Maksimal Transaksi (Rp)</label>
                <input type="number" value={limitAmount} onChange={e => setLimitAmount(e.target.value)} className="w-full bg-[#0a0f1d] border border-[#232942] rounded-xl p-3 text-white" min={1000} required />
              </div>
              {statusMsg && <p className="text-indigo-400 text-xs text-center">{statusMsg}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowLimitModal(false); setStatusMsg(''); }} className="flex-1 py-3 bg-[#1e243b] text-white rounded-xl font-medium">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
