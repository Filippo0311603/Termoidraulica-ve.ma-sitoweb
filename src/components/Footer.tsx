import { smoothScroll } from '../utils';

const LOGO_URL = "/logoo.png";

const Footer = () => {
    const PRIVACY_URL = "https://www.iubenda.com/privacy-policy/56603988";
    const COOKIE_URL = "https://www.iubenda.com/privacy-policy/56603988/cookie-policy";

    return (
        <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <img src={LOGO_URL} alt="VE.MA Logo" className="h-16 w-auto object-contain" />
                            <span className="text-2xl font-bold text-white">VE.MA<span className="text-orange-500">.</span></span>
                        </div>
                        <p className="text-sm leading-relaxed mb-6">
                            Il tuo negozio di termoidraulica a Ladispoli. Offriamo vendita e consulenza per riscaldamento, condizionamento e arredo bagno.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.facebook.com/profile.php?id=100063694985327"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Seguici su Facebook" // <--- AGGIUNTO
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300"
                            >
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a
                                href="https://www.instagram.com/termoidraulica_vema/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Seguici su Instagram" // <--- AGGIUNTO
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all duration-300"
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">Menu Rapido</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#home" onClick={(e) => smoothScroll(e, 'home')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Home</a></li>
                            <li><a href="#chi-siamo" onClick={(e) => smoothScroll(e, 'chi-siamo')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Chi Siamo</a></li>
                            <li><a href="#servizi" onClick={(e) => smoothScroll(e, 'servizi')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Cosa Offriamo</a></li>
                            <li><a href="#prodotti" onClick={(e) => smoothScroll(e, 'prodotti')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Prodotti</a></li>
                            <li><a href="#forniture" onClick={(e) => smoothScroll(e, 'forniture')} className="hover:text-orange-500 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs"></i> Forniture</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Informazioni Legali</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a
                                    href={PRIVACY_URL}
                                    className="iubenda-nostyle iubenda-noiframe iubenda-embed hover:text-orange-500 transition-colors text-left flex items-center gap-2"
                                    title="Privacy Policy"
                                >
                                    <i className="fas fa-shield-alt"></i> Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a
                                    href={COOKIE_URL}
                                    className="iubenda-nostyle iubenda-noiframe iubenda-embed hover:text-orange-500 transition-colors text-left flex items-center gap-2"
                                    title="Cookie Policy"
                                >
                                    <i className="fas fa-cookie-bite"></i> Cookie Policy
                                </a>
                            </li>
                            <li className="pt-6 border-t border-white/10 mt-4">
                                <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1">Dati Societari</span>
                                <span className="block text-xs text-gray-400">P.IVA: 15349091007</span>

                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Contatti Rapidi</h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3">
                                <i className="fas fa-map-marker-alt text-orange-500 mt-1"></i>
                                <span>Via delle Magnolie 21,<br />00055 Ladispoli (RM)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-phone text-orange-500"></i>
                                <span>+39 338 261 1291</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-envelope text-orange-500"></i>
                                <span>max69vema@yahoo.it</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fas fa-clock text-orange-500"></i>
                                <span>Lun-Ven: 08:15-13:00 / 15:00-18:30</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
                    <p>© 2025 TERMOIDRAULICA VE.MA. SRLS - Tutti i diritti riservati.</p>
                    <div className="flex items-center gap-2">
                        <span className="opacity-60">Realizzato da</span>
                        <a
                            href="mailto:filippoleotta06@gmail.com?subject=Richiesta%20Sito%20Web&body=Ciao%20Filippo%2C%0D%0A%0D%0ASei%20nel%20posto%20giusto%20se%20vuoi%20anche%20tu%20un%20sito%20web%20moderno%20e%20professionale.%20Non%20esitare%20a%20contattarmi!%0D%0A%0D%0AScrivimi%20qui%20sotto%20quali%20sono%20i%20tuoi%20obiettivi%20e%20tutto%20ci%C3%B2%20che%20deve%20avere%20il%20tuo%20sito%20e%20io%20ti%20aiuter%C3%B2%20a%20realizzarlo%3A%0D%0A%0D%0A"
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-gray-300 hover:text-orange-400 transition-all duration-300 flex items-center gap-2 group shadow-sm hover:shadow-orange-500/10 hover:border-orange-500/30"
                        >
                            <span className="font-semibold tracking-wide">Filippo Leotta</span>
                            <i className="fas fa-laptop-code text-[10px] opacity-50 group-hover:opacity-100 transition-opacity text-orange-500"></i>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
