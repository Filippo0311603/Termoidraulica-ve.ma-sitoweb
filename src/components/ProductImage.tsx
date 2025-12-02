import { useState } from 'react';

const ProductImage = ({ src, alt, category }: { src: string, alt: string, category: string }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className="relative h-72 overflow-hidden bg-gray-200">
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 animate-pulse">
                    <i className="fas fa-image text-4xl opacity-50"></i>
                </div>
            )}
            <img
                src={hasError ? 'https://via.placeholder.com/600x400?text=No+Image' : src}
                alt={alt}
                loading="lazy"
                decoding="async"
                className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                onLoad={() => setIsLoaded(true)}
                onError={() => { setHasError(true); setIsLoaded(true); }}
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-700 uppercase tracking-wide shadow-sm z-10">
                {category}
            </div>
        </div>
    );
};

export default ProductImage;
