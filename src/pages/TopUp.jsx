import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { 
  Smartphone, ChevronRight, CheckCircle2, Download, 
  ArrowLeft, Loader2 
} from 'lucide-react';

// MENAMBAHKAN accountNumber PADA PROPS
const TopUp = ({ onSuccess, accountNumber }) => {
  const [step, setStep] = useState(1); // 1: Phone, 2: Amount & Wallet, 3: Loading, 4: Struk
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('DANA');
  const [receiptData, setReceiptData] = useState(null);
  const receiptRef = useRef(null);

  const walletOptions = [
    { id: 'DANA', label: 'DANA' },
    { id: 'OVO', label: 'OVO' },
    { id: 'ShopeePay', label: 'Shopee' }
  ];

  const handleNext = () => {
    if (phone.length < 10) return alert("Masukkan nomor HP yang valid!");
    setStep(2);
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (amount < 20000) return alert("Minimal Top Up Rp 20.000");

    setStep(3); // Munculkan Loading

    try {
      // 1. Hitung total beserta admin
      const adminFee = 2000;
      const totalPayment = Number(amount) + adminFee;

      // 2. Tembak API Laravel
      await axios.post('http://127.0.0.1:8000/api/topup', {
        target_phone: phone,
        amount: totalPayment, 
        wallet_type: wallet
      });

      // 3. Siapkan data struk sesuai permintaan (MENGGUNAKAN PROPS accountNumber)
      setReceiptData({
        accountSource: accountNumber || 'Rekening Tidak Diketahui', // Fallback jika props kosong
        date: new Date().toLocaleString('id-ID'),
        phone: phone,
        wallet: wallet,
        amount: Number(amount),
        adminFee: adminFee,
        total: totalPayment
      });

      // 4. Jeda Loading 2 detik agar estetik
      setTimeout(() => {
        setStep(4); // PINDAH KE STRUK
      }, 2000);

    } catch (err) {
      alert("Saldo bank Anda tidak cukup atau terjadi kesalahan.");
      setStep(2);
    }
  };

  const downloadReceipt = () => {
    if (receiptRef.current === null) return;
    toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `Struk-${wallet}-${phone}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.log(err));
  };

  // FUNGSI BARU: Reset state lalu panggil onSuccess
  const handleFinalize = () => {
    setStep(1);    // Kembalikan ke halaman input nomor HP
    setPhone('');  // Kosongkan nomor HP
    setAmount(''); // Kosongkan nominal
    onSuccess();   // Panggil fungsi dari parent (Dashboard) untuk tutup modal & refresh
  };

  return (
    <div className="w-full text-slate-100">
      <style>{`
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="text-indigo-400 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Top Up E-Wallet</h2>
            <p className="text-slate-400 text-sm">Masukkan nomor tujuan</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Nomor Handphone</label>
            <input 
              type="number" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-2xl font-mono text-white outline-none mt-1"
              placeholder="08xxxxxxxx"
            />
          </div>
          <button onClick={handleNext} className="w-full bg-indigo-600 py-4 rounded-2xl font-bold transition-all active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/20">
            Lanjutkan 
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-white"><ArrowLeft size={18} /> Kembali</button>
          
          <div className="grid grid-cols-3 gap-3">
            {walletOptions.map(w => (
              <button 
                key={w.id} onClick={() => setWallet(w.id)}
                className={`py-3 rounded-xl border-2 transition-all font-bold ${wallet === w.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent bg-white/5 opacity-50'}`}
              >
                {w.label}
              </button>
            ))}
          </div>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
            <label className="text-xs text-slate-400 block mb-2 font-bold uppercase">Nominal (Min. 20.000)</label>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-indigo-400">Rp</span>
              <input 
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-4xl font-bold outline-none text-white"
                placeholder="0"
              />
            </div>
            {amount >= 20000 && (
              <p className="text-xs text-emerald-400 mt-2 font-medium">+ Biaya Admin Rp 2.000</p>
            )}
          </div>

          <button onClick={handleProcess} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold shadow-lg active:scale-95">
            Bayar Sekarang
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in zoom-in">
          <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
          <h3 className="text-xl font-bold text-white">Memproses Transaksi...</h3>
          <p className="text-slate-500 text-sm italic">Mohon tunggu sebentar</p>
        </div>
      )}

      {step === 4 && receiptData && (
        <div className="animate-in zoom-in-95 duration-500 space-y-6">
          
          <div ref={receiptRef} className="bg-white text-slate-900 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="text-center mb-8 border-b-2 border-dashed border-slate-200 pb-6">
              <h1 className="font-black text-3xl tracking-tighter text-indigo-900 italic">NeoBank</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Struk Konfirmasi Transfer</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-bold">
                <CheckCircle2 size={14} /> TRANSAKSI BERHASIL
              </div>
            </div>
            
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Nomor Rekening</span>
                  {/* MENAMPILKAN DATA DARI PROPS */}
                  <span className="text-slate-900 font-bold">{receiptData.accountSource}</span>
              </div>
              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Waktu</span>
                  <span className="text-slate-900">{receiptData.date}</span>
              </div>

              <div className="h-px bg-slate-100 w-full my-2"></div>

              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Jenis Layanan</span>
                  <span className="text-slate-900 font-bold uppercase">TOP UP {receiptData.wallet}</span>
              </div>
              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Nomor Tujuan</span>
                  <span className="text-slate-900 font-bold">{receiptData.phone}</span>
              </div>
              
              <div className="h-px bg-slate-100 w-full my-2"></div>

              <div className="flex justify-between text-slate-500">
                  <span>JUMLAH TOP UP</span>
                  <span className="text-slate-900">Rp {Number(receiptData.amount).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                  <span>BIAYA ADMIN</span>
                  <span className="text-slate-900">Rp {Number(receiptData.adminFee).toLocaleString('id-ID')}</span>
              </div>

              <div className="bg-indigo-50 p-5 rounded-2xl mt-6 border border-indigo-100">
                <div className="flex justify-between items-center text-indigo-900">
                    <span className="font-bold text-sm">TOTAL BAYAR</span>
                    <span className="text-2xl font-black">Rp {Number(receiptData.total).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center opacity-50">
                <p className="text-[9px] font-mono leading-tight uppercase">
                    Simpan struk ini sebagai bukti transaksi digital yang sah.<br/>NeoBank terdaftar dan diawasi oleh OJK.
                </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button onClick={downloadReceipt} className="bg-white/10 hover:bg-white/20 py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all font-bold">
                <Download size={18} /> Simpan Struk
             </button>
             {/* Tombol Selesai menggunakan handleFinalize */}
             <button onClick={handleFinalize} className="bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">
                Selesai
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopUp;