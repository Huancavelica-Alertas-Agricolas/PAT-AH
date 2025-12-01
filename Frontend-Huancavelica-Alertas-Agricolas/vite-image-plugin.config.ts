import { defineConfig } from 'vite';

/**
 * Configuración de optimización de imágenes para Vite
 * 
 * Incluye:
 * - Compresión automática de imágenes
 * - Conversión a WebP/AVIF
 * - Generación de responsive images
 */

export const imageOptimizationConfig = {
  // Extensiones de imagen a optimizar
  test: /\.(png|jpg|jpeg|gif|svg|webp)$/i,
  
  // Opciones de compresión
  compress: {
    // Calidad de compresión (0-100)
    quality: 80,
    
    // Compresión progresiva para JPEG
    progressive: true,
    
    // Optimización sin pérdida para PNG
    optimizationLevel: 7,
    
    // Eliminar metadatos EXIF
    stripMetadata: true,
  },
  
  // Generación de formatos modernos
  formats: {
    webp: {
      enabled: true,
      quality: 80,
    },
    avif: {
      enabled: true,
      quality: 70,
    },
  },
  
  // Responsive images
  responsive: {
    // Tamaños a generar
    sizes: [320, 640, 768, 1024, 1280, 1920],
    
    // Formato de nombre: [name]-[width].[ext]
    filename: '[name]-[width].[ext]',
  },
  
  // Límite para inline de imágenes (en bytes)
  inlineLimit: 4096, // 4KB
  
  // Cache de imágenes optimizadas
  cache: {
    enabled: true,
    directory: 'node_modules/.cache/vite-image-cache',
  },
};

/**
 * Loader para imágenes en CSS
 */
export const cssImageLoader = {
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [
            // Optimizar URLs de imágenes en CSS
            ['postcss-url', {
              url: 'inline',
              maxSize: 4, // 4KB
              fallback: 'copy',
            }],
          ],
        },
      },
    },
  ],
};

/**
 * Plugin personalizado para Vite
 */
export const viteImageOptimizationPlugin = () => {
  return {
    name: 'vite-image-optimization',
    
    // Transform hook para procesar imágenes
    transform(code: string, id: string) {
      // Detectar imports de imágenes
      const imageRegex = /\.(png|jpg|jpeg|gif|svg|webp)$/i;
      
      if (imageRegex.test(id)) {
        // Aquí se puede agregar lógica personalizada
        // Por ahora, Vite maneja la optimización básica
        return null;
      }
    },
    
    // Config hook para modificar configuración
    config() {
      return {
        build: {
          // Separar assets grandes en chunks
          assetsInlineLimit: 4096,
          
          // Configuración de chunks
          rollupOptions: {
            output: {
              assetFileNames: (assetInfo) => {
                const ext = assetInfo.name?.split('.').pop() || '';
                
                // Organizar assets por tipo
                if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
                  return 'assets/images/[name]-[hash][extname]';
                }
                
                if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
                  return 'assets/fonts/[name]-[hash][extname]';
                }
                
                return 'assets/[name]-[hash][extname]';
              },
            },
          },
        },
      };
    },
  };
};

export default defineConfig({
  plugins: [viteImageOptimizationPlugin()],
});
