/* =========================================
   MINIJUEGO · SALVAR A OPPORTUNITY
   Dos fases basadas en hechos de la ficha de Opportunity:

   1. Salir de la arena blanda (2005): los ingenieros tardaron unas seis
      semanas en sacarlo, moviéndolo poco a poco. El jugador da comandos a
      las ruedas cuando el indicador está en la zona de tracción.
   2. Sobrevivir la tormenta (2007): las tormentas de polvo redujeron la
      energía de los paneles y el equipo suspendió actividades. A veces el
      viento limpiaba los paneles. El jugador alterna entre ahorro y
      ciencia, y atrapa las ráfagas de viento.

   Uso: OpportunityJuego.abrir({ onWin })
========================================= */
const OpportunityJuego = (() => {

    const SAVE_KEY = "opportunity_juego";
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let root = null, els = {}, frame = 0, opts = {}, lastFocus = null;
    let phase = null;         /* "arena" | "tormenta" | null */
    let keyHandler = null;

    const store = {
        set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sin almacenamiento */ } }
    };

    const say = (text, mood = "neutral") => {
        if (els.guideText) els.guideText.textContent = text;
        if (els.guideFace && typeof Roverchito !== "undefined") Roverchito.setMood(els.guideFace, mood);
        if (typeof RoverchitoVoz !== "undefined") RoverchitoVoz.decir(text);
    };

    /* ---------- Pantalla del juego ---------- */
    function build() {
        root = document.createElement("div");
        root.className = "opg";
        root.hidden = true;
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-modal", "true");
        root.setAttribute("aria-label", "Minijuego: salvar a Opportunity");
        root.innerHTML = `
            <div class="opg-top">
                <span class="opg-title"></span>
                <button type="button" class="opg-close" aria-label="Cerrar minijuego">✕</button>
            </div>

            <div class="opg-stage">
                <div class="opg-sky"></div>
                <div class="opg-dust" aria-hidden="true"></div>
                <div class="opg-ground"></div>
                <div class="opg-sand" aria-hidden="true"></div>
                <div class="opg-rover" aria-hidden="true"></div>
                <div class="opg-gusts"></div>
            </div>

            <div class="opg-hud"></div>

            <div class="opg-panel">
                <div class="opg-guide">
                    <div class="opg-guide-face" data-roverchito data-mood="happy"></div>
                    <p class="opg-guide-text" aria-live="polite"></p>
                </div>
                <div class="opg-controls"></div>
            </div>

            <div class="opg-overlay" hidden></div>
        `;
        document.body.appendChild(root);

        const q = s => root.querySelector(s);
        els = {
            title: q(".opg-title"), stage: q(".opg-stage"), sky: q(".opg-sky"), dust: q(".opg-dust"),
            sand: q(".opg-sand"), rover: q(".opg-rover"), gusts: q(".opg-gusts"), hud: q(".opg-hud"),
            controls: q(".opg-controls"), guideText: q(".opg-guide-text"), guideFace: q(".opg-guide-face"),
            overlay: q(".opg-overlay"), close: q(".opg-close")
        };

        const sprite = document.getElementById("op-sprite");
        if (sprite) els.rover.innerHTML = sprite.innerHTML;
        if (typeof Roverchito !== "undefined") Roverchito.mount(els.guideFace, "happy");

        els.close.addEventListener("click", close);
        document.addEventListener("keydown", e => {
            if (!root || root.hidden) return;
            if (e.key === "Escape") { e.preventDefault(); close(); return; }
            if (keyHandler) keyHandler(e);
        });
    }

    function stop() {
        cancelAnimationFrame(frame);
        frame = 0;
        keyHandler = null;
        els.gusts.innerHTML = "";
    }

    function showOverlay(html, buttons) {
        els.overlay.innerHTML = `<div class="opg-card">${html}<div class="opg-card-actions"></div></div>`;
        const box = els.overlay.querySelector(".opg-card-actions");
        buttons.forEach(b => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = b.primary ? "primary-btn" : "secondary-btn";
            btn.textContent = b.label;
            btn.addEventListener("click", () => { els.overlay.hidden = true; b.onClick(); });
            box.appendChild(btn);
        });
        els.overlay.hidden = false;
        const first = box.querySelector("button");
        if (first) first.focus();
    }

    /* =====================================================
       FASE 1 · SALIR DE LA ARENA BLANDA (2005)
    ===================================================== */
    function startArena() {
        stop();
        phase = "arena";
        root.dataset.phase = "arena";
        els.title.textContent = "FASE 1 DE 2 · SALIR DE LA ARENA BLANDA · 2005";

        const st = { progress: 0, sink: 35, energy: 100, days: 0, pos: 0, dir: 1, zone: 0.5, width: 0.26, locked: false };

        els.hud.innerHTML = `
            <div class="opg-stat"><span>AVANCE</span><div class="opg-bar is-good"><i data-k="progress"></i></div></div>
            <div class="opg-stat"><span>HUNDIMIENTO</span><div class="opg-bar is-bad"><i data-k="sink"></i></div></div>
            <div class="opg-stat"><span>ENERGÍA</span><div class="opg-bar is-energy"><i data-k="energy"></i></div></div>
            <div class="opg-stat opg-days"><span>DÍAS DE RESCATE</span><strong data-k="days">0</strong></div>`;

        els.controls.innerHTML = `
            <div class="opg-meter" aria-hidden="true">
                <div class="opg-zone"><b></b></div>
                <div class="opg-needle"></div>
            </div>
            <button type="button" class="primary-btn opg-action">MOVER RUEDAS</button>
            <p class="opg-help">Pulsa cuando la aguja esté en la zona verde (o usa la barra espaciadora).</p>`;

        const bar = k => els.hud.querySelector(`[data-k="${k}"]`);
        const zoneEl = els.controls.querySelector(".opg-zone");
        const needle = els.controls.querySelector(".opg-needle");
        const action = els.controls.querySelector(".opg-action");

        const paint = () => {
            bar("progress").style.width = `${st.progress}%`;
            bar("sink").style.width = `${st.sink}%`;
            bar("energy").style.width = `${st.energy}%`;
            bar("days").textContent = st.days;
            zoneEl.style.left = `${(st.zone - st.width / 2) * 100}%`;
            zoneEl.style.width = `${st.width * 100}%`;
            needle.style.left = `${st.pos * 100}%`;
            /* El rover sale de la arena: avanza a la derecha y deja de estar hundido */
            els.rover.style.setProperty("--x", `${st.progress * 0.42}%`);
            els.rover.style.setProperty("--sink", (st.sink / 100).toFixed(3));
        };

        const press = () => {
            if (st.locked || phase !== "arena") return;
            st.locked = true;
            const dist = Math.abs(st.pos - st.zone);
            let result;
            if (dist <= st.width * 0.18) result = "perfecto";
            else if (dist <= st.width / 2) result = "bien";
            else result = "fallo";

            st.days += 3;                         /* cada intento lleva unos días de trabajo */
            st.energy = Math.max(0, st.energy - 4);
            if (result === "perfecto") { st.progress += 12; st.sink = Math.max(0, st.sink - 10); }
            else if (result === "bien") { st.progress += 7; st.sink = Math.max(0, st.sink - 3); }
            else { st.sink = Math.min(100, st.sink + 14); }
            st.progress = Math.min(100, st.progress);

            root.classList.remove("is-perfecto", "is-bien", "is-fallo");
            void root.offsetWidth;
            root.classList.add(`is-${result}`);
            els.rover.classList.remove("is-push");
            void els.rover.offsetWidth;
            els.rover.classList.add("is-push");

            const lines = {
                perfecto: ["¡Perfecto! ¡Las ruedas agarraron tracción!", "¡Eso! ¡Avanzamos un buen tramo!"],
                bien: ["Bien, se movió un poquito.", "Poco a poco, como los ingenieros."],
                fallo: ["¡Uy! Las ruedas patinaron y se hundió más.", "¡Cuidado! Eso lo hundió otro poco."]
            };
            const pool = lines[result];
            const line = pool[st.days % pool.length];
            els.guideText.textContent = line;
            if (els.guideFace && typeof Roverchito !== "undefined") {
                Roverchito.setMood(els.guideFace, result === "fallo" ? "sad" : "happy");
            }

            /* Cada avance mueve la zona de tracción y la hace un poco más angosta */
            st.zone = 0.2 + Math.random() * 0.6;
            st.width = Math.max(0.14, 0.26 - st.progress * 0.0011);
            paint();

            setTimeout(() => {
                st.locked = false;
                if (st.progress >= 100) winArena(st.days);
                else if (st.sink >= 100 || st.energy <= 0) loseArena(st.sink >= 100 ? "sink" : "energy");
            }, 380);
        };

        action.addEventListener("click", press);
        keyHandler = e => {
            if (e.code === "Space" || e.key === "Enter") {
                if (e.target.closest && e.target.closest(".opg-close, .opg-overlay")) return;
                e.preventDefault();
                press();
            }
        };

        let last = performance.now();
        const speed = reduceMotion ? 0.35 : 0.75;      /* vueltas de la aguja por segundo */
        const tick = now => {
            const dt = (now - last) / 1000;
            last = now;
            st.pos += st.dir * dt * speed * (1 + st.progress / 160);
            if (st.pos >= 1) { st.pos = 1; st.dir = -1; }
            if (st.pos <= 0) { st.pos = 0; st.dir = 1; }
            needle.style.left = `${st.pos * 100}%`;
            frame = requestAnimationFrame(tick);
        };
        paint();
        frame = requestAnimationFrame(tick);
        action.focus();
        say("¡Opportunity está atorado en la arena! Mueve las ruedas cuando la aguja esté en la zona verde.", "neutral");
    }

    function winArena(days) {
        stop();
        const faster = days <= 42;
        say(faster ? "¡Lo sacamos! ¡Y más rápido que en la vida real!" : "¡Lo sacamos! Igual que los ingenieros: con paciencia.", "happy");
        showOverlay(`
            <span class="opg-kicker">FASE 1 COMPLETADA</span>
            <h3>¡Opportunity salió de la arena!</h3>
            <p>Lo lograste en <strong>${days} días de rescate</strong>. En 2005, los ingenieros de la NASA tardaron unas
            <strong>seis semanas</strong> en sacarlo, moviéndolo poco a poco.</p>`,
            [{ label: "SIGUIENTE FASE →", primary: true, onClick: startTormenta }]);
    }

    function loseArena(reason) {
        stop();
        say(reason === "sink" ? "Ay, se hundió demasiado… ¡Intentémoslo otra vez!" : "Nos quedamos sin energía… ¡Otra vez!", "sad");
        showOverlay(`
            <span class="opg-kicker">INTÉNTALO DE NUEVO</span>
            <h3>${reason === "sink" ? "Opportunity se hundió demasiado" : "Se acabó la energía"}</h3>
            <p>Mover las ruedas en el momento equivocado las hace patinar. Espera a que la aguja entre en la zona verde.</p>`,
            [{ label: "REINTENTAR", primary: true, onClick: startArena }]);
    }

    /* =====================================================
       FASE 2 · SOBREVIVIR LA TORMENTA (2007)
    ===================================================== */
    function startTormenta() {
        stop();
        phase = "tormenta";
        root.dataset.phase = "tormenta";
        els.title.textContent = "FASE 2 DE 2 · SOBREVIVIR LA TORMENTA DE POLVO · 2007";
        els.rover.style.setProperty("--x", "42%");
        els.rover.style.setProperty("--sink", "0");

        const DURATION = 35;
        const st = { battery: 70, dust: 10, science: 0, time: DURATION, mode: "ahorro", nextGust: 2.5 };

        els.hud.innerHTML = `
            <div class="opg-stat"><span>BATERÍA</span><div class="opg-bar is-energy"><i data-k="battery"></i></div></div>
            <div class="opg-stat"><span>POLVO EN PANELES</span><div class="opg-bar is-bad"><i data-k="dust"></i></div></div>
            <div class="opg-stat opg-days"><span>CIENCIA</span><strong data-k="science">0</strong></div>
            <div class="opg-stat opg-days"><span>TORMENTA</span><strong data-k="time">${DURATION}s</strong></div>`;

        els.controls.innerHTML = `
            <div class="opg-modes" role="group" aria-label="Modo de Opportunity">
                <button type="button" class="opg-mode is-on" data-mode="ahorro" aria-pressed="true">🔋 AHORRO</button>
                <button type="button" class="opg-mode" data-mode="ciencia" aria-pressed="false">🔬 CIENCIA</button>
            </div>
            <p class="opg-help">Ciencia gasta más energía pero suma puntos. Toca las ráfagas de viento 🌀 para limpiar los paneles (o pulsa la barra espaciadora cuando aparezcan).</p>`;

        const bar = k => els.hud.querySelector(`[data-k="${k}"]`);
        const modes = [...els.controls.querySelectorAll(".opg-mode")];
        const setMode = m => {
            st.mode = m;
            modes.forEach(b => {
                const on = b.dataset.mode === m;
                b.classList.toggle("is-on", on);
                b.setAttribute("aria-pressed", on ? "true" : "false");
            });
            root.classList.toggle("is-science", m === "ciencia");
        };
        modes.forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));

        const catchGust = gust => {
            if (!gust || gust.dataset.caught) return;
            gust.dataset.caught = "1";
            gust.classList.add("is-caught");
            st.dust = Math.max(0, st.dust - 45);
            els.guideText.textContent = "¡El viento limpió los paneles! ¡Hasta el viento nos echa una mano!";
            if (typeof Roverchito !== "undefined") Roverchito.setMood(els.guideFace, "happy");
            setTimeout(() => gust.remove(), 400);
        };

        const spawnGust = () => {
            const g = document.createElement("button");
            g.type = "button";
            g.className = "opg-gust";
            g.textContent = "🌀";
            g.setAttribute("aria-label", "Ráfaga de viento: tócala para limpiar los paneles");
            g.style.left = `${10 + Math.random() * 70}%`;
            g.style.top = `${12 + Math.random() * 40}%`;
            g.addEventListener("click", e => { e.stopPropagation(); catchGust(g); });
            els.gusts.appendChild(g);
            setTimeout(() => { if (!g.dataset.caught) g.remove(); }, 2600);
        };

        keyHandler = e => {
            if (e.code === "Space") {
                e.preventDefault();
                catchGust(els.gusts.querySelector(".opg-gust:not(.is-caught)"));
            } else if (e.key === "1") setMode("ahorro");
            else if (e.key === "2") setMode("ciencia");
        };

        const paint = () => {
            bar("battery").style.width = `${st.battery}%`;
            bar("dust").style.width = `${st.dust}%`;
            bar("science").textContent = Math.floor(st.science);
            bar("time").textContent = `${Math.ceil(st.time)}s`;
            els.dust.style.opacity = (0.25 + st.dust / 130).toFixed(2);
            root.classList.toggle("is-low", st.battery < 25);
        };

        let last = performance.now();
        const tick = now => {
            const dt = Math.min(0.1, (now - last) / 1000);
            last = now;
            st.time -= dt;
            st.dust = Math.min(100, st.dust + dt * 6.5);                   /* el polvo se acumula */
            const solar = 3.2 * (1 - st.dust / 100);                       /* energía de los paneles */
            const use = st.mode === "ciencia" ? 4.2 : 1.6;                 /* consumo por modo */
            st.battery = Math.max(0, Math.min(100, st.battery + (solar - use) * dt));
            if (st.mode === "ciencia" && st.battery > 0) st.science += dt;

            st.nextGust -= dt;
            if (st.nextGust <= 0) { spawnGust(); st.nextGust = 3.5 + Math.random() * 2.5; }

            paint();
            if (st.battery <= 0) { loseTormenta(); return; }
            if (st.time <= 0) { winTormenta(Math.floor(st.science)); return; }
            frame = requestAnimationFrame(tick);
        };
        paint();
        frame = requestAnimationFrame(tick);
        modes[0].focus();
        say("¡Llegó la tormenta de polvo! Cuida la batería, junta ciencia cuando puedas y atrapa el viento.", "neutral");
    }

    function winTormenta(science) {
        stop();
        const stars = science >= 14 ? 3 : science >= 7 ? 2 : 1;
        store.set(SAVE_KEY, String(stars));
        say("¡Sobrevivimos a la tormenta! ¡Opportunity sigue explorando!", "happy");
        showOverlay(`
            <span class="opg-kicker">¡MISIÓN CUMPLIDA!</span>
            <div class="opg-stars" aria-label="${stars} de 3 estrellas">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
            <h3>Opportunity sobrevivió a la tormenta</h3>
            <p>Juntaste <strong>${science} puntos de ciencia</strong>. En 2007, las tormentas de polvo obligaron al equipo
            a suspender por un tiempo las actividades científicas, y a veces el viento limpiaba sus paneles.</p>`,
            [
                { label: "VER LA CINEMÁTICA FINAL →", primary: true, onClick: () => { close(); if (opts.onWin) opts.onWin(stars); } },
                { label: "JUGAR DE NUEVO", onClick: startArena }
            ]);
    }

    function loseTormenta() {
        stop();
        say("Nos quedamos sin batería… ¡Probemos otra vez!", "sad");
        showOverlay(`
            <span class="opg-kicker">INTÉNTALO DE NUEVO</span>
            <h3>La batería se agotó</h3>
            <p>Usa el modo ahorro cuando haya mucho polvo, y atrapa las ráfagas de viento para limpiar los paneles.</p>`,
            [{ label: "REINTENTAR FASE 2", primary: true, onClick: startTormenta }]);
    }

    /* ---------- Abrir y cerrar ---------- */
    function abrir(options = {}) {
        opts = options;
        if (!root) build();
        lastFocus = document.activeElement;
        root.hidden = false;
        els.overlay.hidden = true;
        document.documentElement.classList.add("cine-open");
        requestAnimationFrame(() => root.classList.add("is-open"));
        showOverlay(`
            <span class="opg-kicker">MINIJUEGO · OPPORTUNITY</span>
            <h3>Salvar a Opportunity</h3>
            <p><strong>Fase 1:</strong> sácalo de la arena blanda, como en 2005.<br>
            <strong>Fase 2:</strong> ayúdalo a sobrevivir una tormenta de polvo, como en 2007.</p>`,
            [{ label: "¡A JUGAR!", primary: true, onClick: startArena }]);
        say("¡Vamos a ayudar a Opportunity!", "happy");
    }

    function close() {
        stop();
        phase = null;
        if (typeof RoverchitoVoz !== "undefined") RoverchitoVoz.callar();
        root.classList.remove("is-open");
        root.hidden = true;
        document.documentElement.classList.remove("cine-open");
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    return { abrir, close };
})();
