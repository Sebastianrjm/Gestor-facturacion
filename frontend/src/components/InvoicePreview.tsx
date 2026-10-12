import React from 'react';
import "../assets/InvoicePreview.css";

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
    notas: string;
  };
  items: ItemDetalle[];
  monedaPrincipal: string;
  monedaReferencia: string;
  plantillaId: string;
  profileImage: string;
}

export default function InvoicePreview({
  formData,
  items,
  monedaPrincipal,
  monedaReferencia,
  plantillaId,
  profileImage,
}: InvoicePreviewProps) {
  const subtotal = items.reduce(
    (acc, item) => acc + (item.cantidad || 0) * (item.precioUnitario || 0),
    0
  );
  const tasaNumerica = parseFloat(String(formData.tasaCambio)) || 0;
  const totalReferencial = tasaNumerica > 0 ? subtotal * tasaNumerica : 0;

  const templateClass = `template-${(plantillaId || 'moderno').toLowerCase()}`;

  return (
    <div className={`invoice-sheet ${templateClass}`}>
      {/* Cabecera del Documento */}
      <div className="invoice-header">
        <div className="invoice-meta">
          <h2 className="invoice-title">Factura</h2>
          <div className="invoice-bill-description">
            <p>{formData.numeroFactura || 'FAC-2026-025'} · {formData.estadoFactura || 'Borrador'}</p>
          </div>
        </div>
      </div>

      {/* Sección informativa */}
      <div className="invoice-info-section">
        <div className="invoice-image-transmitter">
          {profileImage ? (
            <img src={profileImage} alt="Perfil Emisor" />
          ) : (
            <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>SR</span>
          )}
        </div>

        <div className="invoice-info-texts">
          <p className="invoice-info-text">EMISOR · {formData.emisor || 'Emisor'}</p>
          <p className="invoice-info-text">NOMBRE DEL EMISOR · {formData.nombreUsuario || 'Nombre usuario'}</p>
          <p className="invoice-info-text">CLIENTE · {formData.cliente || 'Nombre del Cliente'}</p>
          <p className="invoice-info-text">EMAIL CLIENTE · {formData.correo || 'correo@empresa.com'}</p>
          <p className="invoice-info-text">Emisión: {formData.fechaEmision || 'YYYY-MM-DD'}</p>
          <p className="invoice-info-text">Vence: {formData.fechaVencimiento || 'YYYY-MM-DD'}</p>
        </div>
      </div>

      {/* Tabla de Conceptos */}
      <table className="invoice-table">
        <thead>
          <tr className="invoice-tr-header">
            <th className="invoice-th">Descripción</th>
            <th className="invoice-th-center">Cant.</th>
            <th className="invoice-th-right">Precio U.</th>
            <th className="invoice-th-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const totalFila = (item.cantidad || 0) * (item.precioUnitario || 0);
            return (
              <tr key={item.id || idx} className="invoice-tr-body">
                <td className="invoice-td">{item.descripcion || 'Descripción del servicio...'}</td>
                <td className="invoice-td-center">{item.cantidad}</td>
                <td className="invoice-td-right">${(item.precioUnitario || 0).toFixed(2)}</td>
                <td className="invoice-td-right-bold">${totalFila.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Sección de Totales y Conversión */}
      <div className="invoice-totals-container">
        <div className="invoice-total-row">
          <span>Subtotal:</span>
          <strong>${subtotal.toFixed(2)} {monedaPrincipal}</strong>
        </div>
        <div className="invoice-total-row-final">
          <span>Total a pagar:</span>
          <strong>${subtotal.toFixed(2)} {monedaPrincipal}</strong>
        </div>

        {totalReferencial > 0 && (
          <div className="invoice-ref-box">
            <span className="invoice-ref-label">Monto Referencial:</span>
            <strong className="invoice-ref-value">
              {totalReferencial.toLocaleString('es-VE', { minimumFractionDigits: 2 })} {monedaReferencia}
            </strong>
          </div>
        )}
      </div>

      {formData.notas && (
        <div className="invoice-notes-section">
          <span className="invoice-notes-label">Notas / Condiciones:</span>
          <p className="invoice-notes-text">{formData.notas}</p>
        </div>
      )}
    </div>
  );
}