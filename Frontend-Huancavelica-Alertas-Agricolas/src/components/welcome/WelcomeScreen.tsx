import { useState, useEffect } from 'react';
import { useLanguage, LANGS, LangKey } from '../../context/LanguageContext';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui';
import { Wifi, WifiOff, Globe, Settings } from 'lucide-react';

interface WelcomeScreenProps {
  onEnter: () => void;
}

export function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'weak'>('online');
  const { language, setLanguage } = useLanguage();
  const LANGS = {
    qu: {
      name: 'Quechua Chanka',
      flag: '🏔️',
      title: 'Ruraykuna Rimay',
      region: 'Huancavelica suyu',
      languageLabel: 'Rimay',
      enter: 'Plataformaman yaykuy',
      offline: 'Qhapaq offline churay',
      offlineModalTitle: 'Qhapaq offline churay',
      offlineModalDesc: 'Rikuykuy, internet mana kanqa, datos localta ruwanki.',
      offlineModalCheck: 'Activar modo offline',
      close: 'Cerray',
      version: 'Versión 1.0 - Huancavelica suyu',
      updated: 'Qayna kutin qillqay: Qayna punchaw',
      info1: 'Internet mana kanqa, datos localta ruwanki.',
      info2: 'Móvilpaq allin',
      online: 'ONLINE - Qhapaq sincronizando...',
      offlineStatus: 'OFFLINE - Qayna sync: ',
    },
    es: {
      name: 'Español',
      flag: '🇵🇪',
      title: 'Alertas Agrícolas',
      region: 'Región Huancavelica',
      languageLabel: 'Idioma / Rimay',
      enter: 'ENTRAR A LA PLATAFORMA',
      offline: 'Configurar conexión offline',
      offlineModalTitle: 'Modo Offline',
      offlineModalDesc: 'Activa el modo offline para usar la app solo con datos locales.',
      offlineModalCheck: 'Activar modo offline',
      close: 'Cerrar',
      version: 'Versión 1.0 - Región Huancavelica',
      updated: 'Última actualización: Hoy',
      info1: 'Funciona sin conexión a internet',
      info2: 'Optimizada para dispositivos móviles',
      online: 'ONLINE - Sincronizando...',
      offlineStatus: 'OFFLINE - Última sync: ',
    },
    en: {
      name: 'English (US)',
      flag: '🇺🇸',
      title: 'Agricultural Alerts',
      region: 'Huancavelica Region',
      languageLabel: 'Language',
      enter: 'ENTER PLATFORM',
      offline: 'Configure offline mode',
      offlineModalTitle: 'Offline Mode',
      offlineModalDesc: 'Enable offline mode to use the app with local data only.',
      offlineModalCheck: 'Enable offline mode',
      close: 'Close',
      version: 'Version 1.0 - Huancavelica Region',
      updated: 'Last update: Today',
      info1: 'Works without internet connection',
      info2: 'Optimized for mobile devices',
      online: 'ONLINE - Syncing...',
      offlineStatus: 'OFFLINE - Last sync: ',
    }
  };
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [offlineEnabled, setOfflineEnabled] = useState(() => localStorage.getItem('climaAlert_offline') === 'true');

  useEffect(() => {
    // Simular detección de conexión
    const checkConnection = () => {
      if (navigator.onLine) {
        // Simular conexión débil ocasionalmente
        const isWeak = Math.random() < 0.3;
        setConnectionStatus(isWeak ? 'weak' : 'online');
      } else {
        setConnectionStatus('offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  const getConnectionDisplay = () => {
    switch (connectionStatus) {
      case 'online':
        return {
          icon: <Wifi className="h-6 w-6 text-green-600" />,
          text: 'Online',
          color: 'text-green-600',
          bgColor: 'bg-green-50 border-green-200'
        };
      case 'weak':
        return {
          icon: <Wifi className="h-6 w-6 text-yellow-600" />,
          text: 'Conexión débil',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 border-yellow-200'
        };
      case 'offline':
        return {
          icon: <WifiOff className="h-6 w-6 text-red-600" />,
          text: 'Offline',
          color: 'text-red-600',
          bgColor: 'bg-red-50 border-red-200'
        };
    }
  };

  const connection = getConnectionDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      {/* Header con estado de conexión */}
      <div className={`p-4 border-b-2 ${connection.bgColor}`}>
        <div className="flex items-center justify-center gap-3">
          {connection.icon}
          <span className={`font-medium ${connection.color}`}>
            📶 {connection.text}
            {connectionStatus === 'online' && ' - Sincronizando...'}
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Logo y título */}
        <div className="mb-8">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto bg-green-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🌾</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-2">
            PLATAFORMA DE ALERTAS TEMPRANAS PARA AGRICULTORES DE HUANCAVELICA
          </h1>
          <p className="text-lg text-gray-600">
            {language === 'qu' ? 'Huancavelica suyu' : 'Huancavelica'}
          </p>
        </div>

        {/* Selector de idioma */}
        <div className="mb-8 w-full max-w-sm">
          <label className="block text-left mb-2 font-medium text-gray-700">
            🌐 {LANGS[language].languageLabel}
          </label>
          <Select value={language} onValueChange={val => {
            setLanguage(val as LangKey);
          }}>
            <SelectTrigger className="w-full h-12 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qu">🏔️ Quechua Chanka</SelectItem>
              <SelectItem value="es">🇵🇪 Español</SelectItem>
              <SelectItem value="en">�🇸 English (US)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botón principal */}
        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={onEnter}
            className="w-full h-14 text-lg font-medium bg-green-600 hover:bg-green-700 text-white touch-friendly"
          >
            <Globe className="h-6 w-6 mr-3" />
            {LANGS[language].enter}
          </Button>

          {/* Configuración offline */}
          <Button
            variant="outline"
            className="w-full h-12 text-base touch-friendly"
            onClick={() => setShowOfflineModal(true)}
          >
            <Settings className="h-5 w-5 mr-2" />
            {LANGS[language].offline}
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 text-sm text-gray-500 max-w-sm">
          <p className="mb-2">
            💾 {LANGS[language].info1}
          </p>
          <p>
            📱 {LANGS[language].info2}
          </p>
        </div>
      </div>

      {/* Modal de configuración offline */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowOfflineModal(false)}>&times;</button>
            <h2 className="text-lg font-semibold mb-2">{LANGS[language].offlineModalTitle}</h2>
            <p className="text-sm mb-4">{LANGS[language].offlineModalDesc}</p>
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={offlineEnabled}
                onChange={e => {
                  setOfflineEnabled(e.target.checked);
                  localStorage.setItem('climaAlert_offline', e.target.checked ? 'true' : 'false');
                }}
              />
              <span>{LANGS[language].offlineModalCheck}</span>
            </label>
            <Button className="w-full bg-green-600 hover:bg-green-700 min-h-[44px]" onClick={() => setShowOfflineModal(false)}>
              {LANGS[language].close}
            </Button>
          </div>
        </div>
      )}

      {/* Footer con información de versión */}
      <div className="p-4 text-center text-sm text-gray-400">
  <p>{LANGS[language].version}</p>
  <p>{LANGS[language].updated}</p>
      </div>
    </div>
  );
}