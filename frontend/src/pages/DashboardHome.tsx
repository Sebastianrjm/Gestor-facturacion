import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import '../App.css';
import '../assets/DashboardHome.css';
import CustomSelect from '../components/CustomSelect';
import TemplateSidebar from '../layouts/TemplateSidebar';
import type { SelectOption } from '../components/CustomSelect';
import { useNavigate } from 'react-router-dom';
import { getDashboardData, updateInvoiceStatus } from '../services/billService';

const ESTADOS_FILTRO: SelectOption[] = [
  { label: 'Todos los estados', value: 'TODOS' },
  { label: 'Borrador', value: 'BORRADOR' },
  { label: 'Enviado', value: 'ENVIADO' },
  { label: 'Aprobado', value: 'APROBADO' },
  { label: 'Rechazado', value: 'RECHAZADO' },
  { label: 'Vencido', value: 'VENCIDO' },
];

const ESTADOS_FACTURA: SelectOption[] = [
  { label: 'Borrador', value: 'BORRADOR' },
  { label: 'Enviado', value: 'ENVIADO' },
  { label: 'Aprobado', value: 'APROBADO' },
  { label: 'Rechazado', value: 'RECHAZADO' },
  { label: 'Vencido', value: 'VENCIDO' },
];

export default function DashboardHome() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({ cobradoMes: 0, pendientePago: 0, facturasEmitidas: 0 });
  const [invoices, setInvoices] = useState<any[]>([]);
  
  // Estados para paginación y filtros
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Cargar datos al cambiar de página o de filtro
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData(page, 10, selectedStatus);
        setMetrics(data.metrics);
        setInvoices(data.invoices);
        setTotalPages(data.pagination.totalPages);
      } catch (err: any) {
        console.error('Error al cargar información:', err);
        setError(err.message || 'No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [page, selectedStatus]);

  // Manejar cambio de estado de una factura
  const handleStatusChange = async (id: string, nuevoEstado: string) => {
    try {
      const responseData = await updateInvoiceStatus(id, nuevoEstado);
      
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === id ? { ...inv, estado: nuevoEstado } : inv))
      );

      if (responseData.metrics) {
        setMetrics(responseData.metrics);
      }
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message}`);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    setIsSidebarOpen(false);
    navigate(`/nueva-factura?plantilla=${templateId}`);
  };

  if (loading && invoices.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Cargando datos del dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h2>Ocurrió un detalle:</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Cabecera Principal */}
      <div style={styles.topHeader}>
        <div>
          <h1 className="title" style={{ margin: 0, fontSize: '24px', color: '#172338' }}>Mis facturas</h1>
          <p className="text" style={{ margin: '4px 0 0 0', color: '#748094' }}>Un vistazo a tu negocio</p>
        </div>
        <Button variant="primary" onClick={() => setIsSidebarOpen(true)}>
          + Nueva factura
        </Button>
      </div>

      {/* Tarjetas de Resumen */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <span className='text'>Cobrado este mes</span>
          <h2 className='title'>$ {metrics.cobradoMes.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div style={styles.card}>
          <span className='text'>Pendiente de pago</span>
          <h2 className='title'>$ {metrics.pendientePago.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div style={styles.card}>
          <span className='text'>Facturas emitidas</span>
          <h2 className='title'>{metrics.facturasEmitidas}</h2>
        </div>
      </div>

      {/* Panel de facturas con Filtro de Estado */}
      <div style={styles.principalPanel}>
        <div style={styles.panelHeaderRow}>
          <div style={styles.headerLabels}>
            <span style={styles.principalPanelText}>FACTURA / CLIENTE</span>
            <span style={styles.principalPanelText}>IMPORTE / ESTADO</span>
          </div>
          
          <div style={{ width: '220px' }}>
            <CustomSelect
              label="Filtrar por estado"
              value={selectedStatus}
              options={ESTADOS_FILTRO}
              onChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Listado de Facturas */}
        <div style={styles.principalPanelParent}>
          {invoices.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '32px 0' }}>
              No se encontraron facturas con este criterio.
            </p>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="invoice-card">
                {/* Lado izquierdo: Folio, Cliente y Acción */}
                <div className="invoice-card-info">
                  <div className="invoice-card-header">
                    <strong style={{ color: '#172338', fontSize: '15px' }}>{inv.folio}</strong>
                    <span style={{ color: '#94A3B8' }}>·</span>
                    <span style={{ color: '#475569', fontSize: '14px', fontWeight: '500', wordBreak: 'break-word' }}>
                      {inv.cliente_nombre || 'Cliente general'}
                    </span>
                  </div>
                  <div>
                    <Button variant="secondaryTiny" onClick={() => navigate(`/editar-factura?id=${inv.id}`)}>
                      Editar factura
                    </Button>
                  </div>
                </div>

                {/* Lado derecho (en móvil pasa abajo como una fila independiente) */}
                <div className="invoice-card-actions">
                  <span className="invoice-amount">
                    ${Number(inv.total).toFixed(2)} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 'normal' }}>{inv.moneda_codigo}</span>
                  </span>
                  <div className="invoice-select-wrapper">
                    <CustomSelect
                      label="Estado"
                      value={inv.estado || 'BORRADOR'}
                      options={ESTADOS_FACTURA}
                      onChange={(newValue) => handleStatusChange(inv.id, newValue)}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controles de Paginación */}
        <div style={styles.paginationContainer}>
          <Button 
            variant="tertiaryTiny" 
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className='text' style={{ fontWeight: '600', color: '#475569' }}>
            Página {page} de {totalPages || 1}
          </span>
          <Button 
            variant="tertiaryTiny" 
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <TemplateSidebar
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    marginBottom: "100px"
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
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
  principalPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "24px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E8EF",
    borderRadius: "12px",
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  panelHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '12px',
  },
  headerLabels: {
    display: "flex",
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '450px',
  },
  principalPanelText: {
    fontSize: "11px",
    color: "#748094",
    lineHeight: "1.5em",
    letterSpacing: "-0.02em",
    fontWeight: "600"
  },
  principalPanelParent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  invoiceCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#FAFAFA",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #F1F5F9',
  }
};