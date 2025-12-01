/**
 * Recomendaciones por tipo de alerta agrícola
 * Datos estáticos optimizados para Huancavelica
 */

const RECOMMENDATIONS = {
  helada: [
    {
      titulo: 'Proteger cultivos',
      descripcion: 'Cubrir plantas sensibles con mantas térmicas o plástico durante la noche',
      prioridad: 'alta',
    },
    {
      titulo: 'Riego preventivo',
      descripcion: 'Regar antes del atardecer para aprovechar el calor latente del agua',
      prioridad: 'alta',
    },
    {
      titulo: 'Uso de combustión',
      descripcion: 'Quemar materiales para generar humo y calor en el cultivo',
      prioridad: 'media',
    },
    {
      titulo: 'Cosecha anticipada',
      descripcion: 'Cosechar productos maduros antes de la helada',
      prioridad: 'alta',
    },
  ],
  granizada: [
    {
      titulo: 'Mallas antigranizo',
      descripcion: 'Instalar sistemas de protección con mallas sobre los cultivos',
      prioridad: 'alta',
    },
    {
      titulo: 'Cañones antigranizo',
      descripcion: 'Activar sistemas de dispersión de nubes si están disponibles',
      prioridad: 'media',
    },
    {
      titulo: 'Refugio de animales',
      descripcion: 'Proteger al ganado en establos cubiertos',
      prioridad: 'alta',
    },
    {
      titulo: 'Evaluación post-evento',
      descripcion: 'Inspeccionar daños y aplicar tratamientos preventivos contra plagas',
      prioridad: 'media',
    },
  ],
  lluvia: [
    {
      titulo: 'Drenaje',
      descripcion: 'Verificar y limpiar sistemas de drenaje para evitar inundaciones',
      prioridad: 'alta',
    },
    {
      titulo: 'Protección de semillas',
      descripcion: 'Evitar siembra durante lluvias intensas',
      prioridad: 'media',
    },
    {
      titulo: 'Control de erosión',
      descripcion: 'Implementar barreras vegetales o físicas en terrenos con pendiente',
      prioridad: 'alta',
    },
    {
      titulo: 'Almacenamiento seguro',
      descripcion: 'Proteger cosechas almacenadas de la humedad',
      prioridad: 'media',
    },
  ],
  sequia: [
    {
      titulo: 'Riego eficiente',
      descripcion: 'Implementar sistemas de riego por goteo o aspersión',
      prioridad: 'alta',
    },
    {
      titulo: 'Mulching',
      descripcion: 'Aplicar cobertura orgánica para retener humedad del suelo',
      prioridad: 'media',
    },
    {
      titulo: 'Cultivos resistentes',
      descripcion: 'Sembrar variedades adaptadas a condiciones de sequía',
      prioridad: 'alta',
    },
    {
      titulo: 'Conservación de agua',
      descripcion: 'Almacenar agua de lluvia en reservorios',
      prioridad: 'alta',
    },
  ],
  viento: [
    {
      titulo: 'Cortinas rompevientos',
      descripcion: 'Plantar árboles o instalar barreras para reducir velocidad del viento',
      prioridad: 'media',
    },
    {
      titulo: 'Reforzar estructuras',
      descripcion: 'Asegurar invernaderos y estructuras agrícolas',
      prioridad: 'alta',
    },
    {
      titulo: 'Tutorado de plantas',
      descripcion: 'Atar y reforzar plantas altas susceptibles a volcarse',
      prioridad: 'media',
    },
    {
      titulo: 'Riego post-viento',
      descripcion: 'Reponer humedad perdida por evapotranspiración acelerada',
      prioridad: 'baja',
    },
  ],
};

/**
 * Obtiene recomendaciones por tipo de alerta
 * @param {string} tipoAlerta - Tipo de alerta (helada, granizada, lluvia, sequia, viento)
 * @returns {Array<Object>}
 */
function getRecommendationsByType(tipoAlerta) {
  const tipo = tipoAlerta?.toLowerCase() || '';
  return RECOMMENDATIONS[tipo] || [];
}

module.exports = {
  RECOMMENDATIONS,
  getRecommendationsByType,
};
