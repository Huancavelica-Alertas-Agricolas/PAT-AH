// Comentarios añadidos en español: componente `Dashboard` que orquesta las vistas principales.
// Cómo lo logra: mantiene `currentView` y renderiza componentes como `AlertsList`, `Analytics` o `UserManagement`.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardView from './DashboardView';
import AlertsList from './AlertsList';
import ZoneManagement from './ZoneManagement';
import Analytics from './Analytics';
import Reports from './Reports';
import UserManagement from './UserManagement';
import RolePermissions from './RolePermissions';
import NotificationCenter from './NotificationCenter';
import Settings from './Settings';
import AlertDetail from './AlertDetail';
import { ViewType, UserRole } from '../types';

interface DashboardProps {
  userRole: UserRole;
  onLogout: () => void;
}

/**
 * Componente principal del dashboard
 * Maneja la navegación entre diferentes vistas del sistema
 */
const Dashboard: React.FC<DashboardProps> = ({ userRole, onLogout }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  /**
   * Renderiza la vista actual basada en el estado currentView
   */
  const renderCurrentView = () => {
    const viewProps = { userRole, onAlertClick: setSelectedAlertId };
    
    switch (currentView) {
      case 'dashboard':
        return <DashboardView {...viewProps} />;
      case 'alerts':
        return <AlertsList {...viewProps} />;
      case 'zones':
        return <ZoneManagement userRole={userRole} />;
      case 'analytics':
        return <Analytics userRole={userRole} />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement userRole={userRole} />;
      case 'roles':
        return <RolePermissions userRole={userRole} />;
      case 'notifications':
        return <NotificationCenter userRole={userRole} />;
      case 'settings':
        return <Settings userRole={userRole} />;
      default:
        return <DashboardView {...viewProps} />;
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        userRole={userRole}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          userRole={userRole}
          onLogout={onLogout}
          onNotificationClick={() => setCurrentView('notifications')}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className={`transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-0' : 'ml-0'
          }`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modal de Detalle de Alerta */}
      <AlertDetail 
        alertId={selectedAlertId} 
        onClose={() => setSelectedAlertId(null)} 
      />
    </div>
  );
};

export default Dashboard;