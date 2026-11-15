/* =========================================
   VOZ DE ROVERCHITO
   Lee en voz alta lo que dice Roverchito, con dos fuentes:
     1. Audio grabado (si la frase tiene archivo): la "voz de zueira" exacta,
        generada en la app La Voz de Zueira (voz "Julio", España,
        velocidad 2, tono y velocidad de audio al máximo, efecto "Excited").
     2. Voz del navegador (si no hay audio): una voz en español con el tono
        al máximo y velocidad alta, para imitar ese estilo.

   Los audios grabados se registran en audio/roverchito/frases.js:
   cada frase tiene su archivo y "listo: true" cuando ya existe el audio.
   Si el texto de una frase cambia, deja de coincidir y se usa el navegador
   (así nunca suena un audio viejo).

   Uso:
     RoverchitoVoz.decir(texto, { audio: "ruta/al/archivo.mp3", onEnd })
     RoverchitoVoz.callar() · .pausar() · .seguir()
     RoverchitoVoz.activa()  · .alternar()   (se recuerda entre visitas)
     RoverchitoVoz.hablando()
     RoverchitoVoz.boton(elemento)            (convierte un botón en interruptor)

   Los navegadores solo dejan hablar después de que el usuario hizo clic
   o tocó algo en la página; por eso la voz empieza con la primera interacción.
========================================= */
const RoverchitoVoz = (() => {

    const KEY = "roverchito_voz";
    const TTS = { pitch: 2, rate: 1.45, volume: 1 };   /* estilo "voz insana" */

    /* Voces masculinas en español que se prefieren, en orden */
    const PREFERRED = ["julio", "jorge", "pablo", "diego", "raul", "raúl", "juan", "enrique", "alvaro", "álvaro", "carlos", "jaime"];

    const synth = "speechSynthesis" in window ? window.speechSynthesis : null;

    /* Carpeta de audios, relativa a donde vive este archivo (sirve en cualquier página) */
    const SCRIPT_SRC = (document.currentScript && document.currentScript.src) || "";
    const AUDIO_BASE = SCRIPT_SRC.replace(/voz\.js(\?.*)?$/, "") + "audio/roverchito/";
    const norm = text => (text || "").replace(/\s+/g, " ").trim();

    /* Frases con audio listo: texto → archivo */
    function audioFor(text) {
        const list = window.ROVERCHITO_FRASES || [];
        const key = norm(text);
        const hit = list.find(f => f.listo && norm(f.texto) === key);
        return hit ? AUDIO_BASE + hit.archivo : "";
    }
    let voice = null;
    let audio = null;
    let speaking = false;
    let token = 0;
    const listeners = new Set();

    const store = {
        get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
        set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* sin almacenamiento */ } }
    };

    function activa() {
        return store.get() !== "off";
    }

    function pickVoice() {
        if (!synth) return null;
        const voices = synth.getVoices().filter(v => /^es(-|_|$)/i.test(v.lang));
        if (!voices.length) return null;
        const byName = name => voices.find(v => v.name.toLowerCase().includes(name));
        for (const name of PREFERRED) {
            const v = byName(name);
            if (v) return v;
        }
        return voices.find(v => /es-(ES|MX|US|419)/i.test(v.lang)) || voices[0];
    }

    if (synth) {
        voice = pickVoice();
        synth.addEventListener && synth.addEventListener("voiceschanged", () => { voice = pickVoice(); });
    }

    /* Limpia el texto para que suene natural (sin puntos suspensivos raros) */
    const clean = text => text.replace(/…/g, ", ").replace(/\s+/g, " ").trim();

    function finish(myToken, onEnd) {
        if (myToken !== token) return;
        speaking = false;
        if (onEnd) onEnd();
    }

    function speakTTS(text, myToken, onEnd) {
        if (!synth) { finish(myToken, onEnd); return; }
        const u = new SpeechSynthesisUtterance(clean(text));
        voice = voice || pickVoice();
        if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "es-ES"; }
        u.pitch = TTS.pitch;
        u.rate = TTS.rate;
        u.volume = TTS.volume;
        u.onend = () => finish(myToken, onEnd);
        u.onerror = () => finish(myToken, onEnd);
        synth.speak(u);
    }

    function decir(text, { audio: explicit, onEnd } = {}) {
        callar();
        const src = explicit || audioFor(text);
        if (!activa() || !text) { if (onEnd) onEnd(); return false; }
        const myToken = ++token;
        speaking = true;

        if (src) {
            audio = new Audio(src);
            audio.onended = () => finish(myToken, onEnd);
            /* Si el archivo no existe o falla, se usa la voz del navegador (una sola vez) */
            let fellBack = false;
            const fallback = () => {
                if (fellBack || myToken !== token) return;
                fellBack = true;
                speakTTS(text, myToken, onEnd);
            };
            audio.onerror = fallback;
            audio.play().catch(fallback);
        } else {
            speakTTS(text, myToken, onEnd);
        }
        return true;
    }

    function callar() {
        token++;
        speaking = false;
        if (audio) { audio.pause(); audio.onended = audio.onerror = null; audio = null; }
        if (synth) synth.cancel();
    }

    function pausar() {
        if (audio) audio.pause();
        if (synth && synth.speaking) synth.pause();
    }

    function seguir() {
        if (audio) audio.play().catch(() => {});
        if (synth && synth.paused) synth.resume();
    }

    function alternar() {
        const on = !activa();
        store.set(on ? "on" : "off");
        if (!on) callar();
        listeners.forEach(fn => fn(on));
        return on;
    }

    /* Convierte un botón en interruptor de voz (se actualiza en toda la página) */
    function boton(el) {
        if (!el) return;
        const paint = on => {
            el.textContent = on ? "🔊 VOZ" : "🔇 SIN VOZ";
            el.setAttribute("aria-pressed", on ? "true" : "false");
            el.title = on ? "Silenciar la voz de Roverchito" : "Activar la voz de Roverchito";
        };
        paint(activa());
        listeners.add(paint);
        el.addEventListener("click", e => { e.stopPropagation(); alternar(); });
    }

    return {
        decir, callar, pausar, seguir, activa, alternar, boton,
        hablando: () => speaking,
        disponible: !!synth
    };
})();
