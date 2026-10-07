import React, { useState } from 'react';
import type { ChangeEvent, FormEvent, CSSProperties } from 'react';
import { loginUser } from '../services/authService';
import { Link } from 'react-router-dom';
import type { LoginCredentials, User } from '../types/auth';

interface LoginProps {
  onLoginSuccess?: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
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
      const data = await loginUser(formData);
      setLoading(false);
      
      if (onLoginSuccess) {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setLoading(false);
      setError(
        err.response?.data?.error || 'Ocurrió un error al intentar iniciar sesión.'
      );
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h1 style={styles.title}>Bienvenido de nuevo</h1>
        <p style={{ ...styles.subtitle, ...styles.text }}>
            Tu facturación, en orden. Accede a tu espacio de trabajo.
        </p>

        {error && <div style={styles.errorMessage}>{error}</div>}

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

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>

        {/* Enlace para ir al Registro */}
        <div style={styles.footerText}>
          <span>¿No tienes una cuenta? </span>
          <Link to="/register" style={styles.link}>
            Regístrate aquí
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