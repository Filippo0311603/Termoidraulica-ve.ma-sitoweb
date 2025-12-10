import { loadStripe, Stripe } from '@stripe/stripe-js';

// Sostituisci con la tua Chiave Pubblica di Stripe (trovala nella Dashboard di Stripe)
// Inizia solitamente con "pk_test_..."
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
  }
  return stripePromise;
};
