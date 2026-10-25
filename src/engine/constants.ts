/**
 * Constantes fijas del modelo TORNS (sección 7.1 del diseño).
 *
 * Son parámetros del taller, no mediciones reales de laboratorio.
 * No deben modificarse: los ejemplos-oráculo de la sección 7.10 dependen
 * de estos valores exactos.
 */

/** Milisegundos que tarda un PC con CPU en analizar un cuadro. */
export const T_CPU = 80;

/** Milisegundos que tarda un equipo de borde en analizar un cuadro. */
export const T_EDGE = 110;

/** Milisegundos de red de la alternativa 1 (todo en la misma máquina). */
export const NET_1 = 20;

/** Milisegundos de red de la alternativa 2 (video anotado hasta el centro). */
export const NET_2 = 50;

/** Milisegundos de red de la alternativa 3 (solo viaja un número). */
export const NET_3 = 12;

/** Recargo en milisegundos por cifrar un stream de video. */
export const TLS_VIDEO = 25;

/** Recargo en milisegundos por cifrar un mensaje corto de conteo. */
export const TLS_JSON = 4;

/** Máximo de copias del detector que admite la alternativa 2. */
export const R_MAX = 4;

/** Disponibilidad base estimada de cada alternativa, en porcentaje. */
export const A_BASE_1 = 93;
export const A_BASE_2 = 97;
export const A_BASE_3 = 94;

/** Latencia que se reporta cuando la arquitectura se satura (ρ ≥ 1). */
export const L_SAT = 10_000;

/** Umbral obligatorio RQ-01: latencia máxima aceptable, en milisegundos. */
export const L_MAX = 1000;

/** Piso de disponibilidad: nunca se reporta menos de este porcentaje. */
export const A_PISO = 50;

/** Capacidad de un proceso de inferencia en CPU, en cuadros por segundo. */
export const C_CPU = 1000 / T_CPU; // 12,5

/** Capacidad de un equipo de borde, en cuadros por segundo. */
export const C_EDGE = 1000 / T_EDGE; // ≈ 9,0909

/** Rangos válidos de las variables de entrada (sección 6). */
export const K_MIN = 1;
export const K_MAX = 20;
export const F_MIN = 1;
export const F_MAX = 15;

/** Escenario de referencia (sección 2). */
export const ESCENARIO_REFERENCIA = { K: 2, E: false, F: 5 } as const;
