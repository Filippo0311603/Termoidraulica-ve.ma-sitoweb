import React, { useState, useEffect, Suspense } from 'react';
import './assets/styles/index.css';
import { useScrollReveal } from './hooks/useScrollReveal';
import { Product, CartItem } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';

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
import NotFound from './components/NotFound';
import { getApiUrl } from './utils/api';

// Lazy load components for better performance
const Catalog = React.lazy(() => import('./components/Catalog'));
const FavoritesModal = React.lazy(() => import('./components/FavoritesModal'));
const CartModal = React.lazy(() => import('./components/CartModal'));
const CheckoutModal = React.lazy(() => import('./components/CheckoutModal'));
const AuthModal = React.lazy(() => import('./components/AuthModal'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const CookieBanner = React.lazy(() => import('./components/CookieBanner'));

const AppContent = () => {
    const { user } = useAuth();
    // L'hook ScrollReveal ora parte immediatamente al montaggio del componente
    useScrollReveal();

    // Routing Check
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    const isAdminRoute = currentPath === '/admin';
    const isPrivacyRoute = currentPath === '/privacy-policy';
    const is404 = currentPath !== '/' && currentPath !== '/index.html' && !isAdminRoute && !isPrivacyRoute;

    useEffect(() => {
        const handlePopState = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

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

    // Stato Carrello
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try { const saved = localStorage.getItem('vema_cart'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [checkoutTotal, setCheckoutTotal] = useState(0);

    useEffect(() => { localStorage.setItem('vema_cart', JSON.stringify(cartItems)); }, [cartItems]);

    const addToCart = (product: Product) => {
        setCartItems(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (id: string | number) => {
        setCartItems(prev => prev.filter(item => item.product.id !== id));
    };

    const updateQuantity = (id: string | number, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.product.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const handleCheckout = (total: number) => {
        if (!user) {
            setIsCartOpen(false);
            setIsAuthOpen(true);
            return;
        }
        setCheckoutTotal(total);
        setIsCheckoutOpen(true);
    };

    const handleOrderSuccess = () => {
        setCartItems([]);
        localStorage.removeItem('vema_cart');
    };

    // Fetch Dati
    useEffect(() => {
        const handleResponse = async (res: Response) => {
            if (!res.ok) throw new Error(`HTTP error!`);
            return res.json();
        };

        // Modifica: Carichiamo i dati direttamente dall'API (Database)
        // In questo modo le modifiche fatte nel pannello Admin sono visibili subito.
        fetch(getApiUrl('api/products'))
            .then(handleResponse)
            .then(data => {
                if (Array.isArray(data)) {
                    setProducts(data);
                    setIsCatalogLoading(false);
                } else {
                    throw new Error("Data invalid.");
                }
            })
            .catch((err) => {
                console.error("Errore caricamento API:", err);
                // Fallback sui file statici se l'API fallisce (es. server down)
                fetch('/products.json')
                    .then(handleResponse)
                    .then(data => {
                        if (Array.isArray(data)) {
                            setProducts(data);
                            setIsCatalogLoading(false);
                        }
                    })
                    .catch(() => {
                        setErrorMsg("Errore caricamento catalogo.");
                        setIsCatalogLoading(false);
                    });
            });
    }, []);

    if (isAdminRoute) {
        return (
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento Admin...</div>}>
                <AdminDashboard />
            </Suspense>
        );
    }

    if (isPrivacyRoute) {
        return (
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento...</div>}>
                <PrivacyPolicy />
                <CookieBanner />
            </Suspense>
        );
    }

    if (is404) {
        return <NotFound />;
    }

    return (
        <div className="font-sans text-gray-900 bg-slate-50 min-h-screen">
            <Navbar 
                favoritesCount={favorites.length} 
                onOpenFavorites={() => setIsFavoritesOpen(true)} 
                cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
            />
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
                    addToCart={addToCart}
                    isLoading={isCatalogLoading}
                    errorMsg={errorMsg}
                />
            </Suspense>

            <FornitureSection />
            <Testimonials />
            <FAQ />
            <Contact />
            <Footer />

            <Suspense fallback={null}>
                <CookieBanner />
                {isFavoritesOpen && (
                    <FavoritesModal 
                        isOpen={isFavoritesOpen} 
                        onClose={() => setIsFavoritesOpen(false)} 
                        favorites={favorites} 
                        products={products} 
                        toggleFavorite={toggleFavorite} 
                    />
                )}
                
                {isCartOpen && (
                    <CartModal 
                        isOpen={isCartOpen} 
                        onClose={() => setIsCartOpen(false)} 
                        cartItems={cartItems} 
                        updateQuantity={updateQuantity} 
                        removeFromCart={removeFromCart} 
                        onCheckout={handleCheckout}
                    />
                )}

                {isCheckoutOpen && (
                    <CheckoutModal 
                        isOpen={isCheckoutOpen} 
                        onClose={() => setIsCheckoutOpen(false)} 
                        cartItems={cartItems} 
                        total={checkoutTotal} 
                        onSuccess={handleOrderSuccess} 
                    />
                )}

                {isAuthOpen && (
                    <AuthModal 
                        isOpen={isAuthOpen} 
                        onClose={() => setIsAuthOpen(false)} 
                    />
                )}
            </Suspense>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;
