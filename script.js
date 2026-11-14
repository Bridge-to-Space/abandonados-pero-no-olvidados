// =================================================
// ESTADO
// =================================================

let gameState = {
    sol: 1,
    energy: 70,
    science: 20,
    exploration: 20,
    condition: 100,
    trapped: false,
    winter: false,
    robotName: "SPIRIT"
};


// =================================================
// ESCENAS
// =================================================

const scenes = [

    {
        label: "2004 / ATERRIZAJE",
        title: "Una máquina en otro mundo",
        sceneClass: "landing",

        text:
            "Spirit acaba de llegar a Marte. Frente a él se encuentra un mundo completamente desconocido. El equipo en la Tierra espera los primeros datos.",

        choices: [

            {
                text: "Buscar más datos científicos",

                effects: {
                    energy: -5,
                    science: 15,
                    exploration: 2,
                    condition: 0
                },

                consequence:
                    "Spirit usa energía para observaciones adicionales."
            },

            {
                text: "Conservar energía",

                effects: {
                    energy: 8,
                    science: 4,
                    exploration: -3,
                    condition: 3
                },

                consequence:
                    "Spirit reduce operaciones y guarda recursos."
            },

            {
                text: "Explorar más terreno",

                effects: {
                    energy: -12,
                    science: 7,
                    exploration: 15,
                    condition: -4
                },

                consequence:
                    "Spirit se aleja e investiga nuevas zonas.",

                move: true
            }

        ],

        history:
            "Spirit aterrizó el 4 de enero de 2004. Su misión original era de ~90 soles, pero operó años."
    },


    {
        label: "2004 / INVESTIGACIÓN",
        title: "Una pista entre las rocas",
        sceneClass: "science",

        text:
            "Las cámaras encuentran formaciones rocosas interesantes. Cada decisión puede revelar información sobre el pasado de Marte.",

        choices: [

            {
                text: "Analizar la zona",

                effects: {
                    energy: -7,
                    science: 15,
                    exploration: 4,
                    condition: -1
                },

                consequence:
                    "El análisis aporta datos sobre la composición del terreno."
            },

            {
                text: "Fotografiar y continuar",

                effects: {
                    energy: -4,
                    science: 8,
                    exploration: 10,
                    condition: 0
                },

                consequence:
                    "Spirit registra el área y sigue su recorrido.",

                move: true
            },

            {
                text: "Observar desde aquí",

                effects: {
                    energy: 5,
                    science: 6,
                    exploration: -2,
                    condition: 2
                },

                consequence:
                    "Se obtiene información sin gastar mucha energía."
            }

        ],

        history:
            "Spirit usó cámaras e instrumentos para estudiar rocas y suelo marciano."
    },


    {
        label: "2005 / TERRENO",
        title: "El terreno cambia",
        sceneClass: "terrain",

        text:
            "El paisaje presenta nuevos obstáculos. Spirit debe avanzar con cuidado mientras sigue recopilando información.",

        choices: [

            {
                text: "Avanzar directamente",

                effects: {
                    energy: -10,
                    science: 4,
                    exploration: 15,
                    condition: -8
                },

                consequence:
                    "Avanza, pero el terreno desgasta más al rover.",

                move: true
            },

            {
                text: "Movimiento controlado",

                effects: {
                    energy: -6,
                    science: 7,
                    exploration: 8,
                    condition: -2
                },

                consequence:
                    "Más lento, pero con menos riesgo.",

                move: true
            },

            {
                text: "Quedarse y hacer ciencia",

                effects: {
                    energy: 3,
                    science: 15,
                    exploration: -5,
                    condition: 3
                },

                consequence:
                    "Spirit permanece y usa sus instrumentos."
            }

        ],

        history:
            "Spirit recorrió grandes distancias y encontró terrenos cada vez más difíciles."
    },


    {
        label: "2009 / PROBLEMAS",
        title: "Spirit queda atrapado",
        sceneClass: "trapped",

        text:
            "Spirit queda atrapado en arena. Desde la Tierra, los ingenieros estudian cómo intentar liberarlo.",

        choices: [

            {
                text: "Intentar liberarlo",

                effects: {
                    energy: -15,
                    science: 5,
                    exploration: 5,
                    condition: -10
                },

                consequence:
                    "Se intentan movimientos para sacarlo del terreno.",

                move: true
            },

            {
                text: "Aceptar la posición",

                effects: {
                    energy: 8,
                    science: 12,
                    exploration: -8,
                    condition: 3
                },

                consequence:
                    "Spirit se queda y se concentra en la ciencia."
            },

            {
                text: "Maniobra conservadora",

                effects: {
                    energy: -8,
                    science: 8,
                    exploration: 2,
                    condition: -4
                },

                consequence:
                    "Se mueve con cuidado para evitar más daños.",

                move: true
            }

        ],

        history:
            "En 2009 Spirit quedó atrapado. La NASA intentó liberarlo muchas veces sin éxito."
    },


    {
        label: "2010 / INVIERNO",
        title: "Llega el invierno",
        sceneClass: "winter",

        text:
            "El invierno marciano se acerca. La energía disponible se convierte en la mayor preocupación.",

        choices: [

            {
                text: "Priorizar ciencia",

                effects: {
                    energy: -15,
                    science: 18,
                    exploration: 0,
                    condition: -5
                },

                consequence:
                    "Sigue recopilando datos mientras tenga energía."
            },

            {
                text: "Reducir operaciones",

                effects: {
                    energy: 10,
                    science: 5,
                    exploration: -5,
                    condition: 5
                },

                consequence:
                    "Baja la actividad para conservar energía."
            },

            {
                text: "Buscar movilidad",

                effects: {
                    energy: -12,
                    science: 4,
                    exploration: 10,
                    condition: -8
                },

                consequence:
                    "Intenta aprovechar la movilidad antes de que empeore.",

                move: true
            }

        ],

        history:
            "El invierno fue especialmente duro. La falta de energía terminó afectando su operación."
    },


    {
        label: "2010 / ÚLTIMA SEÑAL",
        title: "La última señal",
        sceneClass: "final",

        text:
            "Spirit ya no puede operar como antes. El equipo intenta aprovechar los últimos momentos para obtener datos.",

        choices: [

            {
                text: "Enviar datos científicos",

                effects: {
                    energy: -8,
                    science: 20,
                    exploration: 0,
                    condition: -3
                },

                consequence:
                    "Usa sus últimos recursos para enviar información."
            },

            {
                text: "Conservar energía",

                effects: {
                    energy: 8,
                    science: 4,
                    exploration: 0,
                    condition: 2
                },

                consequence:
                    "Reduce actividades para intentar conservar recursos."
            },

            {
                text: "Transmitir lo que quede",

                effects: {
                    energy: -12,
                    science: 15,
                    exploration: 3,
                    condition: -5
                },

                consequence:
                    "Aprovecha todo lo posible para transmitir."
            }

        ],

        history:
            "Spirit dejó de comunicarse en marzo de 2010. La misión se declaró terminada en 2011."
    }

];


// =================================================
// FULLSCREEN
// =================================================

function toggleFullscreen() {

    if (!document.fullscreenElement) {

        document.documentElement
            .requestFullscreen()
            .catch(() => {});

    } else {

        document.exitFullscreen();

    }

}


function enterFullscreen() {

    if (!document.fullscreenElement) {

        document.documentElement
            .requestFullscreen()
            .catch(() => {});

    }

}


// =================================================
// VISUAL
// =================================================

function updateScene(cls) {

    const cin =
        document.getElementById("cinematic");

    const rover =
        document.getElementById("rover-wrap");

    if (!cin || !rover) {
        return;
    }

    cin.className = "cinematic";
    rover.className = "rover-wrap";

    if (cls) {
        cin.classList.add(cls);
    }

    if (
        cls === "trapped" ||
        gameState.trapped
    ) {
        rover.classList.add("trapped");
    }

    if (
        cls === "winter" ||
        cls === "final" ||
        gameState.winter
    ) {
        rover.classList.add("winter");
    }

    if (cls === "science") {
        rover.classList.add("science");
    }

}


// =================================================
// ANIMACIÓN DE MOVIMIENTO
// =================================================

function animateMove() {

    const rover =
        document.getElementById("rover-wrap");

    const puff =
        document.getElementById("dust-puff");

    if (!rover) {
        return;
    }

    rover.classList.add("moving");

    if (puff) {
        puff.classList.add("on");
    }

    rover.style.transform =
        "translateX(-42%)";

    setTimeout(() => {

        rover.style.transform =
            "translateX(-58%)";

    }, 200);

    setTimeout(() => {

        rover.style.transform =
            "translateX(-50%)";

        rover.classList.remove("moving");

        if (puff) {
            puff.classList.remove("on");
        }

    }, 500);

}


// =================================================
// CARGAR ESCENA
// =================================================

function loadScene() {

    const scene =
        scenes[gameState.sol - 1];

    if (!scene) {

        finishGame();

        return;

    }


    const solDisplay =
        document.getElementById("sol-display");

    const sceneLabel =
        document.getElementById("scene-label");

    const sceneTitle =
        document.getElementById("scene-title");

    const sceneText =
        document.getElementById("scene-text");

    const historyText =
        document.getElementById("real-history-text");

    const box =
        document.getElementById("choices");

    const consequence =
        document.getElementById("consequence");

    const next =
        document.getElementById("next-button");


    if (solDisplay) {

        solDisplay.textContent =
            "SOL " + gameState.sol;

    }


    if (sceneLabel) {

        sceneLabel.textContent =
            scene.label;

    }


    if (sceneTitle) {

        sceneTitle.textContent =
            scene.title;

    }


    if (sceneText) {

        sceneText.textContent =
            scene.text;

    }


    if (historyText) {

        historyText.textContent =
            scene.history;

    }


    updateScene(scene.sceneClass);


    if (box) {

        box.innerHTML = "";

        scene.choices.forEach((c, i) => {

            const btn =
                document.createElement("button");

            btn.className =
                "choice-btn";

            btn.textContent =
                c.text;

            btn.onclick = function () {

                choose(i);

            };

            box.appendChild(btn);

        });

    }


    if (consequence) {

        consequence.innerHTML = "";

    }


    if (next) {

        next.disabled = true;

        next.textContent =
            gameState.sol === scenes.length
                ? "VER RESULTADO →"
                : "SIGUIENTE →";

    }


    updateStats();

}


// =================================================
// ELECCIÓN
// =================================================

function choose(i) {

    const scene =
        scenes[gameState.sol - 1];

    if (!scene) {
        return;
    }

    const c =
        scene.choices[i];

    if (!c) {
        return;
    }


    gameState.energy =
        clamp(
            gameState.energy +
            (c.effects.energy || 0)
        );


    gameState.science =
        clamp(
            gameState.science +
            (c.effects.science || 0)
        );


    gameState.exploration =
        clamp(
            gameState.exploration +
            (c.effects.exploration || 0)
        );


    gameState.condition =
        clamp(
            gameState.condition +
            (c.effects.condition || 0)
        );


    if (gameState.sol === 4) {

        gameState.trapped = true;

    }


    if (gameState.sol === 5) {

        gameState.winter = true;

    }


    if (c.move) {

        animateMove();

    }


    document
        .querySelectorAll(".choice-btn")
        .forEach(button => {

            button.disabled = true;

        });


    const cons =
        document.getElementById("consequence");


    if (cons) {

        cons.innerHTML =
            "<strong>CONSECUENCIA</strong><p>" +
            c.consequence +
            "</p>";

    }


    const next =
        document.getElementById("next-button");


    if (next) {

        next.disabled = false;

    }


    updateStats();

}


// =================================================
// SIGUIENTE SOL
// =================================================

function nextSol() {

    if (
        gameState.sol >=
        scenes.length
    ) {

        finishGame();

        return;

    }


    gameState.sol++;

    loadScene();

}


// =================================================
// FINAL
// =================================================

function finishGame() {

    updateScene("final");


    let title;
    let text;


    if (
        gameState.science >=
            gameState.exploration &&
        gameState.science >=
            gameState.energy
    ) {

        title =
            "UNA MISIÓN DE CIENCIA";

        text =
            "Priorizaste la investigación. Spirit aportó mucha información antes de que las condiciones limitaran la misión.";

    }

    else if (
        gameState.exploration >=
        gameState.science
    ) {

        title =
            "UN VIAJE DE EXPLORACIÓN";

        text =
            "Llevaste a Spirit a explorar distintas zonas. El terreno y la energía fueron grandes desafíos.";

    }

    else {

        title =
            "SUPERVIVENCIA";

        text =
            "Te enfocaste en conservar recursos. Spirit operó más tiempo, aunque con menos exploración.";

    }


    const storyPanel =
        document.getElementById("story-panel");


    if (!storyPanel) {

        return;

    }


    storyPanel.innerHTML = `

        <div class="final-panel">

            <div class="scene-tag">
                FIN DE LA SIMULACIÓN
            </div>

            <h2>${title}</h2>

            <p>
                ${text}
            </p>

            <div class="final-stats">

                <div>
                    <strong>
                        ${gameState.energy}
                    </strong>

                    <span>
                        ENERGÍA
                    </span>
                </div>


                <div>
                    <strong>
                        ${gameState.science}
                    </strong>

                    <span>
                        CIENCIA
                    </span>
                </div>


                <div>
                    <strong>
                        ${gameState.exploration}
                    </strong>

                    <span>
                        EXPLORACIÓN
                    </span>
                </div>


                <div>
                    <strong>
                        ${gameState.condition}
                    </strong>

                    <span>
                        ESTADO
                    </span>
                </div>

            </div>


            <p
                style="
                    color:#888;
                    font-size:13px;
                    margin-bottom:18px;
                "
            >
                Spirit dejó de comunicarse en 2010,
                pero sus datos siguen ayudando
                a entender Marte.
            </p>


            <button
                class="restart-btn"
                onclick="location.reload()"
            >
                VOLVER A JUGAR
            </button>

        </div>

    `;

}


// =================================================
// ESTADÍSTICAS
// =================================================

function updateStats() {

    set(
        "energy",
        gameState.energy
    );

    set(
        "science",
        gameState.science
    );

    set(
        "exploration",
        gameState.exploration
    );

    set(
        "condition",
        gameState.condition
    );

}


function set(name, val) {

    const v =
        document.getElementById(
            name + "-value"
        );

    const b =
        document.getElementById(
            name + "-bar"
        );


    if (v) {

        v.textContent = val;

    }


    if (b) {

        b.style.width =
            val + "%";

    }

}


function clamp(n) {

    return Math.max(
        0,
        Math.min(100, n)
    );

}


// =================================================
// MODALES DEL EQUIPO
// =================================================
//
// IMPORTANTE:
// Se usan window. para que funcionen
// con onclick="" directamente desde el HTML.
// =================================================


window.openTeamModal = function (id) {

    console.log(
        "Intentando abrir:",
        id
    );


    const modal =
        document.getElementById(id);


    if (!modal) {

        console.error(
            "❌ No se encontró el modal:",
            id
        );

        return;

    }


    // Cerrar cualquier otro modal

    document
        .querySelectorAll(
            ".team-modal-overlay"
        )
        .forEach(function (otherModal) {

            otherModal.classList.remove(
                "show"
            );

        });


    // Abrir el seleccionado

    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";


    console.log(
        "✅ Modal abierto:",
        id
    );

};


window.closeTeamModal = function (id) {

    console.log(
        "Intentando cerrar:",
        id
    );


    const modal =
        document.getElementById(id);


    if (!modal) {

        console.error(
            "❌ No se encontró el modal:",
            id
        );

        return;

    }


    modal.classList.remove("show");

    document.body.style.overflow =
        "";


    console.log(
        "✅ Modal cerrado:",
        id
    );

};


// =================================================
// CONFIGURAR CIERRE POR FONDO
// =================================================

function setupTeamModals() {

    const modals =
        document.querySelectorAll(
            ".team-modal-overlay"
        );


    console.log(
        "🔎 Modales encontrados:",
        modals.length
    );


    modals.forEach(function (modal) {

        // Evita duplicar eventos

        if (
            modal.dataset.modalReady ===
            "true"
        ) {

            return;

        }


        modal.dataset.modalReady =
            "true";


        modal.addEventListener(
            "click",
            function (event) {

                // Solo cerrar cuando se
                // hace click directamente
                // sobre el fondo

                if (
                    event.target === modal
                ) {

                    modal.classList.remove(
                        "show"
                    );

                    document.body.style.overflow =
                        "";

                }

            }
        );

    });

}


// =================================================
// CERRAR CON ESC
// =================================================

function setupEscapeForModals() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            document
                .querySelectorAll(
                    ".team-modal-overlay.show"
                )
                .forEach(function (modal) {

                    modal.classList.remove(
                        "show"
                    );

                });


            document.body.style.overflow =
                "";

        }
    );

}


// =================================================
// INICIO
// =================================================

window.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🚀 JavaScript cargado correctamente"
        );


        // Configurar modales

        setupTeamModals();

        setupEscapeForModals();


        // Iniciar juego

        setTimeout(
            function () {

                enterFullscreen();

            },
            400
        );


        loadScene();

    }
);
