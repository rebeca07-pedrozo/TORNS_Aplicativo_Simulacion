# Simulador de arquitecturas TORNS

Aplicación web que compara tres formas de desplegar el mismo prototipo TORNS y
recomienda una, con reglas reproducibles y verificables.

Publicado en <https://rebeca07-pedrozo.github.io/TORNS_Aplicativo_Simulacion/>

---

## 1. Finalidad

TORNS detecta con visión por computadora cuántas personas esperan en una
estación y recomienda al centro de control cuántos trenes despachar. Ese mismo
software admite varias formas de despliegue, y cada una se comporta distinto en
latencia, capacidad, escalabilidad, disponibilidad y protección del video.

El objeto de comparación de esta aplicación es la **arquitectura de
despliegue**, no el despacho de trenes. La regla de despacho es contexto del
producto y no se simula.

La aplicación cubre los requisitos 1 a 4 del documento de diseño:

| Requisito | Contenido |
|---|---|
| 1 | Ficha del proyecto, en modo solo lectura |
| 2 | Tres alternativas de arquitectura sobre el mismo TORNS |
| 3 | Tres variables de entrada: `K`, `E`, `F` |
| 4 | Modelo analítico determinista y recomendación |

Toda salida es una **estimación del modelo**, calculada con parámetros del
taller. No es una medición de un sistema en producción.

Firma: LIRN. Producto único: TORNS. Equipo: Johel Arias, Rebeca Pedrozo Cueto,
Hanna Cerinza Contreras. Transmilenio es caso de estudio, no cliente.

---

## 2. Funcionamiento

### 2.1 Variables de entrada

| Variable | Pregunta en pantalla | Dominio |
|---|---|---|
| `K` | ¿Cuántas cámaras hay que analizar al mismo tiempo? | entero, 1 a 20 |
| `E` | ¿Hay que cifrar el video de personas? | booleano |
| `F` | ¿Cuántos cuadros por segundo se analizan? | entero, 1 a 15 |

Escenario de referencia: `K = 2`, `E = false`, `F = 5`.

Si una entrada queda fuera de dominio, no es entera o no es un booleano, el
motor no calcula y devuelve un error en lenguaje natural que indica el campo
afectado y su rango válido. La aplicación acepta escritura libre en los campos
numéricos precisamente para que ese comportamiento sea observable.

### 2.2 Alternativas comparadas

| Alternativa | Descripción | Cifrado | Contenedores |
|---|---|---|---|
| 1. Proceso único local | Detector, API y recomendación en el mismo proceso y la misma máquina | No cifra | No |
| 2. Servicios en contenedores | Detector en un contenedor; API y recomendación en otro. Hasta cuatro réplicas del detector | Cifra si se exige | Sí |
| 3. Inferencia en el borde | Detector junto a la cámara; al centro solo viaja el conteo | Cifra si se exige | No |

### 2.3 Indicadores de salida

Por alternativa: capacidad `C`, ocupación `ρ`, latencia `L`, escalabilidad `S`,
disponibilidad `A`, cumplimiento de cifrado, uso de contenedores, elegibilidad y
puntaje. De forma global: alternativa recomendada, o la ausencia de recomendación
con el umbral que falló en cada alternativa.

### 2.4 Criterio de elegibilidad y recomendación

Una alternativa es elegible si cumple los dos requisitos obligatorios:

- **RQ-01**: latencia menor o igual a 1000 ms.
- **RQ-02**: si `E` es verdadero, el video de personas no viaja en claro.

El puntaje solo se calcula para las elegibles. Combina cuatro indicadores
normalizados y descuenta la complejidad de operación:

```
N_L = max(0, (1000 - L) / 1000)
N_A = A / 100
N_S = min(1, S / 20)
N_C = min(1, C / 50)

puntaje = 0,35·N_L + 0,25·N_A + 0,20·N_S + 0,15·N_C - complejidad
```

La recomendación es la elegible de mayor puntaje. En caso de empate decide la
menor latencia; si persiste, el menor número de alternativa.

### 2.5 Trazabilidad del cálculo

La aplicación permite seguir la cadena completa desde las entradas hasta la
recomendación, sin salir de la pantalla.

La recomendación muestra la descomposición de su puntaje: cada indicador con su
nota, su peso y lo que aporta, el descuento por complejidad y el total.

En los resultados por alternativa, el control "Ver cómo se calcula cada
indicador" despliega bajo cada valor la regla del modelo, esa misma regla con
los valores del escenario sustituidos y el resultado. Por ejemplo, para la
alternativa 1 en el escenario de referencia:

```
L = T_CPU × K + NET_1
L = 80 × 2 + 20 = 180 ms
```

La sustitución se arma en `src/engine/cuentas.ts`, con las mismas constantes que
hacen el cálculo, de modo que no puede desviarse de él. Junto a las cuentas se
listan las constantes que el modelo da por fijas.

### 2.6 Precisión y redondeo

El cálculo se hace en coma flotante y **solo se redondea al mostrar**: latencia
al entero más cercano, capacidad a dos decimales, ocupación a cuatro,
disponibilidad a uno y puntaje a cuatro. La comparación entre alternativas usa
siempre el valor sin redondear.

El redondeo es mitad al par, igual que la función `round` de Python. JavaScript
redondea la mitad hacia arriba, por lo que `src/engine/redondeo.ts` reconstruye
el valor decimal exacto del número en coma flotante mediante aritmética entera
con `BigInt` y aplica el redondeo sobre esa representación. Sin esto, varios
puntajes difieren en la última cifra respecto a la tabla de referencia.

---

## 3. Construcción

### 3.1 Stack

| Capa | Tecnología |
|---|---|
| Interfaz | React 19 con TypeScript en modo estricto |
| Empaquetado | Vite 7 |
| Animación | GSAP 3 con `@gsap/react` |
| Pruebas | Vitest 5 |
| Publicación | GitHub Actions a GitHub Pages |

No se usan bibliotecas de componentes ni de gráficos. Las barras comparativas y
las ilustraciones son SVG y CSS escritos para este proyecto.

### 3.2 Estructura

```
src/
  engine/       el modelo, en funciones puras, y sus pruebas
  contenido/    ficha del proyecto, alternativas y glosario
  intro/        secuencia de apertura y la escena del andén
  app/          interfaz del simulador
  styles/       tokens.css (paleta y campos), fuentes.css, global.css
  recursos.ts   rutas a los archivos públicos, con el prefijo de despliegue
public/
  lirn-logo.png, lirn-icono.png
  fuentes/      Manrope, servida desde el propio sitio
.github/workflows/
  deploy.yml    compila, prueba y publica
```

### 3.3 El motor

`src/engine/` son funciones puras. No invocan al detector, ni a la API, ni a
cámaras: reciben un escenario, lo validan y devuelven la salida completa. Esto
permite ejecutarlo en pruebas sin ningún entorno y recalcular en cada pulsación
sin coste perceptible, por lo que la interfaz no necesita un botón de calcular.

| Archivo | Responsabilidad |
|---|---|
| `constants.ts` | Constantes fijas del modelo |
| `types.ts` | Contrato de entrada y salida |
| `validacion.ts` | Validación de dominio con mensajes en lenguaje natural |
| `modelo.ts` | Capacidad, ocupación, latencia, escalabilidad, disponibilidad, puntaje y recomendación |
| `redondeo.ts` | Redondeo mitad al par sobre el valor binario exacto |

### 3.4 Verificación

`src/engine/__tests__/modelo.test.ts` implementa las cinco pruebas mínimas de la
sección 7.11 del diseño contra los valores de referencia de la sección 7.10, más
el escenario `K=8, E=sí, F=5` y las reglas de redondeo.

1. `K = 0` es inválido: no calcula y el mensaje cita el rango 1 a 20.
2. `K=2, E=no, F=5` reproduce la tabla de referencia; recomienda la alternativa 2.
3. `K=1, E=no, F=5` recomienda la alternativa 1, con latencia 100 ms.
4. `K=1, E=sí, F=5` descarta la alternativa 1 por cifrado, no por latencia.
5. `K=1, E=no, F=15` no deja ninguna elegible: las tres saturan.

El flujo de publicación ejecuta la revisión de tipos y estas pruebas antes de
compilar. Si fallan, no se publica.

### 3.5 Diseño de la interfaz

La paleta es la del sitio de LIRN y se aplica con el mismo criterio: el azul
petróleo `#0b4f78` no es un acento sino el campo de secciones completas, que
alternan con campos blancos y de blanco azulado. Cada sección declara su campo
mediante una clase y eso redefine las variables de fondo, tinta, acento y borde;
los componentes interiores solo consumen esas variables, de modo que el mismo
panel se adapta al campo donde se encuentre.

Criterios aplicados:

- El cian `#00a8ff` queda reservado para los datos y el foco, no para el cromo.
  Sobre cian el texto es negro, única combinación que alcanza el mínimo de
  contraste exigido.
- Ningún estado depende del color para interpretarse. Cada resultado lleva su
  palabra y su marca de forma además del tono, de modo que es legible sin
  distinguir colores.
- El movimiento se concentra en la secuencia de apertura. La aplicación es una
  herramienta: el contenido está presente, no aparece. Solo la primera pantalla
  tiene entrada, y una sola vez.
- Se animan exclusivamente `transform` y `opacity`, por lo que ningún fotograma
  provoca recálculo de disposición.
- La página no realiza peticiones a terceros. Manrope se sirve desde el propio
  sitio, incluyendo el subconjunto griego, necesario para los símbolos `ρ` y `Λ`.

### 3.6 Accesibilidad y adaptación

Verificado a 390, 768, 1440 y 1600 píxeles de ancho:

- Sin desbordamiento horizontal en ningún ancho.
- Contraste por encima del mínimo WCAG AA en la totalidad del texto.
- Un solo `h1`, jerarquía de encabezados sin saltos de nivel, ningún encabezado
  por encima de dos líneas.
- Todo control alcanzable por teclado, con indicador de foco visible y nombre
  accesible.
- Áreas táctiles de 40 píxeles como mínimo.
- `prefers-reduced-motion` sustituye la secuencia de apertura por su estado
  final, sin animación.

---

## 4. Ejecución local

```bash
npm install
npm run dev        # servidor de desarrollo
npm run build      # compila a dist/
npm run preview    # sirve lo compilado
npm test           # pruebas del motor
npm run typecheck  # revisión de tipos
```

`npm run dev` y `npm run preview` sirven la aplicación bajo
`/TORNS_Aplicativo_Simulacion/`, igual que en producción.

---

## 5. Validación pendiente

La aplicación incluye una sección que responde qué haría falta para sostener
estas conclusiones sobre un sistema en producción. Para cada supuesto del modelo
indica la medición que lo confirmaría y qué parte del resultado se movería si la
medición no coincidiera. Cubre el tiempo real de inferencia por cuadro, la
latencia y el ancho de banda de la red de la estación, la degradación con cola
cerca de la saturación, el histórico de caídas frente a las disponibilidades
base, el costo real de TLS y el acierto del detector.

---

## 6. Supuestos y limitaciones

- Los tiempos de 80 ms por cuadro en CPU y 110 ms en equipo de borde son
  parámetros del taller, no mediciones.
- El modelo es determinista: no incorpora azar ni teoría de colas. Si una
  arquitectura satura, la latencia se reporta directamente como 10000 ms.
- No se simula la regla de despacho de trenes ni el acierto del detector.
- No hay integración con cámaras en producción ni con el sistema de control real.
- No hay autenticación: el prototipo no implementa control de acceso.
- Ley 1581 de 2012: el sistema cuenta personas; no las identifica ni aplica
  biometría.

---

## 7. Créditos

Manrope, de Mikhail Sharanda, bajo SIL Open Font License 1.1. El texto de la
licencia está en `public/fuentes/OFL.txt`.
