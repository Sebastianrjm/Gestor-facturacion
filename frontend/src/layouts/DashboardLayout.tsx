import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import "../assets/Sidebar.css";
import API from '../services/api';

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await API.post('/auth/logout');
      
      if (response.data.status === 'SUCCESS') {
         navigate('/login') 
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div style={styles.container}>
      {/* Barra Superior Móvil (Visible solo en pantallas pequeñas) */}
      <header className="mobile-header">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          style={styles.hamburgerButton}
          aria-label="Abrir menú"
        >
          ☰
        </button>
        <div style={styles.mobileBrand}>
          {/* Marcador de posición para el logo */}
          <div style={styles.logoPlaceholder}>LOGO</div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#172338' }}>Folio.</h2>
        </div>
      </header>

      {/* Capa oscura (Overlay) al abrir el menú en móviles */}
      {sidebarOpen && (
        <div 
          style={styles.overlay} 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar (Fijo en desktop, panel deslizante en móvil) */}
      <aside className={`sidebar-container ${sidebarOpen ? 'open' : ''}`} style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.logoRow}>
            {/* Marcador de posición para el logo */}
            <div style={styles.logoPlaceholder}>
              <img src="/icon.svg" alt="Logo de folio. generador de facturas online"  style={{width: "100%"}}/>
            </div>



            {/* Aqui va el logo que no lo he hecho */}
          </div>
          {user && (
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#748094' }}>
              {`${user.nombre || ''} ${user.apellido || ''}`.trim()}
            </p>
          )}
        </div>

        <nav style={styles.nav}>
          <NavLink 
            to="/dashboard" 
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => 
              `nav-item-link ${isActive ? 'active' : ''}`
            }
          >
            Mis facturas
          </NavLink>

          <NavLink 
            to="/dashboard/perfil"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => 
              `nav-item-link ${isActive ? 'active' : ''}`
            }
          > 
            Mi perfil
          </NavLink>
        </nav>

        <div style={styles.logoutContainer}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Área Principal con Scroll habilitado */}
      <div style={styles.mainArea} className="main-area-container">
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    minHeight: '100vh',
    backgroundColor: '#F4F6FA',
    overflow: 'hidden',
    position: 'relative',
  },
  sidebar: {
    width: '240px', 
    minWidth: '240px',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e2e8f0', 
    height: '100vh',
    zIndex: 100,
  },
  brand: {
    padding: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoPlaceholder: {
    width: '96px',
    height: '64px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#64748B',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    gap: '8px',
  },
  logoutContainer: {
    marginTop: 'auto',
    padding: '1.5rem 1rem',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    width: '100%',
    textAlign: 'center',
  },
  mainArea: {
    flex: 1,
    height: '100vh',
    overflowY: 'auto',
    backgroundColor: '#F4F6FA',
  },
  content: {
    padding: '2rem',
    minHeight: '100%',
  },
  hamburgerButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#172338',
    padding: '4px 8px',
  },
  mobileBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 99,
  },
};