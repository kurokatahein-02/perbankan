import React, { useState, useEffect } from 'react';
import { PieChart, CreditCard, Smartphone, Send, MoreHorizontal } from 'lucide-react';
import api from '../utils/api';

export default function ExpenseChart({ className = "bg-white/5 border-white/10" }) {
  const [expenses, setExpenses] = useState([]);
  const [totalOut, setTotalOut] = useState(0);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get('/transactions');
        const txs = res.data.transactions.filter(t => t.type === 'out');
        
        const grouped = {
          transfer: 0,
          topup: 0,
          pembayaran: 0
        };

        let total = 0;
        txs.forEach(t => {
          const cat = t.category;
          if (grouped[cat] !== undefined) {
            grouped[cat] += Number(t.amount);
            total += Number(t.amount); // Only add to total if it's one of the known categories
          }
        });

        const data = [
          { id: 'transfer', label: 'Transfer', value: grouped.transfer, color: 'bg-blue-500', icon: Send },
          { id: 'topup', label: 'Top Up', value: grouped.topup, color: 'bg-orange-500', icon: Smartphone },
          { id: 'pembayaran', label: 'Pembayaran', value: grouped.pembayaran, color: 'bg-emerald-500', icon: CreditCard }
        ].filter(item => item.value > 0).sort((a, b) => b.value - a.value);

        setExpenses(data);
        setTotalOut(total);
      } catch (e) {
        console.error(e);
      }
    };
    fetchExpenses();
  }, []);

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val).replace('Rp', 'Rp ');

  return (
    <div className={`backdrop-blur-lg border rounded-3xl p-6 shadow-xl w-full ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
          <PieChart className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Grafik Pengeluaran</h3>
          <p className="text-sm text-slate-400">Total: {formatRp(totalOut)}</p>
        </div>
      </div>

      <div className="space-y-4">
        {expenses.length > 0 ? expenses.map((item) => {
          const percentage = ((item.value / totalOut) * 100).toFixed(1);
          return (
            <div key={item.id} className="group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
                  <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-100 block">{formatRp(item.value)}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{percentage}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        }) : (
          <div className="text-center p-4 text-slate-500 text-sm">Belum ada pengeluaran.</div>
        )}
      </div>
    </div>
  );
}
