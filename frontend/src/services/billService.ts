export interface BillPayload {
  clienteNombre: string;
  clienteCorreo: string;
  folio: string;
  monedaCodigo: string;
  tasaCambioAplicada: number;
  subtotal: number;
  total: number;
  plantillaId: string;
  fechaEmision: string;
  fechaVencimiento: string;
  notasComerciales: string;
  items: Array<{
    descripcion: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export const saveAndDownloadBill = async (payload: BillPayload) => {
  const token = localStorage.getItem('token');

  // 1. Petición POST para guardar de manera persistente en PostgreSQL
  const saveResponse = await fetch('http://localhost:5000/api/v1/presupuestos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const saveResult = await saveResponse.json();
  
  if (!saveResponse.ok || saveResult.status !== 'SUCCESS') {
    throw new Error(saveResult.message || 'Error al guardar la factura');
  }

  const presupuestoId = saveResult.data.id;   // UUID interno de la base de datos
  const folioFactura = saveResult.data.folio; // Ej: FAC-2026-025

  // 2. Petición GET inmediata para obtener el PDF binario (Blob) compilado por Puppeteer
  const pdfResponse = await fetch(`http://localhost:5000/api/v1/presupuestos/${presupuestoId}/pdf`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!pdfResponse.ok) {
    throw new Error('La factura se guardó correctamente, pero falló la generación del PDF.');
  }

  // 3. Convertir la respuesta en Blob y forzar la descarga en el navegador
  const blob = await pdfResponse.blob();
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folioFactura}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  window.URL.revokeObjectURL(url);
  
  return folioFactura;
};