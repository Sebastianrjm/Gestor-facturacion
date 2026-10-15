import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useEffect } from 'react';

export default function NotFound() {
  const navigate = useNavigate();

    useEffect(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }, []);

  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <h1 style={{ fontSize: '72px', margin: '0', color: '#4F46E5' }}>404</h1>
      <h2 style={{ fontSize: '24px', color: '#172338', margin: '0' }}>Página no encontrada</h2>
      <p style={{ color: '#64748B', maxWidth: '400px' }}>
        Lo sentimos, la página que estás buscando no existe, fue movida o la URL es incorrecta.
      </p>
      <div style={{ marginTop: '10px' }}>
        <Button variant="primary" onClick={() => navigate('/login')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}