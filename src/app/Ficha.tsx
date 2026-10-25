/**
 * Requisito 1 — Ficha del proyecto, en modo solo lectura.
 * Requisito 2 — Las tres alternativas, descritas en lenguaje llano.
 * Más los supuestos y las restricciones, que acotan lo que este modelo puede decir.
 */

import {
  ALTERNATIVAS,
  AS_IS,
  FIRMA,
  REQUISITOS,
  RESTRICCIONES,
  SUPUESTOS,
  USUARIOS,
} from '../contenido/ficha';

const ETIQUETA_TIPO = {
  obligatorio: 'Obligatorio · descalifica',
  puntuado: 'Puntuado · suma',
  informativo: 'Informativo · se muestra',
} as const;

export default function Ficha() {
  return (
    <section className="bloque" aria-labelledby="titulo-ficha">
      <header className="bloque-encabezado">
        <div>
          <h2 id="titulo-ficha" className="bloque-titulo">
            Ficha del proyecto
          </h2>
          <p className="bloque-bajada">
            Lo que el simulador da por fijo. No se edita desde aquí: el usuario del simulador
            configura escenarios, no la ficha.
          </p>
        </div>
        <p className="etiqueta-lectura">Solo lectura</p>
      </header>

      <div className="ficha-cuerpo">
        <div className="ficha-columna">
          <h3 className="ficha-subtitulo">Quién y qué</h3>
          <dl className="ficha-datos">
            <div>
              <dt>Firma</dt>
              <dd>{FIRMA.nombre}</dd>
            </div>
            <div>
              <dt>Producto único</dt>
              <dd>{FIRMA.producto}</dd>
            </div>
            <div>
              <dt>Función</dt>
              <dd>{FIRMA.funcion}</dd>
            </div>
            <div>
              <dt>Equipo</dt>
              <dd>{FIRMA.equipo.join(', ')}</dd>
            </div>
            <div>
              <dt>Caso de estudio</dt>
              <dd>{FIRMA.casoDeEstudio}</dd>
            </div>
          </dl>

          <h3 className="ficha-subtitulo">Cómo está hecho hoy</h3>
          <dl className="ficha-datos">
            {AS_IS.map((item) => (
              <div key={item.titulo}>
                <dt>{item.titulo}</dt>
                <dd>{item.detalle}</dd>
              </div>
            ))}
          </dl>

          <h3 className="ficha-subtitulo">Quién lo usa</h3>
          <dl className="ficha-datos">
            {USUARIOS.map((u) => (
              <div key={u.rol}>
                <dt>{u.rol}</dt>
                <dd>
                  <strong className="ficha-enfasis">{u.quien}.</strong> {u.detalle}
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="ficha-subtitulo">Restricciones</h3>
          <ul className="lista-simple">
            {RESTRICCIONES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>

        </div>

        <div className="ficha-columna">
          <h3 className="ficha-subtitulo">Requisitos de calidad</h3>
          <ul className="lista-requisitos">
            {REQUISITOS.map((r) => (
              <li key={r.id} className={`requisito-${r.tipo}`}>
                <p className="requisito-id cifra">{r.id}</p>
                <p className="requisito-titulo">{r.titulo}</p>
                <p className="requisito-tipo">{ETIQUETA_TIPO[r.tipo]}</p>
                <p className="requisito-explicacion">{r.explicacion}</p>
              </li>
            ))}
          </ul>

          <h3 className="ficha-subtitulo">Supuestos del modelo</h3>
          <ul className="lista-simple">
            {SUPUESTOS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="ficha-subtitulo ficha-subtitulo-ancho">Las tres alternativas comparadas</h3>
      <p className="bloque-bajada">
        El mismo TORNS, desplegado de tres formas. Lo que cambia es dónde corre cada pieza y qué
        viaja por la red.
      </p>
      <div className="rejilla-descripciones">
        {ALTERNATIVAS.map((a) => (
          <article className="descripcion" key={a.id}>
            <h4 className="descripcion-nombre">
              Alternativa {a.id}: {a.nombre}
            </h4>
            <p className="descripcion-resumen">{a.resumen}</p>
            <ul className="lista-simple">
              {a.rasgos.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="descripcion-riesgo">
              <span className="descripcion-riesgo-rotulo">Lo que puede salir mal:</span> {a.riesgo}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
