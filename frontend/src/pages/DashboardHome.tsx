import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import '../App.css';
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
    <div style={styles.header}>
      <div style={styles.header}> 
        <h1 className="title">Mis facturas</h1>
        <p className="text">Un vistazo a tu negocio</p>
        <Button variant="primary" onClick={() => setIsSidebarOpen(true)}>
          Nueva factura
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: "flex", gap: "100px" }}>
            <p style={styles.principalPanelText}>FACTURA / CLIENTE</p>
            <p style={styles.principalPanelText}>IMPORTE / ESTADO</p>
          </div>
          
          {/* Selector de filtro por estado */}
          <div style={{ width: '200px' }}>
            <CustomSelect
              label="Filtrar por estado"
              value={selectedStatus}
              options={ESTADOS_FILTRO}
              onChange={(val) => {
                setSelectedStatus(val);
                setPage(1); // Reiniciar a la página 1 al filtrar
              }}
            />
          </div>
        </div>

        {/* Listado de Facturas */}
        <div style={styles.principalPanelParent}>
          {invoices.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
              No se encontraron facturas con este criterio.
            </p>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} style={styles.principalPanelChild}>
                <div style={{ gap: "16px", display: "flex", flexDirection: "column" }}>
                  <p className='text'><strong>{inv.folio}</strong> · {inv.cliente_nombre || 'Cliente general'}</p>
                  <Button variant="secondaryTiny" onClick={() => navigate(`/editar-factura?id=${inv.id}`)}>
                    Editar factura
                  </Button>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ marginRight: "20px" }} className='text'>
                    ${Number(inv.total).toFixed(2)} {inv.moneda_codigo}
                  </p>
                  <CustomSelect
                    label="Estado"
                    value={inv.estado || 'BORRADOR'}
                    options={ESTADOS_FACTURA}
                    onChange={(newValue) => handleStatusChange(inv.id, newValue)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controles de Paginación */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
          <Button 
            variant="tertiaryTiny" 
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className='text' style={{ fontWeight: '600' }}>
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