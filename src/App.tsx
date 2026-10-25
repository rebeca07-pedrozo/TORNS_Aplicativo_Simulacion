/**
 * Arma la página: el intro cinematográfico encima, la app del simulador debajo.
 * La app se monta de una vez, así que el intro nunca bloquea su carga.
 */

import { lazy, Suspense, useCallback, useState } from 'react';
import Simulador from './app/Simulador';

const Intro = lazy(() => import('./intro/Intro'));

/** Marca en el navegador de que esta persona ya vio el intro. */
const CLAVE_INTRO = 'torns:intro-visto';

function yaVioElIntro(): boolean {
  try {
    return window.localStorage.getItem(CLAVE_INTRO) === '1';
  } catch {
    // Navegación privada o almacenamiento bloqueado: se muestra el intro.
    return false;
  }
}

function anotarIntroVisto(): void {
  try {
    window.localStorage.setItem(CLAVE_INTRO, '1');
  } catch {
    // Si no se puede anotar, no pasa nada: solo se repetirá el intro.
  }
}

export default function App() {
  const [mostrarIntro, setMostrarIntro] = useState(() => !yaVioElIntro());

  const cerrarIntro = useCallback(() => {
    anotarIntroVisto();
    setMostrarIntro(false);
  }, []);

  return (
    <>
      <Simulador introActivo={mostrarIntro} alRepetirIntro={() => setMostrarIntro(true)} />
      {mostrarIntro && (
        <Suspense fallback={null}>
          <Intro alTerminar={cerrarIntro} />
        </Suspense>
      )}
    </>
  );
}
