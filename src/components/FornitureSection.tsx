import SectionTitle from './SectionTitle';
import { SOCIAL_LINKS } from '../utils/constants';
import { smoothScroll } from '../utils';
// @ts-ignore
import fotoForniture from '../assets/images/foto-forniture.webp';
// @ts-ignore
import fotoForniture2 from '../assets/images/foto-forniture2.webp';
// @ts-ignore
import fotoForniture3 from '../assets/images/foto forniture3.webp';

const FornitureSection = () => {
    return (
        <section id="forniture" className="py-24 bg-slate-900 text-white relative">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="container mx-auto px-6 relative z-10">
                <SectionTitle title="Forniture & Partner" subtitle="Servizi dedicati a Installatori, Architetti e Imprese Edili." centered={true} light={true} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 reveal">
                    <div>
                        <h3 className="text-3xl font-bold mb-6">Area Professionisti</h3>
                        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                            Sappiamo quanto è importante avere un partner affidabile in cantiere.<br />Per questo offriamo servizi dedicati ai professionisti del settore termoidraulico.
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center font-bold"><i className="fas fa-percent"></i></div>
                                <div><h5 className="font-bold">Listini Riservati</h5><p className="text-sm text-gray-400">Sconti dedicati per possessori di Partita IVA.</p></div>
                            </li>
                            <li className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                                <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 w-full">
                                    <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center font-bold"><i className="fab fa-whatsapp"></i></div>
                                    <div><h5 className="font-bold hover:text-orange-500 transition-colors">Ordini Rapidi WhatsApp</h5><p className="text-sm text-gray-400">Invia la lista e ti prepariamo tutto per il ritiro.</p></div>
                                </a>
                            </li>
                        </ul>
                        <a
                            href="#contatti"
                            onClick={(e) => smoothScroll(e, 'contatti')}
                            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-colors cursor-pointer"
                        >
                            Contattaci per Saperne di Più
                        </a>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src={fotoForniture} className="rounded-2xl transform translate-y-8" alt="Cantiere 1" loading="lazy" width="382" height="510" />
                        <img src={fotoForniture2} className="rounded-2xl" alt="Cantiere 2" loading="lazy" width="382" height="510" />
                        <img src={fotoForniture3} className="rounded-2xl transform translate-y-8" alt="Cantiere 3" loading="lazy" width="382" height="510" />
                        <div className="bg-blue-800 rounded-2xl flex items-center justify-center p-6 text-center">
                            <div>
                                <h4 className="text-4xl font-bold mb-2">500+</h4>
                                <p className="text-sm text-blue-300">Cantieri Forniti</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FornitureSection;
