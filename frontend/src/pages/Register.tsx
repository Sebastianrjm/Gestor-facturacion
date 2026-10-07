import React, { useState } from 'react';
import type { ChangeEvent, FormEvent, CSSProperties } from 'react';
import { registerUser } from '../services/authService';
import { Link } from 'react-router-dom';
import type { RegisterCredentials, User } from '../types/auth';
import InputField from '../components/inputField';

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
        <InputField
          label="Correo Electrónico"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="nombre@empresa.com"
          required
        />

        <InputField
          label="Contraseña"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Contraseña"
          required
        />

        <h2 style={styles.subtitle}>Datos de la empresa</h2>
        <InputField
          label="Razón Social"
          type="text"
          name="razonSocial"
          value={formData.razonSocial}
          onChange={handleChange}
          placeholder="Razón Social"
          required
        />

        <InputField
          label="Identificación Fiscal"
          type="text"
          name="identificacionFiscal"
          value={formData.identificacionFiscal}
          onChange={handleChange}
          placeholder="Identificación Fiscal"
          required
        />

        <InputField
          label="Nombre de la persona encargada"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre de la persona encargada"
          required
        />
        
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        {/* Enlace para ir al Registro */}
        <div style={styles.footerText}>
          <span>¿Ya tienes una cuenta? </span>
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
