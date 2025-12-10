import React, { useState, useRef } from 'react';

const Contact = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [isSending, setIsSending] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState("");

    const sendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setFeedbackMsg("");
        setTimeout(() => { setIsSending(false); setFeedbackMsg("Messaggio inviato! (Configura EmailJS)"); }, 1500);
    };

    return (
        <section id="contatti" className="py-24 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-blob animation-delay-2000"></div>
            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="reveal">
                        <h4 className="text-orange-500 font-bold uppercase tracking-wider mb-2">Contattaci</h4>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">Siamo a Ladispoli.</h2>
                        <p className="text-gray-300 mb-10 text-lg leading-relaxed">Passa a trovarci in negozio per una consulenza personalizzata o richiedi informazioni online.</p>
                        <div className="space-y-6 mb-10">
                            <a href="https://www.google.com/maps/search/?api=1&query=Via+delle+Magnolie,+21,+00055+Ladispoli+RM" target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group hover:opacity-80 transition-opacity">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300"><i className="fas fa-map-marker-alt"></i></div>
                                <div><p className="text-sm text-gray-400 mb-1">Punto Vendita</p><p className="font-bold text-xl">Via delle Magnolie, 21, 00055 Ladispoli (RM)</p></div>
                            </a>
                            <a href="tel:+393382611291" className="flex items-center gap-6 group hover:opacity-80 transition-opacity">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300"><i className="fas fa-phone-alt"></i></div>
                                <div><p className="text-sm text-gray-400 mb-1">Telefono</p><p className="font-bold text-xl">+39 338 261 1291</p></div>
                            </a>
                            <a href="mailto:max69vema@yahoo.it" className="flex items-center gap-6 group hover:opacity-80 transition-opacity">
                                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-500 text-2xl group-hover:bg-orange-500 group-hover:text-white transition-all duration-300"><i className="fas fa-envelope"></i></div>
                                <div><p className="text-sm text-gray-400 mb-1">Email</p><p className="font-bold text-xl">max69vema@yahoo.it</p></div>
                            </a>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><i className="far fa-clock text-orange-500"></i> Orari di Apertura</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-300"><div><span className="block font-bold text-white">Lun - Ven</span><span>08:15 - 13:00</span><br /><span>15:00 - 18:30</span></div><div><span className="block font-bold text-white">Sabato e Domenica</span><span>Chiuso</span></div></div>
                        </div>
                    </div>
                    <div className="space-y-6 reveal">
                        <div className="w-full h-80 bg-slate-800 rounded-3xl overflow-hidden relative group shadow-2xl border border-white/10">
                            <iframe width="100%" height="100%" title="Mappa Termoidraulica VE.MA" src="https://maps.google.com/maps?q=Termoidraulica+VE.MA.+Via+delle+Magnolie,+21,+00055+Ladispoli+RM&t=&z=15&ie=UTF8&iwloc=&output=embed" style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }} allowFullScreen loading="lazy"></iframe>
                            <a href="https://www.google.com/maps/dir//Via+delle+Magnolie,+21,+00055+Ladispoli+RM" target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-105"><i className="fas fa-directions"></i> Ottieni Indicazioni</a>
                        </div>
                        <div className="bg-white rounded-3xl p-8 md:p-10 text-gray-800 shadow-2xl">
                            <h3 className="text-2xl font-bold mb-6 text-blue-900">Scrivici un Messaggio</h3>
                            <form ref={formRef} onSubmit={sendEmail} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4"><input type="text" name="user_name" required placeholder="Nome" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" /><input type="text" name="user_surname" placeholder="Cognome" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                                <input type="email" name="user_email" required placeholder="Email" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <select name="user_type" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"><option value="Privato">Sono un Privato</option><option value="Installatore">Sono un Installatore</option><option value="Impresa">Sono un'Impresa</option></select>
                                <textarea name="message" required rows={3} placeholder="Come possiamo aiutarti?" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                <button type="submit" disabled={isSending} className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-orange-500/30 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSending ? 'Invio in corso...' : 'Invia Messaggio'}</button>
                                {feedbackMsg && (<p className={`text-center text-sm font-bold mt-2 ${feedbackMsg.includes("Errore") ? "text-red-500" : "text-green-600"}`}>{feedbackMsg}</p>)}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
