/** Contrato de entrada y salida del motor (sección 2 del diseño). */

/** Identificador de cada alternativa de arquitectura. */
export type IdAlternativa = 1 | 2 | 3;

/** Escenario que configura el usuario del simulador. */
export interface Escenario {
  /** K — cámaras analizadas al mismo tiempo. Entero de 1 a 20. */
  K: number;
  /** E — si el escenario exige que el video de personas no viaje en claro. */
  E: boolean;
  /** F — cuadros por segundo que se analizan. Entero de 1 a 15. */
  F: number;
}

/** Campos que puede señalar un error de validación. */
export type CampoEscenario = 'K' | 'E' | 'F';

/** Un error de entrada, en lenguaje natural. */
export interface ErrorValidacion {
  /** Campo que está mal. */
  campo: CampoEscenario;
  /** Frase completa en español: qué pasó y cuál es el rango válido. */
  mensaje: string;
}

/** Motivo por el que una alternativa queda fuera. */
export type MotivoNoElegible = 'latencia' | 'cifrado' | 'ambas';

/** Resultado del modelo para una alternativa. */
export interface ResultadoAlternativa {
  id: IdAlternativa;
  /** Nombre corto de la arquitectura. */
  nombre: string;
  /** Capacidad: cuadros por segundo que esta arquitectura puede analizar. */
  C: number;
  /** Ocupación: carga del cuello de botella dividida por la capacidad. */
  rho: number;
  /** Latencia en milisegundos, desde el cuadro hasta el conteo en pantalla. */
  L: number;
  /** Escalabilidad: cámaras que aguantaría a este F sin saturarse. */
  S: number;
  /** Disponibilidad estimada, en porcentaje. */
  A: number;
  /** Si está saturada (ρ ≥ 1), es decir, si no da abasto. */
  saturada: boolean;
  /** RQ-02: si cumple la exigencia de cifrado de este escenario. */
  cumpleCifrado: boolean;
  /** RQ-06: si el prototipo va empaquetado en contenedores. Se muestra, no descalifica. */
  usaContenedores: boolean;
  /** RQ-01: si la latencia estimada está dentro del máximo aceptable. */
  cumpleLatencia: boolean;
  /** Pasa los dos requisitos obligatorios (RQ-01 y RQ-02). */
  elegible: boolean;
  /** Por qué quedó fuera. Vacío (null) cuando es elegible. */
  motivoNoElegible: MotivoNoElegible | null;
  /** Puntaje ponderado. Vacío (null) cuando no es elegible. */
  puntaje: number | null;
  /** Desglose del puntaje, para poder explicarlo en pantalla. */
  desglose: DesglosePuntaje | null;
}

/** Las cuatro notas normalizadas y el descuento que forman el puntaje. */
export interface DesglosePuntaje {
  /** Nota de latencia, entre 0 y 1. */
  N_L: number;
  /** Nota de disponibilidad, entre 0 y 1. */
  N_A: number;
  /** Nota de escalabilidad, entre 0 y 1. */
  N_S: number;
  /** Nota de capacidad, entre 0 y 1. */
  N_C: number;
  /** Descuento por complejidad de operación. */
  complejidad: number;
}

/** Salida completa del motor para un escenario válido. */
export interface ResultadoSimulacion {
  ok: true;
  escenario: Escenario;
  /** Carga total a analizar: Λ = K × F, en cuadros por segundo. */
  carga: number;
  alternativas: ResultadoAlternativa[];
  /** Alternativa recomendada, o null si ninguna es elegible. */
  recomendada: IdAlternativa | null;
  /** Frase que explica por qué ganó, o por qué no hay ganadora. */
  explicacion: string;
  /** Cómo se desempató, cuando hubo empate de puntaje. */
  criterioDesempate: 'puntaje' | 'latencia' | 'numero' | null;
}

/** Salida del motor cuando el escenario no es válido. */
export interface ResultadoInvalido {
  ok: false;
  errores: ErrorValidacion[];
}

export type SalidaMotor = ResultadoSimulacion | ResultadoInvalido;
