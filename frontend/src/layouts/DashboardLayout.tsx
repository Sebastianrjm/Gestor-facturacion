import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "../assets/Sidebar.css"

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#172338' }}>Folio.</h2>
          {user && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#748094' }}>
              {user.nombre}
            </p>
          )}
        </div>

        <nav style={styles.nav}>
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => 
              `nav-item-link ${isActive ? 'active' : ''}`
            }
          >
            Mis facturas
          </NavLink>

          <NavLink 
            to="/dashboard/perfil"
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

      {/* Área Principal con Scroll habilitado y dimensión forzada */}
      <div style={styles.mainArea}>
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
  },
  sidebar: {
    width: '240px', 
    minWidth: '240px',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e2e8f0', 
    height: '100vh',
  },
  brand: {
    padding: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
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
};