/* =========================================
   SPIRIT — MINIJUEGOS
   Mecánicas reutilizables. Cada minijuego devuelve
   un resultado por ronda: "perfecto", "bien" o "fallo".
========================================= */
const Minijuegos = (() => {

    const LABELS = {
        perfecto: "¡PERFECTO!",
        bien: "BIEN",
        fallo: "FALLO"
    };

    /*
       ANILLOS QUE SE CIERRAN
       Un anillo se encoge hacia un círculo fijo. El jugador hace clic,
       toca la pantalla o presiona espacio/Enter cuando coinciden.

       opciones:
         container   elemento donde se dibuja el minijuego
         rounds      [{ name, hint }]  una ronda por elemento
         duration    ms que tarda el anillo en cerrarse (por defecto 1600)
         onRound     (index, resultado) => void   al terminar cada ronda
         onFinish    (resultados) => void
    */
    function anillos({ container, rounds, duration = 1600, onRound, onFinish }) {
        if (!container) return;

        const START_SCALE = 3;      /* el anillo empieza 3 veces más grande */
        const PERFECT = 0.09;       /* margen para "perfecto" */
        const GOOD = 0.22;          /* margen para "bien" */

        const results = [];
        let round = 0;
        let startTime = 0;
        let frame = 0;
        let waiting = false;        /* true mientras se muestra el resultado */
        let currentScale = START_SCALE;

        container.innerHTML = `
            <div class="mg-rings" role="group" aria-label="Minijuego de aterrizaje">
                <div class="mg-top">
                    <span class="mg-step"></span>
                    <strong class="mg-name"></strong>
                    <span class="mg-hint"></span>
                </div>
                <div class="mg-stage">
                    <div class="mg-target"></div>
                    <div class="mg-ring"></div>
                    <div class="mg-feedback" aria-live="assertive"></div>
                </div>
                <div class="mg-bottom">
                    <span class="mg-help">Clic, toque o barra espaciadora</span>
                    <button type="button" class="mg-skip">Saltar minijuego</button>
                </div>
            </div>
        `;
        container.hidden = false;

        const root = container.querySelector(".mg-rings");
        const ring = container.querySelector(".mg-ring");
        const target = container.querySelector(".mg-target");
        const feedback = container.querySelector(".mg-feedback");
        const stepEl = container.querySelector(".mg-step");
        const nameEl = container.querySelector(".mg-name");
        const hintEl = container.querySelector(".mg-hint");
        const skip = container.querySelector(".mg-skip");

        function startRound() {
            const info = rounds[round];
            stepEl.textContent = `ETAPA ${round + 1} DE ${rounds.length}`;
            nameEl.textContent = info.name;
            hintEl.textContent = info.hint || "";
            feedback.textContent = "";
            feedback.className = "mg-feedback";
            target.className = "mg-target";
            waiting = false;
            startTime = performance.now();
            frame = requestAnimationFrame(tick);
        }

        function tick(now) {
            const progress = (now - startTime) / duration;
            currentScale = START_SCALE - (START_SCALE * progress);
            ring.style.transform = `translate(-50%, -50%) scale(${Math.max(currentScale, 0)})`;

            /* Si el anillo pasa de largo sin respuesta, cuenta como fallo */
            if (currentScale < 1 - GOOD) {
                resolve("fallo");
                return;
            }
            frame = requestAnimationFrame(tick);
        }

        function hit() {
            if (waiting) return;
            const diff = Math.abs(currentScale - 1);
            if (diff <= PERFECT) resolve("perfecto");
            else if (diff <= GOOD) resolve("bien");
            else resolve("fallo");
        }

        function resolve(result) {
            if (waiting) return;
            waiting = true;
            cancelAnimationFrame(frame);
            results.push(result);

            feedback.textContent = LABELS[result];
            feedback.className = `mg-feedback is-${result}`;
            target.className = `mg-target is-${result}`;

            if (onRound) onRound(round, result);

            setTimeout(() => {
                round++;
                if (round < rounds.length) startRound();
                else finish();
            }, 850);
        }

        function skipAll() {
            if (waiting && round >= rounds.length) return;
            cancelAnimationFrame(frame);
            /* Las rondas que faltan cuentan como "bien" */
            while (results.length < rounds.length) {
                const index = results.length;
                results.push("bien");
                if (onRound) onRound(index, "bien");
            }
            round = rounds.length;
            finish();
        }

        function onKey(event) {
            if (event.code === "Space" || event.code === "Enter") {
                if (event.target === skip) return;
                event.preventDefault();
                hit();
            }
        }

        function onPointer(event) {
            if (event.target === skip) return;
            event.preventDefault();
            hit();
        }

        let finished = false;
        function finish() {
            if (finished) return;
            finished = true;
            document.removeEventListener("keydown", onKey);
            root.removeEventListener("pointerdown", onPointer);
            container.hidden = true;
            container.innerHTML = "";
            if (onFinish) onFinish(results);
        }

        root.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        skip.addEventListener("click", skipAll);

        startRound();
    }

    return { anillos };
})();
