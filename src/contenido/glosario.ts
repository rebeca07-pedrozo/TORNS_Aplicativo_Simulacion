/**
 * Regla de lenguaje (sección 2 del diseño): cada etiqueta de pantalla y cada
 * nombre de variable visible debe ir con una frase en español que la explique.
 *
 * Este archivo es la única fuente de esas frases. Si una etiqueta aparece en
 * pantalla sin pasar por aquí, es un error.
 */

export interface Termino {
  /** La clave con la que se busca el término. */
  etiqueta: string;
  /**
   * El símbolo que se muestra en pantalla, cuando el término tiene uno.
   * Las palabras corrientes no llevan símbolo: repetirlas sería ruido.
   */
  simbolo?: string;
  /** El nombre largo, sin jerga. */
  titulo: string;
  /** La frase que lo explica a alguien que lo ve por primera vez. */
  explicacion: string;
  /** Unidad de medida, cuando la tiene. */
  unidad?: string;
}

/** Glosario completo (sección 3 del diseño). */
export const GLOSARIO: Termino[] = [
  {
    etiqueta: 'Arquitectura',
    titulo: 'Arquitectura',
    explicacion: 'Cómo se parte el software y en qué máquina corre cada pieza.',
  },
  {
    etiqueta: 'Detector',
    titulo: 'Detector o inferencia',
    explicacion: 'El modelo de visión que mira cada cuadro del video y cuenta personas.',
  },
  {
    etiqueta: 'API',
    titulo: 'API',
    explicacion: 'El servicio que entrega video, conteo y recomendación a la pantalla del operador.',
  },
  {
    etiqueta: 'Cuadro',
    titulo: 'Cuadro',
    explicacion: 'Una imagen suelta del video, como una foto dentro de la película.',
  },
  {
    etiqueta: 'MJPEG',
    titulo: 'Stream MJPEG',
    explicacion: 'El video en vivo enviado cuadro tras cuadro, una imagen detrás de otra.',
  },
  {
    etiqueta: 'Contenedor',
    titulo: 'Contenedor',
    explicacion:
      'Caja de software que aísla un programa para arrancarlo o copiarlo sin mezclarlo con el resto.',
  },
  {
    etiqueta: 'Borde',
    titulo: 'Borde',
    explicacion: 'Un equipo junto a la cámara, en la estación, no en el centro de control.',
  },
  {
    etiqueta: 'Cifrar',
    titulo: 'Cifrar',
    explicacion:
      'Hacer que el video no viaje legible por la red. Lo contrario es que viaje "en claro".',
  },
  {
    etiqueta: 'TLS',
    titulo: 'TLS',
    explicacion:
      'La forma común de cifrar lo que viaja por la red. Cuesta unos milisegundos extra: más en un video, casi nada en un mensaje corto.',
  },
  {
    etiqueta: 'K',
    simbolo: 'K',
    titulo: 'Cámaras concurrentes',
    explicacion: 'Cuántas cámaras hay que analizar al mismo tiempo.',
    unidad: 'cámaras',
  },
  {
    etiqueta: 'E',
    simbolo: 'E',
    titulo: 'Exigencia de cifrado',
    explicacion: 'Si este escenario exige proteger el video de personas mientras viaja por la red.',
  },
  {
    etiqueta: 'F',
    simbolo: 'F',
    titulo: 'Cuadros por segundo analizados',
    explicacion: 'Cuántas veces por segundo se analiza el video de cada cámara.',
    unidad: 'cuadros/s',
  },
  {
    etiqueta: 'Λ',
    simbolo: 'Λ',
    titulo: 'Carga',
    explicacion: 'Cuadros por segundo que hay que analizar en total. Se calcula como K × F.',
    unidad: 'cuadros/s',
  },
  {
    etiqueta: 'C',
    simbolo: 'C',
    titulo: 'Capacidad',
    explicacion: 'Cuántos cuadros por segundo alcanza a analizar esa arquitectura.',
    unidad: 'cuadros/s',
  },
  {
    etiqueta: 'ρ',
    simbolo: 'ρ',
    titulo: 'Ocupación',
    explicacion:
      'Qué tan llena va la pieza más cargada: su carga dividida por su capacidad. Si llega a 1 o más, no da abasto.',
  },
  {
    etiqueta: 'L',
    simbolo: 'L',
    titulo: 'Latencia',
    explicacion:
      'Milisegundos desde que la cámara toma el cuadro hasta que el operador ve el conteo en pantalla.',
    unidad: 'ms',
  },
  {
    etiqueta: 'S',
    simbolo: 'S',
    titulo: 'Escalabilidad',
    explicacion:
      'Cuántas cámaras aguantaría esta arquitectura a estos cuadros por segundo sin saturarse.',
    unidad: 'cámaras',
  },
  {
    etiqueta: 'A',
    simbolo: 'A',
    titulo: 'Disponibilidad',
    explicacion: 'Porcentaje estimado del tiempo en que el conteo sigue saliendo.',
    unidad: '%',
  },
  {
    etiqueta: 'Elegible',
    titulo: 'Elegible',
    explicacion:
      'Que pasa los dos requisitos obligatorios: entregar el conteo en 1000 ms o menos, y cifrar el video cuando el escenario lo exige.',
  },
  {
    etiqueta: 'Puntaje',
    titulo: 'Puntaje',
    explicacion:
      'Nota única de 0 a 1 que combina latencia, disponibilidad, escalabilidad y capacidad, y descuenta lo que cuesta operar la arquitectura. Solo se calcula para las elegibles.',
  },
  {
    etiqueta: 'Punto único de fallo',
    titulo: 'Punto único de fallo',
    explicacion: 'Si esa pieza se cae, se cae todo el conteo.',
  },
  {
    etiqueta: 'Regla de despacho',
    titulo: 'Regla de despacho',
    explicacion:
      'Las personas detectadas se dividen por la capacidad de un tren y el resultado se redondea hacia arriba: eso da cuántos trenes mandar. Es contexto del producto; este simulador no la simula.',
  },
];

/** Búsqueda rápida por etiqueta, para las ayudas de la interfaz. */
export const PorEtiqueta = new Map(GLOSARIO.map((t) => [t.etiqueta, t]));

/** Devuelve la explicación de una etiqueta del glosario. */
export function explicar(etiqueta: string): string {
  return PorEtiqueta.get(etiqueta)?.explicacion ?? '';
}
