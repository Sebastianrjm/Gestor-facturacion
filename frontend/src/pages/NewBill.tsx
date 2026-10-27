import React from 'react';
import { useSearchParams } from 'react-router-dom';
import InputField from '../components/inputField';
import { useState, useEffect } from 'react';
import type { SelectOption } from '../components/CustomSelect';
import CustomSelect from '../components/CustomSelect';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import InvoicePreview, {  type ItemDetalle } from '../components/InvoicePreview';
import { saveAndDownloadBill } from '../services/billService';
import API from '../services/api';
import '../assets/NewBill.css';
import { useNotification } from '../context/NotificationContext';


interface BillFormData {
  cliente: string;
  correo: string;
  numeroFactura: string;
  fechaEmision: string;
  fechaVencimiento: string;
  tasaCambio: number;
  notas: string,
  estadoFactura?: string;
  aplicaImpuesto: boolean;
  impuestoPorcentaje: number | string;
  numeroFiscal: string;
  direccionCliente: string;
  numeroCliente: string;
  emisor: string;
  nombreUsuario: string;
  apellidoUsuario: string;
  numTelefono: string;
  direccionEmisor: string
}

export default function NewBill() {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plantillaId, setPlantillaId] = useState<string>(
    searchParams.get('plantilla') || 'MODERNO'
  );
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [presupuestoId, setPresupuestoId] = useState<string | null>(null);
  const invoiceId = searchParams.get('id'); 
  const isEditing = Boolean(invoiceId);

  const [formData, setFormData] = useState<BillFormData>({
    cliente: '',
    correo: '',
    numeroFactura: 'FAC-2026-025',
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento: '',
    tasaCambio: 1,
    notas: '',
    estadoFactura: "",
    aplicaImpuesto: false,
    impuestoPorcentaje: 16,
    numeroFiscal: '',
    direccionCliente: '',
    numeroCliente: "+",
    emisor: '',
    nombreUsuario: '',
    apellidoUsuario: '',
    numTelefono: '',
    direccionEmisor: ''
  });

  const [monedaPrincipal, setMonedaPrincipal] = useState('USD');
  const [monedaReferencia, setMonedaReferencia] = useState('VES');

  // Estado para las divisas que vienen de la API (con un respaldo inicial por seguridad)
  const [monedasDisponibles, setMonedasDisponibles] = useState<SelectOption[]>([
    { label: 'USD · Dólar estadounidense', value: 'USD' },
    { label: 'VES · Bolívar', value: 'VES' }
  ]);

  const [items, setItems] = useState<ItemDetalle[]>([
    { id: '1', descripcion: '', cantidad: 1, precioUnitario: 0 },
  ]);

  const handleAddItem = () => {
    const newItem: ItemDetalle = {
      id: Date.now().toString(),
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleItemChange = (
    id: string,
    field: keyof ItemDetalle,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      aplicaImpuesto: checked,
    }));
  };

  // fetch data inicial al entrar

  useEffect(() => {
    const fetchInitialData = async () => {
      try {

        if (isEditing && invoiceId) {
          // --- MODO EDICIÓN: Traer datos de la factura existente ---
          const response = await API.get(`/presupuestos/${invoiceId}`);
          const result = response.data;

          if (result.status === 'SUCCESS') {
            const { invoice, items: fetchedItems } = result.data;
            setFormData({
              cliente: invoice.cliente_nombre || '',
              correo: invoice.cliente_correo || '',
              numeroFiscal: invoice.cliente_rif || '',          
              direccionCliente: invoice.cliente_direccion || '',
              numeroCliente: invoice.cliente_telefono || '',
              numeroFactura: invoice.folio || '',
              fechaEmision: invoice.fecha_emision ? invoice.fecha_emision.split('T')[0] : '',
              fechaVencimiento: invoice.fecha_vencimiento ? invoice.fecha_vencimiento.split('T')[0] : '',
              tasaCambio: invoice.tasa_cambio_aplicada || 1.0000,
              notas: invoice.notas_comerciales || '',
              estadoFactura: invoice.estado || 'BORRADOR',
              aplicaImpuesto: Boolean(invoice.aplica_impuesto),
              impuestoPorcentaje: invoice.impuesto_porcentaje ?? 16,
              emisor: invoice.emisor,
              nombreUsuario: invoice.nombreUsuario,
              apellidoUsuario: invoice.apellidoUsuario,
              numTelefono: invoice.telefonoEmisor,
              direccionEmisor: invoice.direccionEmisor
            });
            setMonedaPrincipal(invoice.moneda_codigo || 'USD');
            setProfileImage(invoice.profileImage);
           if (invoice.plantilla_id) {
              setPlantillaId(invoice.plantilla_id);
            }


            if (fetchedItems && fetchedItems.length > 0) {
              setItems(fetchedItems.map((item: any, idx: number) => ({
                id: item.id || idx.toString(),
                descripcion: item.descripcion,
                cantidad: Number(item.cantidad) || 1,
                precioUnitario: Number(item.precioUnitario) || 0
              })));
            }
          }
        } else {
          // --- MODO CREACIÓN: Inicializar nueva factura ---
          const response = await API.get(`/presupuestos/nuevo`);
          const result = response.data;
          
          if (result.status === 'SUCCESS') {
            setFormData(prev => ({
              ...prev,
              numeroFactura: result.data.numeroFactura,
              estadoFactura: result.data.estadoFactura,
              emisor: result.data.emisor,
              nombreUsuario: result.data.nombreUsuario,
              apellidoUsuario: result.data.apellidoUsuario,
              notas: result.data.notasDefecto,
              direccionEmisor: result.data.direccionEmisor,
              numTelefono: result.data.telefonoEmisor
            }));
            setProfileImage(result.data.profileImage);
          }
        }
      } catch (error: any) {
        console.error('Error al cargar datos de la factura:', error);
        showNotification(error, "error")
      }
    };

    fetchInitialData();
  }, [isEditing, invoiceId]);

  // fetch monedas

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await API.get(`/presupuestos/divisas`);
        const result = response.data;
        
        if (result.status === 'SUCCESS' && Array.isArray(result.data)) {
          // Mapeamos los datos de la BD al formato que requiere CustomSelect ({ label, value })
          const formattedCurrencies: SelectOption[] = result.data.map((moneda: any) => ({
            label: `${moneda.codigo} · ${moneda.nombre}`,
            value: moneda.codigo
          }));
          
          setMonedasDisponibles(formattedCurrencies);
        }
      } catch (error) {
        console.error('Error al cargar datos de las divisas:', error);
      }
    };

    fetchCurrencies();
  }, []);

  const calcularTotales = () => {
    const subtotal = items.reduce((acc, item) => acc + ((item.cantidad || 0) * (item.precioUnitario || 0)), 0);
    const porcentaje = formData.aplicaImpuesto ? (Number(formData.impuestoPorcentaje) || 0) : 0;
    const montoImpuesto = (subtotal * porcentaje) / 100;
    const total = subtotal + montoImpuesto;

    return { subtotal, montoImpuesto, total };
  };

  // fetch para guardar 

  const handleSaveAndDownload = async () => {
    try {
      const { subtotal, total } = calcularTotales();

      showNotification("Se esta creando el pdf", "info");

      const response = await saveAndDownloadBill({
        clienteNombre: formData.cliente,
        clienteCorreo: formData.correo,
        clienteFiscal: formData.numeroFiscal,         
        clienteDireccion: formData.direccionCliente,  
        clienteTelefono: formData.numeroCliente,
        folio: formData.numeroFactura,
        monedaCodigo: monedaPrincipal,
        tasaCambioAplicada: Number(formData.tasaCambio) || 1.0000,
        subtotal: subtotal,
        total: total,
        plantillaId: plantillaId,
        fechaEmision: formData.fechaEmision,
        fechaVencimiento: formData.fechaVencimiento,
        notasComerciales: formData.notas,
        //aplicaImpuesto: formData.aplicaImpuesto,
        monedaReferencia: monedaReferencia,             
        impuestoPorcentaje: Number(formData.impuestoPorcentaje) || 0, 
        items: items,
      }as any);

      console.log(`Factura ${response.folio} procesada con éxito`);
      showNotification(response.message, "success");

    } catch (error: any) {
      console.error('Error en el proceso:', error);
      showNotification(error.message, "error");
    }
  };

  // Funciones relacionadas al acordion
  const [openSections, setOpenSections] = useState({
    client: true,
    money: true,
    concept: true,
    notes: true,
  });

  // Función para alternar el estado de una sección
  const toggleSection = (section: 'client' | 'money' | 'concept' | 'notes') => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 className='title'>Editar factura</h1>

        <p className='text'>{formData.numeroFactura} · {formData.estadoFactura}</p>
      </div>

      <div style={{display: "flex", gap: "12px", flexDirection: "column", marginTop: "24px"}}>
        <div className="new-bill-separator">
          
          {/* Formulario (Panel 1) */}
          <div style={styles.principalPanel1} className="panel-form">
            <h2 
              style={{ ...styles.h2Separator, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
              onClick={() => toggleSection('client')}
            >
              <span>01 Cliente y fechas</span>
              <span style={{ fontSize: '14px', color: '#748094' }}>
                {openSections.client ? '▲' : '▼'}
              </span>
            </h2>
            
            {openSections.client && (
              <div style={styles.inputPanel}>
                <InputField
                  label="Cliente"
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  placeholder="Nombre del cliente"
                  required
                />

                <InputField
                  label="Correo del cliente"
                  type="text"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  placeholder="cliente@cliente.com"
                  required
                />

                <InputField
                  label="Numero fiscal del cliente"
                  type="text"
                  name="numeroFiscal"
                  value={formData.numeroFiscal}
                  onChange={handleChange}
                  placeholder="J-12345678"
                  required
                />

                <InputField
                  label="Direccion del cliente"
                  type="text"
                  name="direccionCliente"
                  value={formData.direccionCliente}
                  onChange={handleChange}
                  placeholder="Calle 1, avenida 2"
                  required
                />

                <InputField
                  label="Número del cliente"
                  type="text"
                  name="numeroCliente"
                  value={formData.numeroCliente}
                  onChange={handleChange}
                  placeholder="+58 424-12345678"
                  required
                />

                <InputField
                  label="Fecha Emision"
                  type="date"
                  name="fechaEmision"
                  value={formData.fechaEmision}
                  onChange={handleChange}
                  placeholder="2026-10-09"
                  required
                />

                <InputField
                  label="Fecha Vencimiento"
                  type="date"
                  name="fechaVencimiento"
                  value={formData.fechaVencimiento}
                  onChange={handleChange}
                  placeholder="2026-10-09"
                  required
                />
              </div>
            )}

            <h2 
              style={{ ...styles.h2Separator, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', marginTop: '24px' }}
              onClick={() => toggleSection('money')}
            >
              <span>02 Monedas de la factura</span>
              <span style={{ fontSize: '14px', color: '#748094' }}>
                {openSections.money ? '▲' : '▼'}
              </span>
            </h2>

            {openSections.money && (
              <div style={styles.moneyPanel}>
              <CustomSelect
                label="Moneda Principal"
                value={monedaPrincipal}
                options={monedasDisponibles}
                onChange={(newValue) => setMonedaPrincipal(newValue)}
              />

              <CustomSelect
                label="Moneda Referencia"
                value={monedaReferencia}
                options={monedasDisponibles}
                onChange={(newValue) => setMonedaReferencia(newValue)}
              />

              <InputField
                label= {`Tasa de cambio · ${monedaReferencia} por 1 ${monedaPrincipal}`}
                type="number"
                name="tasaCambio"
                value={formData.tasaCambio}
                onChange={handleChange}
                placeholder="1"
                required
              />

              {/* Checkbox conectado al formData */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="aplicaImpuesto"
                  name="aplicaImpuesto"
                  checked={formData.aplicaImpuesto}
                  onChange={handleCheckboxChange}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="aplicaImpuesto" style={{ fontSize: '13px', color: '#172338', fontWeight: '500', cursor: 'pointer' }}>
                  Aplicar impuesto (%)
                </label>
              </div>

              {/* Input condicional conectado al formData */}
              {formData.aplicaImpuesto && (
                <InputField
                  label="Porcentaje de impuesto"
                  type="number"
                  name="impuestoPorcentaje"
                  value={formData.impuestoPorcentaje}
                  onChange={handleChange}
                  placeholder="16"
                  required
                />
              )}
              </div>
            )}

            <h2 
              style={{ ...styles.h2Separator, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', marginTop: '24px' }}
              onClick={() => toggleSection('concept')}
            >
              <span>03 Concepto de la factura</span>
              <span style={{ fontSize: '14px', color: '#748094' }}>
                {openSections.concept ? '▲' : '▼'}
              </span>
            </h2>

            {openSections.concept && (
              <div style={styles.conceptPanel}>
                {items.map((item, index) => {
                  const totalFila = (item.cantidad || 0) * (item.precioUnitario || 0);

                  return (
                    <div key={item.id} style={styles.itemRow}>
                      <div style={{ flex: 3, width: "100%" }}>
                        <InputField
                          label={`Ítem ${index + 1} Descripción`}
                          type="text"
                          name="descripcion"
                          value={item.descripcion}
                          onChange={(e) =>
                            handleItemChange(item.id, 'descripcion', e.target.value)
                          }
                          placeholder="Ej: Desarrollo de API Backend"
                          required
                        />
                      </div>

                      <div style={{ flex: 1, width: "100%" }}>
                        <InputField
                          label="Cantidad"
                          type="number"
                          name="cantidad"
                          value={item.cantidad}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'cantidad',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          required
                        />
                      </div>

                      <div style={{ flex: 1.5, width: "100%" }}>
                        <InputField
                          label="Precio Unitario"
                          type="number"
                          name="precioUnitario"
                          value={item.precioUnitario}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              'precioUnitario',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0.00"
                          required
                        />
                      </div>
                      
                      <div style={{display: "flex", gap: "12px"}}>
                        <div style={styles.totalRowContainer}>
                          <span style={styles.totalRowLabel}>Monto</span>
                          <span style={styles.totalRowValue}>${totalFila.toFixed(2)}</span>
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            style={styles.deleteButton}
                            title="Eliminar fila"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: '8px' }}>
                  <Button variant="secondaryTiny" onClick={handleAddItem}>
                    + Añadir fila
                  </Button>
                </div>
              </div>
            )}

            <div style={styles.notesPanel}>
              <h2 
                style={{ ...styles.h2Separator, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', marginTop: '24px' }}
                onClick={() => toggleSection('notes')}
              >
                <span>04 Notas</span>
                <span style={{ fontSize: '14px', color: '#748094' }}>
                  {openSections.notes ? '▲' : '▼'}
                </span>
              </h2>

              {openSections.notes && (
                <textarea 
                  name="notas" 
                  id="notas" 
                  style={styles.textAreaNotes}
                  onChange={handleChange} 
                  placeholder="Condiciones de pago, datos bancarios..."
                  value={formData.notas}>
                </textarea>
              )}
            </div>
          </div>

          {/* Vista Previa / Factura (Panel 2 - Aparece primero en móvil gracias a flex-direction: column-reverse) */}
          <div style={styles.principalPanel2} className="panel-preview">
            <h2 style={styles.h2Separator}>Vista Previa en Vivo</h2>
            <span style={styles.badge}>{plantillaId}</span>
            <InvoicePreview
              formData={{
                ...formData,
                estadoFactura: formData.estadoFactura || ''
              } as any} 
              items={items}
              monedaPrincipal={monedaPrincipal}
              monedaReferencia={monedaReferencia}
              plantillaId={plantillaId}
              profileImage={profileImage || ''}
            />
          </div>

        </div>

        <div style={{display: "flex", gap: "12px"}}>
          <Button variant="primary" onClick={handleSaveAndDownload} className="button-correction">
            Descargar PDF
          </Button>

          <Button variant="tertiaryTiny" className="button-correction"
            onClick={() => navigate('/dashboard')}
          >
            Volver a mis facturas
          </Button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  Separator: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: 'flex-start',
  },
  principalPanel1: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "24px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E8EF",
    borderRadius: "12px",
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    width: "43%",
    height: "fit-content"
  },
  principalPanel2: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "24px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E8EF",
    borderRadius: "12px",
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    width: "54%",
    height: "fit-content",
    maxHeight: 'calc(100vh - 40px)', 
    overflowY: 'auto',                
    overflowX: 'hidden',              
    position: 'sticky',               
    top: '24px',
  },
  h2Separator: {
    fontFamily: "inter",
    fontSize: "14px",
    color: "#172338",
    letterSpacing: "-0.02em",
    lineHeight: "1.5em",
    fontWeight: "600"
  },
  inputPanel: {
    gap: "16px"
  },
  moneyPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#EDF2FF",
    borderRadius: "8px"
  },
  conceptPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    borderRadius: "8px",
    backgroundColor: "#F4F6FA"
  },
  itemRow: {
    display: 'flex',
    flexDirection: "column",
    alignItems: 'flex-start',
    padding: '12px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  totalRowContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: '90px',
    paddingBottom: '8px',
  },
  totalRowLabel: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '500',
  },
  totalRowValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0F172A',
  },
  deleteButton: {
    border: 'none',
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
    borderRadius: '6px',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  textAreaNotes: {
    width: "100%",
    minHeight: "110px",
    borderRadius: "8px",
    padding: "12px",
    border: "1px solid #DCE2EC"
  },
  badge: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
    width: "fit-content"
  },
}
