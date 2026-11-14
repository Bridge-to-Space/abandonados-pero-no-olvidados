/* =========================================
   MISIÓN DE ROVERCHITO
   - Mapa de la misión con 4 de los 10 dispositivos
   Datos de las paradas: Fichas de investigación del equipo (fuentes NASA).
========================================= */
(() => {

    /* ---------- MAPA DE LA MISIÓN ---------- */
    const DEVICES = {
        spirit: {
            name: "Spirit",
            place: "CRÁTER GUSEV, MARTE",
            text: "Su misión debía durar 90 días marcianos y siguió trabajando hasta 2010. En 2009 se atascó en tierra blanda.",
            guide: "Dicen que Spirit quedó atascado en la arena… ¿y si sabe algo de mí?",
            mood: "neutral",
            play: "niveles/spirit/index.html",
            source: "https://science.nasa.gov/mission/mer-spirit/"
        },
        opportunity: {
            name: "Opportunity",
            place: "MERIDIANI PLANUM, MARTE",
            text: "La gemela de Spirit. Funcionó casi 15 años, recorrió 45.16 km y envió más de 217,000 imágenes. Una enorme tormenta de polvo la apagó en 2018.",
            guide: "¡Spirit tiene una gemela! A lo mejor me parezco a ella.",
            mood: "happy",
            play: null,
            source: "https://science.nasa.gov/mission/mer-opportunity/"
        },
        ingenuity: {
            name: "Ingenuity",
            place: "CRÁTER JEZERO, MARTE",
            text: "El primer vuelo propulsado en otro planeta. Lo diseñaron para 5 vuelos de prueba y completó 72 en casi tres años.",
            guide: "¡Un helicóptero en Marte! Ojalá me enseñe a volar.",
            mood: "happy",
            play: null,
            source: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/"
        },
        pioneer10: {
            name: "Pioneer 10",
            place: "ESPACIO PROFUNDO",
            text: "La primera misión de la NASA a los planetas exteriores. La diseñaron para 21 meses y duró más de 30 años. Su última señal llegó en 2003 desde 12,230 millones de km.",
            guide: "Es la nave más lejana de todas… ¿Cómo voy a llegar hasta allá?",
            mood: "sad",
            play: null,
            source: "https://science.nasa.gov/mission/pioneer-10/"
        }
    };

    /* Una nota por nave completada. Por ahora solo Spirit tiene nivel. */
    function completedDevices() {
        const done = [];
        try {
            const spirit = JSON.parse(localStorage.getItem("spirit_abandonados_save") || "null");
            if (spirit && spirit.gameOver) done.push("spirit");
        } catch (e) {
            /* sin almacenamiento disponible: el mapa empieza en cero */
        }
        return done;
    }

    function initMap() {
        const stops = [...document.querySelectorAll(".map-stop")];
        if (!stops.length) return;

        const el = id => document.getElementById(id);
        const avatar = el("map-guide-avatar");

        function select(key) {
            const d = DEVICES[key];
            if (!d) return;

            stops.forEach(stop => {
                const on = stop.dataset.device === key;
                stop.classList.toggle("is-selected", on);
                stop.setAttribute("aria-pressed", on ? "true" : "false");
            });

            el("map-detail-place").textContent = d.place;
            el("map-detail-name").textContent = d.name;
            el("map-detail-text").textContent = d.text;
            el("map-guide-text").textContent = d.guide;
            el("map-detail-source").href = d.source;

            const play = el("map-detail-play");
            const soon = el("map-detail-soon");
            if (d.play) {
                play.hidden = false;
                play.href = d.play;
                play.textContent = `VISITAR A ${d.name.toUpperCase()} →`;
                soon.hidden = true;
            } else {
                play.hidden = true;
                soon.hidden = false;
            }

            if (avatar && typeof Roverchito !== "undefined") Roverchito.setMood(avatar, d.mood);
        }

        stops.forEach(stop => stop.addEventListener("click", () => select(stop.dataset.device)));

        /* Notas de la melodía */
        const done = completedDevices();
        document.querySelectorAll(".map-note").forEach(note => {
            note.classList.toggle("is-on", done.includes(note.dataset.device));
        });
        stops.forEach(stop => stop.classList.toggle("is-done", done.includes(stop.dataset.device)));
        const count = el("map-melody-count");
        if (count) count.textContent = `${done.length} / ${stops.length}`;

        select("spirit");
    }

    /* ---------- ROVERCHITO SE ASOMA (inicio) ---------- */
    const PEEK_LINES = [
        null, /* la primera frase viene del HTML */
        "¡Ey! Si pulsas «Comenzar la misión», te cuento cómo empezó todo.",
        "Las naves que quiero visitar siguen allá afuera, en silencio… ¿me acompañas?"
    ];

    function initPeek() {
        const peek = document.getElementById("peek");
        if (!peek) return;

        const bot = peek.querySelector(".peek-bot");
        const bubble = peek.querySelector(".peek-bubble");
        const text = peek.querySelector(".peek-text");
        const sr = peek.querySelector(".peek-sr");
        const face = bot.querySelector("[data-roverchito]");
        PEEK_LINES[0] = text.dataset.text;

        const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let line = 0;
        let timer = null;

        function type(message) {
            clearInterval(timer);
            sr.textContent = message;
            if (reduceMotion) {
                text.textContent = message;
                return;
            }
            let n = 0;
            text.textContent = "";
            text.classList.add("is-typing");
            timer = setInterval(() => {
                n++;
                text.textContent = message.slice(0, n);
                if (n >= message.length) {
                    clearInterval(timer);
                    text.classList.remove("is-typing");
                }
            }, 32);
        }

        /* Empieza a escribir cuando el globo termina de aparecer */
        let started = false;
        const start = () => {
            if (started) return;
            started = true;
            type(PEEK_LINES[0]);
        };
        bubble.addEventListener("animationend", start, { once: true });
        setTimeout(start, 5200);          /* respaldo por si no hay animación */
        if (reduceMotion) start();

        /* Al hacerle clic: saltito y otra frase */
        bot.addEventListener("click", () => {
            line = (line + 1) % PEEK_LINES.length;
            bot.classList.remove("is-hop");
            void bot.offsetWidth;
            bot.classList.add("is-hop");
            if (typeof Roverchito !== "undefined") {
                Roverchito.setMood(face, "happy");
            }
            started = true;
            type(PEEK_LINES[line]);
        });
    }

    function init() {
        initMap();
        initPeek();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
