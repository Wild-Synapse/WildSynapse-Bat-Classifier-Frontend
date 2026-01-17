import React, { useState } from 'react';
import { Activity } from 'lucide-react';

interface SpectrogramViewerProps {
  src: string;
  alt: string;
  className?: string;
}

const SpectrogramViewer: React.FC<SpectrogramViewerProps> = ({ src, alt, className = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}>
        <div className="animate-pulse flex items-center justify-center h-full">
          <Activity className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onLoad={() => setIsLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
        <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
          Click to enlarge
        </span>
      </div>
    </div>
  );
};

export default SpectrogramViewer;