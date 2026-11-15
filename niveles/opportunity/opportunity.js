/* =========================================
   PARADA 3 · OPPORTUNITY
   Historia original: Joel Vazquez Juarez (adaptada como escenas)
   Registra las cinemáticas del nivel y guarda el progreso.
   El minijuego está en juego.js; la cinemática final se desbloquea al ganarlo.
========================================= */
(() => {
    const KEYS = {
        llegada: "opportunity_llegada_vista",
        nota: "opportunity_nota",                 /* lo lee el mapa de la misión */
        juego: "opportunity_juego",               /* estrellas del minijuego */
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
        done("step-2", store.get(KEYS.juego));
        done("step-3", store.get(KEYS.despedida));

        /* La cinemática final se ve después de ganar el minijuego */
        const won = !!store.get(KEYS.juego);
        const final = document.getElementById("play-final");
        const step3 = document.getElementById("step-3");
        if (final) {
            final.disabled = !won;
            final.textContent = won ? "▶ VER" : "🔒 GANA EL MINIJUEGO";
        }
        if (step3) step3.classList.toggle("is-locked", !won);

        const play = document.getElementById("play-game");
        if (play) play.textContent = won ? "↻ JUGAR DE NUEVO" : "▶ JUGAR";
    }

    function openGame() {
        OpportunityJuego.abrir({
            onWin: () => {
                markSteps();
                Cinematica.abrir("op-despedida");
            }
        });
    }

    function init() {
        /* Opportunity dibujado (mismo diseño gemelo que Spirit) */
        const sprite = document.getElementById("op-sprite");
        const rover = document.getElementById("level-rover");
        if (sprite && rover) rover.innerHTML = sprite.innerHTML;

        Cinematica.crear("op-llegada", {
            script: "op-script-1",
            title: "una misión de 90 días",
            seenKey: KEYS.llegada,
            guest: "op-sprite",
            guestColor: "#fb923c",
            endActions: [
                { label: "IR AL MINIJUEGO", primary: true, onClick: openGame },
                { label: "VER DE NUEVO", replay: true }
            ],
            onEnd: markSteps
        });

        Cinematica.crear("op-despedida", {
            script: "op-script-2",
            title: "casi 15 años en Marte",
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

        const play = document.getElementById("play-game");
        if (play) play.addEventListener("click", openGame);

        markSteps();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
