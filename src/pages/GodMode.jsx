import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Since this is outside normal app auth possibly, we just make a direct axios instance
const godApi = axios.create({
  baseURL: 'http://localhost:8000/api/god'
});

export default function GodMode() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await godApi.get('/users');
      setUsers(res.data.users);
    } catch (e) {
      console.error(e);
      setStatus('Failed to fetch users');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || amount <= 0) {
      setStatus('Pilih user dan masukkan nominal yang valid!');
      return;
    }

    setStatus('Mengirim...');
    try {
      const res = await godApi.post('/transfer', {
        user_id: selectedUser,
        amount: Number(amount)
      });
      setStatus(res.data.message);
      setAmount('');
    } catch (e) {
      console.error(e);
      setStatus('Gagal transfer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-indigo-400">⚡ Halaman Dewa ⚡</h1>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
        <form onSubmit={handleTransfer} className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Pilih User / Target</label>
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Pilih User --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullname} ({u.username})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Nominal Uang (Rp)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500"
              placeholder="1000000"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            Kirim Uang dari Kahyangan
          </button>
        </form>

        {status && (
          <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-700 text-center text-indigo-300 font-medium">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
