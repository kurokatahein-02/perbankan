import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  LogOut, 
  User, 
  Mail, 
  Phone,
  Shield,
  Bell,
  CreditCard
} from 'lucide-react';
import api from '../utils/api';

export default function Settings() {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user');
        setUserData(response.data.user);
      } catch (error) {
        console.error("Gagal mengambil data profil", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch(e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex items-center gap-4 mb-8">
          <Link 
            to="/" 
            className="p-2 bg-[#161b2d] rounded-full border border-slate-800 hover:bg-[#1e243b] transition-colors text-slate-300"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold text-slate-100">Pengaturan</h1>
        </header>

        {/* Profil Section */}
        <section className="bg-[#161b2d] p-6 rounded-3xl border border-[#232942] shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg border border-white/20">
              {userData?.fullname?.charAt(0).toUpperCase() || 'B'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-1">{userData?.fullname || 'Budi Santoso'}</h2>
              <p className="text-indigo-400 font-mono text-sm">@{userData?.username || 'user'}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 relative z-10">
            <div className="flex items-center gap-4 bg-[#0a0f1d]/50 p-4 rounded-2xl border border-[#232942]">
              <Mail className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Email</p>
                <p className="text-slate-200 text-sm">{userData?.email || 'email@example.com'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[#0a0f1d]/50 p-4 rounded-2xl border border-[#232942]">
              <Phone className="text-slate-400" size={20} />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Nomor Handphone</p>
                <p className="text-slate-200 text-sm">{userData?.phone || '08xxxxxxxxxx'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Lainnya */}
        {/*
        <section className="bg-[#161b2d] rounded-3xl border border-[#232942] shadow-xl overflow-hidden">
          <div className="divide-y divide-[#232942]">
            {[
              { icon: Shield, label: 'Keamanan Akun & PIN' },
              { icon: CreditCard, label: 'Pengaturan Kartu' },
              { icon: Bell, label: 'Notifikasi' }
            ].map((menu, i) => (
              <div key={i} className="p-5 flex items-center gap-4 hover:bg-white/[0.02] cursor-pointer transition-colors">
                <div className="p-2.5 bg-[#1e243b] text-indigo-400 rounded-xl">
                  <menu.icon size={18} />
                </div>
                <span className="font-medium text-slate-200">{menu.label}</span>
              </div>
            ))}
          </div>
        </section>
        */}

        {/* Logout Section */}
        <section className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg"
          >
            <LogOut size={20} />
            Keluar dari Akun
          </button>
        </section>

      </div>
    </div>
  );
}
