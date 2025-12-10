import { useState, useEffect } from 'react';
import { initGA } from '../utils/analytics';

const CookieBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Controlla se l'utente ha già fatto una scelta
        const consent = localStorage.getItem('vema_cookie_consent');
        
        if (!consent) {
            // Se non c'è scelta, mostra il banner dopo 1.5 secondi
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        } else if (consent === 'accepted') {
            // Se aveva già accettato, inizializza GA4
            initGA();
        }
    }, []);

    // Ascolta l'evento per riaprire il banner (dal footer)
    useEffect(() => {
        const handleReopen = () => setIsVisible(true);
        window.addEventListener('openCookieSettings', handleReopen);
        return () => window.removeEventListener('openCookieSettings', handleReopen);
    }, []);

    const handleAccept = () => {
        localStorage.setItem('vema_cookie_consent', 'accepted');
        setIsVisible(false);
        initGA(); // Avvia GA4
    };

    const handleReject = () => {
        const wasAccepted = localStorage.getItem('vema_cookie_consent') === 'accepted';
        localStorage.setItem('vema_cookie_consent', 'rejected');
        setIsVisible(false);
        // Se l'utente aveva precedentemente accettato, ricarichiamo la pagina per fermare i tracker
        if (wasAccepted) {
            window.location.reload();
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md text-white p-6 z-50 border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] animate-fade-in-up">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-sm text-gray-300 flex-1 leading-relaxed">
                    <p className="mb-2 font-bold text-white text-base">🍪 Informativa sui Cookie</p>
                    <p>
                        Questo sito utilizza cookie tecnici per il corretto funzionamento e, previo tuo consenso, cookie di profilazione (Google Analytics 4) per migliorare la tua esperienza di navigazione. 
                        Cliccando su <strong>"Accetta tutto"</strong> acconsenti all'uso di tutti i cookie. 
                        Cliccando su <strong>"Solo necessari"</strong> rifiuterai i cookie di tracciamento e useremo solo quelli essenziali.
                    </p>
                    <p className="mt-2">
                        Per maggiori dettagli, consulta la nostra <a href="/privacy-policy" className="text-orange-500 hover:text-orange-400 underline decoration-orange-500/30 underline-offset-2">Cookie Policy</a>.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
                    <button 
                        onClick={handleReject}
                        className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-sm font-medium transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        Solo necessari
                    </button>
                    <button 
                        onClick={handleAccept}
                        className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        Accetta tutto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
