import React, { useState } from 'react';
import { Wallet, Eye, EyeOff, Zap, Droplet, Wifi, Smartphone, CheckCircle, X } from 'lucide-react';

// ── SUB-KOMPONEN 1: FITUR CEK SALDO ──────────────────────────────────────────
export function CekSaldo() {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <div className="bg-gradient-to-br from-indigo-600/40 to-blue-600/40 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-indigo-200 font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Total Saldo Aktif
            </p>
            {/* Tombol Toggle Show/Hide Saldo */}
            <button 
              onClick={() => setShowBalance(!showBalance)} 
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-indigo-200 hover:text-white"
              title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
            >
              {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white transition-all">
            {showBalance ? "Rp 45.250.000" : "••••••••••••"}
          </h2>
        </div>

        {/* Informasi Rincian Jenis Rekening Tambahan */}
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 mt-6">
          <div>
            <p className="text-xs text-indigo-200 uppercase tracking-wider">Rekening Tabungan</p>
            <p className="text-sm font-semibold mt-1">{showBalance ? "Rp 35.000.000" : "••••••••"}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-200 uppercase tracking-wider">Deposito / Investasi</p>
            <p className="text-sm font-semibold mt-1">{showBalance ? "Rp 10.250.000" : "••••••••"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SUB-KOMPONEN 2: MODAL FITUR PEMBAYARAN ───────────────────────────────────
export function PembayaranModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: Input Data, 2: Konfirmasi, 3: Sukses
  const [layanan, setLayanan] = useState('pln');
  const [nomorPelanggan, setNomorPelanggan] = useState('');
  const [nominal, setNominal] = useState('100000'); // Khusus pulsa

  const daftarLayanan = [
    { id: 'pln', label: 'Listrik PLN', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 'pdam', label: 'Air PDAM', icon: Droplet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'internet', label: 'Internet / TV', icon: Wifi, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 'pulsa', label: 'Pulsa / Data', icon: Smartphone, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  const handleNext = (e) => {
    e.preventDefault();
    if (!nomorPelanggan) return alert('Mohon masukkan nomor pelanggan / HP');
    setStep(2);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-lg font-semibold text-white">Menu Pembayaran</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Modal */}
        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              {/* Pilih Jenis Layanan */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">Pilih Layanan</label>
                <div className="grid grid-cols-2 gap-3">
                  {daftarLayanan.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button type="button" key={item.id} onClick={() => { setLayanan(item.id); setNomorPelanggan(''); }}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${layanan === item.id ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
                        <div className={`p-2 rounded-lg ${item.bg}`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Input Nomor Pelanggan */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                  {layanan === 'pulsa' ? 'Nomor Handphone' : 'Nomor Pelanggan / ID'}
                </label>
                <input type="number" required placeholder={layanan === 'pulsa' ? 'Contoh: 081234567890' : 'Contoh: 53210987654'} value={nomorPelanggan} onChange={(e) => setNomorPelanggan(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm" />
              </div>

              {/* Pilihan Nominal Khusus Pulsa */}
              {layanan === 'pulsa' && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Pilih Nominal</label>
                  <select value={nominal} onChange={(e) => setNominal(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm">
                    <option value="25000">Rp 25.000</option>
                    <option value="50000">Rp 50.000</option>
                    <option value="100000">Rp 100.000</option>
                    <option value="200000">Rp 200.000</option>
                  </select>
                </div>
              )}

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all text-sm">
                Cek Tagihan
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 font-sans text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Jenis Layanan</span><span className="text-white font-medium capitalize">{layanan}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">No. Pelanggan / HP</span><span className="text-white font-mono">{nomorPelanggan}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Nama Pelanggan</span><span className="text-white font-medium">BUDI SANTOSO</span></div>
                <hr className="border-white/10" />
                <div className="flex justify-between items-center"><span className="text-slate-400">Total Tagihan</span><span className="text-xl font-bold text-emerald-400">{layanan === 'pulsa' ? `Rp ${parseInt(nominal).toLocaleString('id-ID')}` : 'Rp 350.000'}</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStep(1)} className="border border-white/10 hover:bg-white/5 text-slate-300 py-3 rounded-xl font-medium transition-all text-sm">
                  Kembali
                </button>
                <button onClick={() => setStep(3)} className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-medium shadow-lg shadow-emerald-600/20 transition-all text-sm">
                  Konfirmasi & Bayar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-white">Pembayaran Sukses!</h4>
              <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                Transaksi pembayaran <span className="capitalize font-medium text-slate-200">{layanan}</span> Anda telah berhasil diproses.
              </p>
              <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all text-sm">
                Selesai
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}