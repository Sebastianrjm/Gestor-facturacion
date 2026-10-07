import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import type { User } from './types/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css'; 

export default function App() {
  const handleLoginSuccess = (user: User) => {
    console.log('Usuario autenticado con éxito:', user);
    // Próximamente: redirigir al Dashboard
  };

  return (
    <BrowserRouter>
      <div style={styles.appLayout}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route 
            path="/login" 
            element={<Login onLoginSuccess={handleLoginSuccess} />} 
          />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appLayout: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f8',
    display: 'flex',
    flexDirection: 'column',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '1.5rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    backgroundColor: '#e2e8f0',
    padding: '0.25rem',
    borderRadius: '8px',
  },
  navButton: {
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },
  activeButton: {
    backgroundColor: '#007bff',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  inactiveButton: {
    backgroundColor: 'transparent',
    color: '#4a5568',
  },
};