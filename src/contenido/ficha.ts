/**
 * Requisito 1 — Ficha del proyecto, en modo solo lectura (sección 4 del diseño).
 * Requisito 2 — Las tres alternativas de arquitectura (sección 5).
 *
 * Es contenido fijo: el usuario del simulador configura escenarios, no edita
 * la ficha.
 */

import type { IdAlternativa } from '../engine/types';

export const FIRMA = {
  nombre: 'LIRN',
  producto: 'TORNS',
  funcion:
    'Detectar la demanda en estación con visión por computadora y recomendar la oferta al centro de control.',
  equipo: ['Johel Arias', 'Rebeca Pedrozo Cueto', 'Hanna Cerinza Contreras'],
  casoDeEstudio:
    'Transmilenio es caso de estudio, no cliente. No hay integración con su sistema real.',
} as const;

/** Cómo está hecho hoy el prototipo. */
export const AS_IS: { titulo: string; detalle: string }[] = [
  {
    titulo: 'Un solo proceso',
    detalle:
      'FastAPI y YOLO11s (archivo my_model.pt, clase "person", umbral 0,5) corren dentro del mismo programa, en el mismo PC.',
  },
  {
    titulo: 'Video anotado por MJPEG',
    detalle:
      'El video con las cajitas de detección se envía cuadro tras cuadro hacia la pantalla del operador.',
  },
  {
    titulo: 'Métricas por WebSocket',
    detalle: 'El conteo y los indicadores viajan por una conexión que se mantiene abierta.',
  },
  {
    titulo: 'Regla de despacho',
    detalle:
      'Las personas detectadas se dividen por la capacidad del tren y se redondea hacia arriba, con capacidades de 5, 10 y 15 personas. Es contexto del producto: este simulador no la simula.',
  },
];

/** Quién usa qué. */
export const USUARIOS = [
  {
    rol: 'Usuario primario',
    quien: 'Centro de control y despacho',
    detalle: 'Mira el conteo de personas y decide cuántos trenes mandar.',
  },
  {
    rol: 'Usuario secundario',
    quien: 'Evaluador académico',
    detalle: 'Revisa que el modelo sea reproducible y que las decisiones se puedan explicar.',
  },
  {
    rol: 'Usuario del simulador',
    quien: 'Quien abre esta página',
    detalle: 'Configura escenarios para comparar arquitecturas. No opera trenes.',
  },
] as const;

export interface RequisitoCalidad {
  id: string;
  titulo: string;
  explicacion: string;
  tipo: 'obligatorio' | 'puntuado' | 'informativo';
}

/** Requisitos de calidad (sección 4). */
export const REQUISITOS: RequisitoCalidad[] = [
  {
    id: 'RQ-01',
    titulo: 'Latencia de recomendación',
    explicacion:
      'El conteo debe llegar al operador en 1000 milisegundos o menos. Si no, la alternativa queda descalificada.',
    tipo: 'obligatorio',
  },
  {
    id: 'RQ-02',
    titulo: 'Protección del video',
    explicacion:
      'Si el escenario exige cifrado, el video de personas no puede viajar legible por la red. Si viaja en claro, la alternativa queda descalificada.',
    tipo: 'obligatorio',
  },
  {
    id: 'RQ-03',
    titulo: 'Escalabilidad',
    explicacion: 'Cuántas cámaras concurrentes aguanta. Suma puntos, no descalifica.',
    tipo: 'puntuado',
  },
  {
    id: 'RQ-04',
    titulo: 'Capacidad de inferencia',
    explicacion:
      'Cuántos cuadros por segundo alcanza a analizar frente a la carga K × F. Suma puntos, no descalifica.',
    tipo: 'puntuado',
  },
  {
    id: 'RQ-05',
    titulo: 'Disponibilidad',
    explicacion:
      'Porcentaje estimado del tiempo en que el servicio de detección sigue respondiendo. Suma puntos, no descalifica.',
    tipo: 'puntuado',
  },
  {
    id: 'RQ-06',
    titulo: 'Empaquetado en contenedores',
    explicacion:
      'Si el software va en cajas aisladas que se arrancan y copian sin mezclarse. Se muestra en pantalla, pero no descalifica ni suma puntos.',
    tipo: 'informativo',
  },
];

/** Restricciones del proyecto (sección 4). */
export const RESTRICCIONES = [
  'Sin integración con el control real ni con cámaras en producción.',
  'Ley 1581 de 2012: el sistema no identifica personas ni hace biometría. Solo las cuenta.',
  'Sin autenticación: el prototipo no tiene control de acceso.',
  'Un solo desarrollador y sin granja de tarjetas gráficas.',
  'Toda salida de este simulador es una estimación del modelo, no una medición real.',
];

export interface Alternativa {
  id: IdAlternativa;
  nombre: string;
  /** Una frase que dice de qué se trata. */
  resumen: string;
  /** Lo que la caracteriza, en lenguaje llano. */
  rasgos: string[];
  /** Qué parte se cae si falla. */
  riesgo: string;
}

/** Requisito 2 — Las tres alternativas (sección 5). Mismo TORNS, mismas K, E, F. */
export const ALTERNATIVAS: Alternativa[] = [
  {
    id: 1,
    nombre: 'Proceso único local',
    resumen: 'Lo que existe hoy: detector, API y recomendación juntos en un solo PC.',
    rasgos: [
      'El conteo solo existe si alguien tiene abierto el video.',
      'No hay copias del detector: una sola pasada por cada cámara, una después de otra.',
      'No cifra: el video de personas viaja en claro.',
      'Nada que instalar aparte. Es la más simple de operar.',
    ],
    riesgo: 'Si ese PC se apaga, no hay sistema. Es un punto único de fallo.',
  },
  {
    id: 2,
    nombre: 'Servicios en contenedores',
    resumen: 'El detector en una caja; la API y la recomendación en otra.',
    rasgos: [
      'El conteo no depende de que alguien esté mirando el video.',
      'Hasta 4 copias del detector trabajando en paralelo.',
      'El video anotado viaja hasta el centro de control; si se pide cifrado, viaja protegido.',
      'Hay que montar y mantener los contenedores: cuesta un poco más operarla.',
    ],
    riesgo:
      'El video completo sigue cruzando la red, así que el tramo de red pesa en la latencia.',
  },
  {
    id: 3,
    nombre: 'Inferencia en el borde',
    resumen: 'El detector corre junto a la cámara, en la estación.',
    rasgos: [
      'Al centro solo llega el número de personas: un mensaje corto.',
      'El video no cruza esa red, así que cifrarlo cuesta casi nada.',
      'Cada estación carga con su propia cámara: sumar cámaras suma equipos.',
      'El equipo de borde es más lento por cuadro que un PC de escritorio.',
    ],
    riesgo:
      'Hay que instalar y mantener un equipo por estación, lejos del centro de control.',
  },
];

/** Las tres preguntas del requisito 3, tal como se muestran en pantalla. */
export const PREGUNTAS = {
  K: '¿Cuántas cámaras hay que analizar al mismo tiempo?',
  E: '¿Hay que cifrar el video de personas?',
  F: '¿Cuántos cuadros por segundo se analizan?',
} as const;

/**
 * Lo que conviene saber antes de mover cada palanca. No repite la pregunta:
 * dice por qué ese número cambia el resultado.
 */
export const PISTAS = {
  K: 'Cada cámara mira un punto del andén. Sumar cámaras es sumar trabajo, y no todas las arquitecturas lo reparten igual.',
  E: 'Cifrar protege el video mientras viaja, pero cuesta milisegundos: muchos si lo que viaja es video, casi ninguno si solo viaja un número.',
  F: 'Analizar más veces por segundo da un conteo más fresco, pero multiplica el trabajo de cada cámara.',
} as const;

export interface PendienteDeValidar {
  /** El supuesto que el modelo da por bueno. */
  supuesto: string;
  /** Lo que habría que medir para confirmarlo o corregirlo. */
  medir: string;
  /** Qué parte del resultado cambia si la medición no coincide. */
  efecto: string;
}

/**
 * Qué haría falta para validar estas conclusiones en una aplicación real.
 *
 * El simulador entrega estimaciones calculadas con parámetros del taller. Esta
 * lista dice, para cada supuesto, qué medición lo confirmaría y qué parte del
 * resultado se movería si la medición no coincidiera.
 */
export const PENDIENTE_DE_VALIDAR: PendienteDeValidar[] = [
  {
    supuesto: 'Un PC analiza un cuadro en 80 ms y un equipo de borde en 110 ms.',
    medir:
      'El tiempo real de inferencia por cuadro, corriendo YOLO11s sobre el hardware que se vaya a usar y con video de la estación, no con video de prueba. Conviene tomar la mediana y el percentil 95, no solo el promedio.',
    efecto:
      'Mueve la capacidad y la latencia de las tres alternativas, y con ellas la ocupación, la escalabilidad y el puntaje. Es el parámetro que más pesa en todo el modelo.',
  },
  {
    supuesto: 'La red tarda 20, 50 y 12 ms según la alternativa, y siempre lo mismo.',
    medir:
      'La latencia real entre la estación y el centro de control, medida a distintas horas, y cuánto varía en hora pico. También el ancho de banda disponible, que es lo que decide si el video anotado de la alternativa 2 llega completo.',
    efecto:
      'Mueve la latencia de las alternativas 2 y 3. Si la red de la estación es peor de lo supuesto, la alternativa 3 gana todavía más margen, porque solo manda un número.',
  },
  {
    supuesto:
      'Si la arquitectura satura, la latencia salta de golpe a 10000 ms. No hay colas ni azar.',
    medir:
      'Cómo se degrada el sistema real cuando la ocupación se acerca a 1: cuánto crece la cola de cuadros pendientes y en qué momento el conteo deja de ser útil para decidir un despacho.',
    efecto:
      'Un sistema real degrada de forma progresiva, no en un escalón. Cerca de la saturación este modelo es pesimista o directamente no aplica.',
  },
  {
    supuesto: 'Las disponibilidades base son 93, 97 y 94 por ciento.',
    medir:
      'El histórico de caídas de cada pieza durante varios meses: el PC del centro, los contenedores y su orquestador, y los equipos instalados en estación. Con eso se calcula una disponibilidad observada en vez de supuesta.',
    efecto:
      'Mueve la nota de disponibilidad, que pesa 0,25 en el puntaje. Es el segundo peso más alto después de la latencia.',
  },
  {
    supuesto: 'Cifrar cuesta 25 ms en un video y 4 ms en un mensaje corto.',
    medir:
      'El costo real de TLS sobre el stream MJPEG y sobre el mensaje de conteo, con el cifrado y los certificados que se vayan a usar, incluyendo el tiempo de establecer la conexión.',
    efecto:
      'Mueve la latencia de las alternativas 2 y 3 solo cuando el escenario exige cifrado. Es el parámetro de menor peso de los cinco.',
  },
  {
    supuesto:
      'El conteo que entrega el detector es correcto. El modelo no evalúa si acierta.',
    medir:
      'El acierto del detector sobre video real de andén: cuántas personas deja de ver con el andén lleno, cuántas cuenta de más, y cómo le afecta la luz y la distancia de la cámara.',
    efecto:
      'No cambia ningún indicador de este simulador, pero decide si el conteo sirve para despachar trenes. Una arquitectura rápida que cuenta mal no resuelve el problema.',
  },
];

/** Supuestos del modelo (sección 8). */
export const SUPUESTOS = [
  'Los 80 ms por cuadro en un PC y los 110 ms en un equipo de borde son parámetros del taller, no mediciones reales.',
  'No hay azar ni colas de espera: si la arquitectura satura, la latencia se reporta directamente como 10000 ms.',
  'No se simula la regla de despacho de trenes ni qué tan bien detecta el modelo de visión.',
  'Toda salida es una estimación del modelo.',
];
