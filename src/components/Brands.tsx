const Brands = () => {
    const BRANDS = ["Vaillant", "Daikin", "Samsung", "Grohe", "Geberit", "Ariston", "Mitsubishi", "Baxi", "Ideal Standard", "Bosch", "Junkers", "Caleffi", "Roca", "Electrolux", "Hitachi", "Fischer"];
    return (
        <section className="py-8 bg-blue-900 border-t border-blue-800 overflow-hidden">
            <div className="container mx-auto px-6 mb-4">
                <p className="text-center text-blue-300 text-sm font-bold uppercase tracking-widest">I nostri partner commerciali</p>
            </div>
            <div className="relative flex overflow-x-hidden">
                <div className="py-2 animate-marquee whitespace-nowrap flex gap-16 px-6">
                    {BRANDS.map((brand, i) => (<span key={i} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>))}
                    {BRANDS.map((brand, i) => (<span key={`dup-${i}`} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>))}
                </div>
                <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap flex gap-16 px-6">
                    {BRANDS.map((brand, i) => (<span key={`dup2-${i}`} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>))}
                    {BRANDS.map((brand, i) => (<span key={`dup3-${i}`} className="text-2xl md:text-3xl font-bold text-white/40 hover:text-white transition-colors cursor-default">{brand}</span>))}
                </div>
            </div>
            <style>{`
        .animate-marquee { animation: marquee 25s linear infinite; }
        .animate-marquee2 { animation: marquee2 25s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0%); } 100% { transform: translateX(-100%); } }
        @keyframes marquee2 { 0% { transform: translateX(100%); } 100% { transform: translateX(0%); } }
      `}</style>
        </section>
    );
};

export default Brands;
