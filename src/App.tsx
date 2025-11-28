import React, { useState, useEffect, useRef } from 'react';
//import emailjs from '@emailjs/browser';

// IMPORTA IL FILE CSS DI TAILWIND
import './index.css';

// @ts-ignore
import logoLocale from './logoo.png';
// @ts-ignore
import negozioLocale from './negozio.webp';
// @ts-ignore
import fotoForniture from './foto-forniture.webp';
// @ts-ignore
import fotoForniture2 from './foto-forniture2.webp';
// @ts-ignore
import fotoForniture3 from './foto forniture3.webp';

// --- Configuration ---
const COLORS = {
    primary: "text-blue-900",
    primaryBg: "bg-blue-900",
    secondary: "text-orange-500",
    secondaryBg: "bg-orange-500",
    secondaryHover: "hover:bg-orange-600",
    accent: "text-cyan-500",
    accentBg: "bg-cyan-500"
};

// LINK SOCIAL E WHATSAPP
const SOCIAL_LINKS = {
    facebook: "https://www.facebook.com/TUA_PAGINA",
    instagram: "https://www.instagram.com/TUA_PAGINA",
    whatsapp: "https://wa.me/393382611291"
};

const LOGO_URL = logoLocale;
const HERO_IMAGE_URL = "/hero.webp";

// --- Types ---
type Product = {
    id: string | number;
    category: string;
    name: string;
    price: string;
    image: string;
    desc: string;
    specs: string[];
    stock?: number;
};

// --- Sub-Components ---

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    centered?: boolean;
    light?: boolean;
}

const SectionTitle = ({ title, subtitle, centered = true, light = false }: SectionTitleProps) => (
    <div className={`mb-12 reveal ${centered ? 'text-center' : 'text-left'}`}>
        <h2 className={`text-3xl md:text-5xl font-bold mb-4 ${light ? 'text-white' : COLORS.primary}`}>
            {title}
        </h2>
        <div className={`h-1.5 w-20 ${COLORS.secondaryBg} rounded-full mb-6 ${centered ? 'mx-auto' : ''}`}></div>
        {subtitle && <p className={`text-lg ${light ? 'text-gray-300' : 'text-gray-600'} max-w-2xl ${centered ? 'mx-auto' : ''}`}>{subtitle}</p>}
    </div>
);

// Componente Immagine
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

// --- MODALE PREFERITI ---
interface FavoritesModalProps {
    isOpen: boolean;
    onClose: () => void;
    favorites: (string | number)[];
    products: Product[];
    toggleFavorite: (id: string | number) => void;
}

const FavoritesModal = ({ isOpen, onClose, favorites, products, toggleFavorite }: FavoritesModalProps) => {
    if (!isOpen) return null;

    const favoriteProducts = products.filter(p => favorites.includes(p.id));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>

                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                        <i className="fas fa-heart text-red-500"></i> La tua Lista dei Desideri
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <i className="fas fa-times text-xl text-gray-500"></i>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 flex-1">
                    {favoriteProducts.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <i className="far fa-heart text-4xl mb-4 text-gray-300"></i>
                            <p>Non hai ancora salvato nessun prodotto.</p>
                            <button onClick={onClose} className="mt-4 text-blue-600 font-bold hover:underline">Torna al catalogo</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {favoriteProducts.map(product => (
                                <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</h4>
                                        <p className="text-xs text-gray-500 mb-1">Cod: {product.id}</p>
                                        <p className="text-orange-500 font-bold">{product.price}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleFavorite(product.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                        title="Rimuovi dai preferiti"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <p className="text-xs text-gray-500 text-center mb-4">
                        <i className="fas fa-info-circle mr-1"></i>
                        Mostra questa lista in negozio per richiedere i prodotti.
                    </p>
                    <button onClick={onClose} className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors">
                        Chiudi Lista
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- PRODUCT MODAL ---
interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    isFavorite: boolean;
    onToggleFavorite: () => void;
}

const ProductModal = ({ product, onClose, isFavorite, onToggleFavorite }: ProductModalProps) => {
    if (!product) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row relative modal-enter modal-enter-active" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full hover:bg-gray-100">
                    <i className="fas fa-times text-xl text-gray-800"></i>
                </button>
                <div className="md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4 bg-blue-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {product.category}
                    </div>
                    {product.stock !== undefined && (
                        <div className={`absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase ${product.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {product.stock > 0 ? 'Disponibile' : 'Su Ordinazione'}
                        </div>
                    )}
                </div>
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    <p className={`text-2xl font-bold ${COLORS.secondary} mb-6`}>{product.price}</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{product.desc}</p>

                    <div className="mb-8">
                        <h4 className="font-bold text-gray-900 mb-3">Caratteristiche Tecniche:</h4>
                        <ul className="grid grid-cols-2 gap-2">
                            {product.specs?.map((spec: string, i: number) => (
                                <li key={i} className="flex items-center text-sm text-gray-600">
                                    <i className="fas fa-check text-green-500 mr-2"></i> {spec}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <a
                            href="#contatti"
                            onClick={(e) => {
                                onClose();
                                smoothScroll(e, 'contatti');
                            }}
                            className={`flex-1 ${COLORS.secondaryBg} text-white text-center py-3 rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer`}
                        >
                            Richiedi Disponibilità
                        </a>
                        <button
                            onClick={onToggleFavorite}
                            aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                            className={`px-4 py-3 border rounded-xl transition-all ${isFavorite ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}
                        >
                            <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Utilities ---
const smoothScroll = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

// --- Custom Hooks ---
// Modificato per non dipendere da isLoading, parte subito
const useScrollReveal = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        setTimeout(() => {
            const elements = document.querySelectorAll('.reveal');
            elements.forEach(el => observer.observe(el));
        }, 100);

        return () => observer.disconnect();
    }, []);
};

// --- Main Components ---

const Navbar = ({ favoritesCount, onOpenFavorites }: { favoritesCount: number, onOpenFavorites: () => void }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navLinks = ['Chi Siamo', 'Servizi', 'Prodotti', 'Forniture', 'Contatti'];

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent, id: string) => {
        smoothScroll(e, id);
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="flex items-center gap-3 group cursor-pointer text-decoration-none">
                    <img src={LOGO_URL} alt="VE.MA Logo" className="h-16 w-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                    <span className={`text-2xl font-extrabold tracking-tight ${scrolled ? COLORS.primary : 'text-white'}`}>
                        VE.MA<span className="text-orange-500">.</span>
                    </span>
                </a>

                <div className="hidden lg:flex gap-8 items-center">
                    <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className={`font-medium text-sm tracking-wide hover:text-orange-500 transition-colors cursor-pointer ${scrolled ? 'text-gray-700' : 'text-white/90'}`}>HOME</a>
                    {navLinks.map((item) => (
                        <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={(e) => handleNavClick(e, item.toLowerCase().replace(' ', '-'))} className={`font-medium text-sm tracking-wide hover:text-orange-500 transition-colors cursor-pointer relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-orange-500 after:left-0 after:-bottom-1 after:transition-all hover:after:w-full ${scrolled ? 'text-gray-700' : 'text-white/90'}`}>{item.toUpperCase()}</a>
                    ))}

                    {/* Tasto Preferiti Desktop */}
                    <button
                        onClick={onOpenFavorites}
                        aria-label="Vedi i tuoi preferiti"
                        className={`relative p-2 transition-colors ${scrolled ? 'text-gray-700 hover:text-red-500' : 'text-white hover:text-red-400'}`}
                        title="I tuoi preferiti"
                    >
                        <i className="fas fa-heart text-xl"></i>
                        {favoritesCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {favoritesCount}
                            </span>
                        )}
                    </button>

                    <a href="#contatti" onClick={(e) => handleNavClick(e, 'contatti')} className={`${COLORS.secondaryBg} text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 transform cursor-pointer`}>Richiedi Info</a>
                </div>

                <div className="flex items-center gap-4 lg:hidden">
                    <button
                        onClick={onOpenFavorites}
                        aria-label="Vedi i tuoi preferiti"
                        className={`relative p-2 ${scrolled ? 'text-gray-700' : 'text-white'}`}
                    >
                        <i className="fas fa-heart text-xl"></i>
                        {favoritesCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {favoritesCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Chiudi menu" : "Apri menu navigazione"} // <--- QUESTA MANCAVA!
                        className={`text-2xl ${scrolled ? 'text-gray-800' : 'text-white'}`}
                    >
                        <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                    </button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl py-6 flex flex-col items-center space-y-6 text-gray-800 font-bold border-t animate-slide-up">
                    <a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="hover:text-orange-500 text-lg">Home</a>
                    {navLinks.map((item) => (
                        <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={(e) => handleNavClick(e, item.toLowerCase().replace(' ', '-'))} className="hover:text-orange-500 text-lg">{item}</a>
                    ))}
                </div>
            )}
        </nav>
    );
};

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

const Brands = () => {
    const BRANDS = ["Vaillant", "Daikin", "Samsung", "Grohe", "Geberit", "Ariston", "Mitsubishi", "Baxi", "Ideal Standard", "Bosch", "Junkers", "Caleffi", "Roca", "Electrolux", "Hitachi", "Fischer"];
    return (
        <section className="py-8 bg-blue-900 border-t border-blue-800 overflow-hidden">
            <div className="container mx-auto px-6 mb-4">
                <p className="text-center text-blue-300 text-sm font-bold uppercase tracking-widest">I nostri partner commerciali</p>
            </div>
            <div className="relative flex overflow-x-hidden">
                <div className="py-2 animate-marquee whitespace-nowrap flex gap-16 px-6">
                    {BRANDS.map((brand, i) => (<span key={i} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>))}
                    {BRANDS.map((brand, i) => (<span key={`dup-${i}`} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>))}
                </div>
                <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap flex gap-16 px-6">
                    {BRANDS.map((brand, i) => (<span key={`dup2-${i}`} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>))}
                    {BRANDS.map((brand, i) => (<span key={`dup3-${i}`} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>))}
                </div>
            </div>
            <style>{`
        .animate-marquee { animation: marquee 25s linear infinite; }
        .animate-marquee2 { animation: marquee2 25s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
        @keyframes marquee2 { 0% { transform: translateX(100%); } 100% { transform: translateX(0%); } }
      `}</style>
        </section>
    );
};

const About = () => {
    return (
        <section id="chi-siamo" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 relative reveal">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                        <img src={negozioLocale} alt="VE.MA Showroom" className="relative rounded-3xl shadow-2xl z-10 w-full object-cover h-[500px]" />
                        <div className="absolute -bottom-6 -right-6 z-20 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs hidden md:block">
                            <p className="font-serif italic text-gray-600 text-lg">"La qualità dei materiali fa la differenza nel tempo."</p>
                        </div>
                    </div>
                    <div className="lg:w-1/2 reveal">
                        <SectionTitle title="La Nostra Storia" subtitle="Il tuo partner di fiducia a Ladispoli." centered={false} />
                        <p className="text-gray-600 text-lg leading-relaxed mb-6"><strong>Termoidraulica VE.MA</strong> è il punto vendita di riferimento a Ladispoli e nel litorale romano per chi cerca prodotti termoidraulici di alta qualità.</p>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">Siamo specializzati esclusivamente nella <strong>vendita</strong> di forniture civili e industriali. Che tu sia un professionista, un installatore o un privato amante del fai-da-te, nel nostro showroom troverai competenza, cortesia e un magazzino sempre fornito.</p>
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start gap-3"><div className="bg-green-100 p-2 rounded-lg text-green-600"><i className="fas fa-check-circle text-xl"></i></div><div><h5 className="font-bold text-gray-800">Solo Migliori Marche</h5><p className="text-sm text-gray-500">Rivenditori ufficiali dei top brand.</p></div></div>
                            <div className="flex items-start gap-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><i className="fas fa-user-shield text-xl"></i></div><div><h5 className="font-bold text-gray-800">Consulenza Dedicata</h5><p className="text-sm text-gray-500">Ti aiutiamo a scegliere bene.</p></div></div>
                        </div>
                        <div className="border-t pt-8 border-gray-100 flex gap-12">
                            <div><span className="block text-3xl font-bold text-blue-900">100%</span><span className="text-sm text-gray-500">Soddisfazione</span></div>
                            <div><span className="block text-3xl font-bold text-blue-900">25+</span><span className="text-sm text-gray-500">Anni di Esperienza</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Services = () => {
    const SERVICES = [
        { icon: "fa-store", title: "Ampio Showroom", desc: "Vieni a toccare con mano la qualità dei nostri prodotti nel nostro punto vendita di Ladispoli." },
        { icon: "fa-comments", title: "Consulenza Tecnica", desc: "I nostri esperti al banco ti guideranno nella scelta del prodotto migliore per le tue esigenze." },
        { icon: "fa-boxes-stacked", title: "Magazzino Ricambi", desc: "Vasto assortimento di ricambi originali per caldaie, rubinetteria e cassette di scarico." },
        { icon: "fa-truck-ramp-box", title: "Forniture Cantieri", desc: "Listini dedicati e gestione ordini per installatori, imprese edili e professionisti del settore." }
    ];
    return (
        <section id="servizi" className="py-24 bg-slate-50 relative">
            <div className="container mx-auto px-6 relative z-10">
                <SectionTitle
                    title="Cosa Offriamo"
                    subtitle="Un'esperienza di acquisto completa: dalla scelta del prodotto alla fornitura dei ricambi."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {SERVICES.map((service, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 group border border-gray-100 reveal hover:-translate-y-2 cursor-default">
                            <div className={`w-16 h-16 ${COLORS.primaryBg} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-blue-900/20`}>
                                <i className={`fas ${service.icon}`}></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm mb-4">
                                {service.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- CATALOGO AGGIORNATO (Gestione Loading Interna) ---
const Catalog = ({
    products,
    favorites,
    toggleFavorite,
    isLoading,
    errorMsg
}: {
    products: Product[],
    favorites: (string | number)[],
    toggleFavorite: (id: string | number) => void,
    isLoading: boolean,
    errorMsg: string
}) => {
    const [activeCat, setActiveCat] = useState("Tutti");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [inputValue, setInputValue] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const uniqueCategories = [...new Set(products.map(p => p.category))];
    uniqueCategories.sort();
    const categories = ["Tutti", ...uniqueCategories];

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCat === "Tutti" || product.category === activeCat;

        if (!searchQuery.trim()) return matchesCategory;

        const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
        const productDataString = `
        ${product.name} 
        ${product.id} 
        ${product.category} 
        ${product.desc} 
        ${product.specs ? product.specs.join(" ") : ""}
      `.toLowerCase();

        const matchesSearch = searchTerms.every(term => productDataString.includes(term));

        return matchesCategory && matchesSearch;
    });

    const visibleProducts = filteredProducts.slice(0, visibleCount);

    useEffect(() => {
        setVisibleCount(12);
    }, [activeCat, searchQuery]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 12);
    };

    return (
        <section id="prodotti" className="py-24 bg-white">
            <style>{`
          @keyframes simpleFadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .product-enter {
            animation: simpleFadeIn 0.5s ease-out forwards;
          }
        `}</style>

            <div className="container mx-auto px-6">
                {/* HEADER DEL CATALOGO (SEMPRE VISIBILE) */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-8 reveal gap-6">

                    <div className="w-full lg:w-1/2">
                        <h2 className={`text-4xl font-bold ${COLORS.primary} mb-2`}>Il Nostro Catalogo</h2>
                        <p className="text-gray-600 mb-6">
                            {isLoading ? "Caricamento in corso..." : `${filteredProducts.length} prodotti trovati`}
                        </p>

                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Cerca (es. 'Galleggiante', 'Geberit 7300', 'Caldaia 24kw')..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all shadow-sm text-gray-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                {inputValue !== searchQuery ? (<i className="fas fa-spinner fa-spin text-blue-500"></i>) : (<i className="fas fa-search text-lg"></i>)}
                            </div>
                            {inputValue && (
                                <button onClick={() => setInputValue("")} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-1/3 flex items-center gap-3">
                        <div className="relative w-full">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-900 pointer-events-none"><i className="fas fa-filter"></i></div>
                            <select
                                value={activeCat}
                                onChange={(e) => setActiveCat(e.target.value)}
                                disabled={isLoading}
                                aria-label="Filtra prodotti per categoria"
                                className={`w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 pl-12 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 cursor-pointer shadow-sm font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {categories.map(cat => (<option key={cat} value={cat}>{cat === "Tutti" ? "Tutte le Categorie" : cat}</option>))}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"><i className="fas fa-chevron-down text-xs"></i></div>
                        </div>
                        {activeCat !== "Tutti" && (<button onClick={() => setActiveCat("Tutti")} className="bg-red-50 hover:bg-red-100 text-red-500 p-3 rounded-xl border border-red-200 transition-colors flex-shrink-0" title="Annulla Filtro Categoria"><i className="fas fa-times"></i></button>)}
                    </div>
                </div>

                {/* AREA GRIGLIA: QUI GESTIAMO LOADING E ERRORI */}
                <div id="catalog" className="min-h-[400px]">
                    {isLoading ? (
                        // SPINNER DI CARICAMENTO (DENTRO LA SEZIONE)
                        <div className="flex flex-col items-center justify-center py-20 h-full">
                            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-400 text-sm animate-pulse">Stiamo recuperando il listino aggiornato...</p>
                        </div>
                    ) : errorMsg ? (
                        // MESSAGGIO DI ERRORE
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Errore di caricamento</h3>
                            <p className="text-gray-500">{errorMsg}</p>
                            <button onClick={() => window.location.reload()} className="mt-6 text-blue-600 font-bold hover:underline">Riprova</button>
                        </div>
                    ) : (
                        // GRIGLIA PRODOTTI REALE
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {visibleProducts.length > 0 ? (
                                    visibleProducts.map((product) => (
                                        <div key={product.id} className="product-enter group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer relative" onClick={() => setSelectedProduct(product)}>

                                            <ProductImage
                                                src={product.image}
                                                alt={product.name}
                                                category={product.category}
                                            />

                                            {/* Tasto Preferiti sulla Card */}
                                            <button
                                                type="button" // È buona norma specificare type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(product.id);
                                                }}
                                                aria-label={favorites.includes(product.id) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
                                                className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 ${favorites.includes(product.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
                                            >
                                                <i className={`${favorites.includes(product.id) ? 'fas' : 'far'} fa-heart`}></i>
                                            </button>

                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-900 transition-colors line-clamp-1">{product.name}</h3>
                                                    <span className={`${COLORS.secondary} font-bold text-lg whitespace-nowrap`}>{product.price}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mb-2 font-mono">Cod: {product.id}</p>
                                                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{product.desc}</p>
                                                <div className="flex items-center text-sm font-semibold text-blue-900 group-hover:translate-x-2 transition-transform">
                                                    Dettagli <i className="fas fa-arrow-right ml-2"></i>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                                        <div className="text-gray-300 text-6xl mb-4"><i className="fas fa-search"></i></div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">Nessun prodotto trovato</h3>
                                        <p className="text-gray-500">
                                            Non abbiamo trovato risultati per "{inputValue}"
                                            {activeCat !== "Tutti" && <span> nella categoria "<strong>{activeCat}</strong>"</span>}.
                                            <br />Prova a cercare un termine più generico.
                                        </p>
                                        <button onClick={() => { setInputValue(""); setSearchQuery(""); setActiveCat("Tutti"); }} className="mt-6 text-blue-600 font-bold hover:underline">Resetta Filtri</button>
                                    </div>
                                )}
                            </div>

                            {visibleCount < filteredProducts.length && (
                                <div className="mt-16 text-center">
                                    <button
                                        onClick={handleLoadMore}
                                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-orange-500 hover:text-orange-500 px-8 py-3 rounded-full font-bold transition-all duration-300 shadow-sm"
                                    >
                                        Carica altri prodotti ({filteredProducts.length - visibleCount} rimanenti)
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <ProductModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
                onToggleFavorite={() => selectedProduct && toggleFavorite(selectedProduct.id)}
            />
        </section>
    );
};

const FornitureSection = () => {
    return (
        <section id="forniture" className="py-24 bg-slate-900 text-white relative">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="container mx-auto px-6 relative z-10">
                <SectionTitle title="Forniture & Partner" subtitle="Servizi dedicati a Installatori, Architetti e Imprese Edili." centered={true} light={true} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 reveal">
                    <div>
                        <h3 className="text-3xl font-bold mb-6">Area Professionisti</h3>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            Sappiamo quanto è importante avere un partner affidabile in cantiere.<br />Per questo offriamo servizi dedicati ai professionisti del settore termoidraulico.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center font-bold"><i className="fas fa-percent"></i></div>
                                <div><h5 className="font-bold">Listini Riservati</h5><p className="text-sm text-gray-400">Sconti dedicati per possessori di Partita IVA.</p></div>
                            </li>
                            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 w-full">
                                    <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center font-bold"><i className="fab fa-whatsapp"></i></div>
                                    <div><h5 className="font-bold hover:text-orange-500 transition-colors">Ordini Rapidi WhatsApp</h5><p className="text-sm text-gray-400">Invia la lista e ti prepariamo tutto per il ritiro.</p></div>
                                </a>
                            </li>
                        </ul>
                        <a
                            href="#contatti"
                            onClick={(e) => smoothScroll(e, 'contatti')}
                            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
                        >
                            Contattaci per Saperne di Più
                        </a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src={fotoForniture} className="rounded-2xl transform translate-y-8" alt="Cantiere 1" />
                        <img src={fotoForniture2} className="rounded-2xl" alt="Cantiere 2" />
                        <img src={fotoForniture3} className="rounded-2xl transform translate-y-8" alt="Cantiere 3" />
                        <div className="bg-blue-800 rounded-2xl flex items-center justify-center p-6 text-center">
                            <div>
                                <h4 className="text-4xl font-bold mb-2">500+</h4>
                                <p className="text-sm text-blue-300">Cantieri Forniti</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Testimonials = () => {
    const TESTIMONIALS = [
        {
            name: "Luca V.",
            role: "Installatore Professionista",
            text: "Dopo varie ricerche in zona Ladispoli e cerveteri per l'acquisto di una caldaia e accessori per il bagno ho trovato questo negozio gestito da persone veramente competenti, gentili e con prezzi convenienti. Sicuramente tornerò da loro per l'acquisto di un condizionatore prima della prossima estate!",
            rating: 5,
            img: null
        },
        {
            name: "Claudio D.",
            role: "Cliente Google",
            text: "Disponibilità e professionalità al top! Mi sono rivolto alla termoidraulica di Massimo per l'acquisto di uno scaldabagno da 80 litri, ma dopo aver valutato meglio lo spazio disponibile, ho chiesto di poterlo sostituire con uno da 50 litri. Massimo è stato estremamente gentile e disponibile: ha gestito il cambio senza problemi e con grande professionalità. Servizio rapido, preciso e con un'attenzione al cliente davvero rara al giorno d’oggi. Consiglio vivamente Massimo a chi cerca un professionista serio, onesto e sempre pronto a venire incontro alle esigenze del cliente. Grazie ancora!",
            rating: 5,
            img: null
        },
        {
            name: "Luigi D.",
            role: "Cliente Google",
            text: "Personale altamente qualificato e disponibile ad ascoltare le richieste, al fine di aiutare a fare un acquisto mirato e ottimo. Prezzi buoni e soprattutto, ottimo il rapporto qualità prezzo. Lo consiglio vivamente.",
            rating: 5,
            img: null
        },
    ];
    return (
        <section className="py-24 bg-blue-50">
            <div className="container mx-auto px-6">
                <SectionTitle title="Dicono di Noi" subtitle="La soddisfazione di chi sceglie VE.MA per i propri acquisti." centered={true} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-blue-100 reveal flex flex-col h-full">
                            <div className="flex text-yellow-400 mb-4 text-sm">
                                {[...Array(t.rating)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                            </div>

                            <p className="text-gray-600 italic mb-6 leading-relaxed flex-1">"{t.text}"</p>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                {t.img ? (
                                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-lg">
                                        {t.name.charAt(0)}
                                    </div>
                                )}

                                <div>
                                    <h5 className="font-bold text-gray-900 text-sm">{t.name}</h5>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);
    const FAQS = [
        { q: "Effettuate installazioni?", a: "No, siamo un negozio di vendita prodotti. Possiamo però consigliarti i materiali migliori per il tuo installatore di fiducia." },
        { q: "Fate consegne a domicilio?", a: "No, non effettuiamo consegne di materiali." },
        { q: "Avete pezzi di ricambio?", a: "Assolutamente sì. Disponiamo di un magazzino ricambi molto fornito per le principali marche di caldaie e rubinetteria." },
        { q: "Quali sono gli orari del negozio?", a: "Siamo aperti dal Lunedì al Venerdì, 08:15 - 13:00 e 15 - 18:30. Chiusi il Sabato e la Domenica." },
    ];
    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-6 max-w-4xl">
                <SectionTitle title="Domande Frequenti" centered={true} />
                <div className="space-y-4 reveal">
                    {FAQS.map((faq, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden">
                            <button onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)} className="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50 transition-colors text-left">
                                <span className="font-bold text-gray-800 text-lg">{faq.q}</span>
                                <i className={`fas fa-chevron-down transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-orange-500' : 'text-gray-400'}`}></i>
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}><div className="p-6 pt-0 text-gray-600 bg-white border-t border-gray-100">{faq.a}</div></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Contact = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSending, setIsSending] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState("");

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setFeedbackMsg("");
        setTimeout(() => { setIsSending(false); setFeedbackMsg("Messaggio inviato! (Configura EmailJS)"); }, 1500);
    };

    return (
        <section id="contatti" className="py-24 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="reveal">
                        <h4 className="text-orange-500 font-bold uppercase tracking-wider mb-2">Contattaci</h4>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Siamo a Ladispoli.</h2>
                        <p className="text-gray-300 mb-10 text-lg leading-relaxed">Passa a trovarci in negozio per una consulenza personalizzata o richiedi informazioni online.</p>
                        <div className="space-y-6 mb-10">
                            <a href="https://www.google.com/maps/search/?api=1&query=Via+delle+Magnolie,+21,+00055+Ladispoli+RM" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group hover:opacity-80 transition-opacity">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300"><i className="fas fa-map-marker-alt"></i></div>
                                <div><p className="text-sm text-gray-400 mb-1">Punto Vendita</p><p className="font-bold text-xl">Via delle Magnolie, 21, 00055 Ladispoli (RM)</p></div>
                            </a>
                            <a href="tel:+393382611291" className="flex items-center gap-6 group hover:opacity-80 transition-opacity">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300"><i className="fas fa-phone-alt"></i></div>
                                <div><p className="text-sm text-gray-400 mb-1">Telefono</p><p className="font-bold text-xl">+39 338 261 1291</p></div>
                            </a>
                            <a href="mailto:max69vema@yahoo.it" className="flex items-center gap-6 group hover:opacity-80 transition-opacity">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300"><i className="fas fa-envelope"></i></div>
                                <div><p className="text-sm text-gray-400 mb-1">Email</p><p className="font-bold text-xl">max69vema@yahoo.it</p></div>
                            </a>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="far fa-clock text-orange-500"></i> Orari di Apertura</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300"><div><span className="block font-bold text-white">Lun - Ven</span><span>08:15 - 13:00</span><br /><span>15:00 - 18:30</span></div><div><span className="block font-bold text-white">Sabato e Domenica</span><span>Chiuso</span></div></div>
                        </div>
                    </div>
                    <div className="space-y-6 reveal">
                        <div className="w-full h-80 bg-slate-800 rounded-3xl overflow-hidden relative group shadow-2xl border border-white/10">
                            <iframe width="100%" height="100%" title="Mappa Termoidraulica VE.MA" src="https://maps.google.com/maps?q=Termoidraulica+VE.MA.+Via+delle+Magnolie,+21,+00055+Ladispoli+RM&t=&z=15&ie=UTF8&iwloc=&output=embed" style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }} allowFullScreen loading="lazy"></iframe>
                            <a href="https://www.google.com/maps/dir//Via+delle+Magnolie,+21,+00055+Ladispoli+RM" target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"><i className="fas fa-directions"></i> Ottieni Indicazioni</a>
                        </div>
                        <div className="bg-white rounded-3xl p-8 md:p-10 text-gray-800 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 text-blue-900">Scrivici un Messaggio</h3>
                            <form ref={formRef} onSubmit={sendEmail} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4"><input type="text" name="user_name" required placeholder="Nome" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" /><input type="text" name="user_surname" placeholder="Cognome" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <input type="email" name="user_email" required placeholder="Email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <select name="user_type" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"><option value="Privato">Sono un Privato</option><option value="Installatore">Sono un Installatore</option><option value="Impresa">Sono un'Impresa</option></select>
                                <textarea name="message" required rows={3} placeholder="Come possiamo aiutarti?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                <button type="submit" disabled={isSending} className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSending ? 'Invio in corso...' : 'Invia Messaggio'}</button>
                                {feedbackMsg && (<p className={`text-center text-sm font-bold mt-2 ${feedbackMsg.includes("Errore") ? "text-red-500" : "text-green-600"}`}>{feedbackMsg}</p>)}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- FOOTER ---
const Footer = () => {
    const PRIVACY_URL = "https://www.iubenda.com/privacy-policy/56603988";
    const COOKIE_URL = "https://www.iubenda.com/privacy-policy/56603988/cookie-policy";

    return (
        <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <img src={LOGO_URL} alt="VE.MA Logo" className="h-16 w-auto object-contain" />
                            <span className="text-2xl font-bold text-white">VE.MA<span className="text-orange-500">.</span></span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Il tuo negozio di termoidraulica a Ladispoli. Offriamo vendita e consulenza per riscaldamento, condizionamento e arredo bagno.
                        </p>
                        <div className="flex gap-4">
                            <a href={"https://www.facebook.com/profile.php?id=100063694985327"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300"><i className="fab fa-facebook-f"></i></a>
                            <a href={"https://www.instagram.com/termoidraulica_vema/"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all duration-300"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Menu Rapido</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#home" onClick={(e) => smoothScroll(e, 'home')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Home</a></li>
                            <li><a href="#chi-siamo" onClick={(e) => smoothScroll(e, 'chi-siamo')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Chi Siamo</a></li>
                            <li><a href="#servizi" onClick={(e) => smoothScroll(e, 'servizi')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Cosa Offriamo</a></li>
                            <li><a href="#prodotti" onClick={(e) => smoothScroll(e, 'prodotti')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Prodotti</a></li>
                            <li><a href="#forniture" onClick={(e) => smoothScroll(e, 'forniture')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Forniture</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Informazioni Legali</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a
                                    href={PRIVACY_URL}
                                    className="iubenda-nostyle iubenda-noiframe iubenda-embed hover:text-orange-500 transition-colors text-left flex items-center gap-2"
                                    title="Privacy Policy"
                                >
                                    <i className="fas fa-shield-alt"></i> Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href={COOKIE_URL}
                                    className="iubenda-nostyle iubenda-noiframe iubenda-embed hover:text-orange-500 transition-colors text-left flex items-center gap-2"
                                    title="Cookie Policy"
                                >
                                    <i className="fas fa-cookie-bite"></i> Cookie Policy
                                </a>
                            </li>
                            <li className="pt-6 border-t border-white/10 mt-4">
                                <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Dati Societari</span>
                                <span className="block text-xs text-gray-400">P.IVA: 15349091007</span>

                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Contatti Rapidi</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <i className="fas fa-map-marker-alt text-orange-500 mt-1"></i>
                                <span>Via delle Magnolie 21,<br />00055 Ladispoli (RM)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-phone text-orange-500"></i>
                                <span>+39 338 261 1291</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-envelope text-orange-500"></i>
                                <span>max69vema@yahoo.it</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-clock text-orange-500"></i>
                                <span>Lun-Ven: 08:15-13:00 / 15:00-18:30</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
                    <p>© 2025 TERMOIDRAULICA VE.MA. SRLS - Tutti i diritti riservati.</p>
                    <div className="flex items-center gap-2">
                        <span className="opacity-60">Realizzato da</span>
                        <a
                            href="mailto:filippoleotta06@gmail.com?subject=Richiesta%20Sito%20Web&body=Ciao%20Filippo%2C%0D%0A%0D%0ASei%20nel%20posto%20giusto%20se%20vuoi%20anche%20tu%20un%20sito%20web%20moderno%20e%20professionale.%20Non%20esitare%20a%20contattarmi!%0D%0A%0D%0AScrivimi%20qui%20sotto%20quali%20sono%20i%20tuoi%20obiettivi%20e%20tutto%20ci%C3%B2%20che%20deve%20avere%20il%20tuo%20sito%20e%20io%20ti%20aiuter%C3%B2%20a%20realizzarlo%3A%0D%0A%0D%0A"
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-gray-300 hover:text-orange-400 transition-all duration-300 flex items-center gap-2 group shadow-sm hover:shadow-orange-500/10 hover:border-orange-500/30"
                        >
                            <span className="font-semibold tracking-wide">Filippo Leotta</span>
                            <i className="fas fa-laptop-code text-[10px] opacity-50 group-hover:opacity-100 transition-opacity text-orange-500"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const App = () => {
    // L'hook ScrollReveal ora parte immediatamente al montaggio del componente
    useScrollReveal();

    const [products, setProducts] = useState<Product[]>([]);

    // Loading specifico solo per il catalogo
    const [isCatalogLoading, setIsCatalogLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    // Stato Preferiti
    const [favorites, setFavorites] = useState<(string | number)[]>(() => {
        try { const saved = localStorage.getItem('vema_favorites'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

    useEffect(() => { localStorage.setItem('vema_favorites', JSON.stringify(favorites)); }, [favorites]);
    const toggleFavorite = (id: string | number) => { setFavorites(prev => prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]); };

    // Fetch Dati
    useEffect(() => {
        const handleResponse = async (res: Response) => {
            if (!res.ok) throw new Error(`HTTP error!`);
            return res.json();
        };

        // 1. Carica SUBITO la versione Lite (veloce) per mostrare qualcosa all'utente
        fetch('/products_lite.json')
            .then(handleResponse)
            .then(liteData => {
                if (Array.isArray(liteData)) {
                    setProducts(liteData);
                    setIsCatalogLoading(false); // Sblocca l'interfaccia subito

                    // 2. TRUCCO PERFORMANCE: Ritarda il caricamento del file pesante
                    // Aspettiamo 4 secondi (4000ms). In questo modo il browser ha tempo
                    // di scaricare immagini, font e CSS senza essere rallentato dal JSON gigante.
                    setTimeout(() => {
                        fetch('/products.json')
                            .then(handleResponse)
                            .then(fullData => {
                                if (Array.isArray(fullData)) {
                                    // Aggiorniamo i prodotti con la lista completa in modo silenzioso
                                    setProducts(fullData);
                                }
                            })
                            .catch(console.warn);
                    }, 4000);

                } else { throw new Error("Lite invalid."); }
            })
            .catch(() => {
                // Se per caso il Lite fallisce, prova a caricare tutto subito come fallback
                fetch('/products.json')
                    .then(handleResponse)
                    .then(data => {
                        if (Array.isArray(data)) {
                            setProducts(data);
                            setIsCatalogLoading(false);
                        }
                    })
                    .catch(() => {
                        setErrorMsg("Errore caricamento.");
                        setIsCatalogLoading(false);
                    });
            });
    }, []);

    return (
        <div className="font-sans text-gray-900 bg-slate-50 min-h-screen">
            <Navbar favoritesCount={favorites.length} onOpenFavorites={() => setIsFavoritesOpen(true)} />
            <Hero />
            <Brands />
            <About />
            <Services />

            {/* MODIFICA: Passiamo loading e error DIRETTAMENTE al componente Catalog.
        In questo modo la sezione con il titolo appare subito, 
        e lo spinner gira solo al posto dei prodotti.
      */}
            <Catalog
                products={products}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                isLoading={isCatalogLoading}
                errorMsg={errorMsg}
            />

            <FornitureSection />
            <Testimonials />
            <FAQ />
            <Contact />
            <Footer />

            <FavoritesModal isOpen={isFavoritesOpen} onClose={() => setIsFavoritesOpen(false)} favorites={favorites} products={products} toggleFavorite={toggleFavorite} />
        </div>
    );
};

export default App;