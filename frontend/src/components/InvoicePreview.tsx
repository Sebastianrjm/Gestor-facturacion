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
    apellidoUsuario: string;
    notas: string;
    aplicaImpuesto: string;
    impuestoPorcentaje: number;
    numeroFiscal: string;
    direccionCliente: string;
    numeroCliente: string;
    numTelefono: string;
    direccionEmisor: string
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

  // 1. Cálculos de totales
  const subtotal = items.reduce((acc, item) => acc + ((item.cantidad || 0) * (item.precioUnitario || 0)), 0);
  const porcentajeImpuesto = formData.aplicaImpuesto ? (Number(formData.impuestoPorcentaje) || 0) : 0;
  const montoImpuesto = (subtotal * porcentajeImpuesto) / 100;
  const totalPagar = subtotal + montoImpuesto;

  // Para el cálculo referencial (si usas tasa de cambio)
  const tasaNumerica = Number(formData.tasaCambio) || 0;
  const totalReferencial = tasaNumerica > 0 ? totalPagar * tasaNumerica : 0;

  const templateClass = `template-${(plantillaId || 'moderno').toLowerCase()}`;

  const getInitials = () => {
    const firstN = formData.nombreUsuario ? formData.nombreUsuario.trim().charAt(0) : '';
    const firstA = formData.apellidoUsuario ? formData.apellidoUsuario.trim().charAt(0) : '';
    const initials = `${firstN}${firstA}`.toUpperCase();
    return initials || 'US';
  };

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
        {/* Contenedor Izquierdo: Textos del Emisor y Cliente */}
        <div className="invoice-info-texts">
          <div className="invoice-info-group">
            <strong>Datos del emisor:</strong>
            <p className="invoice-info-text">EMISOR · {formData.emisor || 'Emisor'}</p>
            <p className="invoice-info-text">NOMBRE DEL EMISOR · {formData.nombreUsuario || 'Nombre usuario'} {formData.apellidoUsuario || 'apellido usuario'}</p>
            <p className="invoice-info-text">TELÉFONO DE CONTACTO · {formData.numTelefono || 'Telefono Emisor'}</p>
            <p className="invoice-info-text">DIRECCIÓN · {formData.direccionEmisor || 'Direccion emisor'}</p>
          </div>

          <div className="invoice-info-group-client">
            <strong>Datos del cliente:</strong>
            <p className="invoice-info-text">CLIENTE · {formData.cliente || 'Nombre del Cliente'}</p>
            <p className="invoice-info-text">EMAIL DEL CLIENTE · {formData.correo || 'correo@empresa.com'}</p>
            <p className="invoice-info-text">NÚMERO FISCAL · {formData.numeroFiscal || 'J-12345678'}</p>
            <p className="invoice-info-text">DIRECCIÓN DEL CLIENTE · {formData.direccionCliente || 'Calle 1'}</p>
            <p className="invoice-info-text">NÚMERO DEL CLIENTE · {formData.numeroCliente || '+58 424-12345678'}</p>
            <p className="invoice-info-text">Emisión: {formData.fechaEmision || 'YYYY-MM-DD'}</p>
            <p className="invoice-info-text">Vence: {formData.fechaVencimiento || 'YYYY-MM-DD'}</p>
          </div>
        </div>

        {/* Contenedor Derecho: Logo del Emisor */}
        <div className="invoice-image-band">
          <div className="invoice-image-transmitter">
            {profileImage ? (
              <img src={profileImage} alt="Perfil Emisor" />
            ) : (
              <span className="invoice-avatar-initials">{getInitials()}</span>
            )}
          </div>
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
            const cantidadNum = Number(item.cantidad) || 0;
            const precioNum = Number(item.precioUnitario) || 0;
            const totalFila = cantidadNum * precioNum;
            
            return (
              <tr key={item.id || idx} className="invoice-tr-body">
                <td className="invoice-td">{item.descripcion || 'Descripción del servicio...'}</td>
                <td className="invoice-td-center">{cantidadNum}</td>
                <td className="invoice-td-right">${precioNum.toFixed(2)}</td>
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

        {montoImpuesto > 0 && (
          <div className="invoice-total-row">
            <span>Impuesto ({porcentajeImpuesto}%):</span>
            <strong>${montoImpuesto.toFixed(2)} {monedaPrincipal}</strong>
          </div>
        )}

        <div className="invoice-total-row">
          <span>Tasa aplicada:</span>
          <strong>{formData.tasaCambio} {monedaReferencia}</strong>
        </div>

        <div className="invoice-total-row-final">
          <span>Total a pagar:</span>
          <strong>${totalPagar.toFixed(2)} {monedaPrincipal}</strong>
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
        <div className="invoice-notes-section mg-b100">
          <span className="invoice-notes-label">Notas / Condiciones:</span>
          <p className="invoice-notes-text">{formData.notas}</p>
        </div>
      )}
    </div>
  );
}
