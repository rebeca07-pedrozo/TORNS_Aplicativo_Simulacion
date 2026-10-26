/**
 * El glosario completo. Está en la página porque la regla de lenguaje del
 * proyecto pide que nadie tenga que saber de antemano qué es MJPEG, ρ o TLS.
 */

import { GLOSARIO } from '../contenido/glosario';

export default function Glosario() {
  return (
    <section className="banda campo-blanco" aria-labelledby="titulo-glosario">
      <div className="banda-interior">
      <header className="banda-encabezado">
        <div>
          <h2 id="titulo-glosario" className="banda-titulo">
            Glosario
          </h2>
          <p className="banda-bajada">
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
      </div>
    </section>
  );
}
