/**
 * Validación de las variables de entrada (sección 2 del diseño).
 *
 * Si algo está fuera de rango o no es del tipo correcto, el motor no calcula
 * y devuelve el error en lenguaje natural: qué campo y cuál es el rango válido.
 */

import { F_MAX, F_MIN, K_MAX, K_MIN } from './constants';
import type { ErrorValidacion } from './types';

/** Nombres largos de cada variable, para redactar los mensajes. */
const NOMBRE_LARGO = {
  K: 'cámaras analizadas al mismo tiempo',
  E: 'exigencia de cifrar el video de personas',
  F: 'cuadros por segundo que se analizan',
} as const;

function validarEntero(
  campo: 'K' | 'F',
  valor: unknown,
  minimo: number,
  maximo: number,
): ErrorValidacion | null {
  const etiqueta = `${campo} (${NOMBRE_LARGO[campo]})`;
  const rango = `un número entero entre ${minimo} y ${maximo}`;

  if (typeof valor !== 'number' || Number.isNaN(valor)) {
    return {
      campo,
      mensaje: `${etiqueta} no tiene un número. Escriba ${rango}.`,
    };
  }
  if (!Number.isFinite(valor)) {
    return {
      campo,
      mensaje: `${etiqueta} no puede ser un valor infinito. Escriba ${rango}.`,
    };
  }
  if (!Number.isInteger(valor)) {
    return {
      campo,
      mensaje: `${etiqueta} tiene decimales (${valor}) y debe ser un número entero. Escriba ${rango}.`,
    };
  }
  if (valor < minimo || valor > maximo) {
    return {
      campo,
      mensaje: `${etiqueta} vale ${valor}, que está fuera del rango permitido. Escriba ${rango}.`,
    };
  }
  return null;
}

function validarBooleano(valor: unknown): ErrorValidacion | null {
  if (typeof valor !== 'boolean') {
    return {
      campo: 'E',
      mensaje: `E (${NOMBRE_LARGO.E}) debe responderse con sí o con no. No se admite ningún otro valor.`,
    };
  }
  return null;
}

/**
 * Revisa un escenario y devuelve la lista de errores.
 * Lista vacía significa que el escenario es válido y el motor puede calcular.
 */
export function validarEscenario(entrada: {
  K?: unknown;
  E?: unknown;
  F?: unknown;
}): ErrorValidacion[] {
  const errores: ErrorValidacion[] = [];

  const errorK = validarEntero('K', entrada.K, K_MIN, K_MAX);
  if (errorK) errores.push(errorK);

  const errorE = validarBooleano(entrada.E);
  if (errorE) errores.push(errorE);

  const errorF = validarEntero('F', entrada.F, F_MIN, F_MAX);
  if (errorF) errores.push(errorF);

  return errores;
}
