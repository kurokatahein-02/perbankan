import React, { useState } from 'react';
import LoginPage from './pages/NeoBank_Login';
import HomePage from './pages/home';
import RegisterPage from './pages/NeoBank_Register';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  if (isLoggedIn) {
    return <HomePage onLogout={() => setIsLoggedIn(false)} />;
  }

  if (isRegistering) {
    return (
      <RegisterPage 
        onNavigateLogin={() => setIsRegistering(false)} 
      />
    );
  }

  return (
    <LoginPage 
      onLogin={() => setIsLoggedIn(true)} 
      onNavigateRegister={() => setIsRegistering(true)} 
    />
  );
}