import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  AlertTriangle,
  MapPin,
  BarChart3,
  Users,
  Shield,
  Bell,
  Settings,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { ViewType, UserRole } from '../types';
import { cn } from '../utils';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  userRole: UserRole;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<any>;
  allowedRoles: UserRole[];
  description?: string;
}

/**
 * Elementos de navegación del sidebar con permisos por rol
 */
const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['administrador', 'autoridad', 'usuario'],
    description: 'Vista general del sistema'
  },
  {
    id: 'alerts',
    label: 'Alertas',
    icon: AlertTriangle,
    allowedRoles: ['administrador', 'autoridad', 'usuario'],
    description: 'Gestión de alertas'
  },
  {
    id: 'zones',
    label: 'Zonas',
    icon: MapPin,
    allowedRoles: ['administrador', 'autoridad'],
    description: 'Gestión de zonas'
  },
  {
    id: 'analytics',
    label: 'Análisis',
    icon: BarChart3,
    allowedRoles: ['administrador', 'autoridad'],
    description: 'Estadísticas y reportes'
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: FileText,
    allowedRoles: ['administrador', 'autoridad', 'usuario'],
    description: 'Reportes climáticos por cultivo'
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: Users,
    allowedRoles: ['administrador'],
    description: 'Gestión de usuarios'
  },
  {
    id: 'roles',
    label: 'Roles y Permisos',
    icon: Shield,
    allowedRoles: ['administrador'],
    description: 'Configuración de roles'
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: Bell,
    allowedRoles: ['administrador', 'autoridad', 'usuario'],
    description: 'Centro de notificaciones'
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    allowedRoles: ['administrador', 'autoridad', 'usuario'],
    description: 'Configuración personal'
  }
];

/**
 * Componente Sidebar con navegación responsiva
 */
const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  userRole,
  isCollapsed,
  onToggleCollapse
}) => {
  // Filtrar elementos de navegación basado en el rol del usuario
  const allowedNavItems = navigationItems.filter(item => 
    item.allowedRoles.includes(userRole)
  );

  /**
   * Obtiene el color del rol para mostrar en el sidebar
   */
  const getRoleColor = (role: UserRole) => {
    const colors = {
      administrador: 'from-purple-500 to-purple-600',
      autoridad: 'from-blue-500 to-blue-600',
      usuario: 'from-green-500 to-green-600'
    };
    return colors[role];
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: isCollapsed ? -300 : 0 }}
        animate={{ x: isCollapsed ? -300 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50",
          "w-72 bg-white shadow-xl flex flex-col",
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl bg-gradient-to-r flex items-center justify-center",
                getRoleColor(userRole)
              )}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">AlertaSegura</h1>
                <p className="text-sm text-gray-500 capitalize">{userRole}</p>
              </div>
            </div>
            
            {/* Toggle Button */}
            <button
              onClick={onToggleCollapse}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {allowedNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => {
                  onViewChange(item.id);
                  // Cerrar sidebar en mobile después de seleccionar
                  if (window.innerWidth < 1024) {
                    onToggleCollapse();
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500"
                )} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </div>
                  )}
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-blue-600 rounded-full"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className={cn(
                "w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-white text-sm font-medium",
                getRoleColor(userRole)
              )}>
                {userRole === 'administrador' ? 'A' : userRole === 'autoridad' ? 'AU' : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {userRole === 'administrador' ? 'Admin Principal' : 
                   userRole === 'autoridad' ? 'Autoridad' : 'Usuario'}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  Sistema activo
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800">
                  Sistema Operativo
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className={cn(
          "fixed top-4 left-4 z-60 lg:hidden",
          "w-12 h-12 bg-white shadow-lg rounded-xl",
          "flex items-center justify-center",
          "transition-all duration-200 hover:shadow-xl",
          !isCollapsed && "hidden"
        )}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
    </>
  );
};

export default Sidebar;