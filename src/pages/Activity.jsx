import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowDownLeft, 
  ArrowUpRight,
  ArrowLeft,
  Settings,
  X,
  CheckCircle2,
  Download
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { useRef } from 'react';
import ExpenseChart from '../components/ExpenseChart';
import api from '../utils/api';

export default function Activity() {
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const [userData, setUserData] = useState(null);
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

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/transactions');
        setTransactions(response.data.transactions);
        
        // Aggregate logic for the last 6 months
        const last6Months = Array.from({length: 6}, (_, i) => {
          const d = new Date();
          d.setDate(1); // Fix JS date rollover bug (e.g. Mar 31 -> Feb 28/Mar 3)
          d.setMonth(new Date().getMonth() - i);
          return {
            monthLabel: d.toLocaleString('id-ID', { month: 'short' }),
            monthIndex: d.getMonth(),
            year: d.getFullYear(),
            in: 0,
            out: 0
          };
        }).reverse();
        
        response.data.transactions.forEach(t => {
          const tDate = new Date(t.created_at);
          const stat = last6Months.find(s => s.monthIndex === tDate.getMonth() && s.year === tDate.getFullYear());
          if (stat) {
            if (t.type === 'in') stat.in += Number(t.amount) || 0;
            else stat.out += Number(t.amount) || 0;
          }
        });
        
        setMonthlyStats(last6Months);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, []);

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value).replace('Rp', 'Rp '); // Menambahkan spasi setelah Rp agar mirip desain
  };

  const maxChartValue = Math.max(...monthlyStats.flatMap(m => [m.in, m.out]), 1);
  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'in') return t.type === 'in';
    if (filter === 'out') return t.type === 'out';
    if (filter === 'topup') return t.category === 'topup';
    if (filter === 'pembayaran') return t.category === 'pembayaran';
    return true;
  });

  return (
    // Background utama menggunakan warna gelap kebiruan mirip screenshot
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="p-2 bg-[#161b2d] rounded-full border border-slate-800 hover:bg-[#1e243b] transition-colors text-slate-300"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-slate-100">Riwayat Aktivitas</h1>
          </div>
          {/* Ikon Pengaturan di Kanan */}
          <Link to="/settings" className="p-2 bg-[#161b2d] rounded-full text-slate-400 hover:text-slate-200 hover:bg-[#1e243b] transition-colors border border-transparent hover:border-[#232942]">
            <Settings size={20} />
          </Link>
        </header>

        {/* Chart Section - Menyesuaikan warna panel */}
        <section className="bg-[#161b2d] p-6 rounded-3xl border border-[#232942] shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Grafik Arus Kas</h2>
              <p className="text-xs text-slate-400 mt-1">Statistik pemasukan & pengeluaran 6 bulan terakhir</p>
            </div>
            
            <div className="flex gap-4 text-xs font-medium text-slate-400 bg-[#0a0f1d] px-4 py-2 rounded-xl border border-[#232942]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Pemasukan
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Pengeluaran
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 pt-4 pb-2 mt-4 relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 z-0">
                <div className="border-b border-[#232942] opacity-50 w-full h-0"></div>
                <div className="border-b border-[#232942] opacity-50 w-full h-0"></div>
                <div className="border-b border-[#232942] opacity-50 w-full h-0"></div>
                <div className="border-b border-[#232942] opacity-50 w-full h-0"></div>
            </div>

            {monthlyStats.map((stat, index) => {
              const inHeight = maxChartValue > 0 ? (stat.in / maxChartValue) * 100 : 0;
              const outHeight = maxChartValue > 0 ? (stat.out / maxChartValue) * 100 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 group relative z-10">
                  {/* Explicit Height Container for bars */}
                  <div className="w-full h-48 flex justify-center gap-1.5 md:gap-3 items-end group-hover:bg-white/[0.02] rounded-t-xl transition-colors pb-1">
                    
                    {/* In Bar */}
                    <div className="relative w-full max-w-[20px] h-full flex items-end">
                      <div 
                        style={{ height: `${Math.max(inHeight, 0)}%` }} 
                        className={`w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-700 hover:brightness-125 ${inHeight > 0 ? 'min-h-[4px]' : ''}`}
                      ></div>
                    </div>

                    {/* Out Bar */}
                    <div className="relative w-full max-w-[20px] h-full flex items-end">
                      <div 
                        style={{ height: `${Math.max(outHeight, 0)}%` }} 
                        className={`w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-700 hover:brightness-125 ${outHeight > 0 ? 'min-h-[4px]' : ''}`}
                      ></div>
                    </div>

                  </div>
                  
                  {/* Month Label */}
                  <div className="mt-3 pb-2 text-[11px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-wider">
                    {stat.monthLabel}
                  </div>
                  
                  {/* Tooltip Hover */}
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#0a0f1d] border border-[#232942] text-slate-200 text-xs p-3 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-2xl scale-95 group-hover:scale-100">
                    <div className="font-semibold text-slate-400 mb-2 border-b border-[#232942] pb-2">{stat.monthLabel} {stat.year}</div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-slate-400">Pemasukan</span>
                        <span className="text-emerald-400 font-bold">+{formatIDR(stat.in)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-6">
                        <span className="text-slate-400">Pengeluaran</span>
                        <span className="text-rose-400 font-bold">-{formatIDR(stat.out)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* History Section */}
        <section className="bg-[#161b2d] rounded-2xl border border-[#232942] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-[#232942]">
            <h2 className="text-sm font-semibold text-slate-200">Aktivitas Terakhir</h2>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 bg-[#0a0f1d] p-1.5 rounded-xl border border-[#232942]">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'in', label: 'Pemasukan' },
                { id: 'out', label: 'Pengeluaran' },
                { id: 'topup', label: 'Top Up' },
                { id: 'pembayaran', label: 'Pembayaran' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    filter === f.id 
                      ? 'bg-[#1e243b] text-indigo-400 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-[#161b2d]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Transaksi */}
          <div className="px-6 pb-2">
            {filteredTransactions.length > 0 ? (
              <div className="divide-y divide-[#232942]">
                {filteredTransactions.map((trx) => {
                  const dateStr = new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={trx.id} onClick={() => setSelectedTx(trx)} className="py-4 hover:bg-[#1a2035] -mx-6 px-6 flex items-center justify-between transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        {/* Ikon Arrow: Diadaptasi langsung dari gambar */}
                        <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                          trx.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {trx.type === 'in' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} strokeWidth={2.5} />}
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-sm text-slate-200">{trx.title}</h3>
                          <p className="text-[11px] text-slate-500 mt-1">{dateStr}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-semibold tracking-wide ${
                          trx.type === 'in' ? 'text-emerald-400' : 'text-slate-200'
                        }`}>
                          {trx.type === 'in' ? '+' : '-'}{formatIDR(trx.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">
                <p>Belum ada transaksi di kategori ini.</p>
              </div>
            )}
          </div>
          
          {/* Tombol Lihat Semua (Opsional, disamakan dengan desain) */}
          <button className="w-full p-4 text-xs font-medium text-indigo-400 hover:bg-[#1a2035] transition-colors border-t border-[#232942]">
            Muat Lebih Banyak
          </button>
        </section>

        {/* Expense Chart */}
        <ExpenseChart className="bg-[#161b2d] border-[#232942]" />
        
      </div>

      {selectedTx && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b2d] border border-[#232942] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 animate-in zoom-in-95 duration-200">
             <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-[#1e243b] rounded-xl transition-colors z-50">
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
                <button onClick={downloadReceipt} className="bg-[#1e243b] hover:bg-[#2a314d] text-slate-200 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-bold">
                    <Download size={18} /> Simpan Struk
                </button>
                <button onClick={() => setSelectedTx(null)} className="bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">
                    Tutup
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}