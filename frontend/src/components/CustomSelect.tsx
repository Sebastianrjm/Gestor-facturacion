import React, { useId } from 'react';
import '../assets/CustomSelect.css'; // Asegúrate de importar el archivo CSS

export interface SelectOption {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
  fullWidth?: boolean;
}

export default function CustomSelect({
  label,
  value,
  options,
  onChange,
  fullWidth = true,
}: CustomSelectProps) {
  const selectId = useId();

  return (
    <div
      className="custom-select-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: fullWidth ? '100%' : 'auto',
        minWidth: 160,
      }}
    >
      <label htmlFor={selectId} className="custom-select-label">
        {label}
      </label>
      <select
        id={selectId}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          fontSize: '14px',
          color: '#172338',
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}