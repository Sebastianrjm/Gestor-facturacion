import React, { useMemo } from 'react';
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
  const plantillas = useMemo<Plantilla[]>(() => {
    if (!open) return [];

    return [
      {
        id: 'MODERNO',
        nombre: 'Diseño Moderno',
        descripcion: 'Cabecera destacada con bordes suaves.',
        preview_image_url: 'https://via.placeholder.com/300x180?text=Vista+Previa+Moderno',
      },
      {
        id: 'MINIMALISTA',
        nombre: 'Diseño Minimalista',
        descripcion: 'Líneas finas y contraste alto.',
        preview_image_url: 'https://via.placeholder.com/300x180?text=Vista+Previa+Minimalista',
      },
    ];
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