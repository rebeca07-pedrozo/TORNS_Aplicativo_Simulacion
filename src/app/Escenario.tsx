/**
 * Requisito 3 — Las tres palancas de entrada, con sus preguntas en pantalla.
 *
 * Los campos numéricos aceptan cualquier cosa a propósito: así se puede ver
 * el mensaje de error en lenguaje natural que exige el contrato del motor.
 */

import { F_MAX, F_MIN, K_MAX, K_MIN } from '../engine/constants';
import type { ErrorValidacion } from '../engine/types';
import { PISTAS, PREGUNTAS } from '../contenido/ficha';

export interface EntradaCruda {
  K: string;
  E: boolean;
  F: string;
}

interface Props {
  entrada: EntradaCruda;
  errores: ErrorValidacion[];
  carga: number | null;
  alCambiar: (siguiente: EntradaCruda) => void;
  alRestablecer: () => void;
}

function Palanca({
  simbolo,
  pregunta,
  pista,
  unidad,
  valor,
  minimo,
  maximo,
  error,
  alCambiar,
}: {
  simbolo: string;
  pregunta: string;
  pista: string;
  unidad: string;
  valor: string;
  minimo: number;
  maximo: number;
  error?: ErrorValidacion;
  alCambiar: (v: string) => void;
}) {
  const id = `palanca-${simbolo}`;
  const idError = `${id}-error`;
  const idAyuda = `${id}-ayuda`;
  const numero = Number(valor);
  const deslizadorUsable = Number.isInteger(numero) && numero >= minimo && numero <= maximo;

  return (
    <div className={error ? 'palanca palanca-con-error' : 'palanca'}>
      <label className="palanca-pregunta" htmlFor={id}>
        <span className="palanca-simbolo cifra" aria-hidden="true">
          {simbolo}
        </span>
        {pregunta}
      </label>

      <p className="palanca-explicacion" id={idAyuda}>
        {pista}
      </p>

      <div className="palanca-mandos">
        <input
          id={id}
          className="palanca-numero cifra"
          type="number"
          inputMode="numeric"
          value={valor}
          step={1}
          aria-describedby={error ? `${idAyuda} ${idError}` : idAyuda}
          aria-invalid={error ? true : undefined}
          onChange={(e) => alCambiar(e.target.value)}
        />
        <span className="palanca-unidad">
          {unidad}
          <span className="palanca-rango">entero de {minimo} a {maximo}</span>
        </span>

        <input
          className="palanca-deslizador"
          type="range"
          min={minimo}
          max={maximo}
          step={1}
          value={deslizadorUsable ? numero : minimo}
          aria-label={`${pregunta} Deslizador de ${minimo} a ${maximo}.`}
          onChange={(e) => alCambiar(e.target.value)}
        />
      </div>

      {error && (
        <p className="palanca-error" id={idError} role="alert">
          {error.mensaje}
        </p>
      )}
    </div>
  );
}

export default function Escenario({ entrada, errores, carga, alCambiar, alRestablecer }: Props) {
  const errorDe = (campo: 'K' | 'E' | 'F') => errores.find((e) => e.campo === campo);

  return (
    <section className="bloque" aria-labelledby="titulo-escenario">
      <header className="bloque-encabezado">
        <div>
          <h2 id="titulo-escenario" className="bloque-titulo">
            Escenario
          </h2>
          <p className="bloque-bajada">
            Las tres cosas que cambian de una estación a otra. El mismo TORNS se despliega de tres
            formas distintas y se compara con estos mismos valores.
          </p>
        </div>
        <button type="button" className="boton-secundario" onClick={alRestablecer}>
          Volver al escenario de referencia
        </button>
      </header>

      <div className="palancas">
        <Palanca
          simbolo="K"
          pregunta={PREGUNTAS.K}
          pista={PISTAS.K}
          unidad="cámaras"
          valor={entrada.K}
          minimo={K_MIN}
          maximo={K_MAX}
          error={errorDe('K')}
          alCambiar={(K) => alCambiar({ ...entrada, K })}
        />

        {/* E es una pregunta de sí o no: dos botones, no un interruptor ambiguo. */}
        <div className="palanca">
          <span className="palanca-pregunta" id="pregunta-E">
            <span className="palanca-simbolo cifra" aria-hidden="true">
              E
            </span>
            {PREGUNTAS.E}
          </span>
          <p className="palanca-explicacion">{PISTAS.E}</p>
          <div className="palanca-mandos palanca-mandos-dos" role="radiogroup" aria-labelledby="pregunta-E">
            <button
              type="button"
              role="radio"
              aria-checked={!entrada.E}
              className={!entrada.E ? 'opcion opcion-activa' : 'opcion'}
              onClick={() => alCambiar({ ...entrada, E: false })}
            >
              No
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={entrada.E}
              className={entrada.E ? 'opcion opcion-activa' : 'opcion'}
              onClick={() => alCambiar({ ...entrada, E: true })}
            >
              Sí
            </button>
          </div>
          <p className="palanca-nota">
            {entrada.E
              ? 'Con cifrado exigido, la alternativa 1 queda descalificada: manda el video en claro.'
              : 'Sin exigencia de cifrado, las tres alternativas cumplen el requisito RQ-02.'}
          </p>
        </div>

        <Palanca
          simbolo="F"
          pregunta={PREGUNTAS.F}
          pista={PISTAS.F}
          unidad="cuadros/s"
          valor={entrada.F}
          minimo={F_MIN}
          maximo={F_MAX}
          error={errorDe('F')}
          alCambiar={(F) => alCambiar({ ...entrada, F })}
        />
      </div>

      <p className="carga-total">
        {carga === null ? (
          <>
            <span className="carga-rotulo">Carga a analizar</span>
            <span className="carga-vacia">
              No se puede calcular hasta corregir las entradas señaladas arriba.
            </span>
          </>
        ) : (
          <>
            <span className="carga-rotulo">
              Carga a analizar <span className="cifra">Λ = K × F</span>
            </span>
            <span className="carga-cifra cifra">{carga}</span>
            <span className="carga-unidad">
              cuadros por segundo que hay que analizar en total, sumando todas las cámaras.
            </span>
          </>
        )}
      </p>
    </section>
  );
}
