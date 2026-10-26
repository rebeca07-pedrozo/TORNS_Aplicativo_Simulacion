/**
 * La app del simulador. Mantiene el escenario, llama al motor en cada cambio
 * y arma la página.
 *
 * La página se lee como una sucesión de campos de color, igual que el sitio de
 * LIRN: azul petróleo para la barra, la portada con sus palancas y el pie;
 * blanco y aire para las zonas donde se leen cifras. El salto del azul al
 * blanco es lo que marca dónde empieza la respuesta.
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
import { FIRMA } from '../contenido/ficha';
import { LOGO } from '../recursos';
import Anden from '../intro/Anden';
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
  // tiene que estar, no llegar.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-entra]', {
          autoAlpha: 0,
          y: 18,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.09,
          delay: introActivo ? 4.9 : 0.04,
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

      <header className="barra campo-azul" aria-label="Encabezado">
        <div className="barra-interior">
          <div className="barra-marca">
            {/* El logo aterriza aquí al final del intro y se queda como marca de la página. */}
            <img
              data-marca-app
              className="barra-logo"
              src={LOGO}
              alt="LIRN"
              width={1020}
              height={308}
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
            <button type="button" className="boton-secundario" onClick={alRepetirIntro}>
              Ver intro
            </button>
          </div>
        </div>
      </header>

      <main id="contenido">
        {/* La portada y las palancas comparten campo: se abre la página y ya se
            puede mover el escenario, sin bajar a buscarlo. */}
        <section className="banda campo-azul portada" aria-labelledby="titulo-pagina">
          <div className="banda-interior">
            <div className="portada-cuerpo">
              <div className="portada-texto">
                <h1 id="titulo-pagina" className="portada-titulo" data-entra>
                  El mismo TORNS, de tres formas
                </h1>
                <p className="portada-bajada" data-entra>
                  TORNS cuenta las personas que esperan en una estación y le dice al centro de
                  control cuántos trenes mandar. Esa misma pieza de software puede correr de tres
                  maneras distintas. Mueva las tres palancas y el modelo estima, para cada una, qué
                  tan rápido responde, cuánto aguanta y cuánto tiempo sigue en pie, y recomienda una.
                </p>
              </div>

              {/* Lo que TORNS hace, dicho en una imagen: la pantalla del operador,
                  con el detector marcando a cada persona del andén. */}
              <figure className="monitor" data-entra>
                <div className="monitor-pantalla campo-cabina">
                  <Anden />
                </div>
                <figcaption className="monitor-pie">
                  La pantalla del centro de control: el detector marca a cada persona del andén y
                  entrega el conteo. Ilustración del producto.
                </figcaption>
              </figure>
            </div>

            <div data-entra>
              <Escenario
                entrada={entrada}
                errores={errores}
                carga={salida.ok ? salida.carga : null}
                alCambiar={setEntrada}
                alRestablecer={restablecer}
              />
            </div>
          </div>
        </section>

        {salida.ok ? (
          <>
            <Recomendacion salida={salida} />
            <Alternativas salida={salida} />
            <Graficos salida={salida} />
          </>
        ) : (
          <section className="banda campo-blanco" aria-labelledby="titulo-sin-calculo">
            <div className="banda-interior">
              <h2 id="titulo-sin-calculo" className="banda-titulo">
                El modelo no calculó nada
              </h2>
              <p className="banda-bajada">
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
            </div>
          </section>
        )}

        <Ficha />
        <Glosario />
      </main>

      <footer className="pie campo-azul">
        <div className="pie-interior">
          <div className="pie-cabecera">
            <img className="pie-logo" src={LOGO} alt="LIRN" width={1020} height={308} />
            <p className="pie-lema">
              Simulador de arquitecturas de despliegue de TORNS. Compara tres formas de desplegar
              el mismo prototipo y recomienda una, con reglas reproducibles.
            </p>
          </div>

          <div className="pie-columnas">
            <section aria-labelledby="pie-equipo">
              <h2 className="pie-grupo-titulo" id="pie-equipo">
                Equipo
              </h2>
              <ul className="pie-lista">
                {FIRMA.equipo.map((persona) => (
                  <li key={persona}>{persona}</li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="pie-proyecto">
              <h2 className="pie-grupo-titulo" id="pie-proyecto">
                Proyecto
              </h2>
              <ul className="pie-lista">
                <li>
                  {FIRMA.nombre}
                  <span className="pie-detalle">Firma</span>
                </li>
                <li>
                  {FIRMA.producto}
                  <span className="pie-detalle">Producto único</span>
                </li>
                <li>
                  Transmilenio
                  <span className="pie-detalle">Caso de estudio, no cliente</span>
                </li>
              </ul>
            </section>

            <section aria-labelledby="pie-alcance">
              <h2 className="pie-grupo-titulo" id="pie-alcance">
                Alcance
              </h2>
              <ul className="pie-lista">
                <li>
                  Arquitecturas de despliegue
                  <span className="pie-detalle">Lo que este simulador compara</span>
                </li>
                <li>
                  Despacho de trenes
                  <span className="pie-detalle">Contexto del producto: no se simula</span>
                </li>
                <li>
                  Acierto del detector
                  <span className="pie-detalle">Fuera del modelo</span>
                </li>
              </ul>
            </section>

            <section aria-labelledby="pie-datos">
              <h2 className="pie-grupo-titulo" id="pie-datos">
                Tratamiento de datos
              </h2>
              <ul className="pie-lista">
                <li>
                  Ley 1581 de 2012
                  <span className="pie-detalle">No identifica personas ni hace biometría</span>
                </li>
                <li>
                  Solo conteo
                  <span className="pie-detalle">El sistema cuenta, no reconoce</span>
                </li>
                <li>
                  Sin integración real
                  <span className="pie-detalle">Ni cámaras en producción ni control real</span>
                </li>
              </ul>
            </section>
          </div>

          <div className="pie-legal">
            <p>
              Toda cifra de esta página es una estimación del modelo, calculada con parámetros del
              taller. No es una medición de un sistema real.
            </p>
            <p>LIRN · {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
