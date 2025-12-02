import React, { useState, useEffect } from 'react';
import { COLORS } from '../utils/constants';
import { smoothScroll } from '../utils';

const LOGO_URL = "/logoo.png";

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
                    <img 
                        src={LOGO_URL} 
                        alt="VE.MA Logo" 
                        className="h-16 w-auto object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md" 
                        fetchPriority="high"
                        width="64"
                        height="64"
                    />
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

export default Navbar;
