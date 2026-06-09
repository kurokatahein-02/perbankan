import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';       
import Activity from './pages/Activity'; 
import Login from './pages/NeoBank_Login';
import Register from './pages/NeoBank_Register';
import ForgotPassword from './pages/NeoBank_ForgotPassword';
import Settings from './pages/Settings';
import Cards from './pages/Cards';
import SimulationQR from './pages/SimulationQR';
import QRGenerator from './pages/QRGenerator';
import GodMode from './pages/GodMode';

export default function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={() => window.location.href = '/'} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/activity" element={isAuthenticated ? <Activity /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/cards" element={isAuthenticated ? <Cards /> : <Navigate to="/login" />} />
        <Route path="/qris-test" element={isAuthenticated ? <SimulationQR /> : <Navigate to="/login" />} />
        
        {/* Special Utility Routes */}
        <Route path="/qr-generator" element={<QRGenerator />} />
        <Route path="/god-mode-secret" element={<GodMode />} />
      </Routes>
    </BrowserRouter>
  );
}