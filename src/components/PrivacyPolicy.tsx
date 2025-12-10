import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const openCookieSettings = () => {
        window.dispatchEvent(new Event('openCookieSettings'));
    };

    const Section = ({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) => (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl">
                    <i className={`fas ${icon}`}></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            </div>
            <div className="text-slate-600 leading-relaxed space-y-4">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 px-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="max-w-5xl mx-auto relative z-10">
                    <a href="/" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors mb-8 font-medium group">
                        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> 
                        Torna alla Home
                    </a>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Privacy & <span className="text-orange-500">Cookie</span> Policy
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm md:text-base">
                        <span className="flex items-center gap-2">
                            <i className="far fa-calendar-alt"></i>
                            Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
                        </span>
                        <span className="flex items-center gap-2">
                            <i className="fas fa-shield-alt"></i>
                            GDPR Compliant
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20 pb-20 space-y-8">
                
                {/* Intro Card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border-t-4 border-orange-500">
                    <p className="text-lg text-slate-700 leading-relaxed">
                        La tua privacy è fondamentale per noi. In questa pagina descriviamo in modo trasparente come raccogliamo, 
                        utilizziamo e proteggiamo i tuoi dati personali quando visiti il sito di <strong>Termoidraulica Vema Srls</strong>.
                    </p>
                    <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start gap-4">
                        <i className="fas fa-info-circle text-orange-500 mt-1"></i>
                        <p className="text-sm text-orange-800">
                            Hai bisogno di modificare le tue preferenze sui cookie? 
                            <button onClick={openCookieSettings} className="font-bold underline ml-1 hover:text-orange-600">
                                Clicca qui per aprire il pannello
                            </button>.
                        </p>
                    </div>
                </div>

                <Section title="1. Titolare del Trattamento" icon="fa-user-shield">
                    <p>Il titolare del trattamento dei dati personali è:</p>
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-4">
                        <p className="font-bold text-slate-900 text-lg mb-1">Termoidraulica Vema Srls</p>
                        <p className="text-slate-600 mb-4">Via delle Magnolie 21, 00055 — Ladispoli (RM), Italia</p>
                        <a href="mailto:max69vema@yahoo.it" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm hover:shadow transition-all">
                            <i className="far fa-envelope"></i> max69vema@yahoo.it
                        </a>
                    </div>
                </Section>

                <Section title="2. Dati Raccolti" icon="fa-database">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i className="fas fa-pen text-orange-500 text-sm"></i> Dati forniti volontariamente
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-1"></i> Nome e Cognome</li>
                                <li className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-1"></i> Indirizzo di spedizione/fatturazione</li>
                                <li className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-1"></i> Email e Telefono</li>
                                <li className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-1"></i> Messaggi del form contatti</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <i className="fas fa-laptop-code text-orange-500 text-sm"></i> Dati automatici
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-1"></i> Indirizzo IP (anonimizzato)</li>
                                <li className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-1"></i> Tipo di browser e dispositivo</li>
                                <li className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-1"></i> Pagine visitate e tempo di permanenza</li>
                                <li className="flex items-start gap-2"><i className="fas fa-check text-green-500 mt-1"></i> Dati di geolocalizzazione (se attivi)</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                        <strong>Nota sui pagamenti:</strong> Le transazioni avvengono tramite piattaforma sicura Stripe. 
                        Termoidraulica Vema <u>non memorizza</u> né ha accesso ai dati completi della tua carta di credito.
                    </div>
                </Section>

                <Section title="3. Finalità del Trattamento" icon="fa-bullseye">
                    <div className="grid sm:grid-cols-2 gap-4">
                        {[
                            { icon: "fa-shopping-cart", title: "Erogazione Servizi", desc: "Gestione ordini, spedizioni e pagamenti." },
                            { icon: "fa-headset", title: "Assistenza Clienti", desc: "Risposta a richieste via email o form." },
                            { icon: "fa-chart-line", title: "Analisi Statistiche", desc: "Miglioramento del sito tramite dati aggregati (GA4)." },
                            { icon: "fa-shield-alt", title: "Sicurezza", desc: "Prevenzione frodi e sicurezza informatica." },
                            { icon: "fa-file-invoice", title: "Obblighi Legali", desc: "Adempimenti fiscali e contabili." },
                            { icon: "fa-map-marked-alt", title: "Funzionalità", desc: "Visualizzazione mappe e localizzazione." }
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 text-sm">
                                    <i className={`fas ${item.icon}`}></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="4. Cookie Policy" icon="fa-cookie-bite">
                    <p className="mb-4">
                        I cookie sono piccoli file di testo che i siti visitati inviano al tuo terminale. 
                        Utilizziamo cookie tecnici (necessari) e, con il tuo consenso, cookie analitici di terze parti.
                    </p>
                    
                    <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                    <th className="p-4 font-bold">Tipologia</th>
                                    <th className="p-4 font-bold">Scopo</th>
                                    <th className="p-4 font-bold">Durata</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                <tr>
                                    <td className="p-4 font-medium text-slate-900">Tecnici / Essenziali</td>
                                    <td className="p-4 text-slate-600">Funzionamento carrello, sessione, preferenze privacy.</td>
                                    <td className="p-4 text-slate-500">Sessione / 12 mesi</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-medium text-slate-900">Google Analytics 4</td>
                                    <td className="p-4 text-slate-600">Statistiche anonime su visite e traffico.</td>
                                    <td className="p-4 text-slate-500">Fino a 14 mesi</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-medium text-slate-900">Google Maps</td>
                                    <td className="p-4 text-slate-600">Visualizzazione mappe interattive.</td>
                                    <td className="p-4 text-slate-500">Variabile (Google)</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800 text-white p-6 rounded-xl">
                        <div>
                            <h4 className="font-bold mb-1">Gestisci le tue preferenze</h4>
                            <p className="text-sm text-slate-300">Puoi cambiare idea in qualsiasi momento.</p>
                        </div>
                        <button 
                            onClick={openCookieSettings}
                            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 whitespace-nowrap"
                        >
                            Impostazioni Cookie
                        </button>
                    </div>
                </Section>

                <Section title="5. I Tuoi Diritti (GDPR)" icon="fa-gavel">
                    <p className="mb-4">
                        Ai sensi del Regolamento UE 2016/679 (GDPR), hai il diritto di:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {[
                            "Accedere ai tuoi dati",
                            "Chiedere la rettifica o cancellazione",
                            "Limitare il trattamento",
                            "Opporti al trattamento",
                            "Richiedere la portabilità dei dati",
                            "Revocare il consenso in qualsiasi momento"
                        ].map((right, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <i className="fas fa-check-circle text-green-500"></i>
                                <span className="text-slate-700 text-sm font-medium">{right}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-6 text-sm text-slate-500">
                        Per esercitare i tuoi diritti, contattaci a: <a href="mailto:max69vema@yahoo.it" className="text-orange-500 hover:underline">max69vema@yahoo.it</a>
                    </p>
                </Section>

                <Section title="6. Condivisione Dati" icon="fa-share-alt">
                    <p>I dati possono essere condivisi con:</p>
                    <ul className="list-disc pl-5 space-y-2 mt-2">
                        <li><strong>Corrieri:</strong> Per la consegna degli ordini.</li>
                        <li><strong>Stripe:</strong> Per la gestione sicura dei pagamenti.</li>
                        <li><strong>Google:</strong> Per analytics e mappe (con garanzie di trasferimento dati).</li>
                        <li><strong>Fornitori tecnici:</strong> Hosting e manutenzione sito.</li>
                    </ul>
                </Section>

            </div>
        </div>
    );
};

export default PrivacyPolicy;
