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
}

export default function NewBill() {
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
    tasaCambio: '',
    notas: '',
    estadoFactura: "",
    aplicaImpuesto: false,
    impuestoPorcentaje: 16,
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
        const token = localStorage.getItem('token');

        if (isEditing && invoiceId) {
          // --- MODO EDICIÓN: Traer datos de la factura existente ---
          const response = await fetch(`http://localhost:5000/api/v1/presupuestos/${invoiceId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();

          if (result.status === 'SUCCESS') {
            const { invoice, items: fetchedItems } = result.data;
            setFormData({
              cliente: invoice.cliente_nombre || '',
              correo: invoice.cliente_correo || '',
              numeroFactura: invoice.folio || '',
              fechaEmision: invoice.fecha_emision ? invoice.fecha_emision.split('T')[0] : '',
              fechaVencimiento: invoice.fecha_vencimiento ? invoice.fecha_vencimiento.split('T')[0] : '',
              tasaCambio: invoice.tasa_cambio_aplicada || 1.0000,
              notas: invoice.notas_comerciales || '',
              estadoFactura: invoice.estado || 'BORRADOR',
              aplicaImpuesto: Boolean(invoice.aplica_impuesto),
              impuestoPorcentaje: invoice.impuesto_porcentaje ?? 16,
            });
            setMonedaPrincipal(invoice.moneda_codigo || 'USD');
            setProfileImage(invoice.logo_url);
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
          const response = await fetch('http://localhost:5000/api/v1/presupuestos/nuevo', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await response.json();
          
          if (result.status === 'SUCCESS') {
            setFormData(prev => ({
              ...prev,
              numeroFactura: result.data.numeroFactura,
              estadoFactura: result.data.estadoFactura,
              emisor: result.data.emisor,
              nombreUsuario: result.data.nombreUsuario,
            }));
            setProfileImage(result.data.profileImage);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos de la factura:', error);
      }
    };

    fetchInitialData();
  }, [isEditing, invoiceId]);

  // fetch monedas

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/v1/presupuestos/divisas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        
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

      const folioGenerado = await saveAndDownloadBill({
        clienteNombre: formData.cliente,
        clienteCorreo: formData.correo,
        folio: formData.numeroFactura,
        monedaCodigo: monedaPrincipal,
        tasaCambioAplicada: Number(formData.tasaCambio) || 1.0000,
        subtotal: subtotal,
        total: total,
        plantillaId: plantillaId,
        fechaEmision: formData.fechaEmision,
        fechaVencimiento: formData.fechaVencimiento,
        notasComerciales: formData.notas,
        aplicaImpuesto: formData.aplicaImpuesto,
        monedaReferencia: monedaReferencia,               
        impuestoPorcentaje: Number(formData.impuestoPorcentaje) || 0, 
        items: items
      });

      console.log(`Factura ${folioGenerado} procesada con éxito`);
      

    } catch (error: any) {
      console.error('Error en el proceso:', error);
      alert(`Hubo un problema: ${error.message}`);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 className='title'>Editar factura</h1>

        <p className='text'>{formData.numeroFactura} · {formData.estadoFactura}</p>
      </div>

      <div style={{display: "flex", gap: "12px", flexDirection: "column", marginTop: "24px"}}>
        <div style={styles.Separator}>
          <div style={styles.principalPanel}>
            <h2 style={styles.h2Separator}>01   Cliente y fechas</h2>
            
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

            <div style={styles.moneyPanel}>
              <h2 style={styles.h2Separator}>02   Monedas de la factura</h2>
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

            <h2 style={styles.h2Separator}>03   Concepto de la factura</h2>
            <div style={styles.conceptPanel}>
              {items.map((item, index) => {
                // Cálculo automático del total por fila
                const totalFila = (item.cantidad || 0) * (item.precioUnitario || 0);

                return (
                  <div key={item.id} style={styles.itemRow}>
                    {/* Descripción del ítem */}
                    <div style={{ flex: 3, width: "100%" }}>
                      <InputField
                        label={`Ítem ${index + 1} - Descripción`}
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

                    {/* Cantidad */}
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

                    {/* Precio Unitario */}
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
                      {/* Total calculado de la fila */}
                      <div style={styles.totalRowContainer}>
                        <span style={styles.totalRowLabel}>Monto</span>
                        <span style={styles.totalRowValue}>${totalFila.toFixed(2)}</span>
                      </div>

                      {/* Botón Eliminar fila (se oculta si solo hay 1) */}
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

              {/* Botón para añadir una nueva fila */}
              <div style={{ marginTop: '8px' }}>
                <Button variant="secondaryTiny" onClick={handleAddItem}>
                  + Añadir fila
                </Button>
              </div>
            </div>

            <div style={styles.notesPanel}>
              <h2 style={styles.h2Separator}>04   Notas</h2>
              <textarea 
                name="notas" 
                id="notas" 
                style={styles.textAreaNotes}
                onChange={handleChange} 
                placeholder="Condiciones de pago, datos bancarios..."
                value={formData.notas}>
              </textarea>
            </div>

            
          </div>

          <div style={styles.principalPanel}>
            <h2 style={styles.h2Separator}>Vista Previa en Vivo</h2>
            <span style={styles.badge}>{plantillaId}</span>
            <InvoicePreview
              formData={formData}
              items={items}
              monedaPrincipal={monedaPrincipal}
              monedaReferencia={monedaReferencia}
              plantillaId={plantillaId}
              profileImage={profileImage}
            />
          </div>

        </div>

        <div style={{display: "flex", gap: "12px"}}>
          <Button variant="primary" onClick={handleSaveAndDownload}>
            Guardar y descargar PDF
          </Button>

          <Button variant="secondary" variant="secondary" 
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
    justifyContent: "space-between"
  },
  principalPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "24px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E8EF",
    borderRadius: "12px",
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    width: "49%",
    height: "fit-content"
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
