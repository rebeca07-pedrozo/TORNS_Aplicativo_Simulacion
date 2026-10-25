/**
 * Motor del simulador TORNS (requisito 4, secciones 7.1 a 7.9 del diseño).
 *
 * Son funciones puras: no llaman a YOLO, ni a FastAPI, ni a cámaras.
 * Reciben un escenario {K, E, F} y devuelven la salida por alternativa
 * más la recomendación global.
 *
 * Toda salida es una ESTIMACIÓN DEL MODELO.
 */

import {
  A_BASE_1,
  A_BASE_2,
  A_BASE_3,
  A_PISO,
  C_CPU,
  C_EDGE,
  L_MAX,
  L_SAT,
  NET_1,
  NET_2,
  NET_3,
  R_MAX,
  T_CPU,
  T_EDGE,
  TLS_JSON,
  TLS_VIDEO,
} from './constants';
import type {
  DesglosePuntaje,
  Escenario,
  IdAlternativa,
  MotivoNoElegible,
  ResultadoAlternativa,
  ResultadoSimulacion,
  SalidaMotor,
} from './types';
import { formatearA, formatearL } from './redondeo';
import { validarEscenario } from './validacion';

/** Nombre corto de cada alternativa (sección 5). */
export const NOMBRE_ALTERNATIVA: Record<IdAlternativa, string> = {
  1: 'Proceso único local',
  2: 'Servicios en contenedores',
  3: 'Inferencia en el borde',
};

/** Disponibilidad base de cada alternativa. */
const A_BASE: Record<IdAlternativa, number> = {
  1: A_BASE_1,
  2: A_BASE_2,
  3: A_BASE_3,
};

/**
 * Pesos de los cuatro indicadores puntuados (sección 7.9).
 * Se exportan para que la pantalla pueda mostrar el desglose del puntaje
 * sin volver a escribir los números a mano.
 */
export const PESOS = {
  N_L: 0.35,
  N_A: 0.25,
  N_S: 0.2,
  N_C: 0.15,
} as const;

/** Descuento por complejidad de operación (sección 7.9). */
const COMPLEJIDAD: Record<IdAlternativa, number> = {
  1: 0,
  2: 0.03,
  3: 0.02,
};

/** RQ-06: empaquetado en contenedores (sección 7.8). Se muestra, no descalifica. */
const USA_CONTENEDORES: Record<IdAlternativa, boolean> = {
  1: false,
  2: true,
  3: false,
};

/** 7.3 — Capacidad C, en cuadros por segundo. */
export function capacidad(id: IdAlternativa, K: number): number {
  switch (id) {
    case 1:
      return C_CPU;
    case 2:
      return Math.min(K, R_MAX) * C_CPU;
    case 3:
      return K * C_EDGE;
  }
}

/** 7.4 — Ocupación ρ: carga del cuello de botella dividida por la capacidad. */
export function ocupacion(id: IdAlternativa, K: number, F: number, C: number): number {
  // En el borde cada cámara tiene su propio equipo: el cuello de botella es
  // una sola cámara contra un solo detector, no la suma de todas.
  if (id === 3) return (F * T_EDGE) / 1000;
  return (K * F) / C;
}

/** 7.5 — Latencia L en milisegundos. Solo tiene sentido cuando ρ < 1. */
export function latencia(id: IdAlternativa, K: number, E: boolean): number {
  switch (id) {
    case 1:
      // Un solo proceso analiza las K cámaras en serie. Nunca cifra.
      return T_CPU * K + NET_1 + 0;
    case 2: {
      // Las K cámaras se reparten entre min(K, 4) copias del detector.
      const copias = Math.min(K, R_MAX);
      const rondas = Math.ceil(K / copias);
      return T_CPU * rondas + NET_2 + (E ? TLS_VIDEO : 0);
    }
    case 3:
      // Cada estación analiza lo suyo; al centro solo viaja un número.
      return T_EDGE + NET_3 + (E ? TLS_JSON : 0);
  }
}

/** 7.6 — RQ-02: cumplimiento de cifrado. */
export function cumpleCifrado(id: IdAlternativa, E: boolean): boolean {
  if (!E) return true; // Si no se exige cifrar, las tres cumplen.
  return id !== 1; // La alternativa 1 manda el video en claro.
}

/** 7.7 — Disponibilidad A, en porcentaje. */
export function disponibilidad(id: IdAlternativa, rho: number): number {
  const base = A_BASE[id];
  const estimada = rho >= 1 ? base - 15 : base - 20 * Math.max(0, rho - 0.7);
  return Math.max(A_PISO, estimada);
}

/** 7.2 paso 5 — Escalabilidad S: división real antes del piso. */
export function escalabilidad(C: number, F: number): number {
  return Math.floor(C / F);
}

/** 7.9 — Puntaje ponderado. Solo se calcula para alternativas elegibles. */
export function calcularPuntaje(
  id: IdAlternativa,
  L: number,
  A: number,
  S: number,
  C: number,
): { puntaje: number; desglose: DesglosePuntaje } {
  const desglose: DesglosePuntaje = {
    N_L: Math.max(0, (L_MAX - L) / L_MAX),
    N_A: A / 100,
    N_S: Math.min(1, S / 20),
    N_C: Math.min(1, C / 50),
    complejidad: COMPLEJIDAD[id],
  };

  const puntaje =
    PESOS.N_L * desglose.N_L +
    PESOS.N_A * desglose.N_A +
    PESOS.N_S * desglose.N_S +
    PESOS.N_C * desglose.N_C -
    desglose.complejidad;

  return { puntaje, desglose };
}

/** 7.2 — Orden de cálculo para una alternativa. */
export function evaluarAlternativa(
  id: IdAlternativa,
  { K, E, F }: Escenario,
): ResultadoAlternativa {
  // 1. Capacidad.
  const C = capacidad(id, K);
  // 2. Ocupación.
  const rho = ocupacion(id, K, F, C);
  // 3. Cifrado y contenedores.
  const cifrado = cumpleCifrado(id, E);
  const contenedores = USA_CONTENEDORES[id];
  // 4. Si satura, la latencia se reporta como L_SAT y la disponibilidad cae.
  const saturada = rho >= 1;
  const L = saturada ? L_SAT : latencia(id, K, E);
  const A = disponibilidad(id, rho);
  // 5. Escalabilidad.
  const S = escalabilidad(C, F);
  // 6. Elegibilidad: los dos requisitos obligatorios.
  const cumpleLat = L <= L_MAX;
  const elegible = cumpleLat && cifrado;

  let motivoNoElegible: MotivoNoElegible | null = null;
  if (!elegible) {
    if (!cumpleLat && !cifrado) motivoNoElegible = 'ambas';
    else if (!cumpleLat) motivoNoElegible = 'latencia';
    else motivoNoElegible = 'cifrado';
  }

  // 7. Puntaje solo si es elegible.
  const resultadoPuntaje = elegible ? calcularPuntaje(id, L, A, S, C) : null;

  return {
    id,
    nombre: NOMBRE_ALTERNATIVA[id],
    C,
    rho,
    L,
    S,
    A,
    saturada,
    cumpleCifrado: cifrado,
    usaContenedores: contenedores,
    cumpleLatencia: cumpleLat,
    elegible,
    motivoNoElegible,
    puntaje: resultadoPuntaje ? resultadoPuntaje.puntaje : null,
    desglose: resultadoPuntaje ? resultadoPuntaje.desglose : null,
  };
}

/** Frase que nombra el motivo por el que una alternativa quedó fuera. */
export function frasesMotivo(motivo: MotivoNoElegible): string {
  switch (motivo) {
    case 'latencia':
      return `falló la latencia (RQ-01: el conteo debe llegar en ${L_MAX} ms o menos)`;
    case 'cifrado':
      return 'falló el cifrado (RQ-02: en este escenario el video de personas no puede viajar en claro)';
    case 'ambas':
      return `fallaron las dos: la latencia (RQ-01: máximo ${L_MAX} ms) y el cifrado (RQ-02)`;
  }
}

/**
 * 7.9 — Elige la recomendación entre las elegibles.
 * Mayor puntaje; si empatan, menor latencia; si siguen empatadas, menor número.
 * El ganador se decide con el puntaje SIN redondear.
 */
function elegirRecomendada(alternativas: ResultadoAlternativa[]): {
  recomendada: IdAlternativa | null;
  criterioDesempate: 'puntaje' | 'latencia' | 'numero' | null;
} {
  const elegibles = alternativas.filter((a) => a.elegible);
  if (elegibles.length === 0) return { recomendada: null, criterioDesempate: null };

  const mejorPuntaje = Math.max(...elegibles.map((a) => a.puntaje as number));
  const empatadasEnPuntaje = elegibles.filter((a) => a.puntaje === mejorPuntaje);
  if (empatadasEnPuntaje.length === 1) {
    return { recomendada: empatadasEnPuntaje[0].id, criterioDesempate: 'puntaje' };
  }

  const mejorLatencia = Math.min(...empatadasEnPuntaje.map((a) => a.L));
  const empatadasEnLatencia = empatadasEnPuntaje.filter((a) => a.L === mejorLatencia);
  if (empatadasEnLatencia.length === 1) {
    return { recomendada: empatadasEnLatencia[0].id, criterioDesempate: 'latencia' };
  }

  const menorNumero = empatadasEnLatencia.reduce((a, b) => (a.id <= b.id ? a : b));
  return { recomendada: menorNumero.id, criterioDesempate: 'numero' };
}

/** Redacta la explicación de la recomendación, en lenguaje natural. */
function redactarExplicacion(
  alternativas: ResultadoAlternativa[],
  recomendada: IdAlternativa | null,
  criterio: 'puntaje' | 'latencia' | 'numero' | null,
): string {
  if (recomendada === null) {
    const detalle = alternativas
      .map((a) => `la alternativa ${a.id} (${a.nombre}) porque ${frasesMotivo(a.motivoNoElegible!)}`)
      .join('; ');
    return `Ninguna alternativa es elegible en este escenario: queda fuera ${detalle}. Mientras no se cumplan los dos requisitos obligatorios, el modelo no recomienda ninguna arquitectura.`;
  }

  const ganadora = alternativas.find((a) => a.id === recomendada)!;
  const otrasElegibles = alternativas.filter((a) => a.elegible && a.id !== recomendada);
  const descartadas = alternativas.filter((a) => !a.elegible);

  let frase = `Se recomienda la alternativa ${ganadora.id} (${ganadora.nombre}).`;

  if (criterio === 'puntaje') {
    frase += ` Obtiene el puntaje más alto entre las alternativas que cumplen los dos requisitos obligatorios: entrega el conteo en ${formatearL(ganadora.L)} ms, mantiene una disponibilidad estimada del ${formatearA(ganadora.A)} % y aguantaría ${ganadora.S} cámara${ganadora.S === 1 ? '' : 's'} a estos cuadros por segundo.`;
  } else if (criterio === 'latencia') {
    frase += ` Empata en puntaje con otra alternativa, y el desempate lo gana por latencia: entrega el conteo en ${formatearL(ganadora.L)} ms, que es la menor del empate.`;
  } else {
    frase += ` Empata en puntaje y en latencia con otra alternativa, así que el desempate se resuelve por el criterio final: se escoge el número de alternativa más bajo.`;
  }

  if (otrasElegibles.length > 0) {
    const lista = otrasElegibles.map((a) => `la ${a.id} (${a.nombre})`).join(' y ');
    frase += ` También serían viables ${lista}, pero quedan por debajo en el puntaje.`;
  }

  if (descartadas.length > 0) {
    const lista = descartadas
      .map((a) => `la ${a.id} (${a.nombre}), que ${frasesMotivo(a.motivoNoElegible!)}`)
      .join('; ');
    frase += ` Queda fuera ${lista}.`;
  }

  return frase;
}

/**
 * Punto de entrada del motor.
 * Valida el escenario y, si es válido, calcula las tres alternativas
 * y la recomendación global.
 */
export function simular(entrada: { K?: unknown; E?: unknown; F?: unknown }): SalidaMotor {
  const errores = validarEscenario(entrada);
  if (errores.length > 0) {
    return { ok: false, errores };
  }

  const escenario = entrada as Escenario;
  const ids: IdAlternativa[] = [1, 2, 3];
  const alternativas = ids.map((id) => evaluarAlternativa(id, escenario));

  const { recomendada, criterioDesempate } = elegirRecomendada(alternativas);
  const explicacion = redactarExplicacion(alternativas, recomendada, criterioDesempate);

  const resultado: ResultadoSimulacion = {
    ok: true,
    escenario,
    carga: escenario.K * escenario.F,
    alternativas,
    recomendada,
    explicacion,
    criterioDesempate,
  };
  return resultado;
}
