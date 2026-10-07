import react from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import "../assets/Sidebar.css" 

export default function DashboardLayout() {
    const navigate = useNavigate();
    // Se recupera la informacion del usuario del login
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div style={styles.container}>
            {/* Sidebar / Menú Lateral */}
            <aside style={styles.sidebar}>
              <div style={styles.brand}>
                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Folio.</h2>
              </div>
              <nav style={styles.nav}>
                <NavLink to="/dashboard" className={({ isActive }) =>`nav-item-link ${isActive ? 'active' : ''}`}>
                    Mis facturas
                </NavLink>
                <NavLink to="/dashboard/perfil" className={({ isActive }) =>`nav-item-link ${isActive ? 'active' : ''}`}> 
                    Mi perfil
                </NavLink>
              </nav>
              {/* Contenedor del botón alineado abajo y centrado */}
              <div style={styles.logoutContainer}>
                <button onClick={handleLogout} className="nav-item-link" style={{ color: '#ef4444' }}>
                  Cerrar Sesión
                </button>
              </div>
            </aside>

            {/* Área Principal */}
            <div style={styles.mainArea}>

                {/* Contenido Dinámico según la ruta activa */}
                <main style={styles.content}>
                <Outlet />
                </main>
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  sidebar: {
    width: '216px', 
    backgroundColor: '#FFFFFF',
    color: '#748094',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e2e8f0', 
  },
  brand: {
    padding: '1.5rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
     gap: "24px"
  },
  navItem: {
    textAlign: 'start',
    fontSize: "14px",
    lineHeight: "1.5em",
    letterSpacing: "-0.02em",
    color: "#172338",
    fontStyle: "italic",
    fontWeight: "400",
    textDecoration: 'none',
    padding: '12px 16px',
  },
  logoutContainer: {
    marginTop: 'auto',
    padding: '1.5rem 1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    width: '100%', // Opcional: hace que el botón ocupe todo el ancho disponible
    textAlign: 'center',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F4F6FA',
  },
  content: {
    padding: '2rem',
    flex: 1,
  }
};