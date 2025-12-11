import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    // Usa la variabile d'ambiente VITE_STRIPE_PUBLIC_KEY
    // Se non è definita, usa la chiave di test come fallback (utile per sviluppo locale)
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51Sckb3CZRX2lKQ5RfE7BzJPlaCngG5azEcnrot2BZ4RK3vNihxhx0x2Q6qchAfdNZvExFjCtCeJH3wCM5Tc5NjCa00ySitcDoR';
    
    if (!key) {
      console.error("Stripe Public Key mancante! Assicurati di aver impostato VITE_STRIPE_PUBLIC_KEY.");
    }
    
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
