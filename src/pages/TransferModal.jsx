import React, { useState, useRef } from 'react';
import api from '../utils/api';
import { toPng } from 'html-to-image';
import { 
  ArrowRightLeft, CheckCircle2, Download, 
  ArrowLeft, Loader2 
} from 'lucide-react';

const TransferModal = ({ onSuccess, accountNumber, defaultRecipientPhone }) => {
  const [step, setStep] = useState(1); // 1: Card, 2: Amount, 3: Loading, 4: Struk
  const [nomorKartu, setNomorKartu] = useState(defaultRecipientPhone || '');
  const [amount, setAmount] = useState('');
  const [receiptData, setReceiptData] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const receiptRef = useRef(null);

  const handleNext = async () => {
    if (!nomorKartu) return alert("Masukkan nomor kartu yang valid!");
    
    try {
      const res = await api.get(`/check-recipient/${nomorKartu}`);
      setRecipientName(res.data.name);
      setStep(2);
    } catch (err) {
      alert("Nomor kartu tidak ditemukan.");
    }
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (amount < 1000) return alert("Minimal Transfer Rp 1.000");

    setStep(3); // Munculkan Loading

    try {
      // 1. Tembak API Laravel
      const res = await api.post('/transfer', {
        nomor_kartu: nomorKartu,
        amount: Number(amount)
      });

      // 2. Siapkan data struk
      setReceiptData({
        accountSource: accountNumber || 'Rekening Tidak Diketahui',
        date: new Date().toLocaleString('id-ID'),
        phone: nomorKartu,
        amount: Number(amount),
        total: Number(amount),
        recipientName: res.data.transaction.title.replace('Transfer ke ', '')
      });

      // 3. Jeda Loading 2 detik agar estetik
      setTimeout(() => {
        setStep(4); // PINDAH KE STRUK
      }, 2000);

    } catch (err) {
      alert(err.response?.data?.message || "Saldo tidak cukup atau tujuan tidak ditemukan.");
      setStep(2);
    }
  };

  const downloadReceipt = () => {
    if (receiptRef.current === null) return;
    toPng(receiptRef.current, { cacheBust: true, backgroundColor: '#ffffff' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `Struk-Transfer-${nomorKartu}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => console.log(err));
  };

  const handleFinalize = () => {
    setStep(1);    
    setNomorKartu('');  
    setAmount(''); 
    onSuccess();   
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
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <ArrowRightLeft className="text-blue-400 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Transfer Sesama</h2>
            <p className="text-slate-400 text-sm">Masukkan nomor kartu tujuan</p>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <label className="text-[10px] text-slate-500 uppercase font-bold ml-1">Nomor Kartu Penerima</label>
            <input 
              type="text" value={nomorKartu} onChange={(e) => setNomorKartu(e.target.value)}
              className="w-full bg-transparent text-2xl font-mono text-white outline-none mt-1"
              placeholder="XXXX XXXX XXXX XXXX"
            />
          </div>
          <button onClick={handleNext} className="w-full bg-blue-600 py-4 rounded-2xl font-bold transition-all active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-blue-600/20">
            Lanjutkan 
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <button onClick={() => setStep(1)} className="flex items-center gap-2 text-slate-400 hover:text-white"><ArrowLeft size={18} /> Kembali</button>
          
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center">
            <p className="text-sm text-slate-400 uppercase tracking-widest mb-1">Transfer ke</p>
            <p className="text-lg font-bold text-white">{recipientName}</p>
            <p className="text-sm font-mono tracking-wider text-blue-400 mt-1">{nomorKartu}</p>
          </div>

          <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
            <label className="text-xs text-slate-400 block mb-2 font-bold uppercase">Nominal Transfer (Min. 1.000)</label>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-blue-400">Rp</span>
              <input 
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-4xl font-bold outline-none text-white"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-medium">Bebas biaya transfer!</p>
          </div>

          <button onClick={handleProcess} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold shadow-lg active:scale-95">
            Transfer Sekarang
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in zoom-in">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          <h3 className="text-xl font-bold text-white">Memproses Transfer...</h3>
          <p className="text-slate-500 text-sm italic">Mohon tunggu sebentar</p>
        </div>
      )}

      {step === 4 && receiptData && (
        <div className="animate-in zoom-in-95 duration-500 space-y-6">
          
          <div ref={receiptRef} className="bg-white text-slate-900 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="text-center mb-8 border-b-2 border-dashed border-slate-200 pb-6">
              <h1 className="font-black text-3xl tracking-tighter text-blue-900 italic">NeoBank</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Struk Konfirmasi Transfer</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-bold">
                <CheckCircle2 size={14} /> TRANSFER BERHASIL
              </div>
            </div>
            
            <div className="space-y-4 font-mono text-xs">
              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Rekening Sumber</span>
                  <span className="text-slate-900 font-bold">{receiptData.accountSource}</span>
              </div>
              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Waktu</span>
                  <span className="text-slate-900">{receiptData.date}</span>
              </div>

              <div className="h-px bg-slate-100 w-full my-2"></div>

              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Jenis Layanan</span>
                  <span className="text-slate-900 font-bold uppercase text-blue-600">TRANSFER SESAMA</span>
              </div>
              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Nomor Kartu Tujuan</span>
                  <span className="text-slate-900 font-bold">{receiptData.phone}</span>
              </div>
              <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Nama Penerima</span>
                  <span className="text-slate-900 font-bold">{receiptData.recipientName}</span>
              </div>
              
              <div className="h-px bg-slate-100 w-full my-2"></div>

              <div className="flex justify-between text-slate-500">
                  <span>JUMLAH TRANSFER</span>
                  <span className="text-slate-900">Rp {Number(receiptData.amount).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                  <span>BIAYA ADMIN</span>
                  <span className="text-slate-900">Rp 0</span>
              </div>

              <div className="bg-blue-50 p-5 rounded-2xl mt-6 border border-blue-100">
                <div className="flex justify-between items-center text-blue-900">
                    <span className="font-bold text-sm">TOTAL</span>
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
             <button onClick={handleFinalize} className="bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">
                Selesai
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferModal;
