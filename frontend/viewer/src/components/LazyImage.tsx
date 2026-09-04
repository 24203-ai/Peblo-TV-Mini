import { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export const LazyImage = ({ src, alt, className, fallbackText, ...props }: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }} className={className}>
      {!loaded && !error && (
        <div className="skeleton-loader" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      )}
      
      {error ? (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <ImageOff size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
          {fallbackText && <span style={{ fontSize: '0.8rem' }}>{fallbackText}</span>}
        </div>
      ) : (
        <img
          src={src?.startsWith('/assets') ? `http://localhost:8000${src}` : src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            ...props.style
          }}
          {...props}
        />
      )}
    </div>
  );
};
