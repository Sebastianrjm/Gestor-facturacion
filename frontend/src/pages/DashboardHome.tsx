import React, { useState } from 'react';
import { Button } from '../components/Button';
import '../App.css';
import CustomSelect from '../components/customSelect';
import type { SelectOption } from '../components/customSelect';
// import API from '../services/api'; // Comentado temporalmente


const ESTADOS_FACTURA: SelectOption[] = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Pagada', value: 'pagada' },
  { label: 'Anulada', value: 'anulada' },
]

export default function DashboardHome() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [estadoFactura1, setEstadoFactura1] = useState('pendiente');

  /*
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
  */

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
    <div style={styles.header}>
      <div style={styles.header}> 
        <h1 className="title">Mis facturas</h1>

        <p className="text">Un vistazo a tu negocio · </p>

        <Button variant="primary" onClick={() => console.log('Guardar')}>
          Nueva factura
        </Button>
      </div>

      {/* Tarjetas de Resumen */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <span className='text'>Cobrado este mes</span>
          <h2 className='title'>$ 4,520.00</h2>
        </div>
        <div style={styles.card}>
          <span className='text'>Pendiente de pago</span>
          <h2 className='title'>$ 1,520.00</h2>
        </div>
        <div style={styles.card}>
          <span className='text'>Facturas emitidas</span>
          <h2 className='title'>8</h2>
        </div>
      </div>

      {/* Panel de facturas */}
      <div style={styles.principalPanel}>
        <div style={{display: "flex"}}>
          <div style={{marginRight: "100px"}}>
            <p style={styles.principalPanelText}>FACTURA / CLIENTE</p>
          </div>
          <div>
            <p style={styles.principalPanelText}>IMPORTE / ESTADO</p>
          </div>
        </div>

        {/* Cards de las facturas */}
        <div style={styles.principalPanelParent}>

          <div style={styles.principalPanelChild}>
            <p className='text'>FAC-2026-024 · Estudio Prisma</p>
            <div style={{display: "flex"}}>
              <p style={{marginRight: "20px"}} className='text'>$2,378.00</p>
              <CustomSelect
                label="Estado"
                value={estadoFactura1}
                options={ESTADOS_FACTURA}
                onChange={(newValue) => setEstadoFactura1(newValue)}
              />
            </div>
          </div>

          <div style={styles.principalPanelChild}>
            <p className='text'>FAC-2026-023 · Café Origen</p>
            <div style={{display: "flex"}}>
              <p style={{marginRight: "20px"}} className='text'>$2,378.00</p>
              <CustomSelect
                label="Estado"
                value={estadoFactura1}
                options={ESTADOS_FACTURA}
                onChange={(newValue) => setEstadoFactura1(newValue)}
              />
            </div>
          </div>

        </div>
        
      </div>



    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    gap: "12px",
    display: "flex",
    flexDirection: "column"
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
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  principalPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "16px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #FFFFFF",
    borderRadius: "12px",
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  principalPanelText: {
    fontSize: "11px",
    color: "#748094",
    lineHeight: "1.5em",
    letterSpacing: "-0.02em",
    fontWeight: "400"
  },
  principalPanelParent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  principalPanelChild: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 8px",
    borderBottom: "1px solid #E4E8EF"
  }
};