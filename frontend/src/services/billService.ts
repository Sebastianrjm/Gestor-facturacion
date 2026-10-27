import API from "./api";

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
  const response = await API.get(`/presupuestos/dashboard?page=${page}&limit=${limit}&status=${status}`);
  return response.data.data;
};

export const updateInvoiceStatus = async (id: string, estado: string) => {
  const response = await API.patch(`/presupuestos/${id}/estado`, { estado });
  return response.data.data;
};

export const saveAndDownloadBill = async (payload: BillPayload) => {
  // 1. Petición POST para guardar de manera persistente en PostgreSQL
  const saveResponse = await API.post('/presupuestos', payload);
  const saveResult = saveResponse.data;

  const presupuestoId = saveResult.data.id;   // UUID interno de la base de datos
  const folioFactura = saveResult.data.folio; // Ej: FAC-2026-025
  const apiMessage = saveResult.message;      // Capturamos el mensaje exacto de la API

  // 2. Petición GET inmediata para obtener el PDF binario (Blob) compilado por Puppeteer
  const pdfResponse = await API.get(`/presupuestos/${presupuestoId}/pdf`, {
    responseType: 'blob', // Importante para que Axios maneje archivos binarios correctamente
  });

  // 3. Convertir la respuesta en Blob y forzar la descarga en el navegador
  const blob = new Blob([pdfResponse.data]);
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folioFactura}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  window.URL.revokeObjectURL(url);
  
  return {
    folio: folioFactura,
    message: apiMessage
  };
};

export const getInvoiceById = async (id: string) => {
  const response = await API.get(`/presupuestos/${id}`);
  return response.data.data; // Retorna { invoice, items }
};