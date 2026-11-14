/* =========================================
   ROVERCHITO — personaje guía
   Vector (SVG) en estilo pixel art, dibujado sobre
   una cuadrícula de 16 × 22 unidades.

   Uso:
     <div data-roverchito data-mood="happy"></div>   (se dibuja solo)
     Roverchito.mount(elemento, "neutral")
     Roverchito.setMood(elemento, "happy" | "sad" | "neutral")

   El archivo img/roverchito.svg se genera a partir de este mismo dibujo.
========================================= */
const Roverchito = (() => {

    const C = {
        pale: "#e2f0a0",    /* lima pálido: cuernos, brazos, pies */
        lime: "#ecf87c",    /* lima: cuerpo y audífonos */
        dark: "#1e1e1e",
        black: "#050505",
        eye: "#22e6f2",
        line: "#000"
    };

    const W = 16;   /* ancho de la cuadrícula, para reflejar el lado derecho */

    /* [x, y, ancho, alto, color] — lado izquierdo; el derecho se refleja */
    const EAR = [
        [0, 2, 1, 3, C.pale],
        [0, 5, 1, 1, C.dark],
        [1, 3, 1, 2, C.pale],
        [1, 5, 1, 1, C.pale],
        [1, 6, 1, 2, C.dark],
        [2, 4, 2, 1, C.lime],
        [2, 5, 1, 4, C.lime],
        [3, 5, 1, 4, C.dark]
    ];

    const ARM = [
        [3, 12, 1, 1, C.dark],
        [2, 13, 2, 4, C.pale],
        [1, 14, 1, 2, C.pale]
    ];

    const FOOT = [
        [5, 18, 3, 2, C.pale],
        [3, 19, 2, 1, C.pale],
        [3, 20, 5, 1.6, C.dark]
    ];

    const mirror = parts => parts.map(([x, y, w, h, c]) => [W - x - w, y, w, h, c]);

    function rects(parts) {
        return parts.map(([x, y, w, h, c]) => {
            const stroke = c === C.black ? "" : ` stroke="${C.line}" stroke-width="0.12"`;
            return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"${stroke}/>`;
        }).join("");
    }

    function eyeRects(parts) {
        return parts.map(([x, y, w, h]) =>
            `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.eye}"/>`
        ).join("");
    }

    /* Ojos: normal, feliz (^ ^) y triste (cejas caídas) */
    const EYES_NEUTRAL = [[6, 6, 1, 2], [9, 6, 1, 2]];
    const happy = ex => [[ex - 0.25, 6.75, 0.5, 0.5], [ex + 0.25, 6.25, 0.5, 0.5], [ex + 0.75, 6.75, 0.5, 0.5]];
    const EYES_HAPPY = [...happy(6), ...happy(9)];
    const EYES_SAD = [
        [6, 7, 1, 1], [9, 7, 1, 1],
        [6, 6.1, 0.5, 0.3], [6.5, 5.8, 0.5, 0.3],
        [9, 5.8, 0.5, 0.3], [9.5, 6.1, 0.5, 0.3]
    ];

    const STYLE = `
        .rc-eyes-happy, .rc-eyes-sad { display: none; }
        [data-mood="happy"] .rc-eyes-neutral, [data-mood="sad"] .rc-eyes-neutral { display: none; }
        [data-mood="happy"] .rc-eyes-happy, [data-mood="sad"] .rc-eyes-sad { display: inline; }
        .rc-eyes-neutral { transform-box: view-box; transform-origin: 8px 7px; animation: rc-blink 4.5s infinite; }
        .rc-antenna { transform-box: view-box; transform-origin: 5px 3px; animation: rc-antenna 2.6s ease-in-out infinite; }
        @keyframes rc-blink { 0%, 93%, 100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
        @keyframes rc-antenna { 0%, 100% { transform: rotate(-7deg); } 50% { transform: rotate(7deg); } }
        @media (prefers-reduced-motion: reduce) { .rc-eyes-neutral, .rc-antenna { animation: none; } }
    `.replace(/\s+/g, " ").trim();

    const BODY = `<polygon points="5.5,12 10.5,12 11,12.5 11,15.5 10.5,16 5.5,16 5,15.5 5,12.5" fill="${C.dark}" stroke="${C.line}" stroke-width="0.12"/>`;

    const INNER = [
        `<style>${STYLE}</style>`,
        `<g class="rc-antenna">${rects([[4, 0, 1, 1, C.pale], [4, 1, 1, 1, C.dark], [5, 2, 1, 1, C.dark]])}</g>`,
        rects([...EAR, ...mirror(EAR)]),
        rects([[4, 3, 8, 1, C.dark], [4, 4, 8, 5, C.black], [4, 9, 8, 1, C.dark]]),
        `<g class="rc-eyes-neutral">${eyeRects(EYES_NEUTRAL)}</g>`,
        `<g class="rc-eyes-happy">${eyeRects(EYES_HAPPY)}</g>`,
        `<g class="rc-eyes-sad">${eyeRects(EYES_SAD)}</g>`,
        rects([[6, 10, 4, 1, C.dark]]),
        rects([...ARM, ...mirror(ARM)]),
        rects([[4, 11, 8, 6, C.lime], [4, 11, 1, 1, C.dark], [11, 11, 1, 1, C.dark]]),
        BODY,
        rects([[5.5, 17, 2, 1, C.dark], [8.5, 17, 2, 1, C.dark]]),
        rects([...FOOT, ...mirror(FOOT)])
    ].join("");

    function svg(mood = "neutral", { standalone = false } = {}) {
        const ns = standalone ? ` xmlns="http://www.w3.org/2000/svg"` : "";
        return `<svg${ns} class="roverchito-svg" viewBox="-0.2 -0.2 16.4 22" data-mood="${mood}" role="img" aria-label="Roverchito" shape-rendering="crispEdges">${INNER}</svg>`;
    }

    function mount(el, mood) {
        if (!el) return;
        el.innerHTML = svg(mood || el.dataset.mood || "neutral");
    }

    function setMood(el, mood) {
        const s = el && el.querySelector("svg");
        if (s) s.setAttribute("data-mood", mood);
    }

    if (typeof document !== "undefined") {
        const mountAll = () => document.querySelectorAll("[data-roverchito]").forEach(el => mount(el));
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountAll);
        else mountAll();
    }

    return { svg, mount, setMood };
})();

if (typeof module !== "undefined") module.exports = Roverchito;
