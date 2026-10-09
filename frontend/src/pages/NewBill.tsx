import React from 'react';
import { useSearchParams } from 'react-router-dom';
import InputField from '../components/inputField';
import { useState } from 'react';
import type { SelectOption } from '../components/CustomSelect';
import CustomSelect from '../components/CustomSelect';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';


interface BillFormData {
  cliente: string;
  correo: string;
  numeroFactura: string;
  fechaEmision: string;
  fechaVencimiento: string;
  tasaCambio: number
}


const MONEDA_PRINCIPAL: SelectOption[] = [
  { label: 'USD · Dólar estadounidense', value: 'USD' },
  { label: 'VES · Bolívar', value: 'VES' },
]

const MONEDA_REFERENCIA: SelectOption[] = [
  { label: 'VES · Bolívar', value: 'VES' },
  { label: 'USD · Dólar estadounidense', value: 'USD' },
]

export default function NewBill() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ItemDetalle[]>([
    { id: '1', descripcion: '', cantidad: 1, precioUnitario: 0 },
  ]);
  // Función para agregar un nuevo concepto/fila
  const handleAddItem = () => {
    const newItem: ItemDetalle = {
      id: Date.now().toString(),
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Función para actualizar un campo específico de una fila
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

  // Función para eliminar una fila
  const handleRemoveItem = (id: string) => {
    if (items.length === 1) return; // Evita eliminar la última fila
    setItems((prev) => prev.filter((item) => item.id !== id));
  };
  const [searchParams] = useSearchParams();
  const plantillaId = searchParams.get('plantilla') || 'MODERNO';

  const [formData, setFormData] = useState<BillFormData>({
    cliente: '',
    correo: "",
    numeroFactura: 'FAC-2026-025',
    fechaEmision: new Date().toISOString().split('T')[0], // Fecha de hoy (YYYY-MM-DD)
    fechaVencimiento: '',
    tasaCambio: ""
  });

  const [monedaPrincipal, setMonedaPrincipal1] = useState('USD');
  const [monedaReferencia, setMonedaReferencia1] = useState('VES');

  // 2. Función genérica para actualizar cualquier input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 className='title'>Editar factura</h1>

        <p className='text'>FAC-2026-024 · Borrador · USD</p>
        <h2>Creando factura con diseño: {plantillaId}</h2>
      </div>

      <div style={{display: "flex", gap: "12px", flexDirection: "column"}}>
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
                placeholder="Estudio Prisma"
                required
              />

              <InputField
                label="Correo del cliente"
                type="text"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="EstudioPrisma@estudioprisma.com"
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
                options={MONEDA_PRINCIPAL}
                onChange={(newValue) => setMonedaPrincipal1(newValue)}
              />

              <CustomSelect
                label="Moneda Referencia"
                value={monedaReferencia}
                options={MONEDA_REFERENCIA}
                onChange={(newValue) => setMonedaReferencia1(newValue)}
              />

              <InputField
                label= {`Tasa de cambio · ${monedaReferencia} por 1 ${monedaPrincipal}`}
                type="number"
                name="tasaCambio"
                value={formData.tasaCambio}
                onChange={handleChange}
                placeholder="500.10"
                required
              />
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
              <textarea name="Notas" id="notas" style={styles.textAreaNotes}>

              </textarea>
            </div>

            
          </div>

          <div style={styles.principalPanel}>
            <p>aqui va el formulario</p>
            
          </div>

        </div>

        <div style={{display: "flex", gap: "12px"}}>
          <Button variant="primary" onClick={() => console.log('Descargar factura')}>
            Descargar factura
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
  }
}
