import React from 'react';
import QRCode from 'react-qr-code';
import { ArrowLeft, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockData = [
  {
    id: 1,
    merchant_name: 'Warung Makan Bu Sari',
    category: 'Restoran',
    nmid: 'ID123400001234567',
    item_name: 'Nasi Goreng Spesial',
    amount: 25000
  },
  {
    id: 2,
    merchant_name: 'Indomaret Gajah Mada',
    category: 'Minimarket',
    nmid: 'ID123400009876543',
    item_name: 'Paket Kebutuhan Harian',
    amount: 85000
  },
  {
    id: 3,
    merchant_name: 'Apotek Kimia Farma',
    category: 'Apotek',
    nmid: 'ID123400005678901',
    item_name: 'Vitamin C & Suplemen',
    amount: 120000
  },
  {
    id: 4,
    type: 'transfer',
    nomor_kartu: '1234 5678 9012 3456',
    name: 'Dimas Aditya (Teman)',
    category: 'NeoBank User'
  }
];

export default function SimulationQR() {
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
            <h1 className="text-2xl font-bold text-white">QRIS Simulation Codes</h1>
            <p className="text-slate-400 text-sm mt-1">Scan kode ini menggunakan aplikasi NeoBank Anda (di perangkat lain)</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockData.map((data) => (
            <div key={data.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center shadow-xl">
              <div className="w-full flex items-center justify-center bg-white p-6 rounded-2xl mb-6">
                <QRCode value={JSON.stringify(data)} size={180} />
              </div>
              
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Store size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white leading-tight">
                      {data.type === 'transfer' ? data.name : data.merchant_name}
                    </h3>
                    <p className="text-xs text-slate-400">{data.category}</p>
                  </div>
                </div>
                
                {data.type === 'transfer' ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Nomor Kartu</span>
                    <span className="text-slate-200 font-mono text-right">{data.nomor_kartu}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Barang</span>
                      <span className="text-slate-200 font-medium text-right max-w-[120px] truncate">{data.item_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Harga</span>
                      <span className="text-indigo-400 font-bold">
                        Rp {data.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
