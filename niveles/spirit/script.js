/* =========================================
   SPIRIT — ABANDONADOS
   MOTOR DEL JUEGO
========================================= */
const SAVE_KEY = "spirit_abandonados_save";

/* Fuente principal de los datos históricos (NASA Science). */
const NASA_SPIRIT = {
    label: "NASA Science — Spirit (MER-A)",
    url: "https://science.nasa.gov/mission/mer-spirit/"
};

function createInitialState() {
    return {
        sceneIndex: 0,
        energy: 70,
        science: 20,
        exploration: 20,
        condition: 100,
        trapped: false,
        wheelFailure: false,
        dustStorm: false,
        winter: false,
        choiceMade: false,
        gameOver: false,
        landing: null,
        guide: null
    };
}

let gameState = createInitialState();

/*
   Los números de sol se calcularon a partir de las fechas de la ficha
   de investigación (sol 1 = 4 de enero de 2004 UTC, 1 sol ≈ 1.0275 días).
*/
const scenes = [
    {
        sol: null,
        label: "10 JUNIO 2003 / LANZAMIENTO",
        title: "Spirit: rumbo a Marte",
        text: "¡Hola! Soy Roverchito y hoy te voy a contar la historia de Spirit, un rover que viajó hasta Marte. Estamos en 2003: tras años de trabajo, está listo para despegar. Antes de irnos, ¿qué hacemos?",
        history: "Spirit fue lanzado el 10 de junio de 2003. Su misión: explorar la superficie de Marte, estudiar distintos tipos de rocas y suelos, y buscar indicios de actividad del agua en el pasado.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Preparar los sistemas para el viaje",
                energy: -2, science: 3, exploration: 2, condition: 0,
                consequence: "Los sistemas quedan preparados para el largo viaje.",
                result: "good"
            },
            {
                text: "Realizar una última revisión científica",
                energy: -3, science: 5, exploration: 1, condition: 0,
                consequence: "Los instrumentos científicos quedan revisados antes del lanzamiento.",
                result: "good"
            }
        ]
    },
    {
        sol: 1,
        label: "3 ENERO 2004 / ATERRIZAJE",
        title: "Spirit llega a Marte",
        text: "¡Siete meses después, llegamos! Spirit entra en la atmósfera de Marte a toda velocidad. Para aterrizar entero en el cráter Gusev necesito tu ayuda: paracaídas, bolsas de aire y retrocohetes, cada uno en el momento exacto. ¿Listo?",
        history: "Spirit aterrizó en el cráter Gusev el 3 de enero de 2004 (hora de EE. UU.; 4 de enero en tiempo universal), en la zona llamada Estación Memorial Columbia. Tocó la superficie envuelto en bolsas de aire que rebotaron hasta detenerse.",
        source: NASA_SPIRIT,
        landing: true,
        choices: [
            {
                text: "Iniciar el descenso",
                energy: -3, science: 2, exploration: 1, condition: 0
            }
        ]
    },
    {
        sol: 12,
        label: "2004 / PRIMEROS DÍAS",
        title: "Una nueva superficie",
        text: "¡Lo logramos! Spirit ya manda sus primeras fotos a la Tierra. Su misión debía durar solo 90 soles, así que cada día cuenta. ¿Por dónde empezamos?",
        history: "La misión principal de Spirit estaba planeada para durar 90 soles (días marcianos), hasta aproximadamente el 4 de abril de 2004.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Explorar el terreno",
                energy: -7, science: 3, exploration: 8, condition: -1,
                consequence: "Spirit avanza y obtiene nuevas imágenes del terreno.",
                result: "good"
            },
            {
                text: "Analizar el suelo cercano",
                energy: -4, science: 9, exploration: 2, condition: 0,
                consequence: "Los instrumentos encuentran información útil sobre la composición del suelo.",
                result: "good"
            }
        ]
    },
    {
        sol: 30,
        label: "2004 / INVESTIGACIÓN",
        title: "Huellas de agua",
        text: "Mira esas rocas… Spirit busca pistas de agua del pasado, y las rocas guardan esos secretos. ¿Las estudiamos de cerca o seguimos avanzando?",
        history: "Spirit encontró pruebas de que en el pasado Marte fue mucho más húmedo de lo que es ahora.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Examinar una roca",
                energy: -5, science: 10, exploration: 3, condition: -1,
                consequence: "El análisis aporta nueva información sobre la historia geológica de Marte.",
                result: "good"
            },
            {
                text: "Continuar hacia una zona cercana",
                energy: -8, science: 4, exploration: 10, condition: -2,
                consequence: "Spirit cubre más terreno, pero consume más energía.",
                result: "neutral"
            }
        ]
    },
    {
        sol: 120,
        label: "2004 / EXPLORACIÓN",
        title: "Más allá del cráter",
        text: "¿Sabes qué? Spirit ya superó sus 90 soles y sigue funcionando, así que la NASA le extendió la misión una y otra vez. ¿Qué priorizamos ahora?",
        history: "Spirit superó su misión principal de 90 soles. Los planificadores formularon una y otra vez misiones extendidas, mucho más allá de su vida útil original.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Seguir explorando",
                energy: -10, science: 4, exploration: 12, condition: -3,
                consequence: "Spirit recorre una nueva zona del cráter.",
                result: "good"
            },
            {
                text: "Priorizar los instrumentos científicos",
                energy: -5, science: 12, exploration: 4, condition: 0,
                consequence: "La misión obtiene más datos científicos sin recorrer tanta distancia.",
                result: "good"
            }
        ]
    },
    {
        sol: 450,
        label: "2005 / TERRENO DIFÍCIL",
        title: "El terreno cambia",
        text: "Llegamos a las Colinas Columbia. El terreno se pone difícil y un mal paso podría dañar a Spirit. Tú decides cómo avanzar.",
        history: "En las Colinas Columbia, Spirit descubrió una variedad de roca madre; algunas de estas rocas mostraban indicios de alteración por agua.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Avanzar lentamente",
                energy: -5, science: 4, exploration: 7, condition: 0,
                consequence: "Spirit avanza con precaución.",
                result: "good"
            },
            {
                text: "Tomar una ruta más larga",
                energy: -9, science: 2, exploration: 10, condition: -1,
                consequence: "La ruta es más larga, pero permite explorar una zona diferente.",
                result: "neutral"
            }
        ]
    },
    {
        sol: 753,
        label: "2006 / DESGASTE",
        title: "Los años empiezan a pesar",
        text: "Ay, malas noticias: la rueda delantera derecha de Spirit dejó de funcionar. Ahora tiene que arrastrarla… aunque eso podría traer una sorpresa. ¿Qué hacemos?",
        history: "Por la falla de su rueda delantera derecha se canceló el viaje a la zona llamada McCool. Al arrastrarla, la rueda raspó el suelo y dejó ver tierra brillante rica en sílice, señal de contacto con agua.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Conservar energía",
                energy: 2, science: 5, exploration: 2, condition: 1,
                consequence: "Spirit conserva recursos para continuar trabajando.",
                result: "good"
            },
            {
                text: "Buscar nuevos objetivos",
                energy: -8, science: 7, exploration: 9, condition: -3,
                consequence: "La exploración continúa, aunque aumenta el desgaste.",
                result: "neutral"
            }
        ]
    },
    {
        sol: 1241,
        label: "2007 / TORMENTAS DE POLVO",
        title: "El cielo se oscurece",
        text: "¡Cuidado! Una tormenta de polvo tapa el Sol. Spirit funciona con paneles solares, así que menos luz significa menos energía. ¿Cómo lo protegemos?",
        history: "Durante gran parte del verano de 2007, Spirit y Opportunity enfrentaron grandes tormentas de polvo que redujeron la energía generada por sus paneles solares.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Reducir las actividades",
                energy: 4, science: 2, exploration: 0, condition: 1,
                consequence: "Spirit entra en una operación más conservadora para proteger su energía.",
                result: "good"
            },
            {
                text: "Continuar trabajando",
                energy: -12, science: 8, exploration: 5, condition: -4,
                consequence: "Spirit consigue algunos datos, pero consume una cantidad importante de energía.",
                result: "bad"
            }
        ]
    },
    {
        sol: 1893,
        label: "1 MAYO 2009 / TERRENO",
        title: "Una trampa de arena",
        text: "Uh-oh… Spirit pasó por un suelo muy blando y sus ruedas empezaron a hundirse. Ya no avanza como antes. ¿Qué intentamos?",
        history: "El 1 de mayo de 2009, mientras avanzaba hacia el sur junto al borde occidental de una meseta baja, Spirit se atascó en tierra blanda en una zona llamada Troy.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Intentar salir",
                energy: -10, science: 2, exploration: 2, condition: -7,
                consequence: "Las ruedas giran, pero Spirit no consigue liberarse.",
                result: "bad",
                trapped: true
            },
            {
                text: "Analizar el terreno",
                energy: -4, science: 10, exploration: 1, condition: -2,
                consequence: "Aunque no puede avanzar, Spirit aprovecha la situación para estudiar el suelo.",
                result: "good",
                trapped: true
            }
        ]
    },
    {
        sol: 2098,
        label: "NOV 2009 / SPIRIT ATRAPADO",
        title: "Troy",
        text: "Spirit sigue atascado en Troy y ahora otra rueda dejó de funcionar. El equipo en la Tierra no se rinde. ¿Seguimos intentando o aprovechamos que está quieto?",
        history: "El 28 de noviembre de 2009 dejó de funcionar su rueda trasera derecha. A finales de enero de 2010, tras múltiples intentos fallidos, la misión se replanteó como una plataforma científica fija.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Seguir intentando avanzar",
                energy: -8, science: 3, exploration: 0, condition: -8,
                consequence: "El intento no consigue liberar al rover y aumenta el desgaste.",
                result: "bad"
            },
            {
                text: "Usar el lugar como laboratorio",
                energy: -3, science: 12, exploration: 1, condition: 0,
                consequence: "Spirit convierte su posición fija en una oportunidad científica.",
                result: "good"
            }
        ]
    },
    {
        sol: 2156,
        label: "2010 / INVIERNO MARCIANO",
        title: "El frío llega",
        text: "Brrr… llega el invierno marciano. Spirit está atascado, hay poca luz para sus paneles y sus calentadores necesitan energía para que no se congele. ¿Qué hacemos?",
        history: "La causa más probable de la pérdida de contacto fue el frío extremo, que volvió ineficaces los calentadores de supervivencia de Spirit.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Ahorrar toda la energía posible",
                energy: 5, science: 2, exploration: 0, condition: 0,
                consequence: "Spirit reduce sus actividades para conservar energía.",
                result: "good"
            },
            {
                text: "Intentar continuar las observaciones",
                energy: -12, science: 10, exploration: 2, condition: -5,
                consequence: "Spirit consigue algunos datos, pero sus reservas disminuyen rápidamente.",
                result: "neutral"
            }
        ]
    },
    {
        sol: 2210,
        label: "22 MARZO 2010 / ÚLTIMA SEÑAL",
        title: "La señal se apaga",
        text: "Spirit ya casi no responde. Desde la Tierra le mandamos mensajes una y otra vez, esperando escucharlo de nuevo…",
        history: "Después del 22 de marzo de 2010 la NASA no pudo restablecer contacto con Spirit. Se enviaron más de 1,300 comandos para intentar recuperarlo.",
        source: NASA_SPIRIT,
        choices: [
            {
                text: "Enviar una última secuencia de comandos",
                energy: -5, science: 5, exploration: 0, condition: -2,
                consequence: "Los comandos son enviados. El equipo espera una respuesta.",
                result: "neutral"
            }
        ]
    },
    {
        sol: 2210,
        label: "EPÍLOGO / 2011",
        title: "Abandonado, pero no olvidado",
        text: "Spirit dejó de responder, pero lo que descubrió cambió lo que sabemos de Marte. Gracias por acompañarlo. Quedó abandonado… pero nunca olvidado.",
        history: "La NASA concluyó oficialmente sus esfuerzos de recuperación el 25 de mayo de 2011.",
        source: NASA_SPIRIT,
        final: true
    }
];

/* Etapas reales del descenso, en orden. */
const LANDING_STAGES = [
    { name: "PARACAÍDAS", hint: "Abre el paracaídas para frenar la caída." },
    { name: "BOLSAS DE AIRE", hint: "Infla las bolsas de aire antes del impacto." },
    { name: "RETROCOHETES", hint: "Enciende los retrocohetes para frenar al final." }
];

/* Efecto de cada resultado del minijuego en el estado del rover. */
const LANDING_EFFECT = {
    perfecto: { condition: 0, science: 2 },
    bien: { condition: -3, science: 0 },
    fallo: { condition: -10, science: 0 }
};

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function getElement(id) {
    return document.getElementById(id);
}

function applyDeltas(delta) {
    gameState.energy = clamp(gameState.energy + (delta.energy || 0));
    gameState.science = clamp(gameState.science + (delta.science || 0));
    gameState.exploration = clamp(gameState.exploration + (delta.exploration || 0));
    gameState.condition = clamp(gameState.condition + (delta.condition || 0));
}

function updateStats() {
    const stats = ["energy", "science", "exploration", "condition"];
    stats.forEach(stat => {
        const value = getElement(`${stat}-value`);
        const bar = getElement(`${stat}-bar`);
        if (value) value.textContent = gameState[stat];
        if (bar) bar.style.width = `${gameState[stat]}%`;
    });
}

function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
        console.warn("No se pudo guardar la partida.", e);
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem(SAVE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!parsed || typeof parsed !== "object") return;
        gameState = { ...createInitialState(), ...parsed };
        /* Partidas guardadas con la versión anterior del aterrizaje */
        delete gameState.landingStarted;
        delete gameState.landingComplete;
    } catch (e) {
        console.warn("No se pudo cargar la partida.", e);
    }
}

/* =========================================
   ROVERCHITO: reacciones del guía
========================================= */
const GUIDE_REACTIONS = {
    good: [
        "¡Eso! Muy buena decisión.",
        "¡Bien hecho! Spirit te lo agradece.",
        "¡Así se hace! Justo lo que Spirit necesitaba."
    ],
    neutral: [
        "Mmm… funcionó, pero tuvo su costo.",
        "No está mal, aunque Spirit gastó de más.",
        "Bueno… pudo salir mejor, pero seguimos."
    ],
    bad: [
        "¡Uy! Eso le dolió a Spirit.",
        "Ouch… esa no era la mejor idea.",
        "Eso no salió nada bien. ¡Ánimo, seguimos!"
    ]
};

const GUIDE_MOODS = { good: "happy", neutral: "neutral", bad: "sad" };

/* Roverchito cambia de expresión y comenta. kind: good | neutral | bad */
/* Voz de Roverchito (../../voz.js). Solo suena después de que el usuario hizo clic. */
function guideSpeak(text) {
    if (typeof RoverchitoVoz !== "undefined" && userInteracted) RoverchitoVoz.decir(text);
}

let userInteracted = false;
document.addEventListener("pointerdown", () => { userInteracted = true; }, { capture: true });
document.addEventListener("keydown", () => { userInteracted = true; }, { capture: true });

function guideSay(kind, text, { save = true, speak = true } = {}) {
    const avatar = getElement("guide-avatar");
    const reaction = getElement("guide-reaction");
    const line = text || GUIDE_REACTIONS[kind][Math.floor(Math.random() * GUIDE_REACTIONS[kind].length)];
    if (speak) guideSpeak(line);

    if (avatar) {
        Roverchito.setMood(avatar, GUIDE_MOODS[kind] || "neutral");
        avatar.classList.remove("is-reacting");
        void avatar.offsetWidth;
        avatar.classList.add("is-reacting");
    }
    if (reaction) {
        reaction.textContent = line;
        reaction.className = `guide-reaction is-${kind}`;
        reaction.hidden = false;
    }
    if (save) gameState.guide = { kind, text: line };
}

function resetGuide() {
    const avatar = getElement("guide-avatar");
    const reaction = getElement("guide-reaction");
    if (avatar) Roverchito.setMood(avatar, "neutral");
    if (reaction) {
        reaction.hidden = true;
        reaction.textContent = "";
    }
}

function showConsequence(className, title, text) {
    const consequence = getElement("consequence");
    if (!consequence) return;
    consequence.className = `consequence ${className}`;
    consequence.innerHTML = "";
    const strong = document.createElement("strong");
    strong.textContent = title;
    const p = document.createElement("p");
    p.textContent = text;
    consequence.append(strong, p);
    consequence.style.display = "block";
}

/* =========================================
   ATERRIZAJE (MINIJUEGO DE ANILLOS)
========================================= */
function setLanderStage(stage) {
    const lander = getElement("lander");
    if (!lander) return;
    lander.dataset.stage = stage;
}

function startLanding() {
    const button = document.querySelector(".choice-btn");
    if (button) {
        button.disabled = true;
        button.textContent = "Descendiendo...";
    }

    showConsequence(
        "neutral",
        "ENTRADA A LA ATMÓSFERA",
        "Haz clic, toca o presiona la barra espaciadora cuando el anillo coincida con el círculo."
    );

    setLanderStage("entry");
    guideSay("neutral", "¡Atento! Haz clic justo cuando el anillo toque el círculo.", { save: false });

    Minijuegos.anillos({
        container: getElement("minigame"),
        rounds: LANDING_STAGES,
        onRound(index, result) {
            /* Cada acierto o fallo avanza la animación real del descenso */
            const stages = ["chute", "airbags", "rockets"];
            setLanderStage(stages[index]);
            const avatar = getElement("guide-avatar");
            if (avatar) Roverchito.setMood(avatar, result === "perfecto" ? "happy" : result === "fallo" ? "sad" : "neutral");
        },
        onFinish(results) {
            finishLanding(results);
        }
    });
}

function finishLanding(results) {
    const lander = getElement("lander");
    const rover = getElement("rover-box");
    const dust = getElement("dust-cloud");

    setLanderStage("bounce");

    const counts = { perfecto: 0, bien: 0, fallo: 0 };
    const delta = { ...scenes[1].choices[0] };
    results.forEach(r => {
        counts[r]++;
        delta.condition += LANDING_EFFECT[r].condition;
        delta.science += LANDING_EFFECT[r].science;
    });

    applyDeltas(delta);
    gameState.landing = { results };
    gameState.choiceMade = true;

    let className = "good";
    let title = "ATERRIZAJE PERFECTO";
    let text = "Las bolsas de aire rebotaron sobre el cráter Gusev y Spirit quedó intacto.";
    if (counts.fallo >= 2) {
        className = "bad";
        title = "ATERRIZAJE BRUSCO";
        text = "Spirit llegó a Marte, pero el impacto fue fuerte y sus sistemas resintieron el golpe.";
    } else if (counts.fallo === 1 || counts.bien >= 2) {
        className = "neutral";
        title = "ATERRIZAJE CONFIRMADO";
        text = "Spirit llegó a la superficie con algunos golpes. Los sistemas responden.";
    }
    text += ` Resultado: ${counts.perfecto} perfecto${counts.perfecto === 1 ? "" : "s"}, ${counts.bien} bien, ${counts.fallo} fallo${counts.fallo === 1 ? "" : "s"}.`;

    const button = document.querySelector(".choice-btn");
    if (button) {
        button.disabled = true;
        button.textContent = "Aterrizaje completado";
    }

    /* Las bolsas rebotan, se desinflan y aparece el rover */
    setTimeout(() => {
        if (gameState.sceneIndex !== 1) return;
        if (dust) {
            dust.classList.remove("on");
            void dust.offsetWidth;
            dust.classList.add("on");
        }
        setLanderStage("deflate");
    }, 1900);

    setTimeout(() => {
        if (gameState.sceneIndex !== 1) return;
        if (lander) setLanderStage("done");
        if (rover) {
            rover.style.opacity = "1";
            rover.style.transform = "translateX(-50%)";
            rover.classList.remove("greeting");
            void rover.offsetWidth;
            rover.classList.add("greeting");
        }
        showConsequence(className, title, text);
        const landingLines = {
            good: "¡Aterrizaje perfecto! Eres todo un piloto espacial.",
            neutral: "Llegamos con algunos golpes, pero Spirit está bien.",
            bad: "¡Uf! Fue un golpe fuerte… pero Spirit sobrevivió."
        };
        guideSay(className, landingLines[className]);
        saveGame();
        const nextButton = getElement("next-button");
        if (nextButton) nextButton.disabled = false;
        updateStats();
    }, 2700);

    saveGame();
}

/* =========================================
   VISUALES DE LA ESCENA
========================================= */
function updateVisual(sceneIndex) {
    const scene = getElement("scene");
    const rover = getElement("rover-box");
    const dust = getElement("dust-cloud");
    if (!scene || !rover) return;

    scene.className = "scene";
    rover.className = "rover-box";
    if (dust) dust.classList.remove("on");

    if (sceneIndex === 1) {
        scene.classList.add("landing");
        if (gameState.choiceMade) {
            setLanderStage("done");
            rover.style.opacity = "1";
        } else {
            setLanderStage("ready");
            rover.style.opacity = "0";
        }
        return;
    }

    setLanderStage("hidden");
    rover.style.opacity = sceneIndex === 0 ? "0" : "1";
    if (gameState.dustStorm || sceneIndex === 7) scene.classList.add("dust-storm");
    if (gameState.winter || sceneIndex === 10) {
        scene.classList.add("winter");
        rover.classList.add("winter");
    }
    if (gameState.wheelFailure || sceneIndex === 6) rover.classList.add("wheel-damage");
    if (gameState.trapped || sceneIndex === 8 || sceneIndex === 9) rover.classList.add("trapped");
    if (gameState.gameOver) scene.classList.add("game-over");
}

function renderSource(source) {
    const link = getElement("history-source");
    if (!link) return;
    if (!source) {
        link.hidden = true;
        return;
    }
    link.hidden = false;
    link.href = source.url;
    link.textContent = `Fuente: ${source.label}`;
}

function renderScene() {
    const currentScene = scenes[gameState.sceneIndex];
    if (!currentScene) return;

    const sceneLabel = getElement("scene-label");
    const sceneTitle = getElement("scene-title");
    const sceneText = getElement("scene-text");
    const historyText = getElement("real-history-text");
    const choices = getElement("choices");
    const consequence = getElement("consequence");
    const nextButton = getElement("next-button");
    const solNumber = getElement("sol-number");

    resetGuide();
    if (sceneLabel) sceneLabel.textContent = currentScene.label;
    if (sceneTitle) sceneTitle.textContent = currentScene.title;
    if (sceneText) sceneText.textContent = currentScene.text;
    guideSpeak(currentScene.text);
    if (historyText) historyText.textContent = currentScene.history;
    if (solNumber) solNumber.textContent = currentScene.sol === null ? "—" : currentScene.sol;
    renderSource(currentScene.source);

    if (currentScene.final) {
        renderFinal();
        return;
    }

    if (choices) choices.innerHTML = "";
    if (consequence) {
        consequence.innerHTML = "";
        consequence.style.display = "none";
    }

    if (currentScene.choices && choices) {
        currentScene.choices.forEach((choice, index) => {
            const button = document.createElement("button");
            button.className = "choice-btn";
            button.type = "button";
            button.textContent = choice.text;
            button.disabled = gameState.choiceMade;

            if (currentScene.landing && gameState.choiceMade) {
                button.textContent = "Aterrizaje completado";
            }

            button.addEventListener("click", () => makeChoice(index));
            choices.appendChild(button);
        });
    }

    /* Al recargar, Roverchito repite su última reacción */
    if (gameState.choiceMade && gameState.guide) {
        guideSay(gameState.guide.kind, gameState.guide.text, { save: false });
    }

    if (currentScene.landing && gameState.choiceMade && gameState.landing) {
        showConsequence("good", "ATERRIZAJE COMPLETADO", "Spirit ya está en la superficie del cráter Gusev.");
    }

    if (nextButton) {
        nextButton.disabled = !gameState.choiceMade;
        nextButton.textContent = "SIGUIENTE →";
    }

    updateStats();
    updateVisual(gameState.sceneIndex);
}

function makeChoice(choiceIndex) {
    const currentScene = scenes[gameState.sceneIndex];
    if (!currentScene || !currentScene.choices || !currentScene.choices[choiceIndex]) return;
    if (gameState.choiceMade) return;

    if (currentScene.landing) {
        startLanding();
        return;
    }

    const choice = currentScene.choices[choiceIndex];
    applyDeltas(choice);

    if (choice.trapped) gameState.trapped = true;
    if (gameState.sceneIndex === 6) gameState.wheelFailure = true;
    if (gameState.sceneIndex === 7) gameState.dustStorm = true;
    if (gameState.sceneIndex === 10) gameState.winter = true;

    const className = choice.result || "neutral";
    let label = "CONSECUENCIA";
    if (className === "good") label = "RESULTADO POSITIVO";
    if (className === "bad") label = "RESULTADO NEGATIVO";
    showConsequence(className, label, choice.consequence);
    guideSay(className);

    gameState.choiceMade = true;
    document.querySelectorAll(".choice-btn").forEach(btn => btn.disabled = true);

    const nextButton = getElement("next-button");
    if (nextButton) nextButton.disabled = false;

    updateStats();
    updateVisual(gameState.sceneIndex);
    saveGame();
}

function nextSol() {
    if (!gameState.choiceMade) return;
    if (gameState.sceneIndex >= scenes.length - 1) return;

    gameState.sceneIndex++;
    gameState.choiceMade = false;
    gameState.guide = null;

    if (gameState.sceneIndex >= 7) gameState.dustStorm = true;
    if (gameState.sceneIndex >= 10) gameState.winter = true;
    if (gameState.sceneIndex >= 8) gameState.trapped = true;
    if (gameState.sceneIndex >= 6) gameState.wheelFailure = true;
    if (gameState.energy <= 0) gameState.energy = 1;

    updateStats();
    renderScene();
    saveGame();
}

/* =========================================
   PANTALLA FINAL (MODAL)
========================================= */
function renderFinal() {
    const choices = getElement("choices");
    const consequence = getElement("consequence");
    const nextButton = getElement("next-button");

    if (choices) choices.innerHTML = "";
    if (consequence) consequence.style.display = "none";
    if (nextButton) nextButton.style.display = "none";

    const score = calculateScore();

    const values = {
        "final-score": score,
        "final-energia": gameState.energy,
        "final-ciencia": gameState.science,
        "final-exploracion": gameState.exploration,
        "final-estado": gameState.condition
    };
    Object.entries(values).forEach(([id, value]) => {
        const el = getElement(id);
        if (el) el.textContent = value;
    });

    const endScreen = getElement("mission-end");
    if (endScreen) endScreen.style.display = "flex";

    gameState.gameOver = true;
    updateStats();
    updateVisual(gameState.sceneIndex);
    saveGame();
}

function calculateScore() {
    return clamp(Math.round(
        (gameState.energy + gameState.science + gameState.exploration + gameState.condition) / 4
    ));
}

function restartGame() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch (e) {
        /* sin almacenamiento disponible */
    }
    gameState = createInitialState();
    location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
    if (typeof RoverchitoVoz !== "undefined") RoverchitoVoz.boton(getElement("voice-toggle"));
    loadGame();
    /* Si se recargó la página a mitad del descenso, se reinicia el aterrizaje */
    if (gameState.sceneIndex === 1 && !gameState.choiceMade) gameState.landing = null;
    renderScene();
});
