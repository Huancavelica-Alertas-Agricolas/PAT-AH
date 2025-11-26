
import { User, LogOut, Bell, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTitleClick = () => {
    if (user?.isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = async () => {
  logout();
  navigate('/login', { replace: true });
  };

  const handleActorsClick = () => {
    navigate('/about/actors');
  };

  return (
    <>
      {/* Barra de estado de conexión */}
      <div className={`p-2 text-center text-sm font-medium transition-colors ${
        isOnline 
          ? 'bg-green-600 text-white' 
          : 'bg-red-600 text-white'
      }`}>
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="h-4 w-4" />
              <span>
                📶 {language === 'qu' ? 'ONLINE - Qhapaq sincronizando...' : 'ONLINE - Sincronizando...'}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4" />
              <span>
                📶🔴 {language === 'qu' ? `OFFLINE - Qayna sync: ${lastSync.toLocaleTimeString()}` : `OFFLINE - Última sync: ${lastSync.toLocaleTimeString()}`}
              </span>
            </>
          )}
        </div>
      </div>

      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={handleTitleClick} title="Ir al inicio o login">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl" role="img" aria-label="Clima">🌦️</span>
            </div>
            <div>
              <h1 className="font-bold text-green-700 text-lg">🌾 PAT-AH</h1>
              <p className="text-sm text-gray-600">📍 {language === 'qu' ? 'Huancavelica suyu' : language === 'en' ? 'Huancavelica Region' : 'Huancavelica'}</p>
              {/* En desktop, los links van aquí, en mobile van en el menú inferior */}
              <div className="hidden md:flex gap-2 mt-1">
                <button className="text-xs text-blue-600 underline" onClick={e => { e.stopPropagation(); handleActorsClick(); }}>
                  {language === 'qu' ? 'Sistema runakuna rikuy' : 'Ver actores del sistema'}
                </button>
                <button className="text-xs text-blue-600 underline" onClick={e => { e.stopPropagation(); navigate('/about/manual'); }}>
                  {language === 'qu' ? 'Ruraykuna manual' : 'Manual de usuario'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] min-w-[44px] p-2"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleProfileClick} title="Ver perfil">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{language === 'qu' ? 'Kawsaypi: ' : 'Ubicación: '}{user?.location}</p>
              </div>
            </div>

            {/* Botón de cerrar sesión solo si el usuario está autenticado */}
            {user?.isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="min-h-[44px] min-w-[44px] p-2 text-gray-600 hover:text-blue-600"
                aria-label={language === 'qu' ? 'Wisqay' : 'Cerrar sesión'}
                title={language === 'qu' ? 'Wisqay' : 'Cerrar sesión'}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};