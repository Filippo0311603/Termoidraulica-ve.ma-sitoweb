import React, { useState, useRef, useEffect } from 'react';
import SectionTitle from './SectionTitle';
import { SOCIAL_LINKS } from '../utils/constants';
import { smoothScroll } from '../utils';
// @ts-ignore
import fotoForniture from '../assets/images/foto-forniture.webp';
// @ts-ignore
import fotoForniture2 from '../assets/images/foto-forniture2.webp';
// @ts-ignore
import fotoForniture3 from '../assets/images/foto forniture3.webp';
// @ts-ignore
import fotoForniture4 from '../assets/images/foto-forniture4.webp';
// @ts-ignore
import fotoForniture5 from '../assets/images/foto-forniture5.webp';
// @ts-ignore
import fotoForniture6 from '../assets/images/foto-forniture6.webp';
// @ts-ignore
import fotoForniture7 from '../assets/images/foto-forniture7.webp';
// @ts-ignore
import fotoForniture8 from '../assets/images/foto-forniture8.webp';

// Video Imports
// @ts-ignore
import video1 from '../assets/videos/video-vema.mp4';
// @ts-ignore
import video2 from '../assets/videos/video-vema-2.mp4';

// Mixed Media Array
const MEDIA_ITEMS = [
    { type: 'video', src: video1, thumb: fotoForniture, label: 'Operativi in Cantiere' },
    { type: 'video', src: video2, thumb: fotoForniture2, label: 'Tecnologia & Installazione' },
    { type: 'image', src: fotoForniture, label: 'Lavori Residenziali' },
    { type: 'image', src: fotoForniture2, label: 'Impianti Termici' },
    { type: 'image', src: fotoForniture3, label: 'Riscaldamento' },
    { type: 'image', src: fotoForniture4, label: 'Magazzino Forniture' },
    { type: 'image', src: fotoForniture5, label: 'Dettagli Tecnici' },
    { type: 'image', src: fotoForniture6, label: 'Showroom' },
    { type: 'image', src: fotoForniture7, label: 'Logistica' },
    { type: 'image', src: fotoForniture8, label: 'Trasporti' },
];

const FornitureSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slideInterval = useRef<any>(null);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % MEDIA_ITEMS.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + MEDIA_ITEMS.length) % MEDIA_ITEMS.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    // Auto-advance for images only
    useEffect(() => {
        // Clear existing interval
        if (slideInterval.current) clearInterval(slideInterval.current);

        // Only auto-play if current item is an image
        if (MEDIA_ITEMS[currentIndex].type === 'image') {
            slideInterval.current = setInterval(() => {
                nextSlide();
            }, 5000);
        }

        return () => {
            if (slideInterval.current) clearInterval(slideInterval.current);
        };
    }, [currentIndex]);

    const activeItem = MEDIA_ITEMS[currentIndex];
    
    return (
        <section id="forniture" className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <SectionTitle title="Forniture & Partner" subtitle="Servizi dedicati a Installatori, Architetti e Imprese Edili." centered={true} light={true} />

                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    
                    {/* --- LEFT COLUMN: Info Text --- */}
                    <div className="lg:w-1/3 flex flex-col justify-center order-2 lg:order-1">
                        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h3 className="text-3xl font-bold mb-6 text-orange-500">Area Professionisti</h3>
                            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                                L'efficienza è tutto. Offriamo supporto tecnico specializzato, logistica rapida e listini dedicati per i professionisti del settore.
                            </p>

                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="bg-orange-500/20 p-3 rounded-lg text-orange-500"><i className="fas fa-file-invoice-dollar text-xl"></i></div>
                                    <div>
                                        <h5 className="font-bold text-lg">Listini Riservati</h5>
                                        <p className="text-sm text-gray-400">Accedi a condizioni commerciali esclusive.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-500/20 p-3 rounded-lg text-green-500"><i className="fab fa-whatsapp text-xl"></i></div>
                                    <div className="cursor-pointer hover:text-green-400 transition-colors" onClick={() => window.open(SOCIAL_LINKS.whatsapp, '_blank')}>
                                        <h5 className="font-bold text-lg">Ordini WhatsApp</h5>
                                        <p className="text-sm text-gray-400">Invia foto e codici, al resto pensiamo noi.</p>
                                    </div>
                                </div>
                            </div>

                            <a href="#contatti" onClick={(e) => smoothScroll(e, 'contatti')} className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-orange-500/25">
                                <span>Contattaci Subito</span>
                                <i className="fas fa-paper-plane"></i>
                            </a>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: Mixed Media Carousel --- */}
                    <div className="lg:w-2/3 w-full order-1 lg:order-2">
                        {/* Main Viewer */}
                        <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mb-4">
                            
                            {/* Media Display */}
                            <div className="w-full h-full relative">
                                {activeItem.type === 'video' ? (
                                    <video 
                                        key={activeItem.src} // Force re-render on change
                                        src={activeItem.src} 
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay={false} // Don't auto-play immediately to avoid annoyance, or maybe true? User asked for "accattivante", maybe autoPlay muted?
                                        muted={false}
                                        playsInline
                                    />
                                ) : (
                                    <img 
                                        src={activeItem.src} 
                                        alt={activeItem.label} 
                                        className="w-full h-full object-cover animate-fade-in"
                                    />
                                )}
                                
                                {/* Overlay Gradient (Only for Images or Paused Videos) */}
                                {activeItem.type === 'image' && (
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                                        <div>
                                            <p className="text-orange-500 font-bold uppercase tracking-wider text-sm mb-1">Progetto</p>
                                            <h4 className="text-2xl font-bold text-white">{activeItem.label}</h4>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Arrows */}
                            <button 
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white p-4 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0"
                            >
                                <i className="fas fa-chevron-left text-xl"></i>
                            </button>
                            <button 
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-orange-500 text-white p-4 rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                            >
                                <i className="fas fa-chevron-right text-xl"></i>
                            </button>
                        </div>

                        {/* Pagination / Thumbnails */}
                        <div className="bg-black/20 p-2 rounded-xl backdrop-blur-md overflow-x-auto">
                            <div className="flex gap-2 min-w-min">
                                {MEDIA_ITEMS.map((item, index) => (
                                    <button 
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`relative w-20 h-14 md:w-24 md:h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 border-2 ${
                                            index === currentIndex 
                                            ? 'border-orange-500 scale-105 shadow-lg shadow-orange-500/20' 
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                                        }`}
                                    >
                                        <img src={item.type === 'video' ? item.thumb : item.src} alt={item.label} className="w-full h-full object-cover" />
                                        {item.type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <i className="fas fa-play text-white text-xs"></i>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FornitureSection;
