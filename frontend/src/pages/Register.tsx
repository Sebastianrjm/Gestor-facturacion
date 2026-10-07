import React, { useState } from 'react';
import type { ChangeEvent, FormEvent, CSSProperties } from 'react';
import { registerUser } from '../services/authService';
import { Link } from 'react-router-dom';
import type { RegisterCredentials, User } from '../types/auth';

interface RegisterProps {
  onRegisterSuccess?: (user: User) => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const [formData, setFormData] = useState<RegisterCredentials>({
    nombre: '',
    email: '',
    password: '',
    razonSocial: '',
    identificacionFiscal: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await registerUser(formData);
      setLoading(false);

      if (onRegisterSuccess) {
        onRegisterSuccess(data.user);
      }
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.error || 'Ocurrió un error al intentar registrarse.'
      );
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Crear cuenta</h1>
        <p style={{ ...styles.subtitle, ...styles.text }}>
            Regístrate para acceder a tu espacio de trabajo.
        </p>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <h2 style={styles.subtitle}>Datos de inicio de sesión</h2>
        <div style={styles.inputGroup}>
          <label style={{...styles.text, ...styles.label}}>
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nombre@empresa.com"
            required
            style={styles.input}
            className="custom-input"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={{...styles.text, ...styles.label}}>
            Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña"
            required
            style={styles.input}
            className="custom-input"
          />
        </div>

        <h2 style={styles.subtitle}>Datos de la empresa</h2>
        <div style={styles.inputGroup}>
          <label style={{...styles.text, ...styles.label}}>
            Razón Social
          </label>
          <input
            type="text"
            name="razonSocial"
            value={formData.razonSocial}
            onChange={handleChange}
            placeholder="Razón Social"
            required
            style={styles.input}
            className="custom-input"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={{...styles.text, ...styles.label}}>
            Identificación Fiscal
          </label>
          <input
            type="text"
            name="identificacionFiscal"
            value={formData.identificacionFiscal}
            onChange={handleChange}
            placeholder="Identificación Fiscal"
            required
            style={styles.input}
            className="custom-input"
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={{...styles.text, ...styles.label}}>
            Nombre de la persona encargada 
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Pedro Perez"
            required
            style={styles.input}
            className="custom-input"
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        {/* Enlace para ir al Registro */}
        <div style={styles.footerText}>
          <span>¿No tienes una cuenta? </span>
          <Link to="/login" style={styles.link}>
            Inicia sesión aquí
          </Link>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '40px 16px',
    boxSizing: 'border-box',
    backgroundColor: '#f4f6f8',
  },
  form: {
    width: '100%',
    maxWidth: '380px',
    padding: '40px',
    backgroundColor: '#ffffff',
    gap: '24px',
    borderRadius: '16px',
    border: '1px solid #E4E8EF',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)', 
  },
  title: {
    marginBottom: '1.5rem',
    textAlign: 'start',
    color: '#172338',
    fontSize: '30px',
    fontWeight: "bold",
    lineHeight: "1.2em",
    letterSpacing: "-0.04em"
  },
  subtitle: {
    color: "#748094",
    fontSize: "18px",
    textAlign: "start",
    marginBottom: "1.5rem"
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
  button: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#265CF0',
    border: 'none',
    cursor: 'pointer',
    marginTop: '1rem',
    borderRadius: '8px',
  },
  errorMessage: {
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    borderRadius: '4px',
    fontSize: '0.9rem',
    textAlign: 'center',
  },
  footerText: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#64748b',
  },
  link: {
    color: '#007bff',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
