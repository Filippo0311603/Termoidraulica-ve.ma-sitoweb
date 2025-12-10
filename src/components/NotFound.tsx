import { COLORS } from '../utils/constants';

const NotFound = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 flex items-center justify-center">
            {/* Background Image using CSS for better cover behavior */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/error404.jpg")',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat'
                }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 z-10"></div>

            {/* Content */}
            <div className="relative z-20 text-center px-4 animate-fade-in flex flex-col items-center">
                <h1 className="text-8xl md:text-9xl font-extrabold text-white mb-4 drop-shadow-2xl tracking-tighter">
                    404
                </h1>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 drop-shadow-lg">
                    Pagina Non Trovata
                </h2>
                <p className="text-gray-200 text-lg md:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
                    Sembra che tu ti sia perso. La pagina che stai cercando non è disponibile o è stata spostata.
                </p>
                
                <a 
                    href="/" 
                    className={`${COLORS.secondaryBg} hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-xl transition-all shadow-2xl hover:shadow-orange-500/50 inline-flex items-center gap-3 transform hover:-translate-y-1 backdrop-blur-sm border border-white/10`}
                >
                    <i className="fas fa-home"></i> Torna alla Home
                </a>
            </div>
        </div>
    );
};

export default NotFound;
