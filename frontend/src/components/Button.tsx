import React, { useState } from 'react';
import type { ButtonHTMLAttributes, CSSProperties } from 'react';

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

  const baseStyle: CSSProperties = {
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: "1.2em",
    fontWeight: '600',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: disabled ? 0.6 : 1,
    outline: 'none',
    width: "fit-content"
  };

  const variantStyles: Record<'primary' | 'secondary', CSSProperties> = {
    primary: {
      backgroundColor: isHovered && !disabled ? '#3b6cf1' : '#265CF0',
      color: '#ffffff',
      borderColor: 'transparent',
      boxShadow: isHovered && !disabled ? '0 4px 12px rgba(14, 165, 233, 0.25)' : 'none',
    },
    secondary: {
      backgroundColor: isHovered && !disabled ? '#FFD9B7' : '#fffaf6',
      color: '#FF800E',
      border: "0.2px solid #FF800E",
      boxShadow: isHovered && !disabled ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none',
    },
    primaryTiny: {
      backgroundColor: isHovered && !disabled ? '#3b6cf1' : '#265CF0',
      color: '#ffffff',
      borderColor: 'transparent',
      boxShadow: isHovered && !disabled ? '0 4px 12px rgba(14, 165, 233, 0.25)' : 'none',
      padding: '6px 10px',
    },
    secondaryTiny: {
      backgroundColor: isHovered && !disabled ? '#FFD9B7' : '#fffaf6',
      color: '#FF800E',
      border: "0.2px solid #FF800E",
      boxShadow: isHovered && !disabled ? '0 2px 6px rgba(0, 0, 0, 0.05)' : 'none',
      padding: '6px 10px',
    },
  };

  const combinedStyles: CSSProperties = {
    ...baseStyle,
    ...variantStyles[variant],
    ...style,
  };

  return (
    // 👈 Cambiado de <Button> a <button> para renderizar el elemento HTML real
    <button
      style={combinedStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};