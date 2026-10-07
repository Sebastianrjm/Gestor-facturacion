import react from "react";
import type { InputHTMLAttributes, CSSProperties } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function InputField({ label, ...inputProps }: InputFieldProps) {
    return (
        <div style={styles.inputGroup}>
            <label style={{...styles.text, ...styles.label}}>
                {label}
            </label>
            <input 
                {...inputProps}
                style={styles.input}
                className={`custom-input ${inputProps.className || ''}`}
            />
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
  subtitle: {
    color: "#748094",
  },
  text: {
    fontSize: "14px",
    lineHeight: "1.5em",
    textAlign: "start",
    marginBottom: '1.5rem',
    fontWeight: "300",
  },
  inputGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#000000',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    lineHeight: '1.2em',
    borderRadius: '8px',
    border: '1px solid #DCE2EC',
    boxSizing: 'border-box',
    backgroundColor: 'rgba(187, 187, 187, 0.15)',
    height: '46px',
    color: '#999999'
  },
};