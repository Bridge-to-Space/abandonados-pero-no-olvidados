/* =========================================
   CINEMÁTICA: EL ORIGEN DE ROVERCHITO
   Se reproduce a pantalla completa cuando el usuario la inicia.
   El guion vive en el HTML (#cine-script) para que se lea aun sin JavaScript.

   Cada escena tiene un tipo de voz, con su propio estilo:
     narrador    → recuadro de narración
     roverchito  → globo de diálogo que sale de él
     control     → transmisión entrante (Roverchito escucha)
     memoria     → animación de acceso a su memoria interna

   Controles: clic o espacio para avanzar, ← para volver,
   P para pausar, Esc para cerrar, "Saltar" para ir al final.
========================================= */
const Cinematica = (() => {

    const SEEN_KEY = "roverchito_cinematica_vista";
    const TYPE_MS = 30;                         /* velocidad de escritura por letra */
    const holdFor = text => 2400 + text.length * 50;   /* tiempo de lectura */

    /* Acceso a la memoria */
    const MEM_LOAD_MS = 2200;                   /* barra "accediendo…" */
    const MEM_ROW_MS = 800;                     /* aparición de cada dato */
    const MEM_STAMP_MS = 900;                   /* pausa antes del sello */
    const MEM_HOLD_MS = 4200;                   /* tiempo para leer el resultado */

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ICONS = {
        narrador: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3h4.5A2 2 0 0 1 8 5v8.5A2 2 0 0 0 6 12H1.5zM14.5 3H10a2 2 0 0 0-2 2v8.5a2 2 0 0 1 2-1.5h4.5z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
        roverchito: '<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><rect x="3" y="3" width="10" height="9" fill="currentColor"/><rect x="5" y="6" width="2" height="3" fill="#000"/><rect x="9" y="6" width="2" height="3" fill="#000"/><rect x="7" y="0" width="2" height="3" fill="currentColor"/><rect x="1" y="5" width="2" height="5" fill="currentColor"/><rect x="13" y="5" width="2" height="5" fill="currentColor"/></svg>',
        control: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="9" r="1.6" fill="currentColor"/><path d="M5 6a4.2 4.2 0 0 0 0 6M11 6a4.2 4.2 0 0 1 0 6M2.8 3.8a7.3 7.3 0 0 0 0 10.4M13.2 3.8a7.3 7.3 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
        memoria: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="6" y="6" width="4" height="4" fill="currentColor"/><path d="M6 1v2.5M10 1v2.5M6 12.5V15M10 12.5V15M1 6h2.5M1 10h2.5M12.5 6H15M12.5 10H15" stroke="currentColor" stroke-width="1.3"/></svg>',
        lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="1.2" fill="currentColor"/><path d="M5.2 7V5a2.8 2.8 0 0 1 5.6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
    };

    const LABELS = {
        narrador: "NARRADOR",
        roverchito: "ROVERCHITO",
        control: "CONTROL DE MISIÓN",
        memoria: "MEMORIA DE ROVERCHITO"
    };

    let scenes = [];
    let root, els = {};
    let index = 0;
    let typed = 0;
    let typeTimer = null;
    let holdTimer = null;
    let memTimers = [];
    let memDone = true;
    let paused = false;
    let isOpen = false;
    let lastFocus = null;

    /* ---------- Guion ---------- */
    function readScript() {
        const list = document.getElementById("cine-script");
        if (!list) return [];
        return [...list.querySelectorAll("li")].map(li => {
            const clean = li.cloneNode(true);
            clean.querySelectorAll("strong").forEach(s => s.remove());
            return {
                type: li.dataset.type || "narrador",
                mood: li.dataset.mood || "neutral",
                scene: li.dataset.scene || "lab",
                place: li.dataset.place || "",
                note: li.dataset.note || "",
                text: clean.textContent.replace(/\s+/g, " ").trim(),
                rows: [...li.querySelectorAll("[data-label]")].map(span => ({
                    label: span.dataset.label,
                    value: span.textContent.replace(/\s+/g, " ").trim(),
                    alert: span.hasAttribute("data-alert")
                }))
            };
        });
    }

    /* ---------- Construcción ---------- */
    function build() {
        root = document.createElement("div");
        root.className = "cine";
        root.hidden = true;
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-modal", "true");
        root.setAttribute("aria-label", "Cinemática: el origen de Roverchito");
        root.innerHTML = `
            <div class="cine-bg" data-scene="lab"></div>
            <div class="cine-flash" aria-hidden="true"></div>

            <div class="cine-bar cine-bar--top">
                <span class="cine-place"></span>
                <button class="cine-close" type="button" aria-label="Cerrar cinemática">✕</button>
            </div>

            <div class="cine-stage">
                <div class="cine-avatar-wrap">
                    <div class="cine-avatar"></div>
                    <div class="cine-scan" aria-hidden="true"></div>
                    <span class="cine-listening" aria-hidden="true">ESCUCHANDO…</span>
                </div>

                <div class="cine-caption">
                    <div class="cine-tag">
                        <span class="cine-tag-icon"></span>
                        <span class="cine-speaker"></span>
                        <span class="cine-note"></span>
                    </div>

                    <div class="cine-box">
                        <div class="cine-signal" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
                        <p class="cine-text" aria-live="polite"></p>
                    </div>

                    <div class="cine-memory" hidden>
                        <div class="mem-rain" aria-hidden="true"></div>
                        <div class="mem-loading">
                            <span class="mem-loading-label">ACCEDIENDO A LA MEMORIA…</span>
                            <div class="mem-bar"><i></i></div>
                            <span class="mem-pct">0%</span>
                        </div>
                        <div class="mem-file" hidden>
                            <div class="mem-file-head">ARCHIVO · ROVERCHITO.SYS</div>
                            <dl class="mem-rows"></dl>
                            <div class="mem-stamp" hidden>${ICONS.lock}<span>ACCESO RESTRINGIDO</span></div>
                        </div>
                    </div>

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
                    <button class="cine-btn cine-prev" type="button">◀ ANTERIOR</button>
                    <button class="cine-btn cine-pause" type="button">❚❚ PAUSA</button>
                    <button class="cine-btn cine-skip" type="button">SALTAR ▶▶</button>
                </div>
            </div>
        `;
        document.body.appendChild(root);

        const q = sel => root.querySelector(sel);
        els = {
            bg: q(".cine-bg"),
            place: q(".cine-place"),
            avatarWrap: q(".cine-avatar-wrap"),
            avatar: q(".cine-avatar"),
            caption: q(".cine-caption"),
            tagIcon: q(".cine-tag-icon"),
            speaker: q(".cine-speaker"),
            note: q(".cine-note"),
            box: q(".cine-box"),
            text: q(".cine-text"),
            memory: q(".cine-memory"),
            memLoading: q(".mem-loading"),
            memBar: q(".mem-bar i"),
            memPct: q(".mem-pct"),
            memFile: q(".mem-file"),
            memRows: q(".mem-rows"),
            memStamp: q(".mem-stamp"),
            memRain: q(".mem-rain"),
            end: q(".cine-end"),
            progress: q(".cine-progress"),
            prev: q(".cine-prev"),
            pause: q(".cine-pause"),
            skip: q(".cine-skip"),
            close: q(".cine-close"),
            hint: q(".cine-hint")
        };

        if (typeof Roverchito !== "undefined") Roverchito.mount(els.avatar, "neutral");
        els.progress.innerHTML = scenes.map(() => "<span><i></i></span>").join("");

        /* Lluvia de datos para el acceso a la memoria */
        const glyphs = "01ABCDEF";
        els.memRain.innerHTML = Array.from({ length: 14 }, (_, n) => {
            const col = Array.from({ length: 18 }, (_, k) => glyphs[(n * 7 + k * 3) % glyphs.length]).join("<br>");
            return `<span style="left:${n * 7.2}%;animation-delay:-${(n * 0.37) % 2}s">${col}</span>`;
        }).join("");

        root.addEventListener("click", event => {
            if (event.target.closest("button")) return;
            advance();
        });
        els.prev.addEventListener("click", () => goToScene(index - 1));
        els.pause.addEventListener("click", togglePause);
        els.skip.addEventListener("click", skipToEnd);
        els.close.addEventListener("click", close);
        root.querySelector(".cine-end-map").addEventListener("click", () => {
            close();
            if (typeof goTo === "function") goTo("mapa");
        });
        root.querySelector(".cine-end-replay").addEventListener("click", () => goToScene(0));
        document.addEventListener("keydown", onKey);
    }

    function onKey(event) {
        if (!isOpen) return;
        if (event.key === "Escape") {
            event.preventDefault();
            close();
        } else if (event.key === "p" || event.key === "P") {
            togglePause();
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToScene(index - 1);
        } else if ((event.code === "Space" || event.key === "Enter" || event.key === "ArrowRight") && !event.target.closest("button")) {
            event.preventDefault();
            advance();
        } else if (event.key === "Tab") {
            /* Mantener el foco dentro de la cinemática */
            const focusable = [...root.querySelectorAll("button")].filter(b => !b.hidden && !b.closest("[hidden]"));
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    }

    /* ---------- Utilidades ---------- */
    function clearTimers() {
        clearInterval(typeTimer);
        clearTimeout(holdTimer);
        memTimers.forEach(t => { clearTimeout(t); clearInterval(t); });
        memTimers = [];
        typeTimer = null;
        holdTimer = null;
    }

    const later = (fn, ms) => memTimers.push(setTimeout(fn, ms));
    const isLast = () => index === scenes.length - 1;
    const setMood = mood => { if (typeof Roverchito !== "undefined") Roverchito.setMood(els.avatar, mood); };

    function sceneDuration(scene) {
        if (scene.type === "memoria") {
            return MEM_LOAD_MS + scene.rows.length * MEM_ROW_MS + MEM_STAMP_MS + MEM_HOLD_MS;
        }
        const typeTime = reduceMotion ? 0 : scene.text.length * TYPE_MS;
        return isLast() ? typeTime + 300 : typeTime + holdFor(scene.text);
    }

    function updateProgress(duration) {
        [...els.progress.children].forEach((seg, n) => {
            seg.className = n < index ? "is-done" : n === index ? "is-current" : "";
            const bar = seg.firstElementChild;
            bar.style.animation = "none";
            if (n === index && duration) {
                void bar.offsetWidth;
                bar.style.animation = `cineFill ${duration}ms linear forwards`;
                bar.style.animationPlayState = paused ? "paused" : "running";
            }
        });
    }

    function fillCurrentSegment() {
        const seg = els.progress.children[index];
        if (!seg) return;
        seg.firstElementChild.style.animation = "none";
        seg.className = "is-done";
    }

    /* ---------- Escenas ---------- */
    function goToScene(n) {
        if (n < 0 || n >= scenes.length) return;
        paused = false;
        root.classList.remove("is-paused");
        els.pause.textContent = "❚❚ PAUSA";
        play(n);
    }

    function play(n) {
        clearTimers();
        index = n;
        const scene = scenes[index];

        root.dataset.type = scene.type;
        root.dataset.scene = scene.scene;
        root.classList.remove("is-alert");
        els.bg.dataset.scene = scene.scene;

        /* Lugar de la escena, con un fundido cuando cambia */
        if (els.place.textContent !== scene.place) {
            els.place.classList.remove("is-in");
            void els.place.offsetWidth;
            els.place.textContent = scene.place;
            els.place.classList.add("is-in");
        }

        /* Quién habla */
        els.tagIcon.innerHTML = ICONS[scene.type] || "";
        els.speaker.textContent = LABELS[scene.type] || "";
        els.note.textContent = scene.note;
        els.note.hidden = !scene.note;

        els.end.hidden = true;
        els.text.textContent = "";
        typed = 0;
        setMood(scene.mood);

        /* Entrada del personaje y del cuadro de texto */
        [els.avatarWrap, els.caption].forEach(el => {
            el.classList.remove("is-in");
            void el.offsetWidth;
            el.classList.add("is-in");
        });

        els.prev.disabled = index === 0;
        els.skip.hidden = isLast();
        els.pause.hidden = isLast();
        els.hint.textContent = "Clic o espacio para avanzar";

        updateProgress(sceneDuration(scene));

        if (scene.type === "memoria") {
            els.box.hidden = true;
            els.memory.hidden = false;
            playMemory(scene);
            return;
        }

        els.box.hidden = false;
        els.memory.hidden = true;
        els.avatarWrap.classList.remove("is-scanning");

        if (reduceMotion) finishTyping();
        else if (!paused) startTyping();
    }

    function startTyping() {
        const text = scenes[index].text;
        clearInterval(typeTimer);
        root.classList.add("is-typing");
        typeTimer = setInterval(() => {
            typed++;
            els.text.textContent = text.slice(0, typed);
            if (typed >= text.length) finishTyping();
        }, TYPE_MS);
    }

    function finishTyping() {
        clearInterval(typeTimer);
        typeTimer = null;
        root.classList.remove("is-typing");
        const text = scenes[index].text;
        typed = text.length;
        els.text.textContent = text;

        if (isLast()) {
            showEnd();
            return;
        }
        if (!paused) scheduleNext(holdFor(text));
    }

    function scheduleNext(ms) {
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => play(index + 1), ms);
    }

    /* ---------- Acceso a la memoria ---------- */
    function playMemory(scene) {
        memDone = false;
        els.memLoading.hidden = false;
        els.memFile.hidden = true;
        els.memStamp.hidden = true;
        els.memRows.innerHTML = "";
        els.memBar.style.width = "0%";
        els.memPct.textContent = "0%";
        els.avatarWrap.classList.add("is-scanning");

        if (reduceMotion) {
            finishMemory();
            return;
        }

        /* 1. Barra de carga */
        const start = performance.now();
        const loader = setInterval(() => {
            const pct = Math.min(100, Math.round((performance.now() - start) / MEM_LOAD_MS * 100));
            els.memBar.style.width = `${pct}%`;
            els.memPct.textContent = `${pct}%`;
            if (pct >= 100) clearInterval(loader);
        }, 40);
        memTimers.push(loader);

        /* 2. Se abre el archivo y aparecen los datos uno por uno */
        later(() => {
            els.memLoading.hidden = true;
            els.memFile.hidden = false;
        }, MEM_LOAD_MS);

        scene.rows.forEach((row, n) => {
            later(() => addMemoryRow(row, true), MEM_LOAD_MS + n * MEM_ROW_MS + 150);
        });

        /* 3. Sello de acceso restringido */
        const stampAt = MEM_LOAD_MS + scene.rows.length * MEM_ROW_MS + MEM_STAMP_MS;
        later(showStamp, stampAt);
        later(() => {
            memDone = true;
            if (!paused) play(index + 1);
        }, stampAt + MEM_HOLD_MS);
    }

    function addMemoryRow(row, animate) {
        const dt = document.createElement("dt");
        dt.textContent = row.label;
        const dd = document.createElement("dd");
        if (row.alert) dd.className = "is-alert";
        els.memRows.append(dt, dd);

        if (!animate) {
            dd.textContent = row.value;
            return;
        }
        let k = 0;
        const t = setInterval(() => {
            k++;
            dd.textContent = row.value.slice(0, k);
            if (k >= row.value.length) clearInterval(t);
        }, 22);
        memTimers.push(t);
    }

    function showStamp() {
        els.memStamp.hidden = false;
        els.avatarWrap.classList.remove("is-scanning");
        root.classList.add("is-alert");
        setMood("sad");
    }

    /* Muestra de golpe el resultado final del acceso a la memoria */
    function finishMemory() {
        const scene = scenes[index];
        clearTimers();
        els.memLoading.hidden = true;
        els.memFile.hidden = false;
        els.memRows.innerHTML = "";
        scene.rows.forEach(row => addMemoryRow(row, false));
        showStamp();
        memDone = true;
        fillCurrentSegment();
        if (!paused) scheduleNext(3200);
    }

    /* ---------- Controles ---------- */
    function advance() {
        const scene = scenes[index];
        if (paused) togglePause();

        if (scene.type === "memoria") {
            if (!memDone) finishMemory();
            else if (!isLast()) play(index + 1);
            return;
        }

        if (typed < scene.text.length) {
            finishTyping();          /* primer clic: termina de escribir */
            if (!isLast()) fillCurrentSegment();
        } else if (!isLast()) {
            play(index + 1);         /* segundo clic: siguiente escena */
        }
    }

    function togglePause() {
        const scene = scenes[index];
        if (isLast() && typed >= scene.text.length) return;

        /* Si se pausa a mitad de la memoria, se muestra el resultado completo */
        if (!paused && scene.type === "memoria" && !memDone) finishMemory();

        paused = !paused;
        els.pause.textContent = paused ? "▶ SEGUIR" : "❚❚ PAUSA";
        els.hint.textContent = paused ? "En pausa" : "Clic o espacio para avanzar";
        root.classList.toggle("is-paused", paused);
        const bar = els.progress.children[index] && els.progress.children[index].firstElementChild;
        if (bar) bar.style.animationPlayState = paused ? "paused" : "running";

        if (paused) {
            clearTimers();
        } else if (scene.type === "memoria") {
            scheduleNext(2000);
        } else if (typed < scene.text.length) {
            startTyping();
        } else {
            scheduleNext(1800);
        }
    }

    function skipToEnd() {
        goToScene(scenes.length - 1);
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

    /* ---------- Abrir y cerrar ---------- */
    function abrir() {
        if (!scenes.length) scenes = readScript();
        if (!scenes.length) return;
        if (!root) build();

        lastFocus = document.activeElement;
        isOpen = true;
        root.hidden = false;
        document.documentElement.classList.add("cine-open");
        requestAnimationFrame(() => root.classList.add("is-open"));
        els.close.focus();
        goToScene(0);
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
        if (!document.getElementById("cine-script")) return;
        document.documentElement.classList.add("has-cine");
        try {
            if (localStorage.getItem(SEEN_KEY)) markSeen();
        } catch (e) { /* sin almacenamiento */ }
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

    return { abrir };
})();
