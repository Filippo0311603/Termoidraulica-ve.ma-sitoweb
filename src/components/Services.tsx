import SectionTitle from './SectionTitle';
import { COLORS } from '../utils/constants';

const Services = () => {
    const SERVICES = [
        { icon: "fa-store", title: "Ampio Showroom", desc: "Vieni a toccare con mano la qualità dei nostri prodotti nel nostro punto vendita di Ladispoli." },
        { icon: "fa-comments", title: "Consulenza Tecnica", desc: "I nostri esperti al banco ti guideranno nella scelta del prodotto migliore per le tue esigenze." },
        { icon: "fa-boxes-stacked", title: "Magazzino Ricambi", desc: "Vasto assortimento di ricambi originali per caldaie, rubinetteria e cassette di scarico." },
        { icon: "fa-truck-ramp-box", title: "Forniture Cantieri", desc: "Listini dedicati e gestione ordini per installatori, imprese edili e professionisti del settore." }
    ];
    return (
        <section id="servizi" className="py-24 bg-slate-50 relative">
            <div className="container mx-auto px-6 relative z-10">
                <SectionTitle
                    title="Cosa Offriamo"
                    subtitle="Un'esperienza di acquisto completa: dalla scelta del prodotto alla fornitura dei ricambi."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {SERVICES.map((service, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 group border border-gray-100 reveal hover:-translate-y-2 cursor-default">
                            <div className={`w-16 h-16 ${COLORS.primaryBg} rounded-2xl flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-blue-900/20`}>
                                <i className={`fas ${service.icon}`}></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                            <p className="text-gray-600 leading-relaxed text-sm mb-4">
                                {service.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
