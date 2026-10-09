import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function NewBill() {
  const [searchParams] = useSearchParams();
  const plantillaId = searchParams.get('plantilla') || 'MODERNO';

  console.log('Plantilla seleccionada:', plantillaId);

  return (
    <div style={{ padding: '24px' }}>
      <h1>Creando factura con diseño: {plantillaId}</h1>
    </div>
  );
}