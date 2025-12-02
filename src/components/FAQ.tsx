import { useState } from 'react';
import SectionTitle from './SectionTitle';

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

export default FAQ;
