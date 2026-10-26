/**
 * Resultados por alternativa: C, ρ, L, S, A, cifrado, contenedores, elegible y puntaje.
 *
 * Qué significa cada indicador se dice una vez, arriba, en lugar de repetirlo
 * tres veces. Las tres tarjetas comparten las filas (subgrid), así que cada
 * indicador queda a la misma altura en las tres y se pueden comparar de un vistazo.
 *
 * Nada depende del color para leerse: cada estado lleva su palabra
 * ("cumple" / "no cumple") y su marca de forma, además del tono.
 */

import { L_MAX } from '../engine/constants';
import { frasesMotivo } from '../engine/modelo';
import {
  formatearA,
  formatearC,
  formatearL,
  formatearPuntaje,
  formatearRho,
} from '../engine/redondeo';
import type { ResultadoAlternativa, ResultadoSimulacion } from '../engine/types';
import { ALTERNATIVAS } from '../contenido/ficha';
import { explicar } from '../contenido/glosario';

/** Un sí o un no, dicho con palabra y con forma, no solo con color. */
function Marca({
  valor,
  si,
  no,
  neutro = false,
}: {
  valor: boolean;
  si: string;
  no: string;
  neutro?: boolean;
}) {
  const clase = neutro ? 'marca marca-neutra' : valor ? 'marca marca-si' : 'marca marca-no';
  return (
    <span className={clase}>
      <span className="marca-figura" aria-hidden="true" />
      {valor ? si : no}
    </span>
  );
}

const INDICADORES = [
  {
    clave: 'C' as const,
    simbolo: 'C',
    titulo: 'Capacidad',
    unidad: 'cuadros/s',
    valor: (a: ResultadoAlternativa) => formatearC(a.C),
  },
  {
    clave: 'rho' as const,
    simbolo: 'ρ',
    titulo: 'Ocupación',
    unidad: '',
    valor: (a: ResultadoAlternativa) => formatearRho(a.rho),
  },
  {
    clave: 'L' as const,
    simbolo: 'L',
    titulo: 'Latencia',
    unidad: 'ms',
    valor: (a: ResultadoAlternativa) => formatearL(a.L),
  },
  {
    clave: 'S' as const,
    simbolo: 'S',
    titulo: 'Escalabilidad',
    unidad: 'cámaras',
    valor: (a: ResultadoAlternativa) => String(a.S),
  },
  {
    clave: 'A' as const,
    simbolo: 'A',
    titulo: 'Disponibilidad',
    unidad: '%',
    valor: (a: ResultadoAlternativa) => formatearA(a.A),
  },
];

/** Qué mide cada símbolo. Se dice una vez para las tres tarjetas. */
function Leyenda() {
  return (
    <dl className="leyenda">
      {INDICADORES.map((ind) => (
        <div className="leyenda-termino" key={ind.clave}>
          <dt>
            <span className="indicador-simbolo cifra" aria-hidden="true">
              {ind.simbolo}
            </span>
            <span className="leyenda-titulo">{ind.titulo}</span>
            {ind.unidad && <span className="leyenda-unidad">{ind.unidad}</span>}
          </dt>
          <dd>{explicar(ind.simbolo)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Tarjeta({
  resultado,
  recomendada,
}: {
  resultado: ResultadoAlternativa;
  recomendada: boolean;
}) {
  const ficha = ALTERNATIVAS.find((a) => a.id === resultado.id)!;
  const clases = [
    'alternativa',
    recomendada && 'alternativa-recomendada',
    !resultado.elegible && 'alternativa-fuera',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={clases} aria-labelledby={`alt-${resultado.id}`}>
      <header className="alternativa-encabezado">
        <h3 id={`alt-${resultado.id}`} className="alternativa-nombre">
          Alternativa {resultado.id}: {resultado.nombre}
        </h3>
        <p className="alternativa-resumen">{ficha.resumen}</p>
        {recomendada && <p className="alternativa-sello">Recomendada en este escenario</p>}
      </header>

      <dl className="alternativa-indicadores">
        {INDICADORES.map((ind) => (
          <div className="indicador" key={ind.clave}>
            <dt>
              <span className="indicador-simbolo cifra" aria-hidden="true">
                {ind.simbolo}
              </span>
              <span className="indicador-titulo">{ind.titulo}</span>
            </dt>
            <dd className="indicador-valor cifra">
              {ind.valor(resultado)}
              {ind.unidad && <span className="unidad"> {ind.unidad}</span>}
            </dd>
          </div>
        ))}
      </dl>

      {/* La fila existe siempre, aunque esté vacía: así las tarjetas no se desalinean. */}
      <div className="alternativa-aviso-fila">
        {resultado.saturada && (
          <p className="alternativa-aviso">
            No da abasto. La ocupación llegó a 1 o más, así que la latencia se reporta directamente
            como {formatearL(resultado.L)} ms.
          </p>
        )}
      </div>

      <ul className="alternativa-requisitos">
        <li>
          <span className="requisito-rotulo">RQ-02 · Cifrado</span>
          <Marca valor={resultado.cumpleCifrado} si="Cumple" no="No cumple" />
        </li>
        <li>
          <span className="requisito-rotulo">RQ-01 · Latencia</span>
          <Marca valor={resultado.cumpleLatencia} si="Cumple" no="No cumple" />
        </li>
        <li>
          <span className="requisito-rotulo">RQ-06 · Contenedores</span>
          {/* Informativo: ni descalifica ni suma, así que no se pinta como un logro. */}
          <Marca valor={resultado.usaContenedores} si="Sí usa" no="No usa" neutro />
        </li>
      </ul>

      <div className="alternativa-elegible">
        <span className="requisito-rotulo">Elegible</span>
        <Marca valor={resultado.elegible} si="Sí" no="No" />
      </div>

      <div className="alternativa-puntaje">
        <span className="requisito-rotulo">Puntaje</span>
        {resultado.puntaje === null ? (
          <span className="puntaje-vacio">
            Sin puntaje, porque {frasesMotivo(resultado.motivoNoElegible!)}.
          </span>
        ) : (
          <span className="puntaje-cifra cifra">{formatearPuntaje(resultado.puntaje)}</span>
        )}
      </div>
    </article>
  );
}

export default function Alternativas({ salida }: { salida: ResultadoSimulacion }) {
  return (
    <section className="banda campo-aire" aria-labelledby="titulo-alternativas">
      <div className="banda-interior">
      <header className="banda-encabezado">
        <div>
          <h2 id="titulo-alternativas" className="banda-titulo">
            Resultados por alternativa
          </h2>
          <p className="banda-bajada">
            Las tres despliegan el mismo TORNS con las mismas {salida.escenario.K} cámaras,{' '}
            {salida.escenario.F} cuadros por segundo y{' '}
            {salida.escenario.E ? 'con' : 'sin'} exigencia de cifrado. Cambia dónde corre cada pieza.
          </p>
        </div>
      </header>

      <Leyenda />

      <div className="rejilla-alternativas">
        {salida.alternativas.map((a) => (
          <Tarjeta key={a.id} resultado={a} recomendada={a.id === salida.recomendada} />
        ))}
      </div>

      <p className="nota-requisitos">
        <strong>RQ-01</strong> exige que el conteo llegue al operador en {L_MAX} ms o menos.{' '}
        <strong>RQ-02</strong> exige que, cuando el escenario lo pide, el video de personas no viaje
        legible por la red. Los dos son obligatorios: si uno falla, la alternativa queda fuera y no
        recibe puntaje. <strong>RQ-06</strong> solo informa si el software va empaquetado en
        contenedores; ni descalifica ni suma puntos.
      </p>
      </div>
    </section>
  );
}
