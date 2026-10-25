/**
 * Redondeo "mitad al par" sobre el valor binario exacto del número,
 * igual que la función `round` de Python (sección 7.2 del diseño).
 *
 * `toFixed` de JavaScript redondea la mitad hacia arriba, así que no sirve
 * para reproducir la tabla-oráculo. Aquí se reconstruye el valor decimal
 * exacto del double y se redondea con aritmética entera (BigInt), sin
 * perder precisión en ningún paso.
 *
 * Importante: el modelo solo redondea al mostrar. El ganador se decide
 * siempre con el puntaje sin redondear.
 */

const vistaBits = new DataView(new ArrayBuffer(8));

/**
 * Descompone un double en su valor decimal exacto: |x| = digitos × 10^(-escala).
 * Todo double es un racional diádico, así que esta representación es exacta.
 */
function decimalExacto(x: number): { negativo: boolean; digitos: bigint; escala: number } {
  vistaBits.setFloat64(0, x);
  const bits = vistaBits.getBigUint64(0);

  const negativo = (bits >> 63n) === 1n;
  const expo = Number((bits >> 52n) & 0x7ffn);
  const frac = bits & 0xf_ffff_ffff_ffffn;

  // Subnormales: exponente sesgado 0, sin bit implícito.
  const mantisa = expo === 0 ? frac : frac | (1n << 52n);
  const exponente2 = (expo === 0 ? 1 : expo) - 1075;

  if (exponente2 >= 0) {
    return { negativo, digitos: mantisa << BigInt(exponente2), escala: 0 };
  }
  // m × 2^-k = m × 5^k × 10^-k
  const k = -exponente2;
  return { negativo, digitos: mantisa * 5n ** BigInt(k), escala: k };
}

/** Potencia entera de diez, como BigInt. */
function diezA(n: number): bigint {
  return 10n ** BigInt(n);
}

/**
 * Redondea |x| a `decimales` cifras y devuelve el entero escalado exacto.
 * Es decir: `escalado` tal que |x| ≈ escalado / 10^decimales.
 */
function escalarMitadAlPar(x: number, decimales: number): { negativo: boolean; escalado: bigint } {
  const { negativo, digitos, escala } = decimalExacto(x);

  // Queremos n = round(|x| × 10^decimales) = round(digitos × 10^(decimales - escala)).
  const desplazamiento = decimales - escala;

  let n: bigint;
  if (desplazamiento >= 0) {
    // Ya es entero: no hay nada que redondear.
    n = digitos * diezA(desplazamiento);
  } else {
    const divisor = diezA(-desplazamiento);
    const cociente = digitos / divisor;
    const resto = digitos % divisor;
    const dobleResto = resto * 2n;

    if (dobleResto > divisor) n = cociente + 1n;
    else if (dobleResto < divisor) n = cociente;
    else n = cociente % 2n === 0n ? cociente : cociente + 1n; // empate exacto → al par
  }

  return { negativo, escalado: n };
}

/**
 * Redondea `x` a `decimales` cifras decimales usando "mitad al par".
 * Devuelve un número, listo para comparar o graficar.
 */
export function redondearMitadAlPar(x: number, decimales: number): number {
  if (!Number.isFinite(x)) return x;
  const { negativo, escalado } = escalarMitadAlPar(x, decimales);
  const resultado = Number(escalado) / Math.pow(10, decimales);
  return negativo ? -resultado : resultado;
}

/**
 * Formatea con coma decimal (convención en español) y cifras fijas.
 * Las cifras salen del entero exacto, sin volver a pasar por un flotante.
 */
export function formatear(x: number, decimales: number): string {
  if (!Number.isFinite(x)) return String(x);
  const { negativo, escalado } = escalarMitadAlPar(x, decimales);
  const signo = negativo && escalado !== 0n ? '-' : '';
  const texto = escalado.toString().padStart(decimales + 1, '0');
  if (decimales === 0) return signo + texto;
  const corte = texto.length - decimales;
  return `${signo}${texto.slice(0, corte)},${texto.slice(corte)}`;
}

/** Latencia: entero más cercano (sección 7.2). */
export const formatearL = (L: number) => formatear(L, 0);
/** Capacidad: dos decimales. */
export const formatearC = (C: number) => formatear(C, 2);
/** Ocupación: cuatro decimales. */
export const formatearRho = (rho: number) => formatear(rho, 4);
/** Disponibilidad: un decimal. */
export const formatearA = (A: number) => formatear(A, 1);
/** Puntaje: cuatro decimales, solo para mostrar. */
export const formatearPuntaje = (p: number) => formatear(p, 4);
