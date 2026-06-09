import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode, X, ChevronLeft, CheckCircle2, XCircle, Camera,
  AlertCircle, ShieldCheck, Zap, Copy, RefreshCw
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'react-qr-code';
import api from '../utils/api';

const STEP = {
  CHOOSE_MODE: 'choose_mode',
  SCAN:        'scan',
  INPUT_AMOUNT:'input_amount',
  REVIEW:      'review',
  PIN:         'pin',
  PROCESSING:  'processing',
  SUCCESS:     'success',
  FAILED:      'failed',
  SHOW_QR:     'show_qr',
};

export default function QRISModal({ onClose, userData, onScanTransfer }) {
  const [step, setStep]           = useState(STEP.CHOOSE_MODE);
  const [mode, setMode]           = useState(null);
  const [merchant, setMerchant]   = useState(null);
  const [amount, setAmount]       = useState('');
  const [pin, setPin]             = useState('');
  const [pinError, setPinError]   = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [scanProgress, setScanProgress] = useState(0);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const timerRef = useRef(null);

  const formatRp = (val) => {
    const num = val.replace(/\D/g, '');
    return num ? parseInt(num, 10).toLocaleString('id-ID') : '';
  };

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAmount(raw);
  };

  useEffect(() => {
    let html5QrCode;
    if (step === STEP.SCAN) {
      setScanProgress(10);
      html5QrCode = new Html5Qrcode("qris-reader");
      
      const onScanSuccess = (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          
          if (data.type === 'transfer' && data.nomor_kartu) {
            html5QrCode.stop().then(() => {
              if (onScanTransfer) onScanTransfer(data.nomor_kartu);
            }).catch(() => {});
            return;
          }

          if (data.merchant_name && data.amount) {
            html5QrCode.stop().then(() => {
              // Convert to merchant object expected by UI
              setMerchant({
                name: data.merchant_name,
                category: data.category,
                nmid: data.nmid,
                itemName: data.item_name
              });
              setAmount(String(data.amount));
              setScanProgress(100);
              setTimeout(() => setStep(STEP.INPUT_AMOUNT), 800);
            }).catch(() => {});
          }
        } catch (e) {
          // Ignore non-JSON QR codes
        }
      };

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        onScanSuccess
      ).catch(err => {
        // Fallback to laptop webcam (user)
        setIsFrontCamera(true);
        html5QrCode.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 200, height: 200 } },
          onScanSuccess
        ).catch(err2 => {
          console.error("Gagal mengakses kamera:", err2);
        });
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [step]);

  useEffect(() => {
    // Empty useEffect instead of fake timeout
  }, [step]);

  useEffect(() => {
    if (step === STEP.SUCCESS) {
      setCountdown(5);
      timerRef.current = setInterval(() => {
        setCountdown(c => {
          if (c <= 1) { clearInterval(timerRef.current); onClose(); return 0; }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [step]);

  const handlePinInput = async (digit) => {
    if (pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    setPinError(false);
    if (next.length === 6) {
      setStep(STEP.PROCESSING);
      try {
        await api.post('/qris/pay', {
          merchant_name: merchant.name,
          item_name: merchant.itemName,
          amount: total
        });
        setStep(STEP.SUCCESS);
      } catch (error) {
        setStep(STEP.FAILED);
      }
    }
  };

  const handlePinDelete = () => setPin(p => p.slice(0, -1));

  const amountNum = parseInt(amount || '0', 10);
  const fee = amountNum >= 1000 ? 1000 : 0;
  const total = amountNum + fee;

  const renderChooseMode = () => (
    <div className="flex flex-col gap-4 mt-2">
      <button onClick={() => { setMode('pay'); setStep(STEP.SCAN); }} className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group text-left">
        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
          <Camera className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <p className="font-semibold text-white">Scan QRIS</p>
          <p className="text-sm text-slate-400 mt-0.5">Scan kode QR untuk bayar merchant atau transfer</p>
        </div>
      </button>
      <button onClick={() => { setMode('receive'); setStep(STEP.SHOW_QR); }} className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group text-left">
        <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
          <QrCode className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <p className="font-semibold text-white">Tampilkan QR Saya</p>
          <p className="text-sm text-slate-400 mt-0.5">Terima pembayaran dari orang lain</p>
        </div>
      </button>
    </div>
  );

  const renderScan = () => (
    <div className="flex flex-col items-center gap-5 mt-2">
      {isFrontCamera && (
        <style>{`
          #qris-reader video {
            transform: scaleX(-1) !important;
          }
        `}</style>
      )}
      <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center [&_video]:object-cover [&_video]:w-full [&_video]:h-full">
        <div id="qris-reader" className="absolute inset-0 z-10 w-full h-full"></div>
        {/* Overlay frame custom */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-10" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {['top-3 left-3','top-3 right-3','bottom-3 left-3','bottom-3 right-3'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-6 h-6 border-indigo-400 z-10 pointer-events-none`} style={{ borderTop: pos.includes('top') ? '3px solid' : 'none', borderBottom: pos.includes('bottom') ? '3px solid' : 'none', borderLeft: pos.includes('left') ? '3px solid' : 'none', borderRight: pos.includes('right') ? '3px solid' : 'none', borderColor: '#818cf8' }} />
        ))}
        {merchant && <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center gap-2"><CheckCircle2 className="w-12 h-12 text-emerald-400" /><p className="text-white font-medium text-sm">QR Terdeteksi</p></div>}
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-200 rounded-full" style={{ width: `${scanProgress}%` }} /></div>
      <p className="text-sm text-slate-400 text-center">{merchant ? 'Berhasil membaca kode QR…' : 'Arahkan kamera laptop Anda ke gambar QR simulasi'}</p>
    </div>
  );

  const renderInputAmount = () => (
    <div className="flex flex-col gap-5 mt-2">
      <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">{merchant?.name[0]}</div>
        <div><p className="font-semibold text-white">{merchant?.name}</p><p className="text-xs text-slate-400 mt-0.5">{merchant?.category} · {merchant?.nmid}</p></div>
        <div className="ml-auto"><span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg font-medium">Terverifikasi</span></div>
      </div>
      <div>
        <label className="text-sm text-slate-400 mb-2 block">Jumlah Pembayaran</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-semibold">Rp</span>
          <input type="text" inputMode="numeric" placeholder="0" value={formatRp(amount)} onChange={handleAmountChange} disabled={merchant?.itemName ? true : false} className={`w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-xl font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${merchant?.itemName ? 'opacity-70 cursor-not-allowed' : ''}`} />
        </div>
      </div>
      {amountNum > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-sm">
          {merchant?.itemName && <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2 mb-2"><span>Barang</span><span className="text-white font-medium">{merchant.itemName}</span></div>}
          <div className="flex justify-between text-slate-400"><span>Nominal</span><span>Rp {amountNum.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between text-slate-400"><span>Biaya Layanan</span><span>Rp {fee.toLocaleString('id-ID')}</span></div>
          <div className="flex justify-between font-semibold text-white border-t border-white/10 pt-2 mt-2"><span>Total Bayar</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
        </div>
      )}
      <button disabled={amountNum < 1000} onClick={() => setStep(STEP.REVIEW)} className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg">Lanjutkan</button>
      {amountNum < 1000 && amountNum > 0 && <p className="text-xs text-center text-red-400">Minimal pembayaran Rp 1.000</p>}
    </div>
  );

  const renderReview = () => (
    <div className="flex flex-col gap-5 mt-2">
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">{merchant?.name[0]}</div><div><p className="font-semibold text-white text-sm">{merchant?.name}</p><p className="text-xs text-slate-400">{merchant?.category}</p></div></div>
        <div className="p-5 space-y-3 text-sm">
          {merchant?.itemName && <div className="flex justify-between"><span className="text-slate-400">Barang</span><span className="text-slate-200 font-medium">{merchant.itemName}</span></div>}
          {[ ['Nominal', `Rp ${amountNum.toLocaleString('id-ID')}`], ['Biaya Layanan', `Rp ${fee.toLocaleString('id-ID')}`], ['Metode', 'Saldo NeoBank'], ['Tanggal', new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })], ].map(([k, v]) => (
            <div key={k} className="flex justify-between"><span className="text-slate-400">{k}</span><span className="text-slate-200 font-medium">{v}</span></div>
          ))}
          <div className="flex justify-between border-t border-white/10 pt-3"><span className="text-white font-semibold">Total Bayar</span><span className="text-indigo-300 font-bold text-base">Rp {total.toLocaleString('id-ID')}</span></div>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm"><ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span className="text-emerald-300">Saldo mencukupi · Rp 45.250.000</span></div>
      <button onClick={() => setStep(STEP.PIN)} className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl transition-all active:scale-[0.98] shadow-lg">Konfirmasi &amp; Masukkan PIN</button>
    </div>
  );

  const renderPin = () => (
    <div className="flex flex-col items-center gap-6 mt-2">
      <div className="text-center"><p className="text-slate-300 text-sm">Masukkan PIN NeoBank kamu</p><p className="text-xs text-slate-500 mt-1">6 digit angka yang kamu buat saat registrasi</p></div>
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${ pinError ? 'border-red-400 bg-red-400' : pin.length > i ? 'border-indigo-400 bg-indigo-400' : 'border-white/20 bg-transparent' }`} />
        ))}
      </div>
      {pinError && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2"><AlertCircle className="w-4 h-4" /><span>PIN salah. Silakan coba lagi.</span></div>}
      <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
        {[1,2,3,4,5,6,7,8,9,'',0,'del'].map((key, i) => {
          if (key === '') return <div key={i} />;
          if (key === 'del') return <button key={i} onClick={handlePinDelete} className="h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 active:scale-95 transition-all"><X className="w-5 h-5" /></button>;
          return <button key={i} onClick={() => handlePinInput(String(key))} className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white text-xl font-semibold hover:bg-white/10 active:scale-95 transition-all">{key}</button>;
        })}
      </div>
      <p className="text-xs text-slate-500">Hint: gunakan 123456</p>
    </div>
  );

  const renderProcessing = () => (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative w-20 h-20"><div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" /><div className="absolute inset-0 rounded-full border-4 border-t-indigo-400 animate-spin" /><div className="absolute inset-0 flex items-center justify-center"><Zap className="w-8 h-8 text-indigo-400" /></div></div>
      <div className="text-center space-y-1"><p className="font-semibold text-white">Memproses Pembayaran</p><p className="text-sm text-slate-400">Mohon tunggu sebentar…</p></div>
      <div className="space-y-2 w-full">
        {['Menghubungi jaringan QRIS', 'Memverifikasi merchant', 'Mendebit saldo'].map((t, i) => (<div key={i} className="flex items-center gap-3 text-sm text-slate-400"><div className="w-4 h-4 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /></div>{t}</div>))}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center"><CheckCircle2 className="w-12 h-12 text-emerald-400" /></div>
      <div className="text-center"><p className="text-2xl font-bold text-white">Pembayaran Berhasil!</p><p className="text-slate-400 text-sm mt-1">Transaksi kamu telah selesai</p></div>
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 text-sm">
        <div className="flex justify-between"><span className="text-slate-400">Merchant</span><span className="text-white font-medium">{merchant?.name}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Total Dibayar</span><span className="text-emerald-400 font-bold">Rp {total.toLocaleString('id-ID')}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">No. Referensi</span><span className="text-slate-200 font-mono text-xs">NEO{Date.now().toString().slice(-10)}</span></div>
        <div className="flex justify-between"><span className="text-slate-400">Waktu</span><span className="text-slate-200">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span></div>
      </div>
      <div className="flex items-center gap-2 text-slate-400 text-sm"><RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '2s' }} /><span>Menutup otomatis dalam <span className="text-indigo-300 font-semibold">{countdown}s</span>…</span></div>
      <button onClick={onClose} className="w-full py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium rounded-xl transition-all">Selesai</button>
    </div>
  );

  const renderFailed = () => (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center"><XCircle className="w-12 h-12 text-red-400" /></div>
      <div className="text-center"><p className="text-2xl font-bold text-white">Pembayaran Gagal</p><p className="text-slate-400 text-sm mt-1 max-w-xs">Koneksi ke jaringan QRIS terputus. Saldo kamu tidak didebit.</p></div>
      <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 w-full"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>Tidak ada dana yang terdebet dari akun kamu</span></div>
      <div className="flex gap-3 w-full">
        <button onClick={() => { setStep(STEP.PIN); setPin(''); }} className="flex-1 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-all">Coba Lagi</button>
        <button onClick={onClose} className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all">Batal</button>
      </div>
    </div>
  );

  const renderShowQR = () => {
    const qrData = {
      type: 'transfer',
      nomor_kartu: userData?.nomor_kartu || 'XXXX-XXXX-XXXX-XXXX',
      name: userData?.fullname || 'Budi Santoso'
    };

    return (
      <div className="flex flex-col items-center gap-5 mt-2">
        <p className="text-sm text-slate-400 text-center">Tunjukkan kode QR ini untuk menerima transfer</p>
        <div className="bg-white p-5 rounded-2xl shadow-xl border-4 border-indigo-500/20">
          <QRCode value={JSON.stringify(qrData)} size={200} level="H" />
        </div>
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Nama</span><span className="text-white font-medium">{userData?.fullname || 'Budi Santoso'}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Nomor Kartu</span><div className="flex items-center gap-1.5"><span className="text-white font-mono">{userData?.nomor_kartu || 'XXXX-XXXX-XXXX-XXXX'}</span><button className="text-indigo-400 hover:text-indigo-300"><Copy className="w-3.5 h-3.5" /></button></div></div>
          <div className="flex justify-between"><span className="text-slate-400">Bank</span><span className="text-white font-semibold italic text-indigo-300">NeoBank</span></div>
        </div>
        <p className="text-xs text-slate-500 text-center">Pindai dari aplikasi NeoBank lain untuk langsung transfer.</p>
      </div>
    );
  };

  const stepConfig = {
    [STEP.CHOOSE_MODE]:  { title: 'QRIS',                   back: null },
    [STEP.SCAN]:         { title: 'Scan Kode QR',           back: STEP.CHOOSE_MODE },
    [STEP.INPUT_AMOUNT]: { title: 'Masukkan Nominal',       back: STEP.SCAN },
    [STEP.REVIEW]:       { title: 'Konfirmasi Pembayaran',  back: STEP.INPUT_AMOUNT },
    [STEP.PIN]:          { title: 'Masukkan PIN',           back: STEP.REVIEW },
    [STEP.PROCESSING]:   { title: 'Memproses',              back: null },
    [STEP.SUCCESS]:      { title: 'Berhasil',               back: null },
    [STEP.FAILED]:       { title: 'Pembayaran Gagal',       back: null },
    [STEP.SHOW_QR]:      { title: 'QR Code Saya',          back: STEP.CHOOSE_MODE },
  };

  const cfg = stepConfig[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={step !== STEP.PROCESSING ? onClose : undefined} />
      <div className="relative w-full sm:w-auto sm:min-w-[400px] sm:max-w-md bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto z-10">
        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 bg-white/20 rounded-full" /></div>
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            {cfg.back && (<button onClick={() => setStep(cfg.back)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><ChevronLeft className="w-5 h-5" /></button>)}
            <div className="flex items-center gap-2"><div className="p-1.5 bg-indigo-500/20 rounded-lg"><QrCode className="w-4 h-4 text-indigo-400" /></div><span className="font-semibold text-white">{cfg.title}</span></div>
          </div>
          {step !== STEP.PROCESSING && (<button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><X className="w-5 h-5" /></button>)}
        </div>
        <div className="px-6 pb-6 pt-2">
          {step === STEP.CHOOSE_MODE  && renderChooseMode()}
          {step === STEP.SCAN         && renderScan()}
          {step === STEP.INPUT_AMOUNT && renderInputAmount()}
          {step === STEP.REVIEW       && renderReview()}
          {step === STEP.PIN          && renderPin()}
          {step === STEP.PROCESSING   && renderProcessing()}
          {step === STEP.SUCCESS      && renderSuccess()}
          {step === STEP.FAILED       && renderFailed()}
          {step === STEP.SHOW_QR      && renderShowQR()}
        </div>
      </div>
    </div>
  );
}