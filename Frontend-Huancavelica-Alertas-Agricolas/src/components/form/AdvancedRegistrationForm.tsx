import React, { useState, useEffect } from 'react';
// Constantes inlined para independencia del formulario
const provincia = [
  'Huancavelica (Ciudad)',
  'Provincia de Acobamba',
  'Provincia de Angaraes',
  'Provincia de Castrovirreyna',
  'Provincia de Churcampa',
  'Provincia de Huaytará',
  'Provincia de Tayacaja',
  'Otro distrito de Huancavelica'
];

const extensiones = [
  { value: 'menos-1', label: 'Menos de 1 hectárea' },
  { value: '1-5', label: '1 - 5 hectáreas' },
  { value: '5-20', label: '5 - 20 hectáreas' },
  { value: 'mas-20', label: 'Más de 20 hectáreas' },
];

const cultivos = ['Papa', 'Maíz', 'Quinua', 'Arroz', 'Café', 'Cacao'];

const problemas = [
  { value: 'nunca', label: 'Nunca' },
  { value: 'ocasionalmente', label: 'Ocasionalmente' },
  { value: 'frecuentemente', label: 'Frecuentemente' },
  { value: 'muy-frecuente', label: 'Muy frecuentemente' },
];

const medios = [
  { value: 'sms', label: 'SMS' },
  { value: 'Telegram', label: 'Telegram' },
  { value: 'email', label: 'Correo electrónico' },
  { value: 'app', label: 'Aplicación móvil' },
];

const experiencias = [
  { value: 'menos-2', label: 'Menos de 2 años' },
  { value: '2-5', label: '2 - 5 años' },
  { value: '6-10', label: '6 - 10 años' },
  { value: '11-20', label: '11 - 20 años' },
  { value: 'mas-20', label: 'Más de 20 años' },
];

const prediccion = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
  { value: 'a-veces', label: 'A veces' },
];

const importancia = [
  { value: 'muy-importante', label: 'Muy importante' },
  { value: 'importante', label: 'Importante' },
  { value: 'poco-importante', label: 'Poco importante' },
  { value: 'no-importante', label: 'No es importante' },
];
import { Card, CardHeader, CardTitle, CardContent, Input, Label, Checkbox, RadioGroup, RadioGroupItem, Button } from '../ui';
interface FormData {
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  provincia: string;
  extension: string;
  cultivos: string[];
  problemas_clima: string;
  altitud: string;
  medio_alerta: string[];
  experiencia: string;
  usa_prediccion: string;
  importancia_recomendaciones: string;
  comentarios: string;
}

const initialForm: FormData = {
  nombre: '', dni: '', telefono: '', email: '', provincia: '', extension: '',
  cultivos: [], problemas_clima: '', altitud: '', medio_alerta: [],
  experiencia: '', usa_prediccion: '', importancia_recomendaciones: '', comentarios: ''
};

const AdvancedRegistrationForm: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);

  useEffect(() => {
    setTimeout(() => setShowWelcomeAnimation(false), 2000);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'cultivos' || name === 'medio_alerta') {
        setForm(prev => ({
          ...prev,
          [name]: checked
            ? [...(prev[name as keyof FormData] as string[]), value]
            : (prev[name as keyof FormData] as string[]).filter(v => v !== value)
        }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRadioChange = (name: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-300 via-blue-200 to-purple-300 py-8">
      <Card className="w-full max-w-2xl mx-auto shadow-xl bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-green-700 text-center">Registro de Agricultores</CardTitle>
        </CardHeader>
        <CardContent>
          {showWelcomeAnimation && (
            <div className="mb-4 p-3 rounded bg-blue-100 text-blue-800 text-center font-semibold animate-pulse">Bienvenido al registro avanzado</div>
          )}
          {isSubmitted && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center font-semibold">¡Registro exitoso! Redirigiendo...</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                placeholder="Ejemplo: Juan Carlos Pérez López"
              />
            </div>
            {/* DNI */}
            <div className="space-y-1">
              <Label htmlFor="dni">DNI *</Label>
              <Input
                id="dni"
                name="dni"
                value={form.dni}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '').substring(0, 8);
                  setForm(prev => ({ ...prev, dni: val }));
                }}
                required
                maxLength={8}
                placeholder="12345678"
              />
              <div className="flex items-center justify-between text-xs mt-1">
                <div className={form.dni.length === 8 ? 'text-green-600' : 'text-gray-500'}>
                  Dígitos: {form.dni.length}/8
                </div>
                {form.dni.length > 0 && form.dni.length < 8 && (
                  <span className="text-amber-600">⚠️ Faltan {8 - form.dni.length} dígitos</span>
                )}
                {form.dni.length === 8 && (
                  <span className="text-green-500 animate-bounce">✓ DNI válido</span>
                )}
              </div>
            </div>
            {/* Teléfono */}
            <div className="space-y-1">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                name="telefono"
                value={form.telefono}
                onChange={e => {
                  // Permite solo +51 y 9 dígitos, con espacios opcionales
                  let val = e.target.value.replace(/(?!^\+)[^\d]/g, '');
                  if (!val.startsWith('+51')) {
                    val = '+51';
                  }
                  val = val.substring(0, 12); // +51 y 9 dígitos
                  setForm(prev => ({ ...prev, telefono: val }));
                }}
                required
                maxLength={12}
                placeholder="+51999888777"
              />
              {form.telefono && !/^\+51\d{9}$/.test(form.telefono) && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Ingrese un número válido: +51 seguido de 9 dígitos</p>
              )}
              {/^\+51\d{9}$/.test(form.telefono) && (
                <span className="ml-2 text-green-500 animate-bounce text-xs">✓ Número válido</span>
              )}
            </div>
            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com"
              />
              {form.email && !/^\S+@\S+\.\S+$/.test(form.email) && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Ingrese un correo válido, por ejemplo: ejemplo@correo.com</p>
              )}
              {form.email && /^\S+@\S+\.\S+$/.test(form.email) && (
                <span className="ml-2 text-green-500 animate-bounce text-xs">✓ Correo válido</span>
              )}
            </div>
            {/* Provincia */}
            <div className="space-y-1">
              <Label htmlFor="provincia">Provincia *</Label>
              <select
                id="provincia"
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">Seleccione una opción</option>
                {provincia.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {/* Extensión */}
            <div className="space-y-1">
              <Label>Extensión de su terreno</Label>
              <RadioGroup
                value={form.extension}
                onValueChange={val => handleRadioChange('extension', val)}
                className="grid grid-cols-1 gap-2 md:grid-cols-2"
              >
                {extensiones.map(ext => (
                  <Label key={ext.value} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                    <RadioGroupItem value={ext.value} />
                    {ext.label}
                  </Label>
                ))}
              </RadioGroup>
            </div>
            {/* Cultivos */}
            <div className="space-y-1">
              <Label>¿Qué cultivos tiene?</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {cultivos.map(cultivo => (
                  <Label key={cultivo} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                    <Checkbox
                      checked={form.cultivos.includes(cultivo)}
                      onCheckedChange={checked => {
                        setForm(prev => ({
                          ...prev,
                          cultivos: checked
                            ? [...prev.cultivos, cultivo]
                            : prev.cultivos.filter(c => c !== cultivo)
                        }));
                      }}
                    />
                    {cultivo}
                  </Label>
                ))}
              </div>
            </div>
            {/* Problemas climáticos */}
            <div className="space-y-1">
              <Label htmlFor="problemas_clima">¿Qué problemas climáticos ha enfrentado?</Label>
              <select
                id="problemas_clima"
                name="problemas_clima"
                value={form.problemas_clima}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">Seleccione una opción</option>
                {problemas.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            {/* Altitud */}
            <div className="space-y-1">
              <Label htmlFor="altitud">Altitud de su terreno (msnm)</Label>
              <Input
                id="altitud"
                name="altitud"
                value={form.altitud}
                onChange={handleChange}
                placeholder="Ejemplo: 3500"
              />
            </div>
            {/* Medios de alerta */}
            <div className="space-y-1">
              <Label>¿Por qué medios desea recibir alertas?</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {medios.map(medio => (
                  <Label key={medio.value} className="flex items-center gap-2 p-2 border rounded cursor-pointer">
                    <Checkbox
                      checked={form.medio_alerta.includes(medio.value)}
                      onCheckedChange={checked => {
                        setForm(prev => ({
                          ...prev,
                          medio_alerta: checked
                            ? [...prev.medio_alerta, medio.value]
                            : prev.medio_alerta.filter(m => m !== medio.value)
                        }));
                      }}
                    />
                    {medio.label}
                  </Label>
                ))}
              </div>
            </div>
            {/* Experiencia */}
            <div className="space-y-1">
              <Label htmlFor="experiencia">¿Cuántos años de experiencia tiene?</Label>
              <select
                id="experiencia"
                name="experiencia"
                value={form.experiencia}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">Seleccione una opción</option>
                {experiencias.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
            </div>
            {/* Predicción */}
            <div className="space-y-1">
              <Label htmlFor="usa_prediccion">¿Utiliza predicción climática?</Label>
              <select
                id="usa_prediccion"
                name="usa_prediccion"
                value={form.usa_prediccion}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">Seleccione una opción</option>
                {prediccion.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            {/* Importancia recomendaciones */}
            <div className="space-y-1">
              <Label htmlFor="importancia_recomendaciones">¿Qué tan importantes son las recomendaciones?</Label>
              <select
                id="importancia_recomendaciones"
                name="importancia_recomendaciones"
                value={form.importancia_recomendaciones}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              >
                <option value="">Seleccione una opción</option>
                {importancia.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
            </div>
            {/* Comentarios */}
            <div className="space-y-1">
              <Label htmlFor="comentarios">Comentarios adicionales</Label>
              <textarea
                id="comentarios"
                name="comentarios"
                value={form.comentarios}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                placeholder="Escriba aquí cualquier comentario adicional..."
              />
            </div>
            <Button
              type="submit"
              className="w-full mt-4 text-base font-bold"
            >
              Registrarse
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { AdvancedRegistrationForm };
