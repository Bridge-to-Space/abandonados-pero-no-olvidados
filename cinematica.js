/* =========================================
   CINEMÁTICA: EL ORIGEN DE ROVERCHITO
   Se reproduce a pantalla completa cuando el usuario la inicia.
   El guion vive en el HTML (#cine-script) para que se lea aun sin JavaScript.

   Controles: clic o espacio para avanzar, P para pausar,
   Esc para cerrar, botón "Saltar" para ir al final.
========================================= */
const Cinematica = (() => {

    const SEEN_KEY = "roverchito_cinematica_vista";
    const TYPE_MS = 28;                 /* velocidad de escritura por letra */
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let scenes = [];
    let root, els = {};
    let index = 0;
    let typed = 0;
    let typeTimer = null;
    let holdTimer = null;
    let paused = false;
    let isOpen = false;
    let lastFocus = null;

    /* Tiempo de lectura después de escribir el texto */
    const holdFor = text => 1600 + text.length * 40;

    function readScript() {
        const list = document.getElementById("cine-script");
        if (!list) return [];
        return [...list.querySelectorAll("li")].map(li => ({
            text: li.textContent.replace(/\s+/g, " ").trim(),
            speaker: li.dataset.speaker || "",
            mood: li.dataset.mood || "neutral",
            scene: li.dataset.scene || "lab"
        }));
    }

    function build() {
        root = document.createElement("div");
        root.className = "cine";
        root.hidden = true;
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-modal", "true");
        root.setAttribute("aria-label", "Cinemática: el origen de Roverchito");
        root.innerHTML = `
            <div class="cine-bg" data-scene="lab"></div>
            <div class="cine-bar cine-bar--top">
                <span class="cine-title">EL ORIGEN DE ROVERCHITO</span>
                <button class="cine-close" type="button" aria-label="Cerrar cinemática">✕</button>
            </div>
            <div class="cine-stage">
                <div class="cine-avatar"></div>
                <div class="cine-caption">
                    <span class="cine-speaker"></span>
                    <p class="cine-text" aria-live="polite"></p>
                    <div class="cine-end" hidden>
                        <button class="primary-btn cine-end-map" type="button">ABRIR EL MAPA DE LA MISIÓN</button>
                        <button class="secondary-btn cine-end-replay" type="button">VER DE NUEVO</button>
                    </div>
                </div>
            </div>
            <div class="cine-bar cine-bar--bottom">
                <div class="cine-progress"></div>
                <div class="cine-controls">
                    <span class="cine-hint">Clic o espacio para avanzar</span>
                    <button class="cine-btn cine-pause" type="button">❚❚ PAUSA</button>
                    <button class="cine-btn cine-skip" type="button">SALTAR ▶▶</button>
                </div>
            </div>
        `;
        document.body.appendChild(root);

        els = {
            bg: root.querySelector(".cine-bg"),
            avatar: root.querySelector(".cine-avatar"),
            speaker: root.querySelector(".cine-speaker"),
            text: root.querySelector(".cine-text"),
            end: root.querySelector(".cine-end"),
            progress: root.querySelector(".cine-progress"),
            pause: root.querySelector(".cine-pause"),
            skip: root.querySelector(".cine-skip"),
            close: root.querySelector(".cine-close"),
            hint: root.querySelector(".cine-hint")
        };

        if (typeof Roverchito !== "undefined") Roverchito.mount(els.avatar, "neutral");
        els.progress.innerHTML = scenes.map(() => "<span><i></i></span>").join("");

        /* Clic en cualquier parte de la escena = avanzar */
        root.addEventListener("click", event => {
            if (event.target.closest("button")) return;
            advance();
        });
        els.pause.addEventListener("click", togglePause);
        els.skip.addEventListener("click", skipToEnd);
        els.close.addEventListener("click", close);
        root.querySelector(".cine-end-map").addEventListener("click", () => {
            close();
            if (typeof goTo === "function") goTo("mapa");
        });
        root.querySelector(".cine-end-replay").addEventListener("click", () => play(0));
        document.addEventListener("keydown", onKey);
    }

    function onKey(event) {
        if (!isOpen) return;
        if (event.key === "Escape") {
            event.preventDefault();
            close();
        } else if (event.key === "p" || event.key === "P") {
            togglePause();
        } else if ((event.code === "Space" || event.key === "Enter" || event.key === "ArrowRight") && !event.target.closest("button")) {
            event.preventDefault();
            advance();
        } else if (event.key === "Tab") {
            /* Mantener el foco dentro de la cinemática */
            const focusable = [...root.querySelectorAll("button")].filter(b => !b.closest("[hidden]"));
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    }

    function clearTimers() {
        clearInterval(typeTimer);
        clearTimeout(holdTimer);
        typeTimer = null;
        holdTimer = null;
    }

    function updateProgress(duration) {
        [...els.progress.children].forEach((seg, n) => {
            seg.className = n < index ? "is-done" : n === index ? "is-current" : "";
            const bar = seg.firstElementChild;
            bar.style.animation = "none";
            if (n === index) {
                void bar.offsetWidth;
                bar.style.animation = `cineFill ${duration}ms linear forwards`;
                bar.style.animationPlayState = paused ? "paused" : "running";
            }
        });
    }

    function play(n) {
        clearTimers();
        index = Math.max(0, Math.min(scenes.length - 1, n));
        const scene = scenes[index];
        const isLast = index === scenes.length - 1;

        els.bg.dataset.scene = scene.scene;
        root.dataset.scene = scene.scene;
        els.speaker.textContent = scene.speaker;
        els.end.hidden = true;
        els.text.textContent = "";
        typed = 0;
        if (typeof Roverchito !== "undefined") Roverchito.setMood(els.avatar, scene.mood);

        /* reinicia la animación de entrada de la escena */
        els.avatar.classList.remove("is-in");
        void els.avatar.offsetWidth;
        els.avatar.classList.add("is-in");

        const typeTime = reduceMotion ? 0 : scene.text.length * TYPE_MS;
        updateProgress(isLast ? typeTime + 300 : typeTime + holdFor(scene.text));
        els.skip.hidden = isLast;
        els.pause.hidden = isLast;

        if (reduceMotion) finishTyping();
        else if (!paused) startTyping();
    }

    function startTyping() {
        const text = scenes[index].text;
        clearInterval(typeTimer);
        typeTimer = setInterval(() => {
            typed++;
            els.text.textContent = text.slice(0, typed);
            if (typed >= text.length) finishTyping();
        }, TYPE_MS);
    }

    function finishTyping() {
        clearInterval(typeTimer);
        typeTimer = null;
        const text = scenes[index].text;
        typed = text.length;
        els.text.textContent = text;

        if (index === scenes.length - 1) {
            showEnd();
            return;
        }
        if (!paused) scheduleNext();
    }

    function scheduleNext() {
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => play(index + 1), holdFor(scenes[index].text));
    }

    function advance() {
        if (paused) togglePause();
        const text = scenes[index].text;
        if (typed < text.length) {
            /* primer clic: termina de escribir; el siguiente avanza */
            finishTyping();
            if (index < scenes.length - 1) updateProgress(400);
        } else if (index < scenes.length - 1) {
            play(index + 1);
        }
    }

    function togglePause() {
        if (index === scenes.length - 1 && typed >= scenes[index].text.length) return;
        paused = !paused;
        els.pause.textContent = paused ? "▶ SEGUIR" : "❚❚ PAUSA";
        root.classList.toggle("is-paused", paused);
        const bar = els.progress.children[index] && els.progress.children[index].firstElementChild;
        if (bar) bar.style.animationPlayState = paused ? "paused" : "running";

        if (paused) {
            clearTimers();
        } else if (typed < scenes[index].text.length) {
            startTyping();
        } else {
            scheduleNext();
        }
    }

    function skipToEnd() {
        paused = false;
        root.classList.remove("is-paused");
        els.pause.textContent = "❚❚ PAUSA";
        play(scenes.length - 1);
        finishTyping();
    }

    function showEnd() {
        els.end.hidden = false;
        els.hint.textContent = "Fin del episodio";
        [...els.progress.children].forEach(seg => {
            seg.className = "is-done";
            seg.firstElementChild.style.animation = "none";
        });
        try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* sin almacenamiento */ }
        markSeen();
        const mapButton = root.querySelector(".cine-end-map");
        if (mapButton) mapButton.focus();
    }

    function markSeen() {
        const playButton = document.querySelector(".cine-play");
        const toMap = document.querySelector(".cine-to-map");
        if (playButton) playButton.textContent = "↻ VER DE NUEVO";
        if (toMap) toMap.hidden = false;
    }

    function abrir() {
        if (!scenes.length) scenes = readScript();
        if (!scenes.length) return;
        if (!root) build();

        lastFocus = document.activeElement;
        isOpen = true;
        paused = false;
        root.classList.remove("is-paused");
        els.pause.textContent = "❚❚ PAUSA";
        els.hint.textContent = "Clic o espacio para avanzar";
        root.hidden = false;
        document.documentElement.classList.add("cine-open");
        requestAnimationFrame(() => root.classList.add("is-open"));
        els.close.focus();
        play(0);
    }

    function close() {
        clearTimers();
        isOpen = false;
        root.classList.remove("is-open");
        document.documentElement.classList.remove("cine-open");
        root.hidden = true;
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function init() {
        const script = document.getElementById("cine-script");
        if (!script) return;
        document.documentElement.classList.add("has-cine");
        try {
            if (localStorage.getItem(SEEN_KEY)) markSeen();
        } catch (e) { /* sin almacenamiento */ }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

    return { abrir };
})();
