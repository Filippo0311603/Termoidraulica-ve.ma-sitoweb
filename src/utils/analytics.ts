export const initGA = () => {
    // Evita di inizializzare due volte
    if ((window as any).gaInitialized) return;

    // Utilizza requestIdleCallback per non bloccare il thread principale durante il caricamento
    const run = (window as any).requestIdleCallback || ((cb: Function) => setTimeout(cb, 1));

    run(() => {
        const script = document.createElement('script');
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-1104F902TF";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            (window as any).dataLayer = (window as any).dataLayer || [];
            function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
            gtag('js', new Date());
            gtag('config', 'G-1104F902TF', {
                'anonymize_ip': true,   // GDPR: Anonimizza IP
                'send_page_view': true
            });
            (window as any).gaInitialized = true;
            console.log("Google Analytics 4 inizializzato (Lazy).");
        };
    });
};
