import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Button } from '../components/Button';

export default function DashboardHome() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Coloca aquí tu endpoint real de facturas/métricas
        const response = await API.get('/invoices'); 
        setData(response.data);
      } catch (err: any) {
        console.error('Error al cargar información:', err);
        setError(err.response?.data?.message || 'No se pudo cargar la información.');
      } finally {
        // ⚠️ CLAVE: Esto garantiza que la pantalla deje de estar "Cargando"
        setLoading(false); 
      }
    };

    fetchDashboardData();
  }, []);

   //1. Manejo visible de la carga (evita devolver null)
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Cargando datos del dashboard...</h2>
      </div>
    );
  }

  // 2. Manejo visible del error
  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h2>Ocurrió un detalle:</h2>
        <p>{error}</p>
      </div>
    );
  }

  // 3. Renderizado de tus pantallas/tarjetas reales
  return (
        <div>
        <h1 className="title">Mis facturas</h1>

        <Button variant="primary" onClick={() => console.log('Guardar')}>
            Guardar Factura
        </Button>
        {/* Tarjetas de Resumen */}
            <div style={styles.grid}>
                <div style={styles.card}>
                <span style={styles.cardTitle}>Cotizaciones Emitidas</span>
                <h2 style={styles.cardValue}>12</h2>
                </div>
                <div style={styles.card}>
                <span style={styles.cardTitle}>Monto Total ($)</span>
                <h2 style={styles.cardValue}>$ 4,520.00</h2>
                </div>
                <div style={styles.card}>
                <span style={styles.cardTitle}>Clientes Activos</span>
                <h2 style={styles.cardValue}>8</h2>
                </div>
            </div>
        </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  cardValue: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: '0.5rem',
    margin: 0,
  },
};