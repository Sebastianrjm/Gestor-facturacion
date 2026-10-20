import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  login: (userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Al recargar la página, verificamos si la cookie HttpOnly sigue siendo válida en el backend
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/v1/auth/perfil', {
          method: 'GET',
          credentials: 'include', // Vital para que envíe y reciba la cookie HttpOnly
        });
        const result = await response.json();
        
        if (result.status === 'SUCCESS' && result.data) {
          // Extraemos los datos del usuario del endpoint de perfil que ya creamos antes
          const userData = result.data.usuario || result.data;
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // La función login ahora solo actualiza el estado del usuario. 
  // La cookie ya la guardó el navegador automáticamente gracias al backend.
  const login = (userData: any) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Llamamos al endpoint de logout del backend para que limpie la cookie HttpOnly
      await fetch('http://localhost:5000/api/v1/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}