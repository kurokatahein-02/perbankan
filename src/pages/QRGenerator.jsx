import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QRGenerator() {
  const [type, setType] = useState('payment');
  
  // Payment states
  const [merchantName, setMerchantName] = useState('Toko Serba Ada');
  const [category, setCategory] = useState('Minimarket');
  const [nmid, setNmid] = useState('ID1234567890');
  const [itemName, setItemName] = useState('Barang Belanjaan');
  const [amount, setAmount] = useState('50000');

  // Transfer states
  const [targetName, setTargetName] = useState('Budi Santoso');
  const [nomorKartu, setNomorKartu] = useState('1234 5678 9012 3456');
  const [transferCategory, setTransferCategory] = useState('NeoBank User');

  const generateData = () => {
    if (type === 'payment') {
      return {
        merchant_name: merchantName,
        category: category,
        nmid: nmid,
        item_name: itemName,
        amount: Number(amount)
      };
    } else {
      return {
        type: 'transfer',
        name: targetName,
        nomor_kartu: nomorKartu,
        category: transferCategory
      };
    }
  };

  const qrString = JSON.stringify(generateData());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex items-center gap-4 mb-8">
          <Link 
            to="/" 
            className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-slate-300"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">QR Code Generator</h1>
            <p className="text-slate-400 text-sm mt-1">Buat simulasi kode QR untuk dites scan di aplikasi utama</p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-6">Pengaturan QR</h2>
            
            <div className="flex gap-4 mb-6">
              <button 
                onClick={() => setType('payment')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${type === 'payment' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                Merchant (Bayar)
              </button>
              <button 
                onClick={() => setType('transfer')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${type === 'transfer' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                User (Transfer)
              </button>
            </div>

            <div className="space-y-4">
              {type === 'payment' ? (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nama Toko</label>
                    <input type="text" value={merchantName} onChange={e => setMerchantName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Kategori Toko</label>
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">NMID (ID Merchant)</label>
                    <input type="text" value={nmid} onChange={e => setNmid(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nama Barang</label>
                    <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Harga (Rp)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nama User</label>
                    <input type="text" value={targetName} onChange={e => setTargetName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nomor Kartu Tujuan</label>
                    <input type="text" value={nomorKartu} onChange={e => setNomorKartu(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Label Kategori</label>
                    <input type="text" value={transferCategory} onChange={e => setTransferCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl relative min-h-[400px]">
            <p className="text-slate-400 mb-6 text-center">Scan QR code ini dari HP atau tab lain menggunakan fitur QRIS NeoBank</p>
            <div className="bg-white p-6 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              <QRCode value={qrString} size={240} />
            </div>
            
            <div className="w-full mt-8 bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 mb-2">JSON Payload Data:</p>
              <pre className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap overflow-hidden">
                {qrString}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
