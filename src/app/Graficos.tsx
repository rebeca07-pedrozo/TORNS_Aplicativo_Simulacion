/**
 * Comparación de los indicadores entre las tres alternativas.
 *
 * Cada barra va en la misma fila que su nombre y su cifra: no hay que contar
 * posiciones para saber cuál es cuál. Un solo tono de datos —el cian del
 * acento— marca la recomendada; el resto va en el azul petróleo, y lo que no
 * es elegible va apagado y con el borde punteado.
 *
 * Cuando una alternativa satura, su latencia vale 10000 ms y se saldría de la
 * escala: la barra se corta en el tope, se marca como tal y la cifra se muestra
 * igual, sin aplastar el resto del gráfico.
 */

import { L_MAX } from '../engine/constants';
import {
  formatearA,
  formatearC,
  formatearL,
  formatearPuntaje,
  formatearRho,
} from '../engine/redondeo';
import type { ResultadoAlternativa, ResultadoSimulacion } from '../engine/types';
import { explicar } from '../contenido/glosario';

interface Serie {
  titulo: string;
  simbolo?: string;
  explicacion: string;
  /** Qué significa que la barra sea larga. */
  sentido: string;
  valor: (a: ResultadoAlternativa) => number;
  texto: (a: ResultadoAlternativa) => string;
  /** Tope de la escala. Si no se da, se usa el mayor valor de la serie. */
  tope?: number;
  /** Marca de umbral sobre la escala, con su etiqueta. */
  umbral?: { en: number; etiqueta: string };
}

const SERIES: Serie[] = [
  {
    titulo: 'Latencia',
    simbolo: 'L',
    explicacion: explicar('L'),
    sentido: 'Más corta es mejor.',
    valor: (a) => a.L,
    texto: (a) => `${formatearL(a.L)} ms`,
    tope: 1100,
    umbral: { en: L_MAX, etiqueta: `${L_MAX} ms, el máximo que acepta RQ-01` },
  },
  {
    titulo: 'Ocupación',
    simbolo: 'ρ',
    explicacion: explicar('ρ'),
    sentido: 'Más corta es mejor.',
    valor: (a) => a.rho,
    texto: (a) => formatearRho(a.rho),
    tope: 1.25,
    umbral: { en: 1, etiqueta: '1,0000, el punto en que deja de dar abasto' },
  },
  {
    titulo: 'Capacidad',
    simbolo: 'C',
    explicacion: explicar('C'),
    sentido: 'Más larga es mejor.',
    valor: (a) => a.C,
    texto: (a) => `${formatearC(a.C)} cuadros/s`,
  },
  {
    titulo: 'Escalabilidad',
    simbolo: 'S',
    explicacion: explicar('S'),
    sentido: 'Más larga es mejor.',
    valor: (a) => a.S,
    texto: (a) => `${a.S} cámaras`,
  },
  {
    titulo: 'Disponibilidad',
    simbolo: 'A',
    explicacion: explicar('A'),
    sentido: 'Más larga es mejor.',
    valor: (a) => a.A,
    texto: (a) => `${formatearA(a.A)} %`,
    tope: 100,
  },
  {
    titulo: 'Puntaje',
    explicacion: explicar('Puntaje'),
    sentido: 'Más largo es mejor.',
    valor: (a) => a.puntaje ?? 0,
    texto: (a) => (a.puntaje === null ? 'sin puntaje' : formatearPuntaje(a.puntaje)),
    tope: 1,
  },
];

function Grafico({
  serie,
  alternativas,
  recomendada,
}: {
  serie: Serie;
  alternativas: ResultadoAlternativa[];
  recomendada: number | null;
}) {
  const tope = serie.tope ?? Math.max(...alternativas.map(serie.valor), 1);
  const id = `grafico-${serie.titulo.toLowerCase()}`;

  return (
    <figure className="grafico" aria-labelledby={id}>
      <figcaption>
        <h3 className="grafico-titulo" id={id}>
          {serie.simbolo && (
            <span className="indicador-simbolo cifra" aria-hidden="true">
              {serie.simbolo}
            </span>
          )}
          {serie.titulo}
        </h3>
        <p className="grafico-explicacion">
          {serie.explicacion} {serie.sentido}
        </p>
      </figcaption>

      <ol className="grafico-filas">
        {alternativas.map((a) => {
          const bruto = serie.valor(a);
          const cortada = bruto > tope;
          const porcentaje = tope > 0 ? Math.min(100, Math.max(0, (bruto / tope) * 100)) : 0;
          const clases = [
            'grafico-fila',
            a.id === recomendada && 'es-recomendada',
            !a.elegible && 'es-fuera',
            cortada && 'es-cortada',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <li className={clases} key={a.id}>
              <span className="grafico-fila-id cifra">Alt. {a.id}</span>
              <span className="grafico-fila-nombre">{a.nombre}</span>
              <span className="grafico-fila-valor cifra">
                {serie.texto(a)}
                {cortada && <span className="grafico-fuera"> · fuera de escala</span>}
              </span>
              <span className="grafico-carril" aria-hidden="true">
                <span className="grafico-barra" style={{ inlineSize: `${porcentaje}%` }} />
                {serie.umbral && (
                  <span
                    className="grafico-umbral-marca"
                    style={{ insetInlineStart: `${(serie.umbral.en / tope) * 100}%` }}
                  />
                )}
              </span>
            </li>
          );
        })}
      </ol>

      {/* La nota existe siempre: así las barras de una misma fila quedan a la
          misma altura aunque solo algunos gráficos tengan umbral. */}
      <p className="grafico-umbral-nota">
        {serie.umbral ? `Línea punteada: ${serie.umbral.etiqueta}.` : ''}
      </p>
    </figure>
  );
}

export default function Graficos({ salida }: { salida: ResultadoSimulacion }) {
  return (
    <section className="bloque" aria-labelledby="titulo-graficos">
      <header className="bloque-encabezado">
        <div>
          <h2 id="titulo-graficos" className="bloque-titulo">
            Comparación de indicadores
          </h2>
          <p className="bloque-bajada">
            El mismo escenario visto indicador por indicador. La barra en cian es la alternativa
            recomendada; las punteadas son alternativas que quedaron fuera.
          </p>
        </div>
      </header>

      <div className="rejilla-graficos">
        {SERIES.map((serie) => (
          <Grafico
            key={serie.titulo}
            serie={serie}
            alternativas={salida.alternativas}
            recomendada={salida.recomendada}
          />
        ))}
      </div>
    </section>
  );
}
