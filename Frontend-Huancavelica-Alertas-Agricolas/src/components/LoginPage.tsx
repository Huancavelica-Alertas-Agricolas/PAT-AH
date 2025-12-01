import { useState } from 'react';
import { Shield, MapPin, Bell, Users, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../types';
import { toast } from 'sonner';
import PasswordRecovery from './PasswordRecovery';
import RegisterPage from './RegisterPage';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Mock user para desarrollo
      const mockUser: User = {
        id: '1',
        name: 'Usuario Demo',
        email: 'demo@alerta.com',
        phone: formData.phone,
        role: 'usuario',
        zone: 'Huancavelica',
        status: 'activo',
        alertsReported: 0,
        createdAt: new Date().toISOString(),
      };
      
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('¡Bienvenido!');
      onLogin(mockUser);
    } catch (error) {
      toast.error('Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (showRecovery) {
    return (
      <PasswordRecovery 
        onBack={() => setShowRecovery(false)} 
        onSuccess={() => {
          setShowRecovery(false);
          toast.success('Contraseña actualizada exitosamente');
        }}
      />
    );
  }

  if (showRegister) {
    return (
      <RegisterPage
        onBack={() => setShowRegister(false)}
        onSuccess={(token, user) => {
          setShowRegister(false);
          localStorage.setItem('authToken', token);
          onLogin({
            id: user.id,
            name: user.nombre,
            email: user.email,
            phone: user.telefono,
            role: user.roles[0] || 'usuario',
            zone: user.zona || 'Huancavelica',
            status: 'activo',
            alertsReported: 0,
            createdAt: new Date().toISOString(),
          });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AlertaSegura</h1>
              <p className="text-blue-100">Huancavelica, Perú</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Sistema de Alertas Inteligente</h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Protegiendo comunidades en zonas poco concurridas con tecnología de vanguardia
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: MapPin, text: 'Monitoreo en Tiempo Real', desc: 'Visualiza alertas georreferenciadas' },
                { icon: Bell, text: 'Notificaciones Instantáneas', desc: 'Recibe alertas inmediatas' },
                { icon: Users, text: 'Comunidad Conectada', desc: 'Colaboración entre vecinos y autoridades' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.text}</h3>
                    <p className="text-blue-200 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido</h2>
            <p className="text-gray-600">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Número de teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="+51 999 999 999"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div></div>
              <button
                type="button"
                onClick={() => setShowRecovery(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Iniciando Sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </motion.button>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-blue-900 mb-2">Credenciales de prueba:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin:</strong> admin@alertasegura.pe</p>
                <p><strong>Autoridad:</strong> autoridad@serenazgo.pe</p>
                <p><strong>Usuario:</strong> usuario@gmail.com</p>
                <p className="italic">Cualquier contraseña</p>
              </div>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Crear cuenta
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;