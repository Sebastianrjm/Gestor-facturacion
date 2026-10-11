import React from 'react';
import "../assets/InvoicePreview.css"

export interface ItemDetalle {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
}

interface InvoicePreviewProps {
  formData: {
    cliente: string;
    correo: string;
    numeroFactura: string;
    fechaEmision: string;
    fechaVencimiento: string;
    tasaCambio: string | number;
    estadoFactura: string;
    emisor: string;
    nombreUsuario: string;
    notas: string
  };
  items: ItemDetalle[];
  monedaPrincipal: string;
  monedaReferencia: string;
  plantillaId: string;
  profileImage?: string;
}

export default function InvoicePreview({
  formData,
  items,
  monedaPrincipal,
  monedaReferencia,
  plantillaId,
  profileImage,
}: InvoicePreviewProps) {
  // Cálculos automáticos en tiempo real
  const subtotal = items.reduce(
    (acc, item) => acc + (item.cantidad || 0) * (item.precioUnitario || 0),
    0
  );
  const tasaNumerica = parseFloat(String(formData.tasaCambio)) || 0;
  const totalReferencial = tasaNumerica > 0 ? subtotal * tasaNumerica : 0;

  // Generamos la clase CSS dinámica basada en la plantilla (ej: 'template-moderno', 'template-minimalista')
  const templateClass = `template-${(plantillaId || 'moderno').toLowerCase()}`;

  return (
    <div className={`invoice-sheet-container ${templateClass}`} style={previewStyles.sheet}>
      {/* Cabecera del Documento */}
        <div style={previewStyles.header}>
            <div style={previewStyles.invoiceMeta}>
                <h2 className='title' >Factura</h2>
                <div className='BillDescription'>
                    <p>
                        {formData.numeroFactura || 'FAC-2026-024'} 
                        ·  
                        {formData.estadoFactura || 'Borrador'} 
                    </p>
                </div>
            </div>
        </div>
        {/* Seccion informativa */}
        <div className="information-section" style={previewStyles.InformationSection}>
            <div className="image-transmitter" style={previewStyles.ImageTransmitter}>
                {profileImage ? (
                    <img 
                    src={profileImage} 
                    alt="Perfil Emisor" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} 
                    />
                ) : (
                    <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>SR</span>
                )}
            </div>

            <div style={previewStyles.InformationSectionTexts}>
                <p style={previewStyles.InformationSectionText}>
                    EMISOR · {formData.emisor || 'Emisor'}
                </p>
                <p style={previewStyles.InformationSectionText}>
                    NOMBRE DEL EMISOR · {formData.nombreUsuario || 'Nombre usuario'}
                </p>
                <p style={previewStyles.InformationSectionText}>
                    CLIENTE · {formData.cliente || 'Nombre del Cliente'}
                </p>
                <p style={previewStyles.InformationSectionText}>
                    EMAIL CLIENTE · {formData.correo || 'correo@empresa.com'}
                </p>
                <p style={previewStyles.InformationSectionText}>
                    Emisión: {formData.fechaEmision || 'YYYY-MM-DD'}
                </p>
                <p style={previewStyles.InformationSectionText}>
                    Vence: {formData.fechaVencimiento || 'YYYY-MM-DD'}
                </p>
            </div>
        </div>

        {/* Tabla de Conceptos */}
        <table style={previewStyles.table}>
            <thead>
            <tr style={previewStyles.trHeader}>
                <th style={previewStyles.th}>Descripción</th>
                <th style={previewStyles.thCenter}>Cant.</th>
                <th style={previewStyles.thRight}>Precio U.</th>
                <th style={previewStyles.thRight}>Total</th>
            </tr>
            </thead>
            <tbody>
            {items.map((item, idx) => {
                const totalFila = (item.cantidad || 0) * (item.precioUnitario || 0);
                return (
                <tr key={item.id || idx} style={previewStyles.trBody}>
                    <td style={previewStyles.td}>
                    {item.descripcion || 'Descripción del servicio...'}
                    </td>
                    <td style={previewStyles.tdCenter}>{item.cantidad}</td>
                    <td style={previewStyles.tdRight}>
                    ${(item.precioUnitario || 0).toFixed(2)}
                    </td>
                    <td style={previewStyles.tdRightBold}>
                    ${totalFila.toFixed(2)}
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>

      {/* Sección de Totales y Conversión */}
      <div style={previewStyles.totalsContainer}>
        <div style={previewStyles.totalRow}>
          <span>Subtotal:</span>
          <strong>
            ${subtotal.toFixed(2)} {monedaPrincipal}
          </strong>
        </div>
        <div style={previewStyles.totalRowFinal}>
          <span>Total a pagar:</span>
          <strong>
            ${subtotal.toFixed(2)} {monedaPrincipal}
          </strong>
        </div>

        {totalReferencial > 0 && (
          <div style={previewStyles.refBox}>
            <span style={previewStyles.refLabel}>Monto Referencial:</span>
            <strong style={previewStyles.refValue}>
              {totalReferencial.toLocaleString('es-VE', {
                minimumFractionDigits: 2,
              })}{' '}
              {monedaReferencia}
            </strong>
          </div>
        )}
      </div>
      {formData.notas && (
        <div style={previewStyles.notesSection}>
            <span style={previewStyles.notesLabel}>Notas / Condiciones:</span>
            <p style={previewStyles.notesText}>{formData.notas}</p>
        </div>
        )}
    </div>
  );
}

const previewStyles: Record<string, React.CSSProperties> = {
  sheet: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    minHeight: '480px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2px solid #F1F5F9',
    paddingBottom: '16px',
  },
  clientTitle: {
    margin: 0,
    fontSize: '16px',
    color: '#0F172A',
    fontWeight: '600',
  },
  clientEmail: {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#64748B',
  },
  invoiceMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
  invoiceNumber: {
    fontSize: '14px',
    color: '#1E293B',
  },
  dateText: {
    fontSize: '11px',
    color: '#64748B',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  trHeader: {
    backgroundColor: '#F8FAFC',
    borderBottom: '1px solid #E2E8F0',
  },
  th: {
    textAlign: 'left',
    padding: '8px 10px',
    color: '#475569',
    fontSize: '12px',
  },
  thCenter: {
    textAlign: 'center',
    padding: '8px 10px',
    color: '#475569',
    fontSize: '12px',
  },
  thRight: {
    textAlign: 'right',
    padding: '8px 10px',
    color: '#475569',
    fontSize: '12px',
  },
  trBody: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '10px',
    color: '#334155',
  },
  tdCenter: {
    padding: '10px',
    textAlign: 'center',
    color: '#334155',
  },
  tdRight: {
    padding: '10px',
    textAlign: 'right',
    color: '#334155',
  },
  tdRightBold: {
    padding: '10px',
    textAlign: 'right',
    color: '#0F172A',
    fontWeight: '600',
  },
  totalsContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: 'auto',
    borderTop: '1px solid #E2E8F0',
    paddingTop: '12px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#475569',
  },
  totalRowFinal: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    color: '#0F172A',
    fontWeight: '700',
  },
  refBox: {
    marginTop: '6px',
    padding: '8px 10px',
    backgroundColor: '#F8FAFC',
    borderRadius: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    alignItems: 'flex-end',
    border: '1px solid #E2E8F0',
  },
  refLabel: {
    fontSize: '11px',
    color: '#64748B',
  },
  refValue: {
    fontSize: '13px',
    color: '#0F172A',
  },
  ImageTransmitter: {
    backgroundColor: "#265CF0",
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    alignContent: "center"
  },
  InformationSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#F4F6FA",
    borderRadius: "8px"
  },
  InformationSectionTexts: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  InformationSectionText: {
    color: "#172338",
    fontSize: "14px",
    fontStyle: "italic",
    fontWeight: "300",
    letterSpacing: "-0.02em",
    lineHeight: "1.5em",
  },
    notesSection: {
    marginTop: 'auto',
    borderTop: '1px dashed #E2E8F0',
    paddingTop: '12px',
  },
    notesLabel: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '700',
    display: 'block',
    marginBottom: '4px',
  },
    notesText: {
    fontSize: '12px',
    color: '#334155',
    margin: 0,
    whiteSpace: 'pre-wrap', 
  },
};