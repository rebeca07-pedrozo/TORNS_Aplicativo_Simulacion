/**
 * Las cinco pruebas mínimas de la sección 7.11, con los valores-oráculo
 * de la sección 7.10. Si alguna falla, el motor dejó de reproducir el modelo.
 */

import { describe, expect, it } from 'vitest';
import { simular } from '../modelo';
import {
  formatearA,
  formatearC,
  formatearL,
  formatearPuntaje,
  formatearRho,
} from '../redondeo';
import type { ResultadoSimulacion } from '../types';

/** Atajo: corre el motor y exige que el escenario haya sido válido. */
function correr(K: number, E: boolean, F: number): ResultadoSimulacion {
  const salida = simular({ K, E, F });
  if (!salida.ok) {
    throw new Error(`El escenario debía ser válido: ${salida.errores.map((e) => e.mensaje).join(' ')}`);
  }
  return salida;
}

/** Atajo: la fila de una alternativa, ya formateada como se muestra en pantalla. */
function fila(salida: ResultadoSimulacion, id: 1 | 2 | 3) {
  const a = salida.alternativas.find((x) => x.id === id)!;
  return {
    C: formatearC(a.C),
    rho: formatearRho(a.rho),
    L: formatearL(a.L),
    S: a.S,
    A: formatearA(a.A),
    cifrado: a.cumpleCifrado,
    contenedores: a.usaContenedores,
    elegible: a.elegible,
    motivo: a.motivoNoElegible,
    puntaje: a.puntaje === null ? null : formatearPuntaje(a.puntaje),
  };
}

describe('Prueba 1 — K fuera de rango no calcula', () => {
  it('K = 0 es inválido y el mensaje cita el rango 1 a 20', () => {
    const salida = simular({ K: 0, E: false, F: 5 });

    expect(salida.ok).toBe(false);
    if (salida.ok) return;

    const errorK = salida.errores.find((e) => e.campo === 'K');
    expect(errorK).toBeDefined();
    expect(errorK!.mensaje).toContain('1');
    expect(errorK!.mensaje).toContain('20');
    // El motor no debe haber calculado nada.
    expect(salida).not.toHaveProperty('alternativas');
  });

  it('K con decimales y F fuera de rango también se rechazan con su rango', () => {
    const decimal = simular({ K: 2.5, E: false, F: 5 });
    expect(decimal.ok).toBe(false);
    if (!decimal.ok) {
      expect(decimal.errores[0].mensaje).toContain('entero');
    }

    const efe = simular({ K: 2, E: false, F: 16 });
    expect(efe.ok).toBe(false);
    if (!efe.ok) {
      const errorF = efe.errores.find((e) => e.campo === 'F')!;
      expect(errorF.mensaje).toContain('1');
      expect(errorF.mensaje).toContain('15');
    }
  });

  it('E que no es sí/no se rechaza', () => {
    const salida = simular({ K: 2, E: 'quizá', F: 5 });
    expect(salida.ok).toBe(false);
    if (!salida.ok) {
      expect(salida.errores.some((e) => e.campo === 'E')).toBe(true);
    }
  });
});

describe('Prueba 2 — escenario de referencia K=2, E=no, F=5', () => {
  const salida = correr(2, false, 5);

  it('reproduce la tabla de la sección 7.10', () => {
    expect(fila(salida, 1)).toEqual({
      C: '12,50',
      rho: '0,8000',
      L: '180',
      S: 2,
      A: '91,0',
      cifrado: true,
      contenedores: false,
      elegible: true,
      motivo: null,
      puntaje: '0,5720',
    });

    expect(fila(salida, 2)).toEqual({
      C: '25,00',
      rho: '0,4000',
      L: '130',
      S: 5,
      A: '97,0',
      cifrado: true,
      contenedores: true,
      elegible: true,
      motivo: null,
      puntaje: '0,6420',
    });

    expect(fila(salida, 3)).toEqual({
      C: '18,18',
      rho: '0,5500',
      L: '122',
      S: 3,
      A: '94,0',
      cifrado: true,
      contenedores: false,
      elegible: true,
      motivo: null,
      puntaje: '0,6068',
    });
  });

  it('recomienda la alternativa 2', () => {
    expect(salida.recomendada).toBe(2);
  });

  it('la carga a analizar es K × F', () => {
    expect(salida.carga).toBe(10);
  });
});

describe('Prueba 3 — K=1, E=no, F=5 gana la alternativa 1', () => {
  const salida = correr(1, false, 5);

  it('recomienda la alternativa 1', () => {
    expect(salida.recomendada).toBe(1);
  });

  it('la latencia de la alternativa 1 es 100 ms', () => {
    expect(formatearL(salida.alternativas[0].L)).toBe('100');
  });

  it('reproduce latencias, escalabilidad, disponibilidad y puntajes del oráculo', () => {
    expect(salida.alternativas.map((a) => formatearL(a.L))).toEqual(['100', '130', '122']);
    expect(salida.alternativas.map((a) => a.S)).toEqual([2, 2, 1]);
    expect(salida.alternativas.map((a) => formatearA(a.A))).toEqual(['93,0', '97,0', '94,0']);
    expect(salida.alternativas.map((a) => formatearPuntaje(a.puntaje!))).toEqual([
      '0,6050',
      '0,5745',
      '0,5596',
    ]);
  });
});

describe('Prueba 4 — K=1, E=sí, F=5 deja fuera la alternativa 1 por cifrado', () => {
  const salida = correr(1, true, 5);

  it('la alternativa 1 no es elegible, y el motivo es el cifrado, no la latencia', () => {
    const alt1 = salida.alternativas[0];
    expect(alt1.elegible).toBe(false);
    expect(alt1.motivoNoElegible).toBe('cifrado');
    expect(alt1.cumpleLatencia).toBe(true);
    expect(formatearL(alt1.L)).toBe('100'); // la latencia sigue siendo 100 ms
    expect(alt1.puntaje).toBeNull(); // sin puntaje: no es elegible
  });

  it('recomienda la alternativa 2', () => {
    expect(salida.recomendada).toBe(2);
  });

  it('reproduce los valores del oráculo para las alternativas 2 y 3', () => {
    const [, alt2, alt3] = salida.alternativas;
    expect(formatearL(alt2.L)).toBe('155');
    expect(formatearA(alt2.A)).toBe('97,0');
    expect(formatearPuntaje(alt2.puntaje!)).toBe('0,5657');

    expect(formatearL(alt3.L)).toBe('126');
    expect(alt3.S).toBe(1);
    expect(formatearA(alt3.A)).toBe('94,0');
    expect(formatearPuntaje(alt3.puntaje!)).toBe('0,5582');
  });
});

describe('Prueba 5 — K=1, E=no, F=15 no deja ninguna elegible', () => {
  const salida = correr(1, false, 15);

  it('las tres saturan y ninguna pasa el requisito de latencia', () => {
    for (const a of salida.alternativas) {
      expect(a.saturada).toBe(true);
      expect(a.rho).toBeGreaterThanOrEqual(1);
      expect(formatearL(a.L)).toBe('10000');
      expect(a.cumpleLatencia).toBe(false);
      expect(a.elegible).toBe(false);
      expect(a.motivoNoElegible).toBe('latencia');
      expect(a.puntaje).toBeNull();
    }
  });

  it('no hay alternativa recomendada', () => {
    expect(salida.recomendada).toBeNull();
    expect(salida.explicacion).toContain('Ninguna alternativa es elegible');
  });
});

describe('Comprobación extra — K=8, E=sí, F=5 gana la alternativa 3', () => {
  const salida = correr(8, true, 5);

  it('reproduce el cuarto ejemplo del oráculo', () => {
    const [alt1, alt2, alt3] = salida.alternativas;

    expect(alt1.cumpleCifrado).toBe(false);
    expect(formatearRho(alt1.rho)).toBe('3,2000');
    expect(formatearL(alt1.L)).toBe('10000');
    expect(alt1.motivoNoElegible).toBe('ambas');

    expect(formatearC(alt2.C)).toBe('50,00');
    expect(formatearRho(alt2.rho)).toBe('0,8000');
    expect(formatearL(alt2.L)).toBe('235');
    expect(alt2.S).toBe(10);
    expect(formatearA(alt2.A)).toBe('95,0');
    expect(formatearPuntaje(alt2.puntaje!)).toBe('0,7252');

    expect(formatearC(alt3.C)).toBe('72,73');
    expect(formatearRho(alt3.rho)).toBe('0,5500');
    expect(formatearL(alt3.L)).toBe('126');
    expect(alt3.S).toBe(14);
    expect(formatearA(alt3.A)).toBe('94,0');
    expect(formatearPuntaje(alt3.puntaje!)).toBe('0,8109');

    expect(salida.recomendada).toBe(3);
  });
});

describe('Precisión y redondeo (sección 7.2)', () => {
  it('el ganador se decide con el puntaje sin redondear', () => {
    const salida = correr(2, false, 5);
    const puntajes = salida.alternativas.map((a) => a.puntaje!);
    // Los puntajes crudos no son los mostrados: llevan toda la cola decimal.
    expect(puntajes[2]).not.toBe(0.6068);
    expect(puntajes[2]).toBeCloseTo(0.6068454545, 10);
    expect(Math.max(...puntajes)).toBe(puntajes[1]);
  });

  it('el redondeo es "mitad al par", como el round de Python', () => {
    expect(formatearPuntaje(0.5)).toBe('0,5000');
    expect(formatearC(0.125)).toBe('0,12'); // empate exacto → baja al par
    expect(formatearC(0.375)).toBe('0,38'); // empate exacto → sube al par
    expect(formatearL(2.5)).toBe('2');
    expect(formatearL(3.5)).toBe('4');
  });
});
