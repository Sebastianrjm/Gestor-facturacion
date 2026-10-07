import React, { useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';

// Definimos la interfaz extendiendo las props nativas de un botón HTML
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  style,
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Estilos base compartidos por ambas variantes
  const baseStyle: CSSProperties = {
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: disabled ? 0.6 : 1,
    outline: 'none',
  };

  // Estilos especificos por variante (Incluyendo el hover)

  const variantStyles: Record<'primary' | 'secondary', CSSProperties> = {
    primary: {
      backgroundColor: isHovered && !disabled ? '#0284c7' : '#0ea5e9', // Azul principal / Hover más oscuro
      color: '#ffffff',
      borderColor: 'transparent',
      boxShadow: isHovered && !disabled ? '0 4px 12px rgba(14, 165, 233, 0.25)' : 'none',
    },
    secondary: {
      backgroundColor: isHovered && !disabled ? '#f1f5f9' : '#ffffff', // Fondo claro / Hover gris suave
      color: '#0f172a',
      borderColor: '#e2e8f0',
      boxShadow: isHovered && !disabled ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none',
    },
  };

  const combinedStyles: CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    ...style,
  };

  return (
    <Button
      style={combinedStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
};