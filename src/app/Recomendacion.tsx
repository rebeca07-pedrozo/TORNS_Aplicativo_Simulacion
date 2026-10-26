/**
 * La respuesta de la pantalla: qué arquitectura conviene en este escenario y por qué.
 * Si ninguna es elegible, dice por alternativa qué umbral falló.
 */

import { L_MAX } from '../engine/constants';
import { frasesMotivo } from '../engine/modelo';
import { formatearA, formatearL, formatearPuntaje } from '../engine/redondeo';
import type { ResultadoSimulacion } from '../engine/types';
import { ALTERNATIVAS } from '../contenido/ficha';
import { AvisoEstimacion } from './Ayuda';
import DesglosePuntaje from './DesglosePuntaje';

export default function Recomendacion({ salida }: { salida: ResultadoSimulacion }) {
  const ganadora = salida.alternativas.find((a) => a.id === salida.recomendada) ?? null;
  const ficha = ganadora ? ALTERNATIVAS.find((a) => a.id === ganadora.id)! : null;

  return (
    <section className="banda campo-blanco" aria-labelledby="titulo-recomendacion">
      <div className="banda-interior">
      <h2 id="titulo-recomendacion" className="banda-titulo">
        Recomendación
      </h2>

      {ganadora && ficha ? (
        <>
          {/* El número y el nombre van en la misma línea: no es un rótulo suelto
              encima del título, es parte del título. */}
          <p className="recomendacion-nombre">
            Alternativa {ganadora.id}: {ganadora.nombre}
          </p>
          <p className="recomendacion-resumen">{ficha.resumen}</p>

          <dl className="recomendacion-cifras">
            <div>
              <dt>Latencia</dt>
              <dd className="cifra">
                {formatearL(ganadora.L)} <span className="unidad">ms</span>
              </dd>
              <p>Lo que tarda el conteo en llegar al operador. El máximo aceptable es {L_MAX} ms.</p>
            </div>
            <div>
              <dt>Disponibilidad</dt>
              <dd className="cifra">
                {formatearA(ganadora.A)} <span className="unidad">%</span>
              </dd>
              <p>Porcentaje estimado del tiempo en que el conteo sigue saliendo.</p>
            </div>
            <div>
              <dt>Escalabilidad</dt>
              <dd className="cifra">
                {ganadora.S} <span className="unidad">cámaras</span>
              </dd>
              <p>
                Cuántas cámaras aguantaría a {salida.escenario.F} cuadros por segundo sin saturarse.
              </p>
            </div>
            <div>
              <dt>Puntaje</dt>
              <dd className="cifra">{formatearPuntaje(ganadora.puntaje!)}</dd>
              <p>Nota de 0 a 1 que combina los cuatro indicadores puntuados.</p>
            </div>
          </dl>

          <div className="recomendacion-cierre">
            <p className="recomendacion-explicacion">{salida.explicacion}</p>
            <DesglosePuntaje alternativa={ganadora} />
          </div>
        </>
      ) : (
        <>
          <p className="recomendacion-nombre">Ninguna alternativa es elegible</p>
          <p className="recomendacion-resumen">
            Ninguna de las tres pasa los dos requisitos obligatorios en este escenario, así que el
            modelo no recomienda ninguna. Esto es lo que falló en cada una:
          </p>

          <ul className="lista-fallos">
            {salida.alternativas.map((a) => (
              <li key={a.id}>
                <span className="lista-fallos-nombre">
                  Alternativa {a.id}: {a.nombre}
                </span>
                <span className="lista-fallos-motivo">
                  {frasesMotivo(a.motivoNoElegible!).replace(/^fall/, 'Fall')}.
                </span>
                {a.saturada && (
                  <span className="lista-fallos-detalle">
                    Satura: la ocupación llegó a 1 o más, así que no da abasto y la latencia se
                    reporta como {formatearL(a.L)} ms.
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="recomendacion-explicacion">
            Para encontrar una arquitectura viable, baje los cuadros por segundo, reduzca las
            cámaras, o revise si el escenario realmente exige cifrado.
          </p>
        </>
      )}

      <AvisoEstimacion />
      </div>
    </section>
  );
}
