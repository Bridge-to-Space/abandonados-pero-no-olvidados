/* =========================================
   MOTOR DE CINEMÁTICAS
   Reproduce a pantalla completa un guion escrito en el HTML
   (<ol> con un <li> por escena). Sin JavaScript el guion se lee como texto.

   Uso:
     Cinematica.crear("op-llegada", { script: "op-script-1", ... })
     Cinematica.abrir("op-llegada")
     Cinematica.abrir()            → la cinemática del inicio ("origen")

   Atributos de cada <li>:
     data-type   narrador | roverchito | control | nave | jugador | memoria | nota | eleccion
     data-mood   expresión de Roverchito: neutral | happy | sad
     data-scene  fondo: lab | file | night | control | space | mars-day | mars-dusk | mars-night | storm |
                 asteroids | jupiter | deep
     data-place  dónde ocurre (barra superior)
     data-note   etiqueta junto al nombre (por ejemplo "TE PREGUNTA A TI")
     data-if     "clave=valor": la escena solo aparece si el usuario eligió ese valor
     data-solo   escena del pasado: Roverchito no aparece y la nave invitada se ilumina
     data-audio  (frases de Roverchito) archivo con la voz grabada; si no hay,
                 la lee la voz del navegador (ver voz.js)
     nave:      data-name (nombre), data-weak (señal débil)
     memoria:   data-name, data-file, data-loading, data-stamp, data-tone (alert | ok),
                y dentro <span data-label="…" data-alert>valor</span> por dato
     eleccion:  data-key (dónde se guarda) y dentro <span data-option="a">texto</span>

   Controles: clic o espacio para avanzar, ← para volver,
   P para pausar, Esc para cerrar, "Saltar" para ir al final.
========================================= */
const Cinematica = (() => {

    const TYPE_MS = 30;                                  /* velocidad de escritura */
    const holdFor = text => 2400 + text.length * 50;     /* tiempo de lectura */
    const MEM_LOAD_MS = 2200, MEM_ROW_MS = 800, MEM_STAMP_MS = 900, MEM_HOLD_MS = 4200;
    const NOTE_MS = 4200;

    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ICONS = {
        narrador: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3h4.5A2 2 0 0 1 8 5v8.5A2 2 0 0 0 6 12H1.5zM14.5 3H10a2 2 0 0 0-2 2v8.5a2 2 0 0 1 2-1.5h4.5z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
        roverchito: '<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><rect x="3" y="3" width="10" height="9" fill="currentColor"/><rect x="5" y="6" width="2" height="3" fill="#000"/><rect x="9" y="6" width="2" height="3" fill="#000"/><rect x="7" y="0" width="2" height="3" fill="currentColor"/><rect x="1" y="5" width="2" height="5" fill="currentColor"/><rect x="13" y="5" width="2" height="5" fill="currentColor"/></svg>',
        control: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="9" r="1.6" fill="currentColor"/><path d="M5 6a4.2 4.2 0 0 0 0 6M11 6a4.2 4.2 0 0 1 0 6M2.8 3.8a7.3 7.3 0 0 0 0 10.4M13.2 3.8a7.3 7.3 0 0 1 0 10.4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
        nave: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="6" width="12" height="4" rx="1" fill="currentColor"/><rect x="3" y="4" width="10" height="1.6" fill="currentColor"/><circle cx="4" cy="12.5" r="1.6" fill="currentColor"/><circle cx="8" cy="12.5" r="1.6" fill="currentColor"/><circle cx="12" cy="12.5" r="1.6" fill="currentColor"/><rect x="10.5" y="1" width="1.4" height="3.5" fill="currentColor"/></svg>',
        memoria: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/><rect x="6" y="6" width="4" height="4" fill="currentColor"/><path d="M6 1v2.5M10 1v2.5M6 12.5V15M10 12.5V15M1 6h2.5M1 10h2.5M12.5 6H15M12.5 10H15" stroke="currentColor" stroke-width="1.3"/></svg>',
        jugador: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="5" r="3" fill="currentColor"/><path d="M2.5 15c.4-3.4 2.6-5.4 5.5-5.4s5.1 2 5.5 5.4z" fill="currentColor"/></svg>',
        nota: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 12.5V3l7-1.5v9" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="4.3" cy="12.6" rx="2.2" ry="1.7" fill="currentColor"/><ellipse cx="11.3" cy="11" rx="2.2" ry="1.7" fill="currentColor"/></svg>',
        lock: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="7" width="10" height="7.5" rx="1.2" fill="currentColor"/><path d="M5.2 7V5a2.8 2.8 0 0 1 5.6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
        check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    const LABELS = {
        narrador: "NARRADOR",
        roverchito: "ROVERCHITO",
        control: "CONTROL DE MISIÓN",
        memoria: "MEMORIA DE ROVERCHITO",
        nota: "NOTA DE LA MELODÍA",
        eleccion: "ROVERCHITO",
        jugador: "TÚ · EXPLORADOR"
    };

    /* Voz de Roverchito (voz.js); si la página no la carga, todo sigue en texto */
    const voz = () => (typeof RoverchitoVoz !== "undefined" ? RoverchitoVoz : null);
    const speaksRover = s => s.type === "roverchito" || s.type === "eleccion";

    const store = {
        get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* sin almacenamiento */ } }
    };

    const clean = text => text.replace(/\s+/g, " ").trim();

    /* ---------- Lectura del guion ---------- */
    function readScript(id) {
        const list = document.getElementById(id);
        if (!list) return [];
        return [...list.querySelectorAll(":scope > li")].map(li => {
            const copy = li.cloneNode(true);
            copy.querySelectorAll("strong, [data-label], [data-option]").forEach(n => n.remove());
            const d = li.dataset;
            return {
                type: d.type || "narrador",
                mood: d.mood || "neutral",
                scene: d.scene || "lab",
                place: d.place || "",
                note: d.note || "",
                name: d.name || "",
                weak: "weak" in d,
                solo: "solo" in d,
                cond: d.if || "",
                file: d.file || "ARCHIVO · ROVERCHITO.SYS",
                loading: d.loading || "ACCEDIENDO A LA MEMORIA…",
                stamp: d.stamp || "ACCESO RESTRINGIDO",
                tone: d.tone || "alert",
                key: d.key || "",
                audio: d.audio || "",
                text: clean(copy.textContent),
                rows: [...li.querySelectorAll("[data-label]")].map(s => ({
                    label: s.dataset.label, value: clean(s.textContent), alert: s.hasAttribute("data-alert")
                })),
                options: [...li.querySelectorAll("[data-option]")].map(s => ({
                    value: s.dataset.option, text: clean(s.textContent)
                }))
            };
        });
    }

    /* ---------- Un reproductor por cinemática ---------- */
    function createPlayer(id, opts) {
        let scenes = [];
        let root, els = {};
        let index = 0, typed = 0;
        let typeTimer = null, holdTimer = null, timers = [];
        let busy = false;        /* escena con animación propia en curso (memoria / nota) */
        let waiting = false;     /* esperando una elección del usuario */
        let paused = false, isOpen = false, lastFocus = null;
        let waitingVoice = false; /* el texto terminó pero Roverchito sigue hablando */

        const later = (fn, ms) => timers.push(setTimeout(fn, ms));
        const setMood = mood => { if (typeof Roverchito !== "undefined" && els.avatar) Roverchito.setMood(els.avatar, mood); };

        function visible(scene) {
            if (!scene.cond) return true;
            /* "clave=" (sin valor) aparece solo si el usuario aún no ha elegido nada */
            const [key, value] = scene.cond.split("=");
            return (store.get(key) || "") === (value || "");
        }
        const nextIndex = from => { for (let n = from + 1; n < scenes.length; n++) if (visible(scenes[n])) return n; return -1; };
        const prevIndex = from => { for (let n = from - 1; n >= 0; n--) if (visible(scenes[n])) return n; return -1; };
        const isLast = () => nextIndex(index) === -1;

        function build() {
            root = document.createElement("div");
            root.className = "cine";
            root.hidden = true;
            root.setAttribute("role", "dialog");
            root.setAttribute("aria-modal", "true");
            root.setAttribute("aria-label", `Cinemática: ${opts.title || ""}`);
            if (opts.guestColor) root.style.setProperty("--voz-nave", opts.guestColor);
            root.innerHTML = `
                <div class="cine-bg" data-scene="lab"></div>
                <div class="cine-flash" aria-hidden="true"></div>
                <div class="cine-bar cine-bar--top">
                    <span class="cine-place"></span>
                    <button class="cine-close" type="button" aria-label="Cerrar cinemática">✕</button>
                </div>
                <div class="cine-stage${opts.guest ? " has-guest" : ""}">
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
                        <div class="cine-options" hidden></div>
                        <div class="cine-memory" hidden>
                            <div class="mem-rain" aria-hidden="true"></div>
                            <div class="mem-loading">
                                <span class="mem-loading-label"></span>
                                <div class="mem-bar"><i></i></div>
                                <span class="mem-pct">0%</span>
                            </div>
                            <div class="mem-file" hidden>
                                <div class="mem-file-head"></div>
                                <dl class="mem-rows"></dl>
                                <div class="mem-stamp" hidden><span class="mem-stamp-icon"></span><span class="mem-stamp-text"></span></div>
                            </div>
                        </div>
                        <div class="cine-notebox" hidden>
                            <span class="cine-bignote" aria-hidden="true">♪</span>
                            <p class="cine-notetext"></p>
                        </div>
                        <div class="cine-end" hidden></div>
                    </div>
                    <div class="cine-guest" aria-hidden="true"></div>
                </div>
                <div class="cine-bar cine-bar--bottom">
                    <div class="cine-progress"></div>
                    <div class="cine-controls">
                        <span class="cine-hint">Clic o espacio para avanzar</span>
                        <button class="cine-btn cine-voice" type="button">🔊 VOZ</button>
                        <button class="cine-btn cine-prev" type="button">◀ ANTERIOR</button>
                        <button class="cine-btn cine-pause" type="button">❚❚ PAUSA</button>
                        <button class="cine-btn cine-skip" type="button">SALTAR ▶▶</button>
                    </div>
                </div>
            `;
            document.body.appendChild(root);

            const q = s => root.querySelector(s);
            els = {
                bg: q(".cine-bg"), place: q(".cine-place"), avatarWrap: q(".cine-avatar-wrap"), avatar: q(".cine-avatar"),
                caption: q(".cine-caption"), tagIcon: q(".cine-tag-icon"), speaker: q(".cine-speaker"), note: q(".cine-note"),
                box: q(".cine-box"), text: q(".cine-text"), options: q(".cine-options"),
                memory: q(".cine-memory"), memLoading: q(".mem-loading"), memLoadingLabel: q(".mem-loading-label"),
                memBar: q(".mem-bar i"), memPct: q(".mem-pct"), memFile: q(".mem-file"), memHead: q(".mem-file-head"),
                memRows: q(".mem-rows"), memStamp: q(".mem-stamp"), memStampIcon: q(".mem-stamp-icon"), memStampText: q(".mem-stamp-text"),
                memRain: q(".mem-rain"), notebox: q(".cine-notebox"), notetext: q(".cine-notetext"),
                end: q(".cine-end"), guest: q(".cine-guest"), progress: q(".cine-progress"),
                prev: q(".cine-prev"), pause: q(".cine-pause"), skip: q(".cine-skip"), close: q(".cine-close"), hint: q(".cine-hint")
            };

            if (typeof Roverchito !== "undefined") Roverchito.mount(els.avatar, "neutral");
            const voiceBtn = root.querySelector(".cine-voice");
            if (voz()) voz().boton(voiceBtn); else voiceBtn.hidden = true;
            if (opts.guest) {
                const tpl = document.getElementById(opts.guest);
                if (tpl) els.guest.innerHTML = tpl.innerHTML;
            }
            els.progress.innerHTML = scenes.map(() => "<span><i></i></span>").join("");

            const glyphs = "01ABCDEF";
            els.memRain.innerHTML = Array.from({ length: 14 }, (_, n) => {
                const col = Array.from({ length: 18 }, (_, k) => glyphs[(n * 7 + k * 3) % glyphs.length]).join("<br>");
                return `<span style="left:${n * 7.2}%;animation-delay:-${(n * 0.37) % 2}s">${col}</span>`;
            }).join("");

            (opts.endActions || []).forEach(action => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = action.primary ? "primary-btn" : "secondary-btn";
                b.textContent = action.label;
                b.addEventListener("click", () => {
                    if (action.replay) { goToScene(firstIndex()); return; }
                    close();
                    if (action.onClick) action.onClick();
                });
                els.end.appendChild(b);
            });

            root.addEventListener("click", e => { if (!e.target.closest("button")) advance(); });
            els.prev.addEventListener("click", () => { const p = prevIndex(index); if (p >= 0) goToScene(p); });
            els.pause.addEventListener("click", togglePause);
            els.skip.addEventListener("click", skipToEnd);
            els.close.addEventListener("click", close);
            document.addEventListener("keydown", onKey);
        }

        const firstIndex = () => (visible(scenes[0]) ? 0 : nextIndex(0));

        function onKey(e) {
            if (!isOpen) return;
            if (e.key === "Escape") { e.preventDefault(); close(); }
            else if (e.key === "p" || e.key === "P") togglePause();
            else if (e.key === "ArrowLeft") { e.preventDefault(); const p = prevIndex(index); if (p >= 0) goToScene(p); }
            else if ((e.code === "Space" || e.key === "Enter" || e.key === "ArrowRight") && !e.target.closest("button")) { e.preventDefault(); advance(); }
            else if (e.key === "Tab") {
                const f = [...root.querySelectorAll("button")].filter(b => !b.hidden && !b.closest("[hidden]"));
                const first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }

        function clearTimers() {
            clearInterval(typeTimer); clearTimeout(holdTimer);
            timers.forEach(t => { clearTimeout(t); clearInterval(t); });
            timers = []; typeTimer = null; holdTimer = null;
        }

        function sceneDuration(s) {
            if (s.type === "memoria") return MEM_LOAD_MS + s.rows.length * MEM_ROW_MS + MEM_STAMP_MS + MEM_HOLD_MS;
            if (s.type === "nota") return NOTE_MS;
            if (s.type === "eleccion") return 0;
            const t = reduceMotion ? 0 : s.text.length * TYPE_MS;
            return isLast() ? t + 300 : t + holdFor(s.text);
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

        function fillCurrent() {
            const seg = els.progress.children[index];
            if (!seg) return;
            seg.firstElementChild.style.animation = "none";
            seg.className = "is-done";
        }

        function goToScene(n) {
            if (n < 0 || n >= scenes.length) return;
            paused = false;
            root.classList.remove("is-paused");
            els.pause.textContent = "❚❚ PAUSA";
            play(n);
        }

        function next() {
            const n = nextIndex(index);
            if (n >= 0) play(n);
        }

        function play(n) {
            clearTimers();
            if (voz()) voz().callar();
            index = n;
            busy = false;
            waiting = false;
            waitingVoice = false;
            const s = scenes[index];

            root.dataset.type = s.type;
            root.dataset.scene = s.scene;
            root.classList.remove("is-alert", "is-ok", "is-weak");
            if (s.weak) root.classList.add("is-weak");
            root.classList.toggle("is-solo", s.solo);
            els.bg.dataset.scene = s.scene;

            if (els.place.textContent !== s.place) {
                els.place.classList.remove("is-in");
                void els.place.offsetWidth;
                els.place.textContent = s.place;
                els.place.classList.add("is-in");
            }

            const iconKey = s.type === "eleccion" ? "roverchito" : s.type;
            els.tagIcon.innerHTML = ICONS[iconKey] || "";
            els.speaker.textContent = s.name || LABELS[s.type] || "";
            els.note.textContent = s.note;
            els.note.hidden = !s.note;

            els.end.hidden = true;
            els.options.hidden = true;
            els.options.innerHTML = "";
            els.text.textContent = "";
            typed = 0;
            setMood(s.mood);

            [els.avatarWrap, els.caption, els.guest].forEach(el => {
                el.classList.remove("is-in");
                void el.offsetWidth;
                el.classList.add("is-in");
            });

            els.prev.disabled = prevIndex(index) === -1;
            els.skip.hidden = isLast() || s.type === "eleccion";
            els.pause.hidden = isLast() || s.type === "eleccion";
            els.hint.textContent = s.type === "eleccion" ? "Elige una respuesta" : "Clic o espacio para avanzar";

            updateProgress(sceneDuration(s));

            els.box.hidden = s.type === "memoria" || s.type === "nota";
            els.memory.hidden = s.type !== "memoria";
            els.notebox.hidden = s.type !== "nota";
            els.avatarWrap.classList.remove("is-scanning");

            if (s.type === "memoria") { playMemory(s); return; }
            if (s.type === "nota") { playNote(s); return; }

            if (speaksRover(s)) speak(s);
            if (reduceMotion) finishTyping();
            else if (!paused) startTyping();
        }

        /* Roverchito lee su frase; al terminar de hablar se pasa a la siguiente escena */
        function speak(s) {
            const v = voz();
            if (!v) return;
            const mine = index;
            v.decir(s.text, {
                audio: s.audio,
                onEnd: () => {
                    if (index !== mine || !waitingVoice || paused) return;
                    waitingVoice = false;
                    clearTimeout(holdTimer);
                    if (!isLast()) scheduleNext(700);
                }
            });
        }

        const voiceBusy = () => !!(voz() && voz().hablando());

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
            const s = scenes[index];
            typed = s.text.length;
            els.text.textContent = s.text;

            if (s.type === "eleccion") { showOptions(s); return; }
            if (isLast()) { showEnd(); return; }
            if (paused) return;
            if (voiceBusy()) {
                /* espera a que Roverchito termine; con un límite por si la voz se traba */
                waitingVoice = true;
                scheduleNext(holdFor(s.text) + 10000);
            } else {
                scheduleNext(holdFor(s.text));
            }
        }

        function scheduleNext(ms) {
            clearTimeout(holdTimer);
            holdTimer = setTimeout(next, ms);
        }

        /* ---------- Elección del usuario ---------- */
        function showOptions(s) {
            waiting = true;
            els.options.hidden = false;
            els.options.innerHTML = "";
            s.options.forEach((opt, n) => {
                const b = document.createElement("button");
                b.type = "button";
                b.className = "cine-option";
                b.textContent = opt.text;
                b.style.animationDelay = `${n * 0.12}s`;
                b.addEventListener("click", () => {
                    store.set(s.key, opt.value);
                    waiting = false;
                    fillCurrent();
                    next();
                });
                els.options.appendChild(b);
            });
            const first = els.options.querySelector("button");
            if (first) first.focus();
        }

        /* ---------- Memoria / registro ---------- */
        function playMemory(s) {
            busy = true;
            const ok = s.tone === "ok";
            els.memLoadingLabel.textContent = s.loading;
            els.memHead.textContent = s.file;
            els.memStampIcon.innerHTML = ok ? ICONS.check : ICONS.lock;
            els.memStampText.textContent = s.stamp;
            els.memStamp.classList.toggle("is-ok", ok);
            els.memLoading.hidden = false;
            els.memFile.hidden = true;
            els.memStamp.hidden = true;
            els.memRows.innerHTML = "";
            els.memBar.style.width = "0%";
            els.memPct.textContent = "0%";
            els.avatarWrap.classList.add("is-scanning");

            if (reduceMotion) { finishMemory(); return; }

            const start = performance.now();
            const loader = setInterval(() => {
                const pct = Math.min(100, Math.round((performance.now() - start) / MEM_LOAD_MS * 100));
                els.memBar.style.width = `${pct}%`;
                els.memPct.textContent = `${pct}%`;
                if (pct >= 100) clearInterval(loader);
            }, 40);
            timers.push(loader);

            later(() => { els.memLoading.hidden = true; els.memFile.hidden = false; }, MEM_LOAD_MS);
            s.rows.forEach((row, n) => later(() => addRow(row, true), MEM_LOAD_MS + n * MEM_ROW_MS + 150));
            const stampAt = MEM_LOAD_MS + s.rows.length * MEM_ROW_MS + MEM_STAMP_MS;
            later(() => showStamp(s), stampAt);
            later(() => { busy = false; if (!paused) next(); }, stampAt + MEM_HOLD_MS);
        }

        function addRow(row, animate) {
            const dt = document.createElement("dt");
            dt.textContent = row.label;
            const dd = document.createElement("dd");
            if (row.alert) dd.className = "is-alert";
            els.memRows.append(dt, dd);
            if (!animate) { dd.textContent = row.value; return; }
            let k = 0;
            const t = setInterval(() => {
                k++;
                dd.textContent = row.value.slice(0, k);
                if (k >= row.value.length) clearInterval(t);
            }, 22);
            timers.push(t);
        }

        function showStamp(s) {
            els.memStamp.hidden = false;
            els.avatarWrap.classList.remove("is-scanning");
            root.classList.add(s.tone === "ok" ? "is-ok" : "is-alert");
            setMood(s.tone === "ok" ? "happy" : "sad");
        }

        function finishMemory() {
            const s = scenes[index];
            clearTimers();
            els.memLoading.hidden = true;
            els.memFile.hidden = false;
            els.memRows.innerHTML = "";
            s.rows.forEach(row => addRow(row, false));
            showStamp(s);
            busy = false;
            fillCurrent();
            if (!paused) scheduleNext(3200);
        }

        /* ---------- Nota de la melodía ---------- */
        function playNote(s) {
            busy = true;
            els.notetext.textContent = s.text;
            els.notebox.classList.remove("is-in");
            void els.notebox.offsetWidth;
            els.notebox.classList.add("is-in");
            setMood("happy");
            if (opts.onNote) opts.onNote();
            later(() => { busy = false; if (!paused) next(); }, NOTE_MS);
        }

        /* ---------- Controles ---------- */
        function advance() {
            const s = scenes[index];
            if (waiting) return;                  /* hay que elegir una respuesta */
            if (paused) togglePause();

            if (s.type === "memoria" || s.type === "nota") {
                if (busy && s.type === "memoria") finishMemory();
                else if (!isLast()) { clearTimers(); next(); }
                return;
            }
            if (typed < s.text.length) {
                finishTyping();
                if (!isLast() && s.type !== "eleccion") fillCurrent();
            } else if (!isLast()) {
                next();
            }
        }

        function togglePause() {
            const s = scenes[index];
            if (waiting || (isLast() && typed >= s.text.length)) return;
            if (!paused && s.type === "memoria" && busy) finishMemory();

            paused = !paused;
            els.pause.textContent = paused ? "▶ SEGUIR" : "❚❚ PAUSA";
            els.hint.textContent = paused ? "En pausa" : "Clic o espacio para avanzar";
            root.classList.toggle("is-paused", paused);
            const bar = els.progress.children[index] && els.progress.children[index].firstElementChild;
            if (bar) bar.style.animationPlayState = paused ? "paused" : "running";

            if (paused) {
                clearTimers();
                if (voz()) voz().pausar();
                return;
            }
            if (voz()) voz().seguir();
            if (s.type === "memoria" || s.type === "nota") scheduleNext(2000);
            else if (typed < s.text.length) startTyping();
            else if (voiceBusy()) { waitingVoice = true; scheduleNext(holdFor(s.text) + 10000); }
            else scheduleNext(1800);
        }

        /* Saltar lleva a la siguiente elección pendiente, o al final */
        function skipToEnd() {
            let n = index;
            for (let k = nextIndex(index); k >= 0; k = nextIndex(k)) {
                n = k;
                if (scenes[k].type === "eleccion") break;
                /* Saltar no quita la recompensa: la nota se entrega igual */
                if (scenes[k].type === "nota" && opts.onNote) opts.onNote();
            }
            goToScene(n);
            if (scenes[n].type !== "memoria" && scenes[n].type !== "nota") finishTyping();
        }

        function showEnd() {
            els.end.hidden = false;
            els.hint.textContent = "Fin del episodio";
            [...els.progress.children].forEach(seg => {
                seg.className = "is-done";
                seg.firstElementChild.style.animation = "none";
            });
            if (opts.seenKey) store.set(opts.seenKey, "1");
            if (opts.onEnd) opts.onEnd();
            const b = els.end.querySelector("button");
            if (b) b.focus();
        }

        function abrir() {
            if (!scenes.length) scenes = readScript(opts.script);
            if (!scenes.length) return;
            if (!root) build();
            lastFocus = document.activeElement;
            isOpen = true;
            root.hidden = false;
            document.documentElement.classList.add("cine-open");
            requestAnimationFrame(() => root.classList.add("is-open"));
            els.close.focus();
            goToScene(firstIndex());
        }

        function close() {
            clearTimers();
            if (voz()) voz().callar();
            isOpen = false;
            root.classList.remove("is-open");
            document.documentElement.classList.remove("cine-open");
            root.hidden = true;
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        return { abrir, close, seen: () => !!(opts.seenKey && store.get(opts.seenKey)) };
    }

    /* ---------- Registro de cinemáticas ---------- */
    const players = {};

    function crear(id, opts) {
        players[id] = createPlayer(id, opts);
        document.documentElement.classList.add("has-cine");
        return players[id];
    }

    function abrir(id = "origen") {
        if (players[id]) players[id].abrir();
    }

    /* La cinemática del inicio (El origen de Roverchito) */
    function initOrigen() {
        if (!document.getElementById("cine-script")) return;
        const markSeen = () => {
            const play = document.querySelector(".cine-play");
            const toMap = document.querySelector(".cine-to-map");
            if (play) play.textContent = "↻ VER DE NUEVO";
            if (toMap) toMap.hidden = false;
        };
        const player = crear("origen", {
            script: "cine-script",
            title: "el origen de Roverchito",
            seenKey: "roverchito_cinematica_vista",
            endActions: [
                { label: "ABRIR EL MAPA DE LA MISIÓN", primary: true, onClick: () => { if (typeof goTo === "function") goTo("mapa"); } },
                { label: "VER DE NUEVO", replay: true }
            ],
            onEnd: markSeen
        });
        if (player.seen()) markSeen();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initOrigen);
    else initOrigen();

    return { crear, abrir };
})();
