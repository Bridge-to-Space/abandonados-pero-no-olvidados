/* =========================================
   SPIRIT — ABANDONADOS
   MOTOR DEL JUEGO
========================================= */
const SAVE_KEY = "spirit_abandonados_save";
let gameState = {
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
    landingStarted: false,
    landingComplete: false
};

const scenes = [
    {
        sol: 1,
        label: "2003 / PREPARACIÓN",
        title: "Spirit: rumbo a Marte",
        text: "Después de años de desarrollo, Spirit está listo para comenzar su viaje hacia Marte.",
        history: "Spirit fue lanzado el 10 de junio de 2003 y llegó a Marte el 4 de enero de 2004.",
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
        label: "4 ENERO 2004 / ATERRIZAJE",
        title: "Spirit llega a Marte",
        text: "Después de meses de viaje, Spirit entra en la atmósfera marciana. Todo depende de una secuencia automática.",
        history: "Spirit aterrizó en el cráter Gusev el 4 de enero de 2004.",
        choices: [
            {
                text: "Esperar la confirmación de aterrizaje",
                energy: -3, science: 2, exploration: 1, condition: 0,
                consequence: "La señal confirma que Spirit ha llegado a la superficie.",
                result: "good"
            }
        ]
    },
    {
        sol: 12,
        label: "2004 / PRIMEROS DÍAS",
        title: "Una nueva superficie",
        text: "Spirit comienza a transmitir imágenes de Marte. El terreno frente al rover se convierte en su nuevo mundo.",
        history: "Spirit estudió el cráter Gusev y encontró evidencias de que Marte tuvo agua en el pasado.",
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
        text: "Los instrumentos de Spirit detectan características de las rocas que podrían revelar cómo fue Marte hace mucho tiempo.",
        history: "Spirit ayudó a encontrar evidencias geológicas de un Marte antiguo con condiciones más húmedas.",
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
        label: "2005 / EXPLORACIÓN",
        title: "Más allá del cráter",
        text: "Spirit continúa recorriendo Marte. Cada metro recorrido aumenta el conocimiento sobre el planeta.",
        history: "Spirit superó ampliamente su misión principal de 90 soles y continuó operando durante años.",
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
        text: "El paisaje se vuelve más complicado. Cada movimiento requiere mayor cuidado para evitar daños.",
        history: "Spirit atravesó terrenos difíciles durante su misión de exploración.",
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
        sol: 700,
        label: "2006 / DESGASTE",
        title: "Los años empiezan a pesar",
        text: "Spirit lleva años trabajando en Marte. Sus sistemas siguen funcionando, pero el desgaste comienza a ser parte de la misión.",
        history: "La misión de Spirit continuó mucho más allá de su duración originalmente prevista.",
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
        sol: 1400,
        label: "2008 / TORMENTA",
        title: "El cielo se oscurece",
        text: "Una tormenta de polvo cubre gran parte del cielo. La luz solar disminuye y los paneles reciben menos energía.",
        history: "En 2007, Spirit y Opportunity sobrevivieron a importantes tormentas de polvo marcianas.",
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
        sol: 1700,
        label: "2009 / TERRENO",
        title: "Una trampa de arena",
        text: "Spirit intenta atravesar una zona de terreno blando. Sus ruedas pierden tracción y el rover deja de avanzar como antes.",
        history: "En 2009, Spirit quedó atrapado en suelo marciano blando cerca de una zona llamada Troy.",
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
        sol: 1800,
        label: "2009 / SPIRIT ATRAPADO",
        title: "Troy",
        text: "Spirit permanece atrapado. El equipo en la Tierra intenta encontrar una forma de liberar al rover mientras continúa recopilando datos.",
        history: "Spirit quedó atrapado definitivamente en 2009. El equipo intentó varias estrategias para liberarlo.",
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
        sol: 1900,
        label: "2010 / INVIERNO MARCIANO",
        title: "El frío llega",
        text: "Con Spirit inmóvil, llega el invierno marciano. La energía disponible disminuye y mantener los sistemas activos se vuelve cada vez más difícil.",
        history: "Spirit entró en una situación crítica durante el invierno de 2010 debido a la baja energía disponible.",
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
        label: "2010 / ÚLTIMA SEÑAL",
        title: "La señal se apaga",
        text: "La comunicación con Spirit se vuelve cada vez más difícil. Desde la Tierra continúan enviándose comandos esperando recuperar el contacto.",
        history: "La última comunicación de Spirit con la Tierra ocurrió el 22 de marzo de 2010.",
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
        sol: 2211,
        label: "EPÍLOGO / 2010",
        title: "Abandonado, pero no olvidado",
        text: "Spirit dejó de comunicarse con la Tierra, pero los datos que consiguió transformaron nuestra comprensión de Marte.",
        history: "NASA declaró terminada la misión de Spirit el 25 de mayo de 2011.",
        final: true
    }
];

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
}

function getElement(id) {
    return document.getElementById(id);
}

function updateStats() {
    const energyValue = getElement("energy-value");
    const scienceValue = getElement("science-value");
    const explorationValue = getElement("exploration-value");
    const conditionValue = getElement("condition-value");
    const energyBar = getElement("energy-bar");
    const scienceBar = getElement("science-bar");
    const explorationBar = getElement("exploration-bar");
    const conditionBar = getElement("condition-bar");

    if (energyValue) energyValue.textContent = gameState.energy;
    if (scienceValue) scienceValue.textContent = gameState.science;
    if (explorationValue) explorationValue.textContent = gameState.exploration;
    if (conditionValue) conditionValue.textContent = gameState.condition;

    if (energyBar) energyBar.style.width = `${gameState.energy}%`;
    if (scienceBar) scienceBar.style.width = `${gameState.science}%`;
    if (explorationBar) explorationBar.style.width = `${gameState.exploration}%`;
    if (conditionBar) conditionBar.style.width = `${gameState.condition}%`;
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
        gameState = { ...gameState, ...parsed };
    } catch (e) {
        console.warn("No se pudo cargar la partida.", e);
    }
}

/* =========================================
   ATERRIZAJE
========================================= */
function startLandingSequence() {
    const ship = getElement("landing-ship");
    const rover = getElement("rover-box");
    if (!ship) return;

    gameState.landingStarted = true;
    gameState.landingComplete = false;

    if (rover) {
        rover.style.opacity = "0";
        rover.classList.remove("greeting");
    }

    ship.classList.remove("landing-active", "landed");
    ship.style.animation = "none";
    ship.style.opacity = "1";
    ship.style.transform = "translateX(-50%) translateY(-280px) scale(0.78)";
    void ship.offsetWidth;

    requestAnimationFrame(() => {
        ship.style.animation = "";
        ship.classList.add("landing-active");
    });

    setTimeout(() => {
        if (gameState.sceneIndex !== 1 || !gameState.landingStarted) return;

        gameState.landingComplete = true;
        ship.classList.remove("landing-active");
        ship.classList.add("landed");
        ship.style.animation = "none";
        ship.style.opacity = "1";
        ship.style.transform = "translateX(-50%) translateY(160px) scale(1)";

        const button = document.querySelector(".choice-btn");
        if (button) {
            button.disabled = false;
            button.textContent = "Aterrizar";
        }

        const consequence = getElement("consequence");
        if (consequence) {
            consequence.className = "consequence neutral";
            consequence.innerHTML = `
                <strong>ATERRIZAJE CONFIRMADO</strong>
                <p>La nave ha llegado a la superficie. Ahora debes completar el aterrizaje de Spirit.</p>
            `;
            consequence.style.display = "block";
        }
        saveGame();
    }, 4300);
}

function completeLanding() {
    const ship = getElement("landing-ship");
    const rover = getElement("rover-box");
    const dust = getElement("dust-cloud");

    if (ship) {
        ship.classList.remove("landing-active", "landed");
        ship.style.animation = "none";
        ship.style.opacity = "0";
    }

    if (dust) {
        dust.classList.remove("on");
        void dust.offsetWidth;
        dust.classList.add("on");
    }

    setTimeout(() => {
        if (gameState.sceneIndex !== 1) return;
        if (rover) {
            rover.style.opacity = "1";
            rover.style.transform = "translateX(-50%)";
            rover.classList.remove("greeting");
            void rover.offsetWidth;
            rover.classList.add("greeting");
        }
    }, 700);

    gameState.choiceMade = true;
    const choice = scenes[1].choices[0];
    gameState.energy = clamp(gameState.energy + (choice.energy || 0));
    gameState.science = clamp(gameState.science + (choice.science || 0));
    gameState.exploration = clamp(gameState.exploration + (choice.exploration || 0));
    gameState.condition = clamp(gameState.condition + (choice.condition || 0));

    const consequence = getElement("consequence");
    if (consequence) {
        consequence.className = "consequence good";
        consequence.innerHTML = `
            <strong>ATERRIZAJE COMPLETADO</strong>
            <p>${choice.consequence}</p>
        `;
        consequence.style.display = "block";
    }

    const button = document.querySelector(".choice-btn");
    if (button) {
        button.disabled = true;
        button.textContent = "Aterrizaje completado";
    }

    const nextButton = getElement("next-button");
    if (nextButton) nextButton.disabled = false;

    updateStats();
    saveGame();
}

function updateVisual(sceneIndex) {
    const scene = getElement("scene");
    const rover = getElement("rover-box");
    const dust = getElement("dust-cloud");
    const ship = getElement("landing-ship");
    if (!scene || !rover) return;

    scene.className = "scene";
    rover.className = "rover-box";
    if (dust) dust.classList.remove("on");

    if (sceneIndex === 1) {
        scene.classList.add("landing");
        if (!gameState.landingComplete) {
            rover.style.opacity = "0";
        } else {
            rover.style.opacity = "1";
        }

        if (ship) {
            if (!gameState.landingStarted) {
                ship.classList.remove("landing-active", "landed");
                ship.style.animation = "none";
                ship.style.opacity = "1";
                ship.style.transform = "translateX(-50%) translateY(-280px) scale(0.78)";
            } else if (gameState.landingStarted && !gameState.landingComplete) {
                ship.style.opacity = "1";
            } else if (gameState.landingComplete && !gameState.choiceMade) {
                ship.classList.remove("landing-active");
                ship.classList.add("landed");
                ship.style.animation = "none";
                ship.style.opacity = "1";
                ship.style.transform = "translateX(-50%) translateY(160px) scale(1)";
            } else {
                ship.classList.remove("landing-active", "landed");
                ship.style.animation = "none";
                ship.style.opacity = "0";
            }
        }
        return;
    }

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

    if (sceneLabel) sceneLabel.textContent = currentScene.label;
    if (sceneTitle) sceneTitle.textContent = currentScene.title;
    if (sceneText) sceneText.textContent = currentScene.text;
    if (historyText) historyText.textContent = currentScene.history;
    if (solNumber) solNumber.textContent = currentScene.sol;

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

            if (gameState.sceneIndex === 1) {
                if (!gameState.landingStarted) {
                    button.textContent = "Esperar la confirmación de aterrizaje";
                    button.disabled = false;
                } else if (gameState.landingStarted && !gameState.landingComplete) {
                    button.textContent = "Aterrizando...";
                    button.disabled = true;
                } else if (gameState.landingComplete && !gameState.choiceMade) {
                    button.textContent = "Aterrizar";
                    button.disabled = false;
                } else {
                    button.textContent = "Aterrizaje completado";
                    button.disabled = true;
                }
            } else {
                button.textContent = choice.text;
                button.disabled = gameState.choiceMade;
            }

            button.addEventListener("click", () => makeChoice(index));
            choices.appendChild(button);
        });
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

    if (gameState.sceneIndex === 1) {
        if (!gameState.landingStarted) {
            startLandingSequence();
            const button = document.querySelector(".choice-btn");
            if (button) {
                button.disabled = true;
                button.textContent = "Aterrizando...";
            }
            const consequence = getElement("consequence");
            if (consequence) {
                consequence.className = "consequence neutral";
                consequence.innerHTML = `
                    <strong>ESPERANDO CONFIRMACIÓN</strong>
                    <p>La secuencia automática de descenso ha comenzado.</p>
                `;
                consequence.style.display = "block";
            }
            return;
        }
        if (gameState.landingStarted && gameState.landingComplete && !gameState.choiceMade) {
            completeLanding();
            return;
        }
        return;
    }

    if (gameState.choiceMade) return;

    const choice = currentScene.choices[choiceIndex];
    gameState.energy = clamp(gameState.energy + (choice.energy || 0));
    gameState.science = clamp(gameState.science + (choice.science || 0));
    gameState.exploration = clamp(gameState.exploration + (choice.exploration || 0));
    gameState.condition = clamp(gameState.condition + (choice.condition || 0));

    if (choice.trapped) gameState.trapped = true;
    if (gameState.sceneIndex === 6) gameState.wheelFailure = true;
    if (gameState.sceneIndex === 7) gameState.dustStorm = true;
    if (gameState.sceneIndex === 10) gameState.winter = true;

    const consequence = getElement("consequence");
    if (consequence) {
        let className = choice.result || "neutral";
        let label = "CONSECUENCIA";
        if (className === "good") label = "RESULTADO POSITIVO";
        if (className === "bad") label = "RESULTADO NEGATIVO";

        consequence.innerHTML = `
            <strong>${label}</strong>
            <p>${choice.consequence}</p>
        `;
        consequence.className = `consequence ${className}`;
        consequence.style.display = "block";
    }

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
    gameState.landingStarted = false;
    gameState.landingComplete = false;

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
    // Ocultar elementos de la escena normal
    const choices = getElement("choices");
    const consequence = getElement("consequence");
    const nextButton = getElement("next-button");

    if (choices) choices.innerHTML = "";
    if (consequence) consequence.style.display = "none";
    if (nextButton) nextButton.style.display = "none";

    // Calcular puntuación
    const score = calculateScore();

    // Rellenar valores de la pantalla final
    const finalScore = getElement("final-score");
    const finalEnergia = getElement("final-energia");
    const finalCiencia = getElement("final-ciencia");
    const finalExploracion = getElement("final-exploracion");
    const finalEstado = getElement("final-estado");

    if (finalScore) finalScore.textContent = score;
    if (finalEnergia) finalEnergia.textContent = gameState.energy;
    if (finalCiencia) finalCiencia.textContent = gameState.science;
    if (finalExploracion) finalExploracion.textContent = gameState.exploration;
    if (finalEstado) finalEstado.textContent = gameState.condition;

    // Mostrar el modal
    const endScreen = getElement("mission-end");
    if (endScreen) {
        endScreen.style.display = "flex";
    }

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
    localStorage.removeItem(SAVE_KEY);

    // Ocultar modal
    const endScreen = getElement("mission-end");
    if (endScreen) {
        endScreen.style.display = "none";
    }

    gameState = {
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
        landingStarted: false,
        landingComplete: false
    };

    location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
    loadGame();
    if (typeof gameState.landingStarted !== "boolean") gameState.landingStarted = false;
    if (typeof gameState.landingComplete !== "boolean") gameState.landingComplete = false;
    renderScene();
});
