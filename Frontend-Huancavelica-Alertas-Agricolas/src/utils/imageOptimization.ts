// Comentarios añadidos en español: utilidades para optimización de imágenes (compresión, WebP, thumbnails).
// Cómo lo logra: usa Canvas API y FileReader para generar Blobs, srcset y tamaños óptimos.
/**
 * Utilidades para optimización de imágenes
 */

/**
 * Comprime una imagen usando Canvas API
 */
export const compressImage = async (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto 2D'));
          return;
        }

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al comprimir imagen'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convierte imagen a formato WebP
 */
export const convertToWebP = async (
  file: File,
  quality = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener contexto 2D'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al convertir a WebP'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Error al cargar imagen'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsDataURL(file);
  });
};

/**
 * Genera thumbnail de una imagen
 */
export const generateThumbnail = async (
  file: File,
  size = 200
): Promise<Blob> => {
  return compressImage(file, size, size, 0.7);
};

/**
 * Calcula el tamaño óptimo de imagen según viewport
 */
export const getOptimalImageSize = (containerWidth: number): number => {
  // Usar devicePixelRatio para pantallas retina
  const dpr = window.devicePixelRatio || 1;
  
  // Tamaños estándar para responsive images
  const sizes = [320, 640, 768, 1024, 1280, 1920];
  
  const targetWidth = containerWidth * dpr;
  
  // Encontrar el tamaño más cercano que sea mayor o igual
  return sizes.find(size => size >= targetWidth) || sizes[sizes.length - 1];
};

/**
 * Precarga imágenes críticas
 */
export const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load ${url}`));
          img.src = url;
        })
    )
  );
};

/**
 * Genera srcset para responsive images
 */
export const generateSrcSet = (
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920]
): string => {
  return widths
    .map((width) => {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}w=${width} ${width}w`;
    })
    .join(', ');
};

/**
 * Genera sizes attribute para responsive images
 */
export const generateSizes = (
  breakpoints: { maxWidth: string; size: string }[] = [
    { maxWidth: '640px', size: '100vw' },
    { maxWidth: '768px', size: '50vw' },
    { maxWidth: '1024px', size: '33vw' },
  ]
): string => {
  return breakpoints
    .map((bp) => `(max-width: ${bp.maxWidth}) ${bp.size}`)
    .join(', ');
};

/**
 * Detecta soporte de formato WebP
 */
export const supportsWebP = async (): Promise<boolean> => {
  if (!('createImageBitmap' in window)) {
    return false;
  }

  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  
  try {
    const blob = await fetch(webpData).then((r) => r.blob());
    await createImageBitmap(blob);
    return true;
  } catch {
    return false;
  }
};

/**
 * Detecta soporte de formato AVIF
 */
export const supportsAVIF = async (): Promise<boolean> => {
  if (!('createImageBitmap' in window)) {
    return false;
  }

  const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  try {
    const blob = await fetch(avifData).then((r) => r.blob());
    await createImageBitmap(blob);
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtiene el mejor formato soportado
 */
export const getBestImageFormat = async (): Promise<'avif' | 'webp' | 'jpeg'> => {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpeg';
};

/**
 * Calcula el blur hash de una imagen (placeholder)
 */
export const generateBlurHash = async (
  imageUrl: string
): Promise<string> => {
  // Implementación simplificada - en producción usar blurhash library
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Usar imagen muy pequeña para el blur
      canvas.width = 4;
      canvas.height = 4;
      
      if (ctx) {
        ctx.drawImage(img, 0, 0, 4, 4);
        // const imageData = ctx.getImageData(0, 0, 4, 4);
        
        // Convertir a base64 como placeholder
        const placeholder = canvas.toDataURL('image/jpeg', 0.1);
        resolve(placeholder);
      }
    };
    
    img.src = imageUrl;
  });
};
