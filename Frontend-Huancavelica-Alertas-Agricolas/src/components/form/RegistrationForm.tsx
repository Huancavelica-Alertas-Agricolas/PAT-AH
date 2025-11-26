import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from '../../hooks/useForm';
import { FormData } from '../../types/form';
import { registerFarmer } from '../../services/alertService';
import { provincia, extensiones, cultivos, problemas, medios, experiencias, prediccion, importancia } from '../../utils/constants';

const initialForm: FormData = {
  nombre: '',
  dni: '',
  telefono: '',
  email: '',
  provincia: '',
  extension: '',
  cultivos: [],
  problemas_clima: '',
  altitud: '',
  medio_alerta: [],
  experiencia: '',
  usa_prediccion: '',
  importancia_recomendaciones: '',
  comentarios: '',
  contraseña: ''
};

export const RegistrationForm: React.FC = () => {
  const {
    form,
    setForm,
    isSubmitted,
    showSuccessAnimation,
    handleChange
  } = useForm(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // --- Aquí se conecta al backend para registrar el usuario ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    // Validación mínima de contraseña
    if (!form.contraseña || form.contraseña.length < 6) {
      setSubmitError('La contraseña debe tener al menos 6 caracteres.');
      setSubmitting(false);
      return;
    }

    // Si estamos online, intentamos crear el usuario en el backend
    const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3003/api';
    const OFFLINE_DEMO = (import.meta.env.VITE_OFFLINE_DEMO as string) === 'true';

    if (typeof window !== 'undefined' && window.navigator?.onLine) {
      try {
        const payload = {
          nombre: form.nombre,
          telefono: form.telefono,
          password: form.contraseña,
          email: form.email,
          ciudad: form.provincia || form.provincia,
        };
        const resp = await axios.post(`${API_BASE}/users`, payload, { timeout: 5000 });
        if (resp?.data?.success) {
          setSubmitSuccess(true);
          setTimeout(() => {
            setSubmitSuccess(false);
            window.location.href = '/login';
          }, 1500);
          return;
        }
        setSubmitError(resp?.data?.message || 'Error al registrar en el servidor');
      } catch (err: any) {
        console.warn('Registro API falló:', err?.message || err);
        // Si explicitamente activamos modo demo offline (VITE_OFFLINE_DEMO=true), guardamos en localStorage.
        if (OFFLINE_DEMO) {
          console.warn('OFFLINE_DEMO=true → guardando credenciales temporalmente en localStorage');
          try {
            localStorage.setItem('demoUser', JSON.stringify({ telefono: form.telefono, contraseña: form.contraseña }));
            setSubmitSuccess(true);
            setTimeout(() => {
              setSubmitSuccess(false);
              window.location.href = '/login';
            }, 2500);
            return;
          } catch (e: any) {
            // fallthrough to show error
          }
        }
        setSubmitError('Error al conectar con el servidor. Intenta nuevamente o contacte al administrador.');
      } finally {
        setSubmitting(false);
      }
    } else {
      // Offline path: only save demo data if OFFLINE_DEMO is enabled
      if (OFFLINE_DEMO) {
        try {
          localStorage.setItem('demoUser', JSON.stringify({ telefono: form.telefono, contraseña: form.contraseña }));
          setSubmitSuccess(true);
          setTimeout(() => {
            setSubmitSuccess(false);
            window.location.href = '/login';
          }, 2500);
        } catch (err: any) {
          setSubmitError('Error al registrar. Intente nuevamente.');
        } finally {
          setSubmitting(false);
        }
      } else {
        setSubmitError('Sin conexión: no se pudo contactar con el servidor. Intente más tarde.');
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-green-300 via-blue-200 to-purple-300 py-4 px-2 sm:py-8 sm:px-4 lg:px-8">
      <div className="max-w-4xl mx-auto shadow-xl bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-10">
        <h1 className="mb-6 text-3xl font-bold text-center text-green-700">Registro de Agricultores</h1>
        {submitSuccess && (
          <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center font-semibold">¡Registro exitoso! Redirigiendo...</div>
        )}
        {submitError && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-center font-semibold">{submitError}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Checkboxes de consentimiento y recordarme */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="remember"
                  name="remember"
                  className="h-5 w-5 text-green-600 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="text-sm">
                  📱 Recordarme en este dispositivo
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  className="h-5 w-5 text-green-600 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="notifications" className="text-sm">
                  📢 Consentimiento notificaciones SMS/Telegram
                </label>
              </div>
            </div>
            {/* Nombre */}
            <div>
              <label className="block mb-2 text-base font-medium text-gray-700">Nombre completo *</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200 border-gray-300 focus:border-green-500 hover:border-green-300"
                placeholder="Ejemplo: Juan Carlos Pérez López"
              />
            </div>
            {/* DNI */}
            <div>
              <label className="block mb-2 text-base font-medium text-gray-700">DNI *</label>
              <input
                name="dni"
                value={form.dni}
                onChange={handleChange}
                required
                maxLength={8}
                className="w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200 border-gray-300 focus:border-green-500 hover:border-green-300"
                placeholder="12345678"
              />
            </div>
            {/* Teléfono */}
            <div>
              <label className="block mb-2 text-base font-medium text-gray-700">Teléfono *</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200 border-gray-300 focus:border-green-500 hover:border-green-300"
                placeholder="+51 999 888 777"
              />
            </div>
            {/* Contraseña */}
            <div className="flex flex-col gap-1 mb-2">
              <label htmlFor="contraseña" className="block mb-2 text-base font-medium text-gray-700">Contraseña *</label>
              <input
                id="contraseña"
                name="contraseña"
                type="password"
                value={form.contraseña}
                onChange={handleChange}
                required
                minLength={6}
                autoComplete="new-password"
                className="w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200 border-gray-300 focus:border-green-500 hover:border-green-300 bg-white placeholder-gray-400"
                placeholder="Mínimo 6 caracteres"
              />
              <span className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 6 caracteres</span>
            </div>
            {/* Email */}
            <div>
              <label className="block mb-2 text-base font-medium text-gray-700">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-base border-2 rounded-lg focus:ring-2 focus:ring-green-200 outline-none transition-all duration-200 border-gray-300 focus:border-green-500 hover:border-green-300"
                placeholder="ejemplo@correo.com"
              />
            </div>
            {/* Provincia */}
            <div>
              <label className="block mb-2 text-base font-medium text-gray-700">Provincia *</label>
              <select
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">Seleccione una opción</option>
                {provincia.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
              </select>
            </div>
            {/* Extensión */}
            <div>
              <label className="block mb-3 text-base font-medium text-gray-700">Extensión de su terreno:</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {extensiones.map(ext => (
                  <label key={ext.value} className="flex items-center p-3 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-green-500">
                    <input
                      type="radio"
                      name="extension"
                      value={ext.value}
                      checked={form.extension === ext.value}
                      onChange={handleChange}
                      className="mr-3 text-green-500"
                    />
                    <span className="text-base">{ext.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Cultivos */}
            <div>
              <label className="block mb-3 text-base font-medium text-gray-700">¿Qué cultivos maneja?</label>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {cultivos.map(c => (
                  <label key={c} className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border-2 ${form.cultivos.includes(c)
                    ? 'bg-green-100 border-green-400 text-green-800'
                    : 'bg-white border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}>
                    <input
                      type="checkbox"
                      name="cultivos"
                      value={c}
                      checked={form.cultivos.includes(c)}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-base font-medium">{c}</span>
                    {form.cultivos.includes(c) && (
                      <span className="ml-auto text-green-500">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
            {/* Problemas climáticos */}
            <div>
              <label className="block mb-3 font-medium text-gray-700">¿Con qué frecuencia experimenta problemas climáticos?</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {problemas.map(p => (
                  <label key={p.value} className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="problemas_clima"
                      value={p.value}
                      checked={form.problemas_clima === p.value}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Altitud */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">¿A qué altitud se encuentra su cultivo? (metros)</label>
              <input
                name="altitud"
                type="number"
                min="0"
                max="5000"
                value={form.altitud}
                onChange={handleChange}
                placeholder="Ej: 3200"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            {/* Medio de alerta */}
            <div>
              <label className="block mb-3 font-medium text-gray-700">¿Qué medio prefiere para recibir alertas?</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {medios.map(m => (
                  <label key={m.value} className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      name="medio_alerta"
                      value={m.value}
                      checked={form.medio_alerta.includes(m.value)}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Experiencia */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">¿Cuántos años de experiencia tiene en agricultura?</label>
              <select
                name="experiencia"
                value={form.experiencia}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500"
              >
                <option value="">Seleccione su experiencia</option>
                {experiencias.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            {/* Predicción */}
            <div>
              <label className="block mb-3 font-medium text-gray-700">¿Utiliza algún sistema de predicción climática?</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {prediccion.map(p => (
                  <label key={p.value} className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="usa_prediccion"
                      value={p.value}
                      checked={form.usa_prediccion === p.value}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Importancia */}
            <div>
              <label className="block mb-3 font-medium text-gray-700">¿Qué tan importante considera recibir recomendaciones personalizadas?</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {importancia.map(i => (
                  <label key={i.value} className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="importancia_recomendaciones"
                      value={i.value}
                      checked={form.importancia_recomendaciones === i.value}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    {i.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Comentarios */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">Comentarios adicionales (Opcional)</label>
              <textarea
                name="comentarios"
                value={form.comentarios}
                onChange={handleChange}
                rows={4}
                placeholder="Escriba sus sugerencias aquí..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
            {/* Botón de envío */}
            <div className="text-center">
              <button
                type="submit"
                disabled={submitting || submitSuccess}
                className={`py-4 px-12 rounded-full text-lg font-bold shadow-lg transition-all duration-300 ${submitting || submitSuccess
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white cursor-pointer hover:scale-105'
                  }`}
              >
                {submitting ? 'Enviando...' : submitSuccess ? '✅ Formulario Enviado' : 'Enviar Formulario'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};
