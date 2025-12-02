import { COLORS } from '../utils/constants';
import { smoothScroll } from '../utils';

const HERO_IMAGE_URL = "/hero.webp";

const Hero = () => {
    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            <div className="absolute inset-0 z-0">
                <img
                    src={HERO_IMAGE_URL}
                    alt="Showroom Termoidraulica"
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900/90 to-blue-900/30"></div>
            </div>
            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="max-w-2xl text-left pt-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-md rounded-full px-4 py-1.5 mb-8 animate-slide-up shadow-lg">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-white font-semibold text-xs tracking-wider uppercase">Il punto di riferimento a Ladispoli</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight animate-slide-up delay-100 drop-shadow-lg">
                        Qualità e Scelta per la tua <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-400">Casa Ideale.</span>
                    </h1>
                    <p className="text-xl text-gray-300 mb-10 max-w-lg leading-relaxed animate-slide-up delay-200 font-light">
                        Il tuo negozio di fiducia per forniture termoidrauliche. Caldaie, climatizzatori, arredo bagno e ricambi delle migliori marche.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 animate-slide-up delay-300">
                        <a href="#prodotti" onClick={(e) => smoothScroll(e, 'prodotti')} className={`${COLORS.secondaryBg} hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 flex items-center justify-center gap-3 transform hover:-translate-y-1 cursor-pointer`}>
                            Guarda il Catalogo <i className="fas fa-arrow-right"></i>
                        </a>
                        <a href="#contatti" onClick={(e) => smoothScroll(e, 'contatti')} className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center justify-center gap-2 hover:border-white/40 cursor-pointer">
                            <i className="fas fa-map-marker-alt"></i> Dove Siamo
                        </a>
                    </div>
                    <div className="mt-16 mb-16 flex items-center gap-10 text-white animate-slide-up delay-300 border-t border-white/10 pt-8">
                        <div><h3 className="text-3xl font-bold text-white">25+</h3><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Anni Esperienza</p></div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div><h3 className="text-3xl font-bold text-white">10k+</h3><p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Prodotti</p></div>
                        <div className="w-px h-12 bg-white/20"></div>
                        <div><h3 className="text-3xl font-bold text-white">4.8</h3><div className="flex text-orange-400 text-xs mt-1"><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i><i className="fas fa-star"></i></div></div>
                    </div>
                </div>
                <div className="hidden lg:block relative animate-slide-up delay-200">
                    <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl max-w-md ml-auto animate-float">
                        <div className="flex justify-between items-start mb-6">
                            <div><h4 className="text-white font-bold text-lg">Vendita & Assistenza</h4><p className="text-gray-400 text-xs">I migliori brand del settore</p></div>
                            <div className="bg-orange-500/20 p-2 rounded-lg"><i className="fas fa-tags text-orange-400"></i></div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400"><i className="fas fa-fire"></i></div>
                                <div><p className="text-white text-sm font-bold">Riscaldamento</p><p className="text-gray-500 text-xs">Caldaie e Pompe di Calore</p></div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><i className="fas fa-snowflake"></i></div>
                                <div><p className="text-white text-sm font-bold">Climatizzazione</p><p className="text-gray-500 text-xs">Monosplit e Multisplit</p></div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex justify-between text-xs text-gray-400 mb-2"><span>Disponibilità Prodotti</span><span>Immediata</span></div>
                            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 w-[90%]"></div></div>
                        </div>
                    </div>
                    <div className="absolute -bottom-12 -left-4 z-20 bg-white text-gray-800 p-5 rounded-2xl shadow-xl max-w-xs animate-float animation-delay-2000">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><i className="fas fa-check-double text-xl"></i></div>
                            <div><span className="font-bold block text-sm">Rivenditore Autorizzato</span><span className="text-xs text-gray-500">Garanzia Ufficiale</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
