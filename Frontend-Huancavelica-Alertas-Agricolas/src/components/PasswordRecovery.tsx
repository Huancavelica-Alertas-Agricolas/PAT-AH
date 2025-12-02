// Comentarios añadidos en español: componente `PasswordRecovery` para recuperar contraseñas.
// Cómo lo logra: muestra formulario de recuperación y llama a la API para restablecer la contraseña.
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Smartphone, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { authApi } from '../services';
import { toast } from 'sonner';

interface PasswordRecoveryProps {
  onBack: () => void;
  onSuccess: () => void;
}

type RecoveryStep = 'request' | 'verify' | 'reset' | 'success';
type RecoveryMethod = 'sms' | 'email';

export default function PasswordRecovery({ onBack, onSuccess }: PasswordRecoveryProps) {
  const [step, setStep] = useState<RecoveryStep>('request');
  const [method, setMethod] = useState<RecoveryMethod>('sms');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identifier = method === 'sms' ? phone : email;
      await authApi.recoverPassword(identifier, method);
      toast.success(`Código enviado a tu ${method === 'sms' ? 'teléfono' : 'correo'}`);
      setStep('verify');
    } catch (err) {
      setError('Error al enviar código. Verifica tus datos.');
      toast.error('Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identifier = method === 'sms' ? phone : email;
      const isValid = await authApi.verifyCode(identifier, code);
      
      if (isValid) {
        toast.success('Código verificado');
        setStep('reset');
      } else {
        setError('Código incorrecto');
        toast.error('Código incorrecto');
      }
    } catch (err) {
      setError('Error al verificar código');
      toast.error('Error al verificar código');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const identifier = method === 'sms' ? phone : email;
      await authApi.resetPassword(identifier, code, newPassword);
      toast.success('Contraseña actualizada exitosamente');
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError('Error al actualizar contraseña');
      toast.error('Error al actualizar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {step === 'request' && (
            <motion.div
              key="request"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                aria-label="Volver al inicio de sesión"
              >
                <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                Volver
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h2>
              <p className="text-gray-600 mb-6">Selecciona cómo deseas recibir el código de verificación</p>

              <div className="grid grid-cols-2 gap-3 mb-6" role="group" aria-label="Método de recuperación">
                <button
                  onClick={() => setMethod('sms')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    method === 'sms'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-pressed={method === 'sms'}
                  aria-label="Recuperar por SMS"
                >
                  <Smartphone className={`w-6 h-6 mx-auto mb-2 ${method === 'sms' ? 'text-blue-600' : 'text-gray-400'}`} aria-hidden="true" />
                  <span className={`text-sm font-medium ${method === 'sms' ? 'text-blue-700' : 'text-gray-600'}`}>SMS</span>
                </button>

                <button
                  onClick={() => setMethod('email')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    method === 'email'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  aria-pressed={method === 'email'}
                  aria-label="Recuperar por correo electrónico"
                >
                  <Mail className={`w-6 h-6 mx-auto mb-2 ${method === 'email' ? 'text-blue-600' : 'text-gray-400'}`} aria-hidden="true" />
                  <span className={`text-sm font-medium ${method === 'email' ? 'text-blue-700' : 'text-gray-600'}`}>Email</span>
                </button>
              </div>

              <form onSubmit={handleRequestCode} className="space-y-4">
                {method === 'sms' ? (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Número de teléfono
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+51 999 999 999"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      aria-required="true"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      aria-required="true"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                    <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Enviar código de verificación"
                >
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificar Código</h2>
              <p className="text-gray-600 mb-6">
                Ingresa el código de 6 dígitos que enviamos a tu {method === 'sms' ? 'teléfono' : 'correo'}
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Código de verificación
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                    maxLength={6}
                    required
                    aria-required="true"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                    <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Verificar código"
                >
                  {loading ? 'Verificando...' : 'Verificar'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Volver a enviar código"
                >
                  ¿No recibiste el código? Reenviar
                </button>
              </form>
            </motion.div>
          )}

          {step === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Nueva Contraseña</h2>
              <p className="text-gray-600 mb-6">Crea una nueva contraseña segura</p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      minLength={8}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma tu contraseña"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      minLength={8}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
                    <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Actualizar contraseña"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña Actualizada!</h2>
              <p className="text-gray-600">Tu contraseña ha sido cambiada exitosamente</p>
              <p className="text-sm text-gray-500 mt-4">Redirigiendo al inicio de sesión...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
