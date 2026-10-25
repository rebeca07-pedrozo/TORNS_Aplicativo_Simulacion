/**
 * Aviso permanente: todo lo que sale del motor es una estimación, no una medida.
 */

export function AvisoEstimacion() {
  return (
    <p className="aviso">
      <span className="aviso-punto" aria-hidden="true" />
      Estimación del modelo. Son cálculos con parámetros del taller, no mediciones de un sistema
      real.
    </p>
  );
}
