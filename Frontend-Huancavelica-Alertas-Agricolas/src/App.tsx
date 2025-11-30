import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { RegistrationForm } from './components/form/RegistrationForm';
import { useCrops } from './hooks/useCrops';
import { useAlerts } from './hooks/useAlerts';
import { useWeather } from './hooks/useWeather';
import { useRecommendations } from './hooks/useRecommendations';
import { Button } from './components/ui';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import LoginForm from './components/auth/LoginForm';
import { Header } from './components/shared/Header';
import { BottomNav } from './components/shared/BottomNav';
import { WeatherWidget } from './components/dashboard/WeatherWidget';
import { AlertCard } from './components/dashboard/AlertCard';
import { QuickActions } from './components/dashboard/QuickActions';
import { DashboardSummary } from './components/dashboard/DashboardSummary';
import AlertDetail from './components/alerts/AlertDetail';
import AlertsHistoryScreen from './components/alerts/AlertsHistoryScreen';
import { ReportGenerator } from './components/reports/ReportGenerator';
import { CropManagement } from './components/crops/CropManagement';
import { RecommendationSystem } from './components/recommendations/RecommendationSystem';
import { ConfigurationScreen } from './components/configuration/ConfigurationScreen';
import { UserProfile } from './components/profile/UserProfile';
import { ActorsInfo } from './components/about/ActorsInfo';
import { UserManual } from './components/about/UserManual';
import { useAuth } from './hooks/useAuth';
import { Alert } from './types';

// DashboardLoader: Ensures recommendations and related data are loaded once
function DashboardLoader({ children }: { children: React.ReactNode }) {
  const { crops } = useCrops();
  const { activeAlerts } = useAlerts();
  const { weatherData } = useWeather();
  const { recommendations } = useRecommendations();

  // Solo ejecutar una vez al montar el componente
  useEffect(() => {
    // Los hooks ya cargan los datos automáticamente
    // Este efecto solo se ejecuta una vez para inicializar
  }, []); // Array vacío para ejecutar solo una vez
  
  return <>{children}</>;
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const { alerts, activeAlerts, shareAlert, getAlertById, isLoading: isAlertsLoading } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const navigate = useNavigate();


  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto p-4 md:p-6 min-h-screen bg-gray-50 pb-20 md:pb-4">
        <Routes>
          {/* Redirigir '/' a '/login' si no autenticado */}
          <Route path="/" element={
            isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-600">Cargando...</span>
              </div>
            ) : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <WelcomeScreen onEnter={() => navigate('/dashboard')} />
            )
          } />
          <Route path="/login" element={<LoginForm onSuccess={() => navigate('/dashboard')} />} />
          <Route path="/register" element={<RegistrationForm />} />
          {/* Rutas privadas */}
          <Route path="/dashboard" element={
            isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-gray-600">Cargando...</span>
              </div>
            ) : !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <DashboardLoader>
                <div className="space-y-6">
                  <WeatherWidget />
                  <DashboardSummary onNavigate={(section) => navigate(`/${section}`)} />
                  {isAlertsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-600">Cargando alertas...</span>
                    </div>
                  ) : activeAlerts.length > 0 && (
                    <div>
                      <h2 className="text-xl font-medium mb-6">🚨 Alertas Activas</h2>
                      <div className="grid gap-4">
                        {activeAlerts.slice(0, 3).map((alert) => (
                          <AlertCard
                            key={alert.id}
                            alert={alert}
                            onClick={() => setSelectedAlert(alert)}
                          />
                        ))}
                      </div>
                      {activeAlerts.length > 3 && (
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            onClick={() => navigate('/alerts')}
                            className="min-h-[44px]"
                          >
                            Ver todas las alertas ({activeAlerts.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  <QuickActions onNavigate={(section) => navigate(`/${section}`)} />
                </div>
              </DashboardLoader>
            )
          } />
          <Route path="/alerts" element={isAuthenticated ? <AlertsHistoryScreen onAlertClick={setSelectedAlert} /> : <Navigate to="/login" replace />} />
          <Route path="/reports" element={isAuthenticated ? <ReportGenerator /> : <Navigate to="/login" replace />} />
          <Route path="/crops" element={isAuthenticated ? <CropManagement /> : <Navigate to="/login" replace />} />
          <Route path="/recommendations" element={isAuthenticated ? <RecommendationSystem /> : <Navigate to="/login" replace />} />
          <Route path="/configuration" element={isAuthenticated ? <ConfigurationScreen /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" replace />} />
          <Route path="/about/actors" element={isAuthenticated ? <ActorsInfo /> : <Navigate to="/login" replace />} />
          <Route path="/about/manual" element={isAuthenticated ? <UserManual /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {selectedAlert && (
          <AlertDetail
            alert={selectedAlert}
            onClose={() => setSelectedAlert(null)}
            onShare={shareAlert}
          />
        )}
      </main>
      <BottomNav 
        currentSection={window.location.pathname.replace('/', '') === 'configuration' ? 'profile' : window.location.pathname.replace('/', '') as any}
        onSectionChange={(section) => navigate(`/${section === 'profile' ? 'configuration' : section}`)}
      />
    </>
  );
}

export default App;