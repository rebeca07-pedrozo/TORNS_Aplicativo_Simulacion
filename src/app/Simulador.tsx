/**
 * La app del simulador. Mantiene el escenario, llama al motor en cada cambio
 * y arma la página.
 *
 * El motor es puro, así que recalcular en cada tecleo cuesta microsegundos:
 * no hay ni espera ni botón de "calcular".
 */

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ESCENARIO_REFERENCIA } from '../engine/constants';
import { simular } from '../engine/modelo';
import type { ErrorValidacion } from '../engine/types';
import Alternativas from './Alternativas';
import Escenario, { type EntradaCruda } from './Escenario';
import Ficha from './Ficha';
import Glosario from './Glosario';
import Graficos from './Graficos';
import Recomendacion from './Recomendacion';
import './app.css';

gsap.registerPlugin(useGSAP);

const REFERENCIA: EntradaCruda = {
  K: String(ESCENARIO_REFERENCIA.K),
  E: ESCENARIO_REFERENCIA.E,
  F: String(ESCENARIO_REFERENCIA.F),
};

/**
 * Convierte lo que se escribió en pantalla a lo que espera el motor.
 * Un campo vacío o con letras no se fuerza a cero: se pasa como está,
 * para que la validación diga en español qué pasa.
 */
function aNumero(texto: string): number | string {
  const limpio = texto.trim();
  if (limpio === '') return '';
  const n = Number(limpio);
  return Number.isNaN(n) ? limpio : n;
}

export default function Simulador({
  introActivo,
  alRepetirIntro,
}: {
  introActivo: boolean;
  alRepetirIntro: () => void;
}) {
  const [entrada, setEntrada] = useState<EntradaCruda>(REFERENCIA);
  const raiz = useRef<HTMLDivElement>(null);

  const salida = useMemo(
    () => simular({ K: aNumero(entrada.K), E: entrada.E, F: aNumero(entrada.F) }),
    [entrada],
  );

  const errores: ErrorValidacion[] = salida.ok ? [] : salida.errores;

  const restablecer = useCallback(() => setEntrada(REFERENCIA), []);

  // Solo entra la primera pantalla, y solo una vez. El intro ya es el momento
  // con movimiento; de aquí en adelante esto es una herramienta y el contenido
  // tiene que estar, no llegar. Si el navegador pide movimiento reducido, no se
  // anima nada y todo queda visible igual.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-entra]', {
          autoAlpha: 0,
          y: 16,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.09,
          delay: introActivo ? 2.85 : 0.04,
        });
      });
      return () => mm.revert();
    },
    { scope: raiz, dependencies: [] },
  );

  return (
    <div className="pagina" ref={raiz}>
      <a className="saltar-al-contenido" href="#contenido">
        Saltar al contenido
      </a>

      <header className="barra" aria-label="Encabezado">
        <div className="barra-interior">
          <div className="barra-marca">
            {/* El logo aterriza aquí al final del intro y se queda como marca de la página. */}
            <img
              data-marca-app
              className="barra-logo"
              src="/lirn-marca.png"
              alt="LIRN"
              width={216}
              height={65}
              decoding="async"
            />
            <span className="barra-separador" aria-hidden="true" />
            <p className="barra-producto">
              TORNS
              <span className="barra-producto-nota">Simulador de arquitecturas</span>
            </p>
          </div>

          <div className="barra-acciones">
            <p className="barra-sello">Estimación del modelo</p>
            <button type="button" className="boton-secundario boton-discreto" onClick={alRepetirIntro}>
              Ver intro
            </button>
          </div>
        </div>
      </header>

      <main id="contenido" className="contenido">
        <section className="portada" aria-labelledby="titulo-pagina">
          <h1 id="titulo-pagina" className="portada-titulo" data-entra>
            Tres formas de desplegar el mismo TORNS
          </h1>
          <p className="portada-bajada" data-entra>
            TORNS cuenta las personas que esperan en una estación y le dice al centro de control
            cuántos trenes mandar. Esa misma pieza de software puede correr de tres maneras
            distintas. Mueva las tres palancas de abajo y el modelo estima, para cada una, qué tan
            rápido responde, cuánto aguanta y cuánto tiempo sigue en pie, y recomienda una.
          </p>
        </section>

        <div data-entra>
          <Escenario
            entrada={entrada}
            errores={errores}
            carga={salida.ok ? salida.carga : null}
            alCambiar={setEntrada}
            alRestablecer={restablecer}
          />
        </div>

        {salida.ok ? (
          <>
            <Recomendacion salida={salida} />
            <Alternativas salida={salida} />
            <Graficos salida={salida} />
          </>
        ) : (
          <section className="bloque bloque-vacio" aria-labelledby="titulo-sin-calculo">
            <h2 id="titulo-sin-calculo" className="bloque-titulo">
              El modelo no calculó nada
            </h2>
            <p className="bloque-bajada">
              Una de las entradas está fuera de lo que el motor acepta, así que no se produjo
              ningún resultado. Corrija lo siguiente y los resultados vuelven solos:
            </p>
            <ul className="lista-errores">
              {errores.map((e) => (
                <li key={e.campo}>
                  <span className="lista-errores-campo cifra">{e.campo}</span>
                  {e.mensaje}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Ficha />
        <Glosario />
      </main>

      <footer className="pie">
        <div className="pie-interior">
          {/* La marca cierra la página, como la abrió. */}
          <img className="pie-marca" src="/lirn-logo.png" alt="LIRN" width={1194} height={360} />
          <p className="pie-texto">
            Simulador de arquitecturas de despliegue de TORNS. Johel Arias, Rebeca Pedrozo Cueto y
            Hanna Cerinza Contreras. Transmilenio es caso de estudio, no cliente. Toda cifra de esta
            página es una estimación del modelo, no una medición de un sistema real.
          </p>
        </div>
      </footer>
    </div>
  );
}
