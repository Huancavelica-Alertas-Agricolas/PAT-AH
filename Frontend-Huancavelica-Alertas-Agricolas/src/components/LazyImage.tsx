import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagen con lazy loading y optimización
 * Características:
 * - Carga diferida con IntersectionObserver
 * - Placeholder mientras carga
 * - Soporte para WebP con fallback
 * - Blur-up effect
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholderSrc,
  threshold = 0.1,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholderSrc);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Verificar si IntersectionObserver está disponible
    if (!('IntersectionObserver' in window)) {
      // Fallback: cargar imagen inmediatamente
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            if (imgRef.current) {
              observer.unobserve(imgRef.current);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '50px', // Cargar 50px antes de entrar al viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
      
      {/* Skeleton loader mientras carga */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg
              className="w-12 h-12 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Error al cargar</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Hook para generar URLs de imágenes optimizadas
 * Convierte automáticamente a WebP si es soportado
 */
export const useOptimizedImage = (src: string, width?: number, quality = 80) => {
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  useEffect(() => {
    // Verificar soporte de WebP
    const checkWebPSupport = async () => {
      if (!('createImageBitmap' in window)) {
        return false;
      }

      const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
      const blob = await fetch(webpData).then(r => r.blob());
      return createImageBitmap(blob).then(() => true, () => false);
    };

    checkWebPSupport().then((supportsWebP) => {
      if (supportsWebP && !src.endsWith('.webp')) {
        // Convertir extensión a .webp si es soportado
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        setOptimizedSrc(webpSrc);
      }
      
      // Agregar parámetros de optimización si es necesario
      if (width) {
        const separator = optimizedSrc.includes('?') ? '&' : '?';
        setOptimizedSrc(`${optimizedSrc}${separator}w=${width}&q=${quality}`);
      }
    });
  }, [src, width, quality]);

  return optimizedSrc;
};

/**
 * Componente para imágenes de fondo con lazy loading
 */
interface LazyBackgroundProps {
  src: string;
  children: React.ReactNode;
  className?: string;
}

export const LazyBackground: React.FC<LazyBackgroundProps> = ({
  src,
  children,
  className = '',
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string>('none');
  const [isLoaded, setIsLoaded] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setBackgroundImage(`url(${src})`);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Precargar imagen
            const img = new Image();
            img.src = src;
            img.onload = () => {
              setBackgroundImage(`url(${src})`);
              setIsLoaded(true);
            };
            
            if (divRef.current) {
              observer.unobserve(divRef.current);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => {
      if (divRef.current) {
        observer.unobserve(divRef.current);
      }
    };
  }, [src]);

  return (
    <div
      ref={divRef}
      className={`transition-all duration-500 ${className}`}
      style={{
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay mientras carga */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      {children}
    </div>
  );
};
