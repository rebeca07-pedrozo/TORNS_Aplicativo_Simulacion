/**
 * El andén visto por el operador: el tren, las dos cámaras con sus conos, las
 * personas y las cajitas del detector.
 *
 * Lo usan dos sitios. En el intro entra animado, pieza por pieza. En la portada
 * se queda quieto, dentro del panel que hace de pantalla del centro de control:
 * es lo que TORNS hace, dicho en una imagen en vez de en un párrafo.
 */

import EscenaControl, { DETECCIONES } from './EscenaControl';
import './anden.css';

export default function Anden() {
  return (
    <>
      <EscenaControl />
      <div className="intro-gente">
        {DETECCIONES.map((d) => (
          <div className="persona" key={d.x} style={{ left: `${d.x}%` }}>
            <svg className="figura" viewBox="0 0 22 44" aria-hidden="true">
              <circle cx="11" cy="8" r="7" fill="var(--tinta-2)" />
              <rect x="2.5" y="18" width="17" height="25" rx="7" fill="var(--tinta-2)" />
            </svg>
            {/* La cajita del detector encierra a la persona, como en la pantalla real. */}
            <span className="caja">
              <span className="caja-etiqueta">
                <span className="caja-clase">person</span> {d.confianza}
              </span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
