import React, { useState } from 'react';
import type { ChangeEvent, FormEvent, CSSProperties } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LoginCredentials, User } from '../types/auth';
import InputField from '../components/inputField';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface LoginProps {
  onLoginSuccess?: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Enviamos formData.email y formData.password
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;

      // 2. Pasamos token y user como 2 argumentos requeridos por AuthContext
      login(token, user);

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }

      // 3. Redirección limpia al dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      const msg = err.response?.data?.message || 'Error al conectar con el servidor';
      setError(msg);
    } finally {
      setLoading(false);
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

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>

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
    width: '100%',
  },
  form: {
    width: '100%',
    maxWidth: '380px',
    padding: '40px',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '16px',
    border: '1px solid #E4E8EF',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)',
  },
  title: {
    marginBottom: '0.5rem',
    textAlign: 'start',
    color: '#172338',
    fontSize: '30px',
    fontWeight: 'bold',
    lineHeight: '1.2em',
    letterSpacing: '-0.04em',
  },
  subtitle: {
    color: '#748094',
  },
  text: {
    fontSize: '14px',
    lineHeight: '1.5em',
    textAlign: 'start',
    marginBottom: '1.5rem',
    fontWeight: '300',
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
    borderRadius: '6px',
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
    color: '#265CF0',
    fontWeight: '600',
    textDecoration: 'none',
  },
};