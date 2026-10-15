import React, { useState, useEffect, useRef } from 'react';
import InputField from '../components/inputField';
import { Button } from '../components/Button';
import '../App.css';

interface ProfileFormData {
  nombres: string;
  apellidos: string;
  correo: string;
  nombreEmpresa: string;
  numeroFiscal: string;
  direccionEmpresa: string;
  numeroEmpresa: string;
  notasDefecto: string;
  contrasenaActual: string;
  nuevaContrasena: string;
  confirNuevaContrasena: string;
  profileImage: string;
}

export default function MyProfile() {
  const [formData, setFormData] = useState<ProfileFormData>({
    nombres: '',
    apellidos: '',
    correo: '',
    nombreEmpresa: 'Empresa C.A.',
    numeroFiscal: 'J-12345678-9',
    direccionEmpresa: '',
    numeroEmpresa: '',
    notasDefecto: '',
    contrasenaActual: '',
    nuevaContrasena: '',
    confirNuevaContrasena: '',
    profileImage: ""
  });

  const [profileImage, setprofileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos reales del perfil al montar el componente
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/v1/auth/perfil', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.status === 'SUCCESS' && result.data) {
          const { usuario, emisor } = result.data;
          setFormData(prev => ({
            ...prev,
            nombres: usuario.nombre || '',
            apellidos: usuario.apellido || '',
            correo: usuario.email || '',
            nombreEmpresa: emisor.razon_social || '',
            numeroFiscal: emisor.identificacion_fiscal || '',
            direccionEmpresa: emisor.direccion || '',
            numeroEmpresa: emisor.telefono || '',
            notasDefecto: emisor.condiciones_defecto || ''
          }));
          if (emisor.logo_url) {
            setprofileImage(emisor.logo_url);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejo de la selección de archivos para el logo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert('El archivo es demasiado pesado. Debe ser menor a 1 Megabyte.');
        return;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert('Solo se admiten formatos PNG o JPG.');
        return;
      }
      setprofileImage(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/auth/actualizar-perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          correo: formData.correo,
          direccionEmpresa: formData.direccionEmpresa,
          numeroEmpresa: formData.numeroEmpresa,
          notasDefecto: formData.notasDefecto
        })
      });

      const result = await response.json();

      if (result.status === 'SUCCESS') {
        alert('Perfil actualizado correctamente.');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error al guardar el perfil:', error);
      alert('Error al conectar con el servidor.');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Actualizando contraseña...");
    alert("Contraseña actualizada correctamente");
  };

  // Obtener la primera letra del nombre y apellido de forma dinámica
  const getInitials = () => {
    const firstN = formData.nombres ? formData.nombres.trim().charAt(0) : '';
    const firstA = formData.apellidos ? formData.apellidos.trim().charAt(0) : '';
    const initials = `${firstN}${firstA}`.toUpperCase();
    return initials || 'US';
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 className='title'>Mi perfil</h1>
        <p className='text'>Configura los datos del emisor que aparecerán en tus facturas.</p>
      </div>

      <div style={styles.Separator}>
        
        {/* SECCIÓN 01: Identidad del emisor */}
        <div style={styles.principalPanel}>
            <h2 style={styles.h2Separator}>01 &nbsp; Identidad del emisor</h2>
            
            {/* Zona de carga de logo solicitada */}
            <div style={styles.principalPanelLogo} onClick={() => fileInputRef.current?.click()}>
                <div className='invoice-image-transmitter'>
                    {profileImage ? (
                        <img src={profileImage} alt="Perfil Emisor" style={styles.imgLogo}/>
                    ) : (
                        <span style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '18px' }}>
                          {getInitials()}
                        </span>
                    )}
                </div>

                <div style={styles.gapcolumn}>
                    <label className='text' style={{fontStyle: "italic", cursor: 'pointer', fontWeight: '600'}}>
                        Logo de la empresa
                    </label>
                    <p className='text' style={{color: "#748094", fontSize: '12px', margin: 0}}>
                        Se admiten archivos png, jpg más livianos de 1 mega
                    </p>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/png, image/jpeg" 
                        style={{ display: 'none' }} 
                    />
                    <span style={{ fontSize: '12px', color: '#265CF0', fontWeight: '600', marginTop: '4px', cursor: "pointer"}}>
                        Haz clic aquí para cambiar imagen
                    </span>
                </div>
            </div>

          <form onSubmit={handleSaveProfile} style={styles.inputPanel}>
            <div style={styles.gridRow}>
              <InputField
                label="Nombres"
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Nombres del emisor"
                required
              />

              <InputField
                label="Apellidos"
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Apellidos del emisor"
                required
              />
            </div>

            <InputField
              label="Correo de contacto"
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@empresa.com"
              required
            />

            <div style={styles.gridRow}>
              <InputField
                label="Nombre de la empresa"
                type="text"
                name="nombreEmpresa"
                value={formData.nombreEmpresa}
                onChange={handleChange}
                placeholder="Nombre de la empresa"
                required
                readOnly
              />

              <InputField
                label="Número fiscal de la empresa"
                type="text"
                name="numeroFiscal"
                value={formData.numeroFiscal}
                onChange={handleChange}
                placeholder="J-12345678"
                required
                readOnly
              />
            </div>

            <div style={styles.gridRow}>
              <InputField
                label="Dirección de la empresa"
                type="text"
                name="direccionEmpresa"
                value={formData.direccionEmpresa}
                onChange={handleChange}
                placeholder="Calle 1"
                required
              />

              <InputField
                label="Número de teléfono"
                type="text"
                name="numeroEmpresa"
                value={formData.numeroEmpresa}
                onChange={handleChange}
                placeholder="+58 424-12345678"
                required
              />
            </div>

            <InputField
              label="Notas por defecto"
              type="text"
              name="notasDefecto"
              value={formData.notasDefecto}
              onChange={handleChange}
              placeholder="Ej: Únicamente pagos por transferencia"
              required
            />

            <div style={{ marginTop: '10px' }}>
              <Button variant="primary" type="submit">
                Guardar perfil
              </Button>
            </div>
          </form>
        </div>

        {/* SECCIÓN 02: Cambio de contraseña */}
        <div style={styles.principalPanel}>
          <h2 style={styles.h2Separator}>02 &nbsp; Cambio de contraseña</h2>
          <p style={styles.wd8} className='text'>Introduce tu contraseña actual y confirma la nueva.</p>
          
          <form onSubmit={handleUpdatePassword} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: "12px"}}>
            <InputField
              label="Contraseña actual"
              type="password"
              name="contrasenaActual"
              value={formData.contrasenaActual}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <InputField
              label="Nueva contraseña"
              type="password"
              name="nuevaContrasena"
              value={formData.nuevaContrasena}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <InputField
              label="Confirmar nueva contraseña"
              type="password"
              name="confirNuevaContrasena"
              value={formData.confirNuevaContrasena}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <div style={{ marginTop: '10px' }}>
              <Button variant="primary" type="submit">
                Actualizar contraseña
              </Button>
            </div>
          </form>
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
    marginTop: "12px"
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
  wd8:{
    width: "80%"
  },
  dropzoneContainer: {
    border: '2px dashed #CBD5E1',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  uploadButton: {
    marginTop: '4px',
    padding: '6px 12px',
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  inputPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  principalPanelLogo: {
    width: "100%",
    height: "252px",
    padding: "24px",
    background: "rgb(244, 246, 250)",
    border: "1px dashed rgb(116, 128, 148)",
    borderRadius: "8px"
  },
  imgLogo :{
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "inherit"
  },
  gapcolumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "12px"
  },
}
