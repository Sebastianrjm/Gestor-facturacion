import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';

interface Plantilla {
  id: string;
  nombre: string;
  descripcion: string;
  preview_image_url: string;
}

interface TemplateSidebarProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateSidebar({ open, onClose, onSelectTemplate }: TemplateSidebarProps) {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo hace el fetch si el Drawer está abierto para evitar peticiones innecesarias
    if (!open) return;

    const fetchPlantillas = async () => {
      setLoading(true);
      setError(null);
      try {
        // Recuperamos el token de autenticación almacenado al hacer login
        const token = localStorage.getItem('token'); 

        const response = await fetch('http://localhost:5000/api/v1/plantillas', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Error al obtener las plantillas');
        }

        // Como tu controlador devuelve { status: 'SUCCESS', data: [...] }
        setPlantillas(result.data);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlantillas();
  }, [open]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, padding: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }} className='title'>
          Elige tu plantilla
        </Typography>
        <Typography variant="body2" color="text.secondary" className='text italic'>
          Selecciona un modelo para abrir su pantalla de edición.
        </Typography>

        {plantillas.map((item) => (
          <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardActionArea onClick={() => onSelectTemplate(item.id)} style={styles.buttonStyles}>
              <CardMedia
                component="img"
                height="140"
                image={item.preview_image_url}
                alt={item.nombre}
                style={{borderRadius:"4px"}}
              />
              <CardContent style={styles.textStyles}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }} className='title'>
                  {item.nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary" className='text'>
                  {item.descripcion}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Drawer>
  );
}
const styles: Record<string, React.CSSProperties> = {
    buttonStyles: {
        gap: "12px",
        padding: "20px",
        display: "flex",
        flexDirection: "column"
    },
    textStyles: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "0px",
        width: "100%"
    }
}