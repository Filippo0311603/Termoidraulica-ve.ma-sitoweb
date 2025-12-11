import { loadStripe, Stripe } from '@stripe/stripe-js';

// Sostituisci con la tua Chiave Pubblica di Stripe (trovala nella Dashboard di Stripe)
// Inizia solitamente con "pk_test_..."
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_test_51Sckb3CZRX2lKQ5RfE7BzJPlaCngG5azEcnrot2BZ4RK3vNihxhx0x2Q6qchAfdNZvExFjCtCeJH3wCM5Tc5NjCa00ySitcDoR');
  }
  return stripePromise;
};
