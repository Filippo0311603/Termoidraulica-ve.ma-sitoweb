import SectionTitle from './SectionTitle';

const Testimonials = () => {
    const TESTIMONIALS = [
        {
            name: "Luca V.",
            role: "Installatore Professionista",
            text: "Dopo varie ricerche in zona Ladispoli e cerveteri per l'acquisto di una caldaia e accessori per il bagno ho trovato questo negozio gestito da persone veramente competenti, gentili e con prezzi convenienti. Sicuramente tornerò da loro per l'acquisto di un condizionatore prima della prossima estate!",
            rating: 5,
            img: null
        },
        {
            name: "Claudio D.",
            role: "Cliente Google",
            text: "Disponibilità e professionalità al top! Mi sono rivolto alla termoidraulica di Massimo per l'acquisto di uno scaldabagno da 80 litri, ma dopo aver valutato meglio lo spazio disponibile, ho chiesto di poterlo sostituire con uno da 50 litri. Massimo è stato estremamente gentile e disponibile: ha gestito il cambio senza problemi e con grande professionalità. Servizio rapido, preciso e con un'attenzione al cliente davvero rara al giorno d’oggi. Consiglio vivamente Massimo a chi cerca un professionista serio, onesto e sempre pronto a venire incontro alle esigenze del cliente. Grazie ancora!",
            rating: 5,
            img: null
        },
        {
            name: "Luigi D.",
            role: "Cliente Google",
            text: "Personale altamente qualificato e disponibile ad ascoltare le richieste, al fine di aiutare a fare un acquisto mirato e ottimo. Prezzi buoni e soprattutto, ottimo il rapporto qualità prezzo. Lo consiglio vivamente.",
            rating: 5,
            img: null
        },
    ];
    return (
        <section className="py-24 bg-blue-50">
            <div className="container mx-auto px-6">
                <SectionTitle title="Dicono di Noi" subtitle="La soddisfazione di chi sceglie VE.MA per i propri acquisti." centered={true} />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-blue-100 reveal flex flex-col h-full">
                            <div className="flex text-yellow-400 mb-4 text-sm">
                                {[...Array(t.rating)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                            </div>

                            <p className="text-gray-600 italic mb-6 leading-relaxed flex-1">"{t.text}"</p>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                                {t.img ? (
                                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-lg">
                                        {t.name.charAt(0)}
                                    </div>
                                )}

                                <div>
                                    <h5 className="font-bold text-gray-900 text-sm">{t.name}</h5>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
