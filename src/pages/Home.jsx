import React, { useState, useEffect } from 'react';
import {
  Search, Menu, Home, CreditCard, ArrowRightLeft, Clock,
  Settings, LogOut, Wallet, ArrowUpRight, ArrowDownLeft,
  QrCode, Smartphone, X, CheckCircle2, Download
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import QRISModal from './QRISModal';
import TopUp from './TopUp';
import TransferModal from './TransferModal';
import { PembayaranModal } from './SaldoDanPembayaran';
import ExpenseChart from '../components/ExpenseChart';
import api from '../utils/api';

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showQRIS, setShowQRIS]           = useState(false);
  const [showTopUp, setShowTopUp]         = useState(false);
  const [showTransfer, setShowTransfer]   = useState(false);
  const [showPembayaran, setShowPembayaran] = useState(false);
  const [transferTarget, setTransferTarget] = useState(null);
  const [selectedTx, setSelectedTx]       = useState(null);
  const [userData, setUserData] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const receiptRef = useRef(null);

  const downloadReceipt = () => {
    if (receiptRef.current === null) return;
    toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `Struk-${selectedTx.title}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.log(err));
  };

  const fetchData = async () => {
    try {
      const userRes = await api.get('/user');
      setUserData(userRes.data.user);
      
      const txRes = await api.get('/transactions');
      setRecentTx(txRes.data.transactions.slice(0, 4));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val).replace('Rp', 'Rp ');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans relative overflow-hidden selection:bg-indigo-500/30">

      {/* Ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-purple-500/20 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[25vw] h-[25vw] rounded-full bg-emerald-500/10 blur-[100px]" />
      </div>

      {/* Modals */}
      {showQRIS && <QRISModal 
        userData={userData}
        onClose={() => setShowQRIS(false)} 
        onScanTransfer={(phone) => {
          setShowQRIS(false);
          setTransferTarget(phone);
          setShowTransfer(true);
        }}
      />}
      
      {showTopUp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative p-6">
             <button onClick={() => setShowTopUp(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors z-50">
               <X className="w-5 h-5" />
             </button>
             <TopUp onSuccess={() => { setShowTopUp(false); fetchData(); }} accountNumber={userData?.phone || '08xxxxxxxx'} />
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative p-6">
             <button onClick={() => { setShowTransfer(false); setTransferTarget(null); }} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors z-50">
               <X className="w-5 h-5" />
             </button>
             <TransferModal 
                onSuccess={() => { setShowTransfer(false); setTransferTarget(null); fetchData(); }} 
                accountNumber={userData?.phone || '08xxxxxxxx'} 
                defaultRecipientPhone={transferTarget}
             />
          </div>
        </div>
      )}

      {showPembayaran && (
        <PembayaranModal onClose={() => setShowPembayaran(false)} onSuccess={() => { setShowPembayaran(false); fetchData(); }} accountNumber={userData?.phone || '08xxxxxxxx'} />
      )}

      {selectedTx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 animate-in zoom-in-95 duration-200">
             <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors z-50">
               <X className="w-5 h-5" />
             </button>
             
             <div ref={receiptRef} className="bg-white text-slate-900 p-8 rounded-3xl relative overflow-hidden shadow-2xl mt-4">
                <div className="text-center mb-8 border-b-2 border-dashed border-slate-200 pb-6">
                  <h1 className="font-black text-3xl tracking-tighter text-indigo-900 italic">NeoBank</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Detail Transaksi</p>
                  <div className={`mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold ${selectedTx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {selectedTx.status === 'success' ? <CheckCircle2 size={14} /> : <X size={14} />} 
                    {selectedTx.status === 'success' ? 'TRANSAKSI BERHASIL' : 'TRANSAKSI GAGAL'}
                  </div>
                </div>
                
                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Nomor Rekening</span>
                      <span className="text-slate-900 font-bold">{userData?.phone || '08xxxxxxxx'}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Waktu</span>
                      <span className="text-slate-900">{new Date(selectedTx.created_at).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="h-px bg-slate-100 w-full my-2"></div>

                  <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Jenis Transaksi</span>
                      <span className={`font-bold uppercase ${selectedTx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {selectedTx.type === 'in' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">Keterangan</span>
                      <span className="text-slate-900 font-bold text-right max-w-[150px]">{selectedTx.title}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-slate-500 uppercase">No. Referensi</span>
                      <span className="text-slate-900 font-bold">{selectedTx.reference_number || '-'}</span>
                  </div>
                  
                  <div className="h-px bg-slate-100 w-full my-2"></div>

                  <div className="bg-indigo-50 p-5 rounded-2xl mt-6 border border-indigo-100">
                    <div className="flex justify-between items-center text-indigo-900">
                        <span className="font-bold text-sm">JUMLAH</span>
                        <span className="text-xl font-black">Rp {Number(selectedTx.amount).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center opacity-50">
                    <p className="text-[9px] font-mono leading-tight uppercase">
                        Simpan struk ini sebagai bukti transaksi digital yang sah.<br/>NeoBank terdaftar dan diawasi oleh OJK.
                    </p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={downloadReceipt} className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all font-bold">
                    <Download size={18} /> Simpan Struk
                </button>
                <button onClick={() => setSelectedTx(null)} className="bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">
                    Tutup
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2 text-white">
            <Wallet className="w-8 h-8 text-indigo-400" />
            <span className="text-xl font-bold tracking-wide">NeoBank</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {[
            { icon: Home, label: 'Dashboard', active: true, path: '/' },
            { icon: ArrowRightLeft, label: 'Transfer', path: '#', onClick: (e) => { e.preventDefault(); setShowTransfer(true); setIsSidebarOpen(false); } },
            { icon: CreditCard, label: 'Kartu', path: '/cards' },
            { icon: Clock, label: 'Aktivitas', path: '/activity' },
            { icon: Settings, label: 'Pengaturan', path: '/settings' },
          ].map(({ icon: Icon, label, active, path, onClick }) => (
            <Link key={label} to={path} onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${active ? 'text-white bg-white/10 border border-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <Icon className={`w-5 h-5 ${active ? 'text-indigo-400' : ''}`} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-16 bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-300 hover:text-white hover:bg-white/10 lg:hidden rounded-lg transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-white hidden sm:block tracking-wide">Selamat Datang, {userData?.fullname?.split(' ')[0] || 'Budi'}!</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Cari transaksi..." className="pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all" />
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold cursor-pointer shadow-lg border border-white/20">{userData?.fullname?.charAt(0).toUpperCase() || 'B'}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Balance + Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600/40 to-blue-600/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="relative z-10">
                  <p className="text-indigo-200 font-medium mb-2 flex items-center gap-2"><Wallet className="w-4 h-4" /> Total Saldo Aktif</p>
                  <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">{userData ? formatRp(userData.balance) : 'Rp 0'}</h2>
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between group transition-all duration-300 hover:bg-white/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-white">Kartu Saya</h3>
                  <Link to="/cards" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">Lihat Semua</Link>
                </div>
                <Link to="/cards" className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl p-5 text-white relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 block cursor-pointer">
                  <div className="absolute top-0 right-0 p-4 opacity-70">
                    <svg width="40" height="24" viewBox="0 0 40 24"><circle cx="12" cy="12" r="12" fill="#ff5f00" fillOpacity="0.8"/><circle cx="28" cy="12" r="12" fill="#ffb900" fillOpacity="0.8"/></svg>
                  </div>
                  <div className="w-8 h-6 bg-white/20 rounded-md mb-6" />
                  <p className="text-sm tracking-[0.2em] mb-4 text-slate-200 font-mono">**** **** **** 3842</p>
                  <div className="flex justify-between items-end">
                    <div><p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Card Holder</p><p className="text-sm font-medium">{userData?.fullname || 'Budi Santoso'}</p></div>
                    <div><p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Expires</p><p className="text-sm font-medium">12/28</p></div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Layanan Cepat</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: ArrowRightLeft, label: 'Transfer',    color: 'text-blue-400',   bg: 'bg-blue-500/10',   onClick: () => setShowTransfer(true) },
                  { icon: CreditCard,    label: 'Pembayaran',  color: 'text-emerald-400', bg: 'bg-emerald-500/10', onClick: () => setShowPembayaran(true) },
                  { icon: QrCode,        label: 'QRIS',         color: 'text-purple-400', bg: 'bg-purple-500/10', onClick: () => setShowQRIS(true) },
                  { icon: Smartphone,    label: 'Top Up',       color: 'text-orange-400', bg: 'bg-orange-500/10', onClick: () => setShowTopUp(true) },
                ].map((action, i) => (
                  <button key={i} onClick={action.onClick}
                    className={`bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-3 hover:bg-white/10 transition-all duration-300 group ${action.label === 'QRIS' ? 'ring-1 ring-purple-500/30 hover:ring-purple-500/50' : ''}`}>
                    <div className={`p-3 rounded-xl ${action.bg} border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-lg font-semibold text-white">Aktivitas Terakhir</h3>
                <Link to="/activity" className="text-indigo-400 text-sm font-medium hover:text-indigo-300">Lihat Semua</Link>
              </div>
              <div className="divide-y divide-white/5">
                {recentTx.length > 0 ? recentTx.map((tx, i) => {
                  const isOut = tx.type === 'out';
                  const Icon = isOut ? ArrowUpRight : ArrowDownLeft;
                  const iconColor = isOut ? 'text-red-400' : 'text-emerald-400';
                  const iconBg = isOut ? 'bg-red-500/10' : 'bg-emerald-500/10';
                  const sign = isOut ? '-' : '+';
                  const date = new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={i} onClick={() => setSelectedTx(tx)} className="p-4 sm:p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${iconBg} border border-white/5 group-hover:scale-105 transition-transform`}>
                          <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 group-hover:text-white">{tx.title}</p>
                          <p className="text-sm text-slate-400">{date}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${!isOut ? 'text-emerald-400' : 'text-slate-200'}`}>{sign}{formatRp(tx.amount)}</div>
                    </div>
                  );
                }) : (
                  <div className="p-6 text-center text-slate-400 text-sm">Belum ada transaksi.</div>
                )}
              </div>
            </div>

            {/* Expense Chart */}
            <ExpenseChart className="bg-white/5 border-white/10" />

          </div>
        </div>
      </main>
    </div>
  );
}
