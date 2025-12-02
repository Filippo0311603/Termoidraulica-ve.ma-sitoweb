import React, { useState, useEffect, Suspense } from 'react';
import './assets/styles/index.css';
import { useScrollReveal } from './hooks/useScrollReveal';
import { Product } from './types';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Brands from './components/Brands';
import About from './components/About';
import Services from './components/Services';
import FornitureSection from './components/FornitureSection';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FavoritesModal from './components/FavoritesModal';

// Lazy load Catalog for better performance
const Catalog = React.lazy(() => import('./components/Catalog'));

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
            <Suspense fallback={<div className="py-24 text-center">Caricamento Catalogo...</div>}>
                <Catalog
                    products={products}
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    isLoading={isCatalogLoading}
                    errorMsg={errorMsg}
                />
            </Suspense>

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
