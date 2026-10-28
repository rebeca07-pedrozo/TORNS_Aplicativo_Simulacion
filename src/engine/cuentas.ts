/**
 * La memoria de cálculo de cada indicador.
 *
 * El criterio de evaluación pide una relación verificable entre las variables
 * de entrada, las reglas del modelo y los resultados. En pantalla se ve que la
 * latencia de la alternativa 1 vale 180 ms; esto es lo que falta para poder
 * comprobarlo: la fórmula, la misma fórmula con los valores de este escenario
 * puestos, y el resultado.
 *
 * Vive en el motor y no en la interfaz a propósito: la sustitución se arma con
 * las mismas constantes que hacen el cálculo, así que no puede desviarse de él.
 */

import {
  A_PISO,
  C_CPU,
  L_MAX,
  NET_1,
  NET_2,
  NET_3,
  R_MAX,
  T_CPU,
  T_EDGE,
  TLS_JSON,
  TLS_VIDEO,
} from './constants';
import { formatearA, formatearC, formatearL, formatearRho } from './redondeo';
import type { Escenario, IdAlternativa, ResultadoAlternativa } from './types';

export interface Cuenta {
  /** La regla del modelo, con los nombres de las variables. */
  formula: string;
  /** La misma regla con los valores de este escenario sustituidos. */
  sustitucion: string;
  /** El resultado, formateado como se muestra. */
  resultado: string;
  /** Aclaración, cuando la cuenta la necesita. */
  nota?: string;
}

export type ClaveIndicador = 'C' | 'rho' | 'L' | 'S' | 'A';
export type CuentasAlternativa = Record<ClaveIndicador, Cuenta>;

/** Disponibilidad base de cada alternativa, para poder nombrarla en la cuenta. */
const A_BASE: Record<IdAlternativa, number> = { 1: 93, 2: 97, 3: 94 };

/** Número entero, sin decimales. */
const n = (x: number) => String(x);

function cuentaCapacidad(id: IdAlternativa, K: number, C: number): Cuenta {
  const resultado = formatearC(C);
  switch (id) {
    case 1:
      return {
        formula: 'C = 1000 / T_CPU',
        sustitucion: `C = 1000 / ${T_CPU}`,
        resultado,
        nota: 'Un solo proceso en un PC, que tarda 80 ms por cuadro.',
      };
    case 2:
      return {
        formula: 'C = mín(K, 4) × (1000 / T_CPU)',
        sustitucion: `C = mín(${n(K)}, ${R_MAX}) × (1000 / ${T_CPU}) = ${n(Math.min(K, R_MAX))} × (1000 / ${T_CPU})`,
        resultado,
        nota: `Hasta ${R_MAX} copias del detector trabajando en paralelo.`,
      };
    case 3:
      return {
        formula: 'C = K × (1000 / T_EDGE)',
        sustitucion: `C = ${n(K)} × (1000 / ${T_EDGE})`,
        resultado,
        nota: 'Cada cámara tiene su propio equipo en la estación, más lento por cuadro.',
      };
  }
}

function cuentaOcupacion(id: IdAlternativa, K: number, F: number, C: number, rho: number): Cuenta {
  const resultado = formatearRho(rho);
  if (id === 3) {
    return {
      formula: 'ρ = (F × T_EDGE) / 1000',
      sustitucion: `ρ = (${n(F)} × ${T_EDGE}) / 1000`,
      resultado,
      nota: 'En el borde el cuello de botella es una cámara contra su equipo, no la suma de todas.',
    };
  }
  return {
    formula: 'ρ = (K × F) / C',
    sustitucion: `ρ = (${n(K)} × ${n(F)}) / ${formatearC(C)} = ${n(K * F)} / ${formatearC(C)}`,
    resultado,
    nota: 'La carga total dividida por lo que la arquitectura alcanza a analizar.',
  };
}

function cuentaLatencia(
  id: IdAlternativa,
  K: number,
  E: boolean,
  L: number,
  saturada: boolean,
): Cuenta {
  const resultado = formatearL(L);
  if (saturada) {
    return {
      formula: 'si ρ ≥ 1 → L = 10000',
      sustitucion: 'ρ llegó a 1 o más, así que no se aplica la fórmula de latencia',
      resultado,
      nota: 'La arquitectura no da abasto. El modelo no simula colas: corta en seco.',
    };
  }
  switch (id) {
    case 1:
      return {
        formula: 'L = T_CPU × K + NET_1',
        sustitucion: `L = ${T_CPU} × ${n(K)} + ${NET_1}`,
        resultado,
        nota: 'Las cámaras se analizan una tras otra. Esta alternativa nunca cifra.',
      };
    case 2: {
      const copias = Math.min(K, R_MAX);
      const rondas = Math.ceil(K / copias);
      const recargo = E ? TLS_VIDEO : 0;
      return {
        formula: 'L = T_CPU × techo(K / mín(K, 4)) + NET_2 + (cifrado ? TLS_VIDEO : 0)',
        sustitucion: `L = ${T_CPU} × techo(${n(K)} / ${n(copias)}) + ${NET_2} + ${recargo} = ${T_CPU} × ${n(rondas)} + ${NET_2} + ${recargo}`,
        resultado,
        nota: E
          ? 'Las cámaras se reparten entre las copias. Cifrar un video cuesta 25 ms.'
          : 'Las cámaras se reparten entre las copias. Sin exigencia de cifrado, no hay recargo.',
      };
    }
    case 3: {
      const recargo = E ? TLS_JSON : 0;
      return {
        formula: 'L = T_EDGE + NET_3 + (cifrado ? TLS_JSON : 0)',
        sustitucion: `L = ${T_EDGE} + ${NET_3} + ${recargo}`,
        resultado,
        nota: E
          ? 'Al centro solo viaja un número, y cifrar un mensaje corto cuesta 4 ms.'
          : 'Al centro solo viaja un número, por eso el tramo de red es el más corto.',
      };
    }
  }
}

function cuentaEscalabilidad(C: number, F: number, S: number): Cuenta {
  return {
    formula: 'S = parte entera de (C / F)',
    sustitucion: `S = parte entera de (${formatearC(C)} / ${n(F)})`,
    resultado: n(S),
    nota: 'La división se hace con la capacidad sin redondear y solo al final se toma la parte entera.',
  };
}

function cuentaDisponibilidad(id: IdAlternativa, rho: number, A: number, saturada: boolean): Cuenta {
  const base = A_BASE[id];
  const resultado = formatearA(A);
  const piso = A <= A_PISO ? ` El resultado nunca baja de ${A_PISO}.` : '';
  if (saturada) {
    return {
      formula: 'si ρ ≥ 1 → A = A_base − 15',
      sustitucion: `A = ${n(base)} − 15`,
      resultado,
      nota: `Base de ${n(base)} % para esta arquitectura, con el castigo por saturación.${piso}`,
    };
  }
  const exceso = Math.max(0, rho - 0.7);
  return {
    formula: 'A = A_base − 20 × máx(0, ρ − 0,7)',
    sustitucion: `A = ${n(base)} − 20 × máx(0; ${formatearRho(rho)} − 0,7) = ${n(base)} − 20 × ${formatearRho(exceso)}`,
    resultado,
    nota:
      exceso > 0
        ? `Base de ${n(base)} %. La ocupación pasó de 0,7, así que se castiga.${piso}`
        : `Base de ${n(base)} %. La ocupación no pasó de 0,7, así que no hay castigo.${piso}`,
  };
}

/**
 * Arma la memoria de cálculo de los cinco indicadores de una alternativa.
 */
export function cuentasDe(a: ResultadoAlternativa, { K, E, F }: Escenario): CuentasAlternativa {
  return {
    C: cuentaCapacidad(a.id, K, a.C),
    rho: cuentaOcupacion(a.id, K, F, a.C, a.rho),
    L: cuentaLatencia(a.id, K, E, a.L, a.saturada),
    S: cuentaEscalabilidad(a.C, F, a.S),
    A: cuentaDisponibilidad(a.id, a.rho, a.A, a.saturada),
  };
}

/** La carga, que es la entrada del resto de cuentas. */
export function cuentaCarga(K: number, F: number): Cuenta {
  return {
    formula: 'Λ = K × F',
    sustitucion: `Λ = ${n(K)} × ${n(F)}`,
    resultado: `${n(K * F)} cuadros/s`,
    nota: 'Cuadros por segundo a analizar, sumando todas las cámaras.',
  };
}

/** Constantes que el modelo da por fijas, para poder citarlas en pantalla. */
export const CONSTANTES_VISIBLES = [
  { simbolo: 'T_CPU', valor: `${T_CPU} ms`, que: 'Lo que tarda un PC en analizar un cuadro.' },
  { simbolo: 'T_EDGE', valor: `${T_EDGE} ms`, que: 'Lo que tarda un equipo de borde en analizar un cuadro.' },
  { simbolo: 'NET_1', valor: `${NET_1} ms`, que: 'Red de la alternativa 1: todo en la misma máquina.' },
  { simbolo: 'NET_2', valor: `${NET_2} ms`, que: 'Red de la alternativa 2: el video anotado viaja al centro.' },
  { simbolo: 'NET_3', valor: `${NET_3} ms`, que: 'Red de la alternativa 3: solo viaja el número.' },
  { simbolo: 'TLS_VIDEO', valor: `${TLS_VIDEO} ms`, que: 'Recargo por cifrar un stream de video.' },
  { simbolo: 'TLS_JSON', valor: `${TLS_JSON} ms`, que: 'Recargo por cifrar un mensaje corto.' },
  { simbolo: 'C_CPU', valor: `${formatearC(C_CPU)} cuadros/s`, que: 'Capacidad de un proceso en CPU: 1000 / T_CPU.' },
  { simbolo: 'R_MAX', valor: `${R_MAX} copias`, que: 'Máximo de copias del detector en la alternativa 2.' },
  { simbolo: 'L_MAX', valor: `${L_MAX} ms`, que: 'Latencia máxima que acepta RQ-01.' },
  { simbolo: 'A_PISO', valor: `${A_PISO} %`, que: 'La disponibilidad nunca se reporta por debajo de este valor.' },
] as const;
