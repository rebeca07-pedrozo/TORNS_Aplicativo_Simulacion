/**
 * De dónde sale el puntaje de la alternativa recomendada.
 *
 * Está en pantalla porque la recomendación tiene que ser explicable: no basta
 * con decir "gana la 2", hay que poder seguir la cuenta.
 */

import { PESOS } from '../engine/modelo';
import { formatear, formatearPuntaje } from '../engine/redondeo';
import type { ResultadoAlternativa } from '../engine/types';

const FILAS = [
  { clave: 'N_L' as const, titulo: 'Latencia', peso: PESOS.N_L },
  { clave: 'N_A' as const, titulo: 'Disponibilidad', peso: PESOS.N_A },
  { clave: 'N_S' as const, titulo: 'Escalabilidad', peso: PESOS.N_S },
  { clave: 'N_C' as const, titulo: 'Capacidad', peso: PESOS.N_C },
];

export default function DesglosePuntaje({ alternativa }: { alternativa: ResultadoAlternativa }) {
  const d = alternativa.desglose;
  if (!d || alternativa.puntaje === null) return null;

  return (
    <div className="desglose">
      <h3 className="desglose-titulo">Cómo se arma ese puntaje</h3>
      <p className="desglose-bajada">
        Cada indicador se lleva a una nota de 0 a 1, se multiplica por su peso y se suman. Al final
        se descuenta lo que cuesta operar esa arquitectura.
      </p>

      <table className="desglose-tabla">
        <thead>
          <tr>
            <th scope="col">Indicador</th>
            <th scope="col">Nota</th>
            <th scope="col">Peso</th>
            <th scope="col">Aporta</th>
          </tr>
        </thead>
        <tbody>
          {FILAS.map((f) => (
            <tr key={f.clave}>
              <th scope="row">{f.titulo}</th>
              <td className="cifra">{formatear(d[f.clave], 4)}</td>
              <td className="cifra">{formatear(f.peso, 2)}</td>
              <td className="cifra">{formatear(d[f.clave] * f.peso, 4)}</td>
            </tr>
          ))}
          <tr className="desglose-descuento">
            <th scope="row">Complejidad de operación</th>
            <td className="cifra" aria-hidden="true">
              —
            </td>
            <td className="cifra" aria-hidden="true">
              —
            </td>
            <td className="cifra">−{formatear(d.complejidad, 4)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Puntaje</th>
            <td aria-hidden="true" />
            <td aria-hidden="true" />
            <td className="cifra">{formatearPuntaje(alternativa.puntaje)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="desglose-nota">
        En pantalla se muestran cuatro decimales, pero la comparación entre alternativas se hace con
        el valor completo, sin redondear.
      </p>
    </div>
  );
}
