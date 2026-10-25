# Simulador de arquitecturas TORNS · LIRN

Página web que compara **tres formas de desplegar el mismo prototipo TORNS** y
recomienda una, con reglas reproducibles.

TORNS detecta con visión por computadora cuántas personas esperan en una estación
y le recomienda al centro de control cuántos trenes mandar. Ese mismo software
puede correr de tres maneras distintas; lo que este simulador compara es la
**arquitectura de despliegue**, no el despacho de trenes.

> Toda salida de este simulador es una **estimación del modelo**: son cálculos con
> parámetros del taller, no mediciones de un sistema real.

- Firma: **LIRN**. Producto único: **TORNS**.
- Equipo: Johel Arias, Rebeca Pedrozo Cueto, Hanna Cerinza Contreras.
- Transmilenio es **caso de estudio, no cliente**.

## Qué hay en la página

1. **Intro cinematográfico** (3,3 s): el logo aparece y se desliza a la esquina,
   se revela la vista del operador en cabina, el detector marca siete personas en
   el andén y un tren cierra la secuencia.
   Se puede saltar, no se repite en cada visita y respeta `prefers-reduced-motion`.
2. **Escenario**: las tres palancas de entrada `K`, `E` y `F` con sus preguntas.
3. **Recomendación**: cuál gana, por qué, y de dónde sale su puntaje. Si ninguna
   es elegible, dice por alternativa qué umbral falló.
4. **Resultados por alternativa**: `C`, `ρ`, `L`, `S`, `A`, cifrado, contenedores,
   elegibilidad y puntaje, con las filas alineadas entre las tres.
5. **Comparación de indicadores**: barras por indicador, con los umbrales marcados.
6. **Ficha del proyecto** (solo lectura) y **glosario**.

Cada etiqueta visible va acompañada de una frase en español que la explica: no se
asume que quien lee sepa qué es MJPEG, ρ o TLS.

## Dónde está publicado

<https://rebeca07-pedrozo.github.io/TORNS_Aplicativo_Simulacion/>

Cada vez que se empuja un cambio a la rama principal, GitHub Actions revisa los
tipos, corre las pruebas del motor, compila y publica. El flujo está en
`.github/workflows/deploy.yml`; si las pruebas fallan, no se publica nada.

**Para activarlo la primera vez:** en el repositorio, *Settings → Pages →
Build and deployment → Source:* elegir **GitHub Actions**. Hecho eso, el flujo
se puede lanzar a mano desde la pestaña *Actions* o esperar al siguiente empujón.

El sitio se sirve bajo el nombre del repositorio, así que `vite.config.ts` fija
`base`. Si algún día se mueve a un dominio propio, basta con compilar con
`BASE_PATH=/ npm run build`.

## Cómo correrlo

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # compila a dist/
npm run preview    # sirve lo compilado
npm test           # las pruebas del motor
npm run typecheck  # revisión de tipos
```

`npm run dev` y `npm run preview` sirven la página bajo
`/TORNS_Aplicativo_Simulacion/`, igual que en producción, para que lo que se ve
en local sea lo que se publica.

## El motor

`src/engine/` son **funciones puras**: no llaman a YOLO, ni a FastAPI, ni a
cámaras. Reciben un escenario `{ K, E, F }`, lo validan y devuelven la salida por
alternativa más la recomendación global.

| Archivo | Qué hace |
|---|---|
| `constants.ts` | Las constantes fijas del modelo (sección 7.1 del diseño). |
| `types.ts` | El contrato de entrada y salida. |
| `validacion.ts` | Rechaza entradas fuera de rango con un mensaje en lenguaje natural. |
| `modelo.ts` | Capacidad, ocupación, latencia, escalabilidad, disponibilidad, puntaje y recomendación. |
| `redondeo.ts` | Redondeo "mitad al par" exacto, igual que el `round` de Python. |

### Entradas

| Variable | Pregunta en pantalla | Rango |
|---|---|---|
| `K` | ¿Cuántas cámaras hay que analizar al mismo tiempo? | entero, 1 a 20 |
| `E` | ¿Hay que cifrar el video de personas? | no / sí |
| `F` | ¿Cuántos cuadros por segundo se analizan? | entero, 1 a 15 |

Escenario de referencia: `K = 2`, `E = no`, `F = 5`.

### Precisión

Se calcula en coma flotante y **solo se redondea al mostrar**: latencia al entero
más cercano, capacidad a dos decimales, ocupación a cuatro, disponibilidad a uno y
puntaje a cuatro. El ganador se decide siempre con el puntaje **sin redondear**.

JavaScript redondea la mitad hacia arriba, así que `redondeo.ts` reconstruye el
valor decimal exacto del número con aritmética entera y redondea mitad al par, que
es lo que pide el diseño.

## Pruebas

`src/engine/__tests__/modelo.test.ts` implementa las cinco pruebas mínimas de la
sección 7.11 contra los valores-oráculo de la 7.10, más la comprobación de
`K=8, E=sí, F=5` y las reglas de redondeo.

1. `K = 0` es inválido: no calcula y el mensaje cita el rango 1–20.
2. `K=2, E=no, F=5` reproduce la tabla de referencia y gana la alternativa 2.
3. `K=1, E=no, F=5` gana la alternativa 1, con latencia 100 ms.
4. `K=1, E=sí, F=5` deja fuera la alternativa 1 **por cifrado**, no por latencia.
5. `K=1, E=no, F=15` no deja ninguna elegible: las tres saturan.

## Estructura

```
src/
  engine/      el modelo, en funciones puras, y sus pruebas
  contenido/   la ficha del proyecto, las alternativas y el glosario
  intro/       el intro cinematográfico (una sola línea de tiempo de GSAP)
  app/         la interfaz del simulador
  styles/      tokens.css (la paleta) y global.css
public/
  lirn-logo.png    la marca, grande
  lirn-marca.png   la marca, para la barra superior
  fuentes/         Manrope, servida desde el propio sitio
.github/workflows/
  deploy.yml       compila, prueba y publica en GitHub Pages
```

## Decisiones de diseño

- **Modo oscuro sobre negro, tipografía Manrope**, con la paleta de
  `src/styles/tokens.css`. Las superficies y los bordes no son colores nuevos:
  son mezclas de negro con `--torns-deep` y `--torns-mid`, anotadas con su
  proporción.
- **El cian `--activity` se reserva para los datos y el foco**, no para el cromo.
- **Nada depende del color para leerse.** Cada estado lleva su palabra
  ("cumple" / "no cumple") y su marca de forma además del tono, así que el
  resultado se entiende sin distinguir colores.
- **El movimiento vive en el intro.** La app es una herramienta: el contenido
  está, no llega. Solo entra la primera pantalla, y solo una vez.
- Solo se animan `transform` y `opacity`, así que ningún cuadro dispara
  recálculo de disposición.
- **La página no pide nada a terceros.** Manrope se sirve desde el propio sitio
  (`public/fuentes/`), así que se ve igual aunque no haya acceso a Google Fonts.
  Incluye el subconjunto griego porque el modelo usa `ρ` y `Λ`.

## Créditos

Manrope, de Mikhail Sharanda, bajo SIL Open Font License 1.1. El texto de la
licencia va en `public/fuentes/OFL.txt`.

## Alcance

Esto cubre los requisitos 1 a 4 del diseño: ficha, tres alternativas, tres
entradas y modelo. No se simula la regla de despacho de trenes ni el acierto del
detector, y no hay integración con cámaras ni con el control real.
