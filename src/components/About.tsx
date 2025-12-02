import SectionTitle from './SectionTitle';
// @ts-ignore
import negozioLocale from '../assets/images/negozio.webp';

const About = () => {
    return (
        <section id="chi-siamo" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2 relative reveal">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                        <img src={negozioLocale} alt="VE.MA Showroom" className="relative rounded-3xl shadow-2xl z-10 w-full object-cover h-[500px]" />
                        <div className="absolute -bottom-6 -right-6 z-20 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs hidden md:block">
                            <p className="font-serif italic text-gray-600 text-lg">"La qualità dei materiali fa la differenza nel tempo."</p>
                        </div>
                    </div>
                    <div className="lg:w-1/2 reveal">
                        <SectionTitle title="La Nostra Storia" subtitle="Il tuo partner di fiducia a Ladispoli." centered={false} />
                        <p className="text-gray-600 text-lg leading-relaxed mb-6"><strong>Termoidraulica VE.MA</strong> è il punto vendita di riferimento a Ladispoli e nel litorale romano per chi cerca prodotti termoidraulici di alta qualità.</p>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">Siamo specializzati esclusivamente nella <strong>vendita</strong> di forniture civili e industriali. Che tu sia un professionista, un installatore o un privato amante del fai-da-te, nel nostro showroom troverai competenza, cortesia e un magazzino sempre fornito.</p>
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="flex items-start gap-3"><div className="bg-green-100 p-2 rounded-lg text-green-600"><i className="fas fa-check-circle text-xl"></i></div><div><h5 className="font-bold text-gray-800">Solo Migliori Marche</h5><p className="text-sm text-gray-500">Rivenditori ufficiali dei top brand.</p></div></div>
                            <div className="flex items-start gap-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><i className="fas fa-user-shield text-xl"></i></div><div><h5 className="font-bold text-gray-800">Consulenza Dedicata</h5><p className="text-sm text-gray-500">Ti aiutiamo a scegliere bene.</p></div></div>
                        </div>
                        <div className="border-t pt-8 border-gray-100 flex gap-12">
                            <div><span className="block text-3xl font-bold text-blue-900">100%</span><span className="text-sm text-gray-500">Soddisfazione</span></div>
                            <div><span className="block text-3xl font-bold text-blue-900">25+</span><span className="text-sm text-gray-500">Anni di Esperienza</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
