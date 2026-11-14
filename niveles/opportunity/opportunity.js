/* =========================================
   PARADA 2 · OPPORTUNITY
   Registra las cinemáticas del nivel y guarda el progreso.
   (El minijuego se agregará en la siguiente etapa.)
========================================= */
(() => {
    const KEYS = {
        llegada: "opportunity_llegada_vista",
        nota: "opportunity_nota",                 /* lo lee el mapa de la misión */
        despedida: "opportunity_despedida_vista"
    };

    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
    };

    function markSteps() {
        const done = (id, on) => {
            const step = document.getElementById(id);
            if (step) step.classList.toggle("is-done", !!on);
        };
        done("step-1", store.get(KEYS.llegada));
        done("step-3", store.get(KEYS.despedida));
    }

    function init() {
        /* Opportunity dibujado (mismo diseño gemelo que Spirit) */
        const sprite = document.getElementById("op-sprite");
        const rover = document.getElementById("level-rover");
        if (sprite && rover) rover.innerHTML = sprite.innerHTML;

        Cinematica.crear("op-llegada", {
            script: "op-script-1",
            title: "el gemelo orgulloso",
            seenKey: KEYS.llegada,
            guest: "op-sprite",
            guestColor: "#fb923c",
            endActions: [
                {
                    label: "IR AL MINIJUEGO", primary: true,
                    onClick: () => {
                        const step = document.getElementById("step-2");
                        if (!step) return;
                        step.scrollIntoView({ behavior: "smooth", block: "center" });
                        step.classList.remove("is-flash");
                        void step.offsetWidth;
                        step.classList.add("is-flash");
                    }
                },
                { label: "VER DE NUEVO", replay: true }
            ],
            onEnd: markSteps
        });

        Cinematica.crear("op-despedida", {
            script: "op-script-2",
            title: "más de mil mensajes",
            seenKey: KEYS.despedida,
            guest: "op-sprite",
            guestColor: "#fb923c",
            onNote: () => store.set(KEYS.nota, "1"),
            endActions: [
                { label: "VOLVER AL MAPA", primary: true, onClick: () => { location.href = "../../index.html#mapa"; } },
                { label: "VER DE NUEVO", replay: true }
            ],
            onEnd: markSteps
        });

        markSteps();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
