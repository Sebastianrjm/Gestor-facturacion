import react from "react"

export default function DashboardHome() {
    return (
        <div>
        <h1 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Mis facturas</h1>

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