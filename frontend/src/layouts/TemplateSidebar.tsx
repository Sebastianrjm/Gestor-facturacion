import React, { useState, useEffect } from 'react';
import { Drawer, Box, Typography, Card, CardMedia, CardContent, CardActionArea } from '@mui/material';
import API from '../services/api';

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
    if (!open) return;

    const fetchPlantillas = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await API.get('/plantillas');

        const result = response.data;

        if (result.status !== 'SUCCESS') {
          throw new Error(result.message || 'Error al obtener las plantillas');
        }

        setPlantillas(result.data);
      } catch (err: any) {
        console.error('Error:', err);
        const mensajeError = err.response?.data?.message || err.message || 'Error al obtener las plantillas';
        setError(mensajeError);
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
                style={{borderRadius:"4px", border: "1px solid"}}
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