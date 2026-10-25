/**
 * La vista del operador en cabina: dos cámaras con conos de luz apuntando a un
 * andén con un tren. Es ilustración, dibujada en SVG con la paleta de la casa.
 *
 * Todo lo que se anima son grupos <g> a los que GSAP les aplica transform y
 * opacity: nada aquí dispara recálculo de layout.
 */

export const ANCHO_ESCENA = 1000;
export const ALTO_ESCENA = 400;

/** Las siete personas que el detector encuentra, con su confianza. */
export const DETECCIONES = [
  { x: 15.5, confianza: '.91' },
  { x: 23.5, confianza: '.88' },
  { x: 31.5, confianza: '.75' },
  { x: 62.0, confianza: '.93' },
  { x: 68.5, confianza: '.84' },
  { x: 75.0, confianza: '.79' },
  { x: 81.5, confianza: '.68' },
] as const;

/** Ventanas del tren detenido en el andén. */
const VENTANAS = [0, 1, 2, 3, 4, 5, 6].map((i) => 248 + i * 100);

function Camara({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* Poste */}
      <rect x="-5" y="96" width="10" height="214" fill="var(--torns-deep)" />
      {/* Cuerpo de la cámara, inclinado hacia el andén */}
      <g transform="rotate(-24 0 96)">
        <rect
          x="-4"
          y="76"
          width="74"
          height="34"
          rx="4"
          fill="var(--surface-3)"
          stroke="var(--torns-panel)"
          strokeWidth="2.5"
        />
      </g>
      {/* Lente */}
      <circle cx="0" cy="96" r="11" fill="var(--surface-0)" stroke="var(--activity)" strokeWidth="3" />
      <circle cx="0" cy="96" r="3.5" fill="var(--activity)" />
    </g>
  );
}

export default function EscenaControl() {
  return (
    <svg
      className="escena-svg"
      viewBox={`0 0 ${ANCHO_ESCENA} ${ALTO_ESCENA}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {/* Rejilla de la sala de control */}
      <g className="escena-rejilla">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 70}
            x2={ANCHO_ESCENA}
            y2={i * 70}
            stroke="var(--border-quiet)"
            strokeWidth="1"
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line
            key={`v${i}`}
            x1={i * 140}
            y1="0"
            x2={i * 140}
            y2={ALTO_ESCENA}
            stroke="var(--border-quiet)"
            strokeWidth="1"
          />
        ))}
      </g>

      {/* Tren detenido en el andén */}
      <g className="escena-tren">
        <path
          d="M 0 148 L 1000 148 L 1000 300 L 0 300 Z"
          fill="var(--surface-2)"
          stroke="var(--border-mid)"
          strokeWidth="2"
        />
        {VENTANAS.map((vx) => (
          <rect
            key={vx}
            x={vx}
            y="176"
            width="72"
            height="40"
            rx="3"
            fill="var(--surface-0)"
            stroke="var(--border-quiet)"
            strokeWidth="1.5"
          />
        ))}
      </g>

      {/* Conos de luz de las dos cámaras */}
      <g className="escena-conos">
        <path className="cono" d="M 200 100 L 92 330 L 332 330 Z" fill="var(--activity)" />
        <path className="cono" d="M 700 100 L 592 330 L 832 330 Z" fill="var(--activity)" />
      </g>

      {/* Línea de seguridad del andén */}
      {/* La línea de seguridad es mobiliario del andén, no un dato: va en el azul
          medio. El cian pleno queda reservado para lo que el detector marca. */}
      <g className="escena-anden">
        <rect x="0" y="302" width={ANCHO_ESCENA} height="5" fill="var(--torns-mid)" />
        <rect x="0" y="307" width={ANCHO_ESCENA} height="2" fill="var(--torns-deep)" />
        <rect x="0" y="330" width={ANCHO_ESCENA} height="1.5" fill="var(--border-mid)" />
      </g>

      {/* Postes de cámara, encima de todo */}
      <g className="escena-camaras">
        <Camara x={200} />
        <Camara x={700} />
      </g>
    </svg>
  );
}
