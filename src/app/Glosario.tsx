/**
 * El glosario completo. Está en la página porque la regla de lenguaje del
 * proyecto pide que nadie tenga que saber de antemano qué es MJPEG, ρ o TLS.
 */

import { GLOSARIO } from '../contenido/glosario';

export default function Glosario() {
  return (
    <section className="bloque" aria-labelledby="titulo-glosario">
      <header className="bloque-encabezado">
        <div>
          <h2 id="titulo-glosario" className="bloque-titulo">
            Glosario
          </h2>
          <p className="bloque-bajada">
            Cada palabra técnica que aparece en esta página, dicha en español corriente.
          </p>
        </div>
      </header>

      <dl className="rejilla-glosario">
        {GLOSARIO.map((t) => (
          <div className="termino" key={t.etiqueta}>
            <dt>
              {/* El símbolo solo aparece cuando lo hay: repetir la palabra sería ruido. */}
              {t.simbolo && <span className="termino-etiqueta cifra">{t.simbolo}</span>}
              <span className="termino-titulo">{t.titulo}</span>
              {t.unidad && <span className="termino-unidad">{t.unidad}</span>}
            </dt>
            <dd>{t.explicacion}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
