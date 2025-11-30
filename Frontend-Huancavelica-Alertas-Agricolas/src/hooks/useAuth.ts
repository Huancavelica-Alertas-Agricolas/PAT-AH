import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, AuthFormData, ConsentData } from '../types';

const STORAGE_KEY = 'climaAlert_user';

// Hook para manejo de autenticación
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar usuario desde localStorage al inicializar
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        // Si existe token en storage, configure axios header
        const t = localStorage.getItem('climaAlert_token');
        if (t) axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Añadir interceptor para manejar 401 globalmente
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (resp) => resp,
      (error) => {
        if (error?.response?.status === 401) {
          // limpiar estado y redirigir al login
          try {
            localStorage.removeItem('climaAlert_token');
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
          } catch (e) {
            // noop
          }
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(id);
    };
  }, [navigate]);

  const login = async (formData: AuthFormData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Si estamos online, intentar login contra API Gateway
    try {
      if (typeof window !== 'undefined' && window.navigator?.onLine) {
        const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3003/api';
        const resp = await axios.post(`${API_BASE}/auth/login`, {
          phone: formData.phone,
          password: formData.password,
        }, { timeout: 5000 });

        if (resp?.data?.success) {
          const { token, user } = resp.data;
          try {
            localStorage.setItem('climaAlert_token', token);
          } catch (e) {
            console.error('useAuth: error saving token to localStorage', e);
          }
          try {
            const authenticatedUser = { ...user, isAuthenticated: true };
            setUser(authenticatedUser as any);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
          } catch (e) {
            console.error('useAuth: error saving user to localStorage', e);
          }
          // Establecer header global de axios
          try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } catch (e) {
            // noop
          }
          setIsLoading(false);
          // Navegar al dashboard centralmente desde el hook
          try {
            navigate('/dashboard');
          } catch (e) {
            // noop: si no hay router, no navegar
          }
          return { success: true };
        }
        // si hay un mensaje de error del servidor, devolverlo
        if (resp?.data?.message) {
          setIsLoading(false);
          return { success: false, error: resp.data.message };
        }
      }
    } catch (err: any) {
      // No bloqueante: si falla la llamada al backend, caer al modo demo
      console.warn('API login failed, falling back to demo login:', err?.message || err);
    }

    // Demo fallback removed for production: do not use local demo credentials.
    setIsLoading(false);
    return { success: false, error: 'Error de autenticación. Verifica tus credenciales e intenta nuevamente.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateConsents = (consents: ConsentData) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      notifications: consents
    };
    
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user?.isAuthenticated,
    login,
    logout,
    updateConsents
  };
};