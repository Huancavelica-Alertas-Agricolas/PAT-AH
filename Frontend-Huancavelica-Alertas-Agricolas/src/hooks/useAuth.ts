import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, AuthFormData, ConsentData } from '../types';

const STORAGE_KEY = 'climaAlert_user';

// Hook para manejo de autenticación
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage al inicializar
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

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
          // Guardar token y usuario
          localStorage.setItem('climaAlert_token', token);
          setUser(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          setIsLoading(false);
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

    // Validación DEMO: compara con datos guardados en registro
    const demoUserRaw = localStorage.getItem('demoUser');
    if (demoUserRaw) {
      try {
        const demoUser = JSON.parse(demoUserRaw);
        if (
          demoUser.telefono === formData.phone &&
          demoUser.contraseña === formData.password
        ) {
          const newUser: User = {
            id: 'user_' + Date.now(),
            phone: formData.phone,
            name: `Usuario ${formData.phone}`,
            location: 'Huancavelica Centro',
            isAuthenticated: true,
            notifications: {
              sms: true,
              telegram: false,
              email: false
            }
          };
          setUser(newUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
          localStorage.removeItem('climaAlert_token');
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          return { success: false, error: 'Teléfono o contraseña incorrectos.' };
        }
      } catch (e) {
        setIsLoading(false);
        return { success: false, error: 'Error de datos de usuario demo.' };
      }
    }
    setIsLoading(false);
    return { success: false, error: 'No existe usuario registrado. Regístrese primero.' };
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