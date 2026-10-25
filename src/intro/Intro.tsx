/**
 * Intro cinematográfico: cuenta en pequeño lo que hace TORNS y da paso a la app.
 *
 * Dura menos de 3,2 s y toda la secuencia la orquesta UNA sola gsap.timeline.
 * Solo se animan transform y opacity, así que no hay recálculo de layout en
 * ningún cuadro.
 *
 * - Se puede saltar con el botón, con Escape o tocando la pantalla.
 * - No se repite en cada visita: queda anotado en localStorage.
 * - Con prefers-reduced-motion se muestra el estado final, sin animación.
 * - No bloquea la carga de la app: la app ya está montada debajo.
 */

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useCallback, useEffect, useRef } from 'react';
import { LOGO } from '../recursos';
import EscenaControl, { DETECCIONES } from './EscenaControl';
import './intro.css';

/** Capacidad de tren que usa el operador en el ejemplo del intro. */
const CAPACIDAD_TREN = 5;
const PERSONAS = DETECCIONES.length;
/** ⌈7 / 5⌉ = 2 trenes. Es la regla de despacho del producto, mostrada como contexto. */
const TRENES = Math.ceil(PERSONAS / CAPACIDAD_TREN);

gsap.registerPlugin(useGSAP);

interface Props {
  /** Se llama cuando el intro termina o cuando el usuario lo salta. */
  alTerminar: () => void;
}

export default function Intro({ alTerminar }: Props) {
  const raiz = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLImageElement>(null);
  const contador = useRef<HTMLSpanElement>(null);
  const linea = useRef<gsap.core.Timeline>(null);

  /** Salta el intro: la línea de tiempo se va al final y la app queda libre. */
  const saltar = useCallback(() => {
    linea.current?.progress(1).kill();
    alTerminar();
  }, [alTerminar]);

  // Escape salta el intro desde cualquier parte, sin tener que buscar el botón.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') saltar();
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [saltar]);

  useGSAP(
    () => {
      const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Con movimiento reducido no hay película: se muestra el resultado y listo.
      if (reducido) {
        if (contador.current) contador.current.textContent = String(PERSONAS).padStart(2, '0');
        gsap.set('.intro-capa', { autoAlpha: 1 });
        gsap.set('.intro-logo', { autoAlpha: 1 });
        const salida = gsap.delayedCall(1.1, alTerminar);
        return () => salida.kill();
      }

      // Posición final del logo: la marca fija de la barra superior de la app.
      // Se mide en vivo para que el aterrizaje caiga exactamente encima.
      const destino = document.querySelector<HTMLElement>('[data-marca-app]');
      const desde = logo.current?.getBoundingClientRect();
      const hasta = destino?.getBoundingClientRect();

      const vuelo =
        desde && hasta && desde.width > 0
          ? {
              x: hasta.left + hasta.width / 2 - (desde.left + desde.width / 2),
              y: hasta.top + hasta.height / 2 - (desde.top + desde.height / 2),
              scale: hasta.width / desde.width,
            }
          : { x: 0, y: 0, scale: 0.18 };

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.5 },
        onComplete: alTerminar,
      });
      linea.current = tl;

      // 1 — El logo aparece y se sostiene un instante.
      tl.addLabel('logo', 0)
        .fromTo(
          '.intro-logo',
          { autoAlpha: 0, scale: 1.08, y: 14 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.46 },
          'logo',
        )

        // 2 — Y se desliza a la esquina superior izquierda, donde se queda.
        .addLabel('vuelo', 0.72)
        .to(
          '.intro-logo',
          { ...vuelo, duration: 0.56, ease: 'power3.inOut' },
          'vuelo',
        )

        // 3 — Se revela la vista del operador: rejilla, tren, andén, cámaras.
        .addLabel('escena', 0.82)
        .fromTo('.escena-rejilla', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 'escena')
        .fromTo(
          '.escena-tren',
          { autoAlpha: 0, scaleY: 0.82, transformOrigin: '50% 100%' },
          { autoAlpha: 1, scaleY: 1, duration: 0.5 },
          'escena+=0.04',
        )
        .fromTo(
          '.escena-anden',
          { autoAlpha: 0, scaleX: 0, transformOrigin: '0% 50%' },
          { autoAlpha: 1, scaleX: 1, duration: 0.52 },
          'escena+=0.08',
        )
        .fromTo(
          '.escena-camaras > g',
          { autoAlpha: 0, y: -16 },
          { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.08 },
          'escena+=0.12',
        )
        .fromTo(
          '.escena-conos',
          { autoAlpha: 0, scaleY: 0.5, transformOrigin: '50% 25%' },
          { autoAlpha: 1, scaleY: 1, duration: 0.46 },
          'escena+=0.24',
        )
        .fromTo('.intro-hud', { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 'escena+=0.2')

        // 4 — Llegan las personas al andén.
        .addLabel('gente', 1.36)
        .fromTo(
          '.persona',
          { autoAlpha: 0, xPercent: -50, y: 22, scale: 0.9 },
          { autoAlpha: 1, xPercent: -50, y: 0, scale: 1, duration: 0.38, stagger: 0.06 },
          'gente',
        )

        // 5 — El detector las marca y el contador sube de 00 a 07.
        .addLabel('deteccion', 1.62)
        .fromTo(
          '.caja',
          { autoAlpha: 0, scale: 0.86, transformOrigin: '50% 100%' },
          { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.055, ease: 'back.out(2)' },
          'deteccion',
        )
        .to(
          { n: 0 },
          {
            n: PERSONAS,
            duration: 0.72,
            ease: 'power2.out',
            onUpdate() {
              const valor = Math.round(this.targets()[0].n as number);
              if (contador.current) contador.current.textContent = String(valor).padStart(2, '0');
            },
          },
          'deteccion',
        )

        // Y aparece la decisión del operador.
        .fromTo(
          '.intro-decision',
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.36 },
          'deteccion+=0.46',
        )

        // 6 — El tren entra a toda velocidad y cierra el intro.
        .addLabel('tren', 2.34)
        // El recorrido va de "fuera por la izquierda" a "fuera por la derecha":
        // el elemento mide 120 % del ancho, así que -105 % lo deja justo detrás
        // del borde y +95 % lo saca por completo. Velocidad casi constante,
        // que es como pasa un tren.
        .fromTo(
          '.intro-expreso',
          { xPercent: -105, autoAlpha: 1 },
          { xPercent: 95, duration: 0.66, ease: 'power1.in' },
          'tren',
        )
        .to('.intro-capa', { autoAlpha: 0, duration: 0.3 }, 'tren+=0.26')
        .to('.intro-expreso', { autoAlpha: 0, duration: 0.18 }, 'tren+=0.54')
        .to('.intro-telon', { autoAlpha: 0, duration: 0.28 }, 'tren+=0.56');
    },
    { scope: raiz },
  );

  return (
    <div
      className="intro-telon"
      ref={raiz}
      onPointerDown={saltar}
      role="presentation"
    >
      {/* El contenido de la película es decorativo: la app real está debajo. */}
      <div className="intro-escenario" aria-hidden="true">
        <div className="intro-capa intro-escena">
          <EscenaControl />

          {/* Las personas y sus cajitas de detección, sobre el andén. */}
          <div className="intro-gente">
            {DETECCIONES.map((d) => (
              <div className="persona" key={d.x} style={{ left: `${d.x}%` }}>
                <svg className="figura" viewBox="0 0 22 44" aria-hidden="true">
                  <circle cx="11" cy="8" r="7" fill="var(--text-2)" />
                  <rect x="2.5" y="18" width="17" height="25" rx="7" fill="var(--text-2)" />
                </svg>
                {/* La cajita del detector encierra a la persona, como en la pantalla real. */}
                <span className="caja">
                  <span className="caja-etiqueta">person {d.confianza}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel del operador */}
        <div className="intro-capa intro-hud">
          <p className="intro-hud-rotulo">Personas detectadas</p>
          <p className="intro-hud-cifra cifra">
            <span ref={contador}>00</span>
          </p>
          <p className="intro-decision cifra">
            [{PERSONAS} / {CAPACIDAD_TREN}] → {TRENES} trenes
          </p>
        </div>

        {/* El tren expreso que cierra la secuencia */}
        <div className="intro-expreso">
          <svg viewBox="0 0 1200 200" preserveAspectRatio="none" aria-hidden="true">
            <path d="M 0 0 L 1120 0 L 1200 100 L 1120 200 L 0 200 Z" fill="var(--torns-deep)" />
            <path d="M 0 0 L 1120 0 L 1200 100 L 1120 200 L 0 200 Z" fill="none" stroke="var(--activity)" strokeWidth="3" />
            {[80, 230, 380, 530, 680, 830, 980].map((x) => (
              <rect key={x} x={x} y="56" width="92" height="52" rx="4" fill="var(--surface-0)" opacity="0.85" />
            ))}
          </svg>
        </div>
      </div>

      {/* El logo: aparece, se sostiene y vuela a la esquina. */}
      <img
        className="intro-logo"
        ref={logo}
        src={LOGO}
        alt=""
        aria-hidden="true"
        width={1194}
        height={360}
        decoding="async"
      />

      <button
        type="button"
        className="intro-saltar"
        onClick={(e) => {
          e.stopPropagation();
          saltar();
        }}
      >
        Saltar intro
      </button>
    </div>
  );
}
