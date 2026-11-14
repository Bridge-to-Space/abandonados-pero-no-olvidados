/* =========================================
   PARADA 5 · PIONEER 10 (el final de la historia)
   Registra las cinemáticas del nivel, guarda el progreso
   y hace sonar la melodía completa cuando Roverchito recibe la última nota.
   (El minijuego se agregará en la siguiente etapa.)
========================================= */
(() => {
    const KEYS = {
        viaje: "pioneer10_viaje_vista",
        nota: "pioneer10_nota",                   /* lo lee el mapa de la misión */
        final: "pioneer10_final_vista"
    };

    const store = {
        get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
    };

    /* La melodía: una nota por nave (Sojourner, Spirit, Opportunity, Kepler, Pioneer 10) */
    const MELODY = [523.25, 659.25, 783.99, 880.0, 1046.5];

    function playMelody() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        try {
            const ctx = new AudioCtx();
            const start = ctx.currentTime + 0.15;
            MELODY.forEach((freq, n) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const t = start + n * 0.42;
                osc.type = "sine";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, t);
                gain.gain.exponentialRampToValueAtTime(0.18, t + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
                osc.connect(gain).connect(ctx.destination);
                osc.start(t);
                osc.stop(t + 1);
            });
            setTimeout(() => ctx.close(), 4000);
        } catch (e) {
            /* sin audio: la escena se ve igual */
        }
    }

    function markSteps() {
        const done = (id, on) => {
            const step = document.getElementById(id);
            if (step) step.classList.toggle("is-done", !!on);
        };
        done("step-1", store.get(KEYS.viaje));
        done("step-3", store.get(KEYS.final));
    }

    function init() {
        const sprite = document.getElementById("p10-sprite");
        const probe = document.getElementById("level-rover");
        if (sprite && probe) probe.innerHTML = sprite.innerHTML;

        Cinematica.crear("p10-viaje", {
            script: "p10-script-1",
            title: "la señal más lejana",
            seenKey: KEYS.viaje,
            guest: "p10-sprite",
            guestColor: "#c4b5fd",
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

        let melodyPlayed = false;
        Cinematica.crear("p10-final", {
            script: "p10-script-2",
            title: "nuestra última señal",
            seenKey: KEYS.final,
            guest: "p10-sprite",
            guestColor: "#c4b5fd",
            onNote: () => {
                store.set(KEYS.nota, "1");
                if (!melodyPlayed) { melodyPlayed = true; playMelody(); }
            },
            endActions: [
                { label: "VER EL MAPA COMPLETO", primary: true, onClick: () => { location.href = "../../index.html#mapa"; } },
                { label: "VER DE NUEVO", replay: true }
            ],
            onEnd: () => { melodyPlayed = false; markSteps(); }
        });

        markSteps();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
