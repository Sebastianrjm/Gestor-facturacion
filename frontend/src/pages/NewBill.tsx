import React from 'react';
import { Button } from '../components/Button';

interface Props {
  onBack?: () => void;
}

export default function NuevaFactura({ onBack }: Props) {
  return (
    <div
      style={{
        backgroundColor: '#265CF0',
        color: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        marginTop: '20px',
      }}
    >
      <h2 style={{ margin: 0, fontSize: '24px' }}>¡Conexión Exitosa!</h2>
      <p style={{ margin: 0, opacity: 0.9 }}>
        Estás en la pantalla de Nueva Factura.
      </p>

      {onBack && (
        <Button variant="secondary" onClick={onBack}>
          ← Volver
        </Button>
      )}
    </div>
  );
}