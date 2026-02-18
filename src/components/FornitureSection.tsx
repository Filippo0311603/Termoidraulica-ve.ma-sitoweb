import { useEffect, useRef, useState } from 'react';
import { SOCIAL_LINKS } from '../utils/constants';
import { smoothScroll } from '../utils';

// ── Foto reali del negozio / forniture ──────────────────────
import fotoForniture1 from '../assets/images/foto-forniture.webp';
import fotoForniture2 from '../assets/images/foto-forniture2.webp';
import fotoForniture3 from '../assets/images/foto forniture3.webp';
import fotoForniture4 from '../assets/images/foto-forniture4.webp';
import fotoForniture5 from '../assets/images/foto-forniture5.webp';
import fotoForniture6 from '../assets/images/foto-forniture6.webp';
import fotoForniture7 from '../assets/images/foto-forniture7.webp';
import fotoForniture8 from '../assets/images/foto-forniture8.webp';
import fotoNegozio   from '../assets/images/negozio.webp';

const GALLERY_PHOTOS = [
    { src: fotoForniture1, alt: 'Magazzino forniture idrauliche' },
    { src: fotoForniture2, alt: 'Esposizione prodotti' },
    { src: fotoForniture3, alt: 'Forniture termoidrauliche' },
    { src: fotoForniture4, alt: 'Rubinetteria ed accessori' },
    { src: fotoForniture5, alt: 'Prodotti a catalogo' },
    { src: fotoForniture6, alt: 'Materiale idraulico' },
    { src: fotoForniture7, alt: 'Forniture professionali' },
    { src: fotoForniture8, alt: 'Punto vendita termoidraulica' },
];

// ── Brand ticker data ────────────────────────────────────────
const BRANDS = [
    { name: 'GEBERIT',        icon: 'fa-toilet' },
    { name: 'GROHE',          icon: 'fa-faucet' },
    { name: 'FERROLI',        icon: 'fa-fire' },
    { name: 'VAILLANT',       icon: 'fa-temperature-high' },
    { name: 'IDEAL STANDARD', icon: 'fa-bath' },
    { name: 'BERETTA',        icon: 'fa-burn' },
    { name: 'BAXI',           icon: 'fa-fire-burner' },
    { name: 'FONDITAL',       icon: 'fa-radiation' },
    { name: 'GRUNDFOS',       icon: 'fa-water' },
    { name: 'HANSGROHE',      icon: 'fa-shower' },
    { name: 'DURAVIT',        icon: 'fa-sink' },
    { name: 'TIEMME',         icon: 'fa-screwdriver-wrench' },
    { name: 'IMMERGAS',       icon: 'fa-gauge' },
    { name: 'PAINI',          icon: 'fa-faucet-drip' },
    { name: 'GEDY',           icon: 'fa-toothbrush' },
];

// ── Services cards data ──────────────────────────────────────
const SERVICES = [
    {
        icon: 'fa-file-invoice-dollar',
        color: 'from-blue-900 to-blue-700',
        accent: '#f97316',
        title: 'Listini Dedicati',
        desc: 'Condizioni commerciali riservate per installatori, imprese e studi tecnici. Prezzi competitivi su tutto il catalogo.',
        tag: 'Solo per professionisti',
    },
    {
        icon: 'fab fa-whatsapp',
        color: 'from-green-700 to-green-500',
        accent: '#22c55e',
        title: 'Ordini via WhatsApp',
        desc: 'Fotografa il pezzo, inviaci codice o foto. Recuperiamo noi il materiale e lo prepariamo per il ritiro o la consegna.',
        tag: 'Risposta in pochi minuti',
    },
    {
        icon: 'fa-truck-fast',
        color: 'from-orange-600 to-orange-400',
        accent: '#f97316',
        title: 'Consegna Rapida',
        desc: 'Logistica efficiente per cantieri e magazzini. Consegne programmate e ritiro prioritario per i clienti registrati.',
        tag: 'Puntuale sempre',
    },
    {
        icon: 'fa-headset',
        color: 'from-cyan-700 to-cyan-500',
        accent: '#06b6d4',
        title: 'Supporto Tecnico',
        desc: 'Il nostro team di esperti è a disposizione per consulenza su prodotti, compatibilità e specifiche tecniche di impianto.',
        tag: 'Esperienza 30+ anni',
    },
];

// ── Stats data ───────────────────────────────────────────────
const STATS = [
    { value: '30+',   label: 'Anni di Esperienza',   icon: 'fa-calendar-check' },
    { value: '5.000+', label: 'Prodotti a Catalogo', icon: 'fa-boxes-stacked' },
    { value: '200+',  label: 'Brand e Fornitori',    icon: 'fa-handshake' },
    { value: '24h',   label: 'Tempo di Risposta',    icon: 'fa-bolt' },
];

// ── Animated counter hook ────────────────────────────────────
function useCountUp(target: string, duration = 1400, trigger: boolean) {
    const [display, setDisplay] = useState('0');
    useEffect(() => {
        if (!trigger) return;
        const num = parseInt(target.replace(/\D/g, ''), 10);
        if (isNaN(num)) { setDisplay(target); return; }
        const suffix = target.replace(/[0-9]/g, '');
        let start = 0;
        const timer = setInterval(() => {
            start += Math.ceil(num / (duration / 16));
            if (start >= num) { setDisplay(num + suffix); clearInterval(timer); }
            else setDisplay(start + suffix);
        }, 16);
        return () => clearInterval(timer);
    }, [trigger, target, duration]);
    return display;
}

// ── Single stat pill ─────────────────────────────────────────
const StatPill = ({ value, label, icon, trigger }: { value: string; label: string; icon: string; trigger: boolean }) => {
    const count = useCountUp(value, 1200, trigger);
    return (
        <div className="flex flex-col items-center gap-2 px-6 py-2">
            <i className={`fas ${icon} text-orange-400 text-xl`}></i>
            <span className="text-4xl font-black text-white tracking-tight">{count}</span>
            <span className="text-sm text-slate-400 text-center font-medium uppercase tracking-wider">{label}</span>
        </div>
    );
};

// ── Main component ───────────────────────────────────────────
const FornitureSection = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <section
            id="forniture"
            ref={sectionRef}
            className="relative bg-slate-950 text-white overflow-hidden"
        >
            {/* ── Decorative mesh gradient ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-900/30 blur-[120px]" />
                <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-orange-500/15 blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-cyan-900/10 blur-[100px]" />
            </div>

            {/* ══════════════════════════════════════════════════════
                HERO BLOCK
            ══════════════════════════════════════════════════════ */}
            <div className="relative z-10 container mx-auto px-6 pt-24 pb-16 text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
                    <i className="fas fa-star"></i>
                    Area Professionisti
                </div>

                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-6">
                    <span className="block text-white">Forniture</span>
                    <span
                        className="block"
                        style={{
                            background: 'linear-gradient(90deg, #f97316, #06b6d4, #f97316)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            animation: 'gradientShift 4s linear infinite',
                        }}
                    >
                        & Partner
                    </span>
                </h2>
                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Servizi su misura per <strong className="text-white">installatori</strong>,{' '}
                    <strong className="text-white">architetti</strong> e{' '}
                    <strong className="text-white">imprese edili</strong>. Materiali, velocità e competenza in un unico punto di riferimento.
                </p>
            </div>

            {/* ══════════════════════════════════════════════════════
                STATS BAR
            ══════════════════════════════════════════════════════ */}
            <div className="relative z-10 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                        {STATS.map((s) => (
                            <StatPill key={s.label} trigger={inView} {...s} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                SERVICES GRID
            ══════════════════════════════════════════════════════ */}
            <div className="relative z-10 container mx-auto px-6 py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {SERVICES.map((s) => (
                        <div
                            key={s.title}
                            className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-white/15 rounded-3xl p-6 transition-all duration-500 cursor-default overflow-hidden"
                            style={{ '--accent': s.accent } as React.CSSProperties}
                        >
                            {/* Glow on hover */}
                            <div
                                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{ boxShadow: `inset 0 0 60px ${s.accent}15` }}
                            />

                            {/* Icon */}
                            <div
                                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                                <i className={`${s.icon} text-white text-lg`}></i>
                            </div>

                            {/* Tag */}
                            <span
                                className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mb-3"
                                style={{ background: `${s.accent}20`, color: s.accent }}
                            >
                                {s.tag}
                            </span>

                            <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                PHOTO STRIP (scorrimento infinito)
            ══════════════════════════════════════════════════════ */}
            <div className="relative z-10 py-10 overflow-hidden">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                {/* Striscia scorrevole */}
                <div
                    className="flex gap-4"
                    style={{ animation: 'photoStrip 40s linear infinite', width: 'max-content' }}
                >
                    {[...GALLERY_PHOTOS, ...GALLERY_PHOTOS].map((photo, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-72 h-48 rounded-2xl overflow-hidden border border-white/10 group"
                        >
                            <img
                                src={photo.src}
                                alt={photo.alt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-100"
                                loading="lazy"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                BRAND TICKER (infinite scroll)
            ══════════════════════════════════════════════════════ */}
            <div className="relative z-10 border-y border-white/5 py-6 overflow-hidden">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

                <div className="flex gap-0" style={{ animation: 'ticker 30s linear infinite' }}>
                    {[...BRANDS, ...BRANDS].map((b, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-8 flex-shrink-0 text-slate-500 hover:text-white transition-colors duration-300 group"
                        >
                            <i className={`fas ${b.icon} text-lg group-hover:text-orange-400 transition-colors`}></i>
                            <span className="text-sm font-bold uppercase tracking-[0.2em] whitespace-nowrap">{b.name}</span>
                            <span className="text-slate-700 ml-4">·</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                CTA BLOCK
            ══════════════════════════════════════════════════════ */}
            <div className="relative z-10 container mx-auto px-6 py-20">
                <div className="relative rounded-3xl overflow-hidden border border-white/10">
                    {/* Foto negozio reale come sfondo */}
                    <img
                        src={fotoNegozio}
                        alt="Il nostro negozio"
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.25]"
                    />
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900/40 to-slate-950/80" />

                    <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 text-center md:text-left">
                            <p className="text-orange-400 text-sm font-bold uppercase tracking-widest mb-3">Sei un professionista?</p>
                            <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">
                                Inizia subito a<br />
                                <span className="text-orange-400">risparmiare sui materiali</span>
                            </h3>
                            <p className="text-slate-400 text-lg max-w-md">
                                Contattaci per accedere ai listini riservati, agli ordini WhatsApp prioritari e alla consulenza tecnica dedicata.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 flex-shrink-0 relative z-10 w-full md:w-auto">
                            <a
                                href={SOCIAL_LINKS.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-400/30 hover:scale-105 text-lg"
                            >
                                <i className="fab fa-whatsapp text-2xl"></i>
                                Scrivici su WhatsApp
                            </a>
                            <a
                                href="#contatti"
                                onClick={(e) => smoothScroll(e, 'contatti')}
                                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold py-4 px-8 rounded-2xl transition-all"
                            >
                                <i className="fas fa-envelope"></i>
                                Richiedi Listino
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Keyframe animations ── */}
            <style>{`
                @keyframes gradientShift {
                    0%   { background-position: 0% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes ticker {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes photoStrip {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    );
};

export default FornitureSection;
