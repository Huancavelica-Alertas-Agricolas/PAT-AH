// Comentarios añadidos en español: componente raíz `App` que maneja autenticación y navegación.
// Cómo lo logra: mantiene estados (`isAuthenticated`, `userRole`, `currentUser`) y renderiza `LoginPage` o `Dashboard`.
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { User, UserRole } from './types';

/**
 * Componente principal de la aplicación AlertaSegura
 * Maneja la autenticación y el estado global de la aplicación
 */
const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('usuario');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = async (user: User) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setCurrentUser(user);
    setUserRole(user.role);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRole('usuario');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="mt-4 text-gray-600">Cargando sistema...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sistema de notificaciones */}
      <Toaster
        position="top-right"
        expand={true}
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            padding: '16px',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      />

      {/* Contenido principal */}
      {!isAuthenticated || !currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard userRole={userRole} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;