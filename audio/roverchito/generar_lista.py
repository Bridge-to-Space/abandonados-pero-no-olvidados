"""
Genera la lista de frases de Roverchito para grabar con La Voz de Zueira.

Uso (desde la carpeta raíz del proyecto):
    python audio/roverchito/generar_lista.py

Crea o actualiza:
    audio/roverchito/frases.js   → la lee voz.js (qué audios existen)
    audio/roverchito/FRASES.md   → la lista para el equipo (archivo + texto)

Las frases que ya estaban marcadas como "listo: true" conservan su marca
mientras su texto no cambie. Si el texto cambió, la marca se quita y hay
que volver a grabar ese audio.
"""
import html
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CARPETA = RAIZ / "audio" / "roverchito"


def limpiar(texto):
    return re.sub(r"\s+", " ", html.unescape(texto)).strip()


def frases_de_cinematica(archivo, prefijo):
    """Líneas de Roverchito (roverchito y eleccion) de cada <ol class="cine-script">."""
    contenido = (RAIZ / archivo).read_text(encoding="utf-8")
    salida = []
    for lista in re.finditer(r'<ol class="cine-script" id="([^"]+)">(.*?)</ol>', contenido, re.S):
        id_lista, cuerpo = lista.groups()
        n = 0
        for li in re.finditer(r'<li ([^>]*)>(.*?)</li>', cuerpo, re.S):
            attrs, texto = li.groups()
            tipo = re.search(r'data-type="([^"]+)"', attrs)
            if not tipo or tipo.group(1) not in ("roverchito", "eleccion"):
                continue
            texto = re.sub(r"<strong>.*?</strong>", "", texto, flags=re.S)
            texto = re.sub(r"<span data-option.*?</span>", "", texto, flags=re.S)
            texto = limpiar(re.sub(r"<[^>]+>", "", texto))
            n += 1
            salida.append((f"{prefijo}-{id_lista}-{n:02d}.mp3", texto, f"{archivo} · {id_lista}"))
    return salida


def frases_de_spirit():
    """Narración de cada escena y reacciones del guía en el nivel de Spirit."""
    js = (RAIZ / "niveles/spirit/script.js").read_text(encoding="utf-8")
    salida = []
    escenas = js[js.index("const scenes = ["):js.index("/* Etapas reales del descenso")]
    for n, m in enumerate(re.finditer(r'\n        text: "([^"]+)"', escenas), 1):
        salida.append((f"spirit-escena-{n:02d}.mp3", limpiar(m.group(1)), "niveles/spirit · narración"))
    reacciones = js[js.index("const GUIDE_REACTIONS = {"):js.index("const GUIDE_MOODS")]
    for n, m in enumerate(re.finditer(r'"([^"]+)"', reacciones), 1):
        if m.group(1) in ("good", "neutral", "bad"):
            continue
        salida.append((f"spirit-reaccion-{n:02d}.mp3", limpiar(m.group(1)), "niveles/spirit · reacción"))
    for n, m in enumerate(re.finditer(r'guideSay\("[a-z]+", "([^"]+)"', js), 1):
        salida.append((f"spirit-aterrizaje-{n:02d}.mp3", limpiar(m.group(1)), "niveles/spirit · aterrizaje"))
    for n, m in enumerate(re.finditer(r'(good|neutral|bad): "([^"]+)"', js[js.index("const landingLines"):]), 1):
        salida.append((f"spirit-aterrizaje-final-{n:02d}.mp3", limpiar(m.group(2)), "niveles/spirit · aterrizaje"))
    return salida


def frases_del_inicio():
    """Lo que dice Roverchito al asomarse en el inicio."""
    index = (RAIZ / "index.html").read_text(encoding="utf-8")
    js = (RAIZ / "mision.js").read_text(encoding="utf-8")
    salida = []
    saludo = re.search(r'class="peek-text"[^>]*data-text="([^"]+)"', index)
    if saludo:
        salida.append(("inicio-01.mp3", limpiar(saludo.group(1)), "index.html · Roverchito se asoma"))
    extra = js[js.index("const PEEK_LINES = ["):js.index("];", js.index("const PEEK_LINES = ["))]
    for n, m in enumerate(re.finditer(r'"([^"]+)"', extra), 2):
        salida.append((f"inicio-{n:02d}.mp3", limpiar(m.group(1)), "index.html · Roverchito se asoma"))
    return salida


def main():
    frases = []
    frases += frases_del_inicio()
    frases += frases_de_cinematica("index.html", "origen")
    frases += frases_de_spirit()
    frases += frases_de_cinematica("niveles/opportunity/index.html", "opportunity")
    frases += frases_de_cinematica("niveles/pioneer10/index.html", "pioneer10")

    # Conservar las marcas "listo" de la versión anterior si el texto no cambió
    anteriores = {}
    viejo = CARPETA / "frases.js"
    if viejo.exists():
        datos = re.search(r"=\s*(\[.*\]);", viejo.read_text(encoding="utf-8"), re.S)
        if datos:
            for f in json.loads(datos.group(1)):
                anteriores[f["archivo"]] = f

    lista = []
    for archivo, texto, origen in frases:
        previo = anteriores.get(archivo)
        listo = bool(previo and previo.get("listo") and previo.get("texto") == texto)
        lista.append({"archivo": archivo, "texto": texto, "origen": origen, "listo": listo})

    CARPETA.mkdir(parents=True, exist_ok=True)
    (CARPETA / "frases.js").write_text(
        "/* Frases de Roverchito y sus audios grabados (generado por generar_lista.py).\n"
        "   Cambia \"listo\" a true cuando el archivo .mp3 ya esté en esta carpeta. */\n"
        "window.ROVERCHITO_FRASES = " + json.dumps(lista, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )

    listos = sum(f["listo"] for f in lista)
    filas = "\n".join(
        f"| {'✅' if f['listo'] else '⬜'} | `{f['archivo']}` | {f['texto'].replace('|', '/')} |" for f in lista
    )
    (CARPETA / "FRASES.md").write_text(
        f"""# Audios de Roverchito (voz de zueira)

{listos} de {len(lista)} frases tienen audio grabado. Las demás las lee la voz del navegador.

## Cómo grabar cada frase

1. Abre la app **La Voz de Zueira** (Android).
2. En **Voz y Idioma** elige **Julio** (bandera de España).
3. Pega el texto de la frase **tal cual** aparece en la tabla.
4. **Velocidad de lectura: 2** · **Tono: máximo** · **Velocidad de audio: máximo**.
5. **Perfil 1** · **Efecto: Excited**.
6. Guarda el audio y renómbralo con el nombre de la columna *Archivo* (formato `.mp3`).
7. Copia el archivo a esta carpeta (`audio/roverchito/`).
8. En `frases.js`, cambia `"listo": false` a `"listo": true` en esa frase.

Antes de publicar los audios, confirmen que los términos de la app permiten usarlos en un sitio web.

Si cambia algún guion, vuelvan a correr `python audio/roverchito/generar_lista.py`:
las frases cuyo texto cambió pierden su marca y hay que regrabarlas.

## Frases

| Listo | Archivo | Texto |
|---|---|---|
{filas}
""",
        encoding="utf-8",
    )
    print(f"{len(lista)} frases ({listos} con audio listo)")


if __name__ == "__main__":
    main()
