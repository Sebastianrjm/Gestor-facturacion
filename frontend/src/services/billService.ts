export interface BillPayload {
  clienteNombre: string;
  clienteCorreo: string;
  clienteFiscal: string;
  clienteDireccion: string;
  clienteTelefono: string;
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

export const getDashboardData = async (page = 1, limit = 10, status = 'TODOS') => {
  const response = await fetch(`http://localhost:5000/api/v1/presupuestos/dashboard?page=${page}&limit=${limit}&status=${status}`, {
    method: 'GET',
    credentials: 'include' // <--- Envía la cookie HttpOnly
  });
  const result = await response.json();
  if (result.status !== 'SUCCESS') throw new Error(result.message);
  return result.data; 
};

export const updateInvoiceStatus = async (id: string, estado: string) => {
  const response = await fetch(`http://localhost:5000/api/v1/presupuestos/${id}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // <--- Envía la cookie HttpOnly
    body: JSON.stringify({ estado })
  });
  const result = await response.json();
  if (!response.ok || result.status !== 'SUCCESS') {
    throw new Error(result.message || 'Error al actualizar estado');
  }
  return result.data; // Retorna { updatedInvoice, metrics }
};

export const saveAndDownloadBill = async (payload: BillPayload) => {
  // 1. Petición POST para guardar de manera persistente en PostgreSQL
  const saveResponse = await fetch('http://localhost:5000/api/v1/presupuestos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // <--- Envía la cookie HttpOnly
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
    method: 'GET',
    credentials: 'include' // <--- Envía la cookie HttpOnly
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

export const getInvoiceById = async (id: string) => {
  const response = await fetch(`http://localhost:5000/api/v1/presupuestos/${id}`, {
    method: 'GET',
    credentials: 'include' // <--- Envía la cookie HttpOnly
  });
  const result = await response.json();
  if (!response.ok || result.status !== 'SUCCESS') {
    throw new Error(result.message || 'Error al obtener los detalles de la factura');
  }
  return result.data; // Retorna { invoice, items }
};