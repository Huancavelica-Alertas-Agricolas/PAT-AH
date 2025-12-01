import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { UserRole } from '../types';
import { mockNotifications } from '../data/mockData';
import { cn } from '../utils';

interface HeaderProps {
  userRole: UserRole;
  onLogout: () => void;
  onNotificationClick: () => void;
}

/**
 * Componente Header con búsqueda, notificaciones y perfil de usuario
 */
const Header: React.FC<HeaderProps> = ({ 
  userRole, 
  onLogout, 
  onNotificationClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Contar notificaciones no leídas
  useEffect(() => {
    const unread = mockNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, []);

  /**
   * Obtiene información del usuario basada en el rol
   */
  const getUserInfo = (role: UserRole) => {
    const userInfo = {
      administrador: {
        name: 'Admin SENAMHI',
        email: 'admin@senamhi.gob.pe',
        avatar: 'A',
        color: 'from-purple-500 to-purple-600'
      },
      autoridad: {
        name: 'Ing. Agrícola',
        email: 'ingeniero@agraria.gob.pe', 
        avatar: 'I',
        color: 'from-blue-500 to-blue-600'
      },
      usuario: {
        name: 'Agricultor Demo',
        email: 'agricultor@huancavelica.pe',
        avatar: 'A',
        color: 'from-green-500 to-green-600'
      }
    };
    return userInfo[role];
  };

  const userInfo = getUserInfo(userRole);

  /**
   * Formatea la fecha y hora actual
   */
  const formatDateTime = (date: Date) => {
    return {
      time: date.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      date: date.toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const { time, date } = formatDateTime(currentTime);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Search and DateTime */}
        <div className="flex items-center gap-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar alertas climáticas, zonas agrícolas..."
              className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Current Date and Time */}
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-900">{time}</div>
            <div className="text-xs text-gray-500 capitalize">{date}</div>
          </div>
        </div>

        {/* Right Side - Notifications and User Menu */}
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-4 mr-4">
            <div className="text-center">
              <div className="text-sm font-medium text-red-600">3</div>
              <div className="text-xs text-gray-500">Alertas Activas</div>
            </div>
            <div className="w-px h-8 bg-gray-300" />
            <div className="text-center">
              <div className="text-sm font-medium text-blue-600">15°C</div>
              <div className="text-xs text-gray-500">Temperatura</div>
            </div>
            <div className="w-px h-8 bg-gray-300" />
            <div className="text-center">
              <div className="text-sm font-medium text-green-600">65%</div>
              <div className="text-xs text-gray-500">Humedad</div>
            </div>
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationClick}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                {unreadCount}
              </motion.div>
            )}
          </motion.button>

          {/* Weather Info (if authority or admin) */}
          {(userRole === 'administrador' || userRole === 'autoridad') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              title="Información Meteorológica"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>
          )}

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center text-white font-medium",
                userInfo.color
              )}>
                {userInfo.avatar}
              </div>
              <div className="hidden md:block text-left">
                <div className="font-medium text-gray-900">{userInfo.name}</div>
                <div className="text-sm text-gray-500 capitalize">{userRole}</div>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-gray-500 transition-transform duration-200",
                showUserMenu && "rotate-180"
              )} />
            </motion.button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <>
                {/* Overlay para cerrar el menú */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{userInfo.name}</div>
                    <div className="text-sm text-gray-500">{userInfo.email}</div>
                    <div className="text-xs text-blue-600 capitalize mt-1">
                      Rol: {userRole}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Mi Perfil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Configuración</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2">
                    <button 
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Cerrar Sesión</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;