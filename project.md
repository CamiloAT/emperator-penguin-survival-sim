# AGRUPACIÓN DE PINGÜINOS EMPERADOR EN EL INVIERNO ANTÁRTICO

**AGUIRRE TENJO DIEGO FERNANDO**

**ARIAS TENJO CAMILO ANDRES**

**SIMULACIÓN DE COMPUTADORES**

**INGENIERO:**

**JOSE OSBALDO ROJAS MORENO**

---

**UNIVERSIDAD PEDAGÓGICA Y TECNOLÓGICA DE COLOMBIA**

**FACULTAD DE INGENIERÍA**

**INGENIERÍA DE SISTEMAS Y COMPUTACIÓN**

/2026

---

## Tabla de Contenido

1. [Definición del Problema](#1-definición-del-problema)
2. [Alcance](#2-alcance)
   - 2.1 [Lo que incluye la simulación](#21-lo-que-incluye-la-simulación)
   - 2.2 [Lo que no incluye la simulación](#22-lo-que-no-incluye-la-simulación)
   - 2.3 [Supuestos del Modelo](#23-supuestos-del-modelo)
3. [Modelo Conceptual](#3-modelo-conceptual)
   - 3.1 [Tipo de Modelo](#31-tipo-de-modelo)
   - 3.2 [Enfoque Metodológico: PASSI](#32-enfoque-metodológico-passi)
   - 3.3 [Componentes del Sistema](#33-componentes-del-sistema)
   - 3.4 [Reglas de Comportamiento](#34-reglas-de-comportamiento)
   - 3.5 [Fases del Invierno Antártico](#35-fases-del-invierno-antártico)
   - 3.6 [Escenarios de Simulación](#36-escenarios-de-simulación)
   - 3.7 [Variables de Entrada y Salida](#37-variables-de-entrada-y-salida)
4. [Implementación Computacional](#4-implementación-computacional)
   - 4.1 [Arquitectura del Software](#41-arquitectura-del-software)
   - 4.2 [Landing Page](#42-landing-page)
   - 4.3 [Panel de Parámetros](#43-panel-de-parámetros)
   - 4.4 [Visualización 2D y 3D](#44-visualización-2d-y-3d)
   - 4.5 [Modales del Sistema](#45-modales-del-sistema)
5. [Conclusiones](#5-conclusiones)

---

## 1. Definición del Problema

Los pingüinos emperador (*Aptenodytes forsteri*) son la especie de pingüino más grande del mundo y habitan la Antártida, uno de los entornos más hostiles del planeta. Durante el invierno antártico, las temperaturas pueden descender hasta los -60°C y los vientos superar los 200 km/h. A diferencia de la mayoría de las aves, los pingüinos emperador se reproducen precisamente en esta época de oscuridad perpetua.

Tras la puesta del huevo a principios del invierno (fase de oviposición entre mayo y junio), las hembras agotan sus reservas energéticas y parten inmediatamente en un viaje de más de 100 km hacia el océano abierto para alimentarse. Esto deja a los machos con la responsabilidad exclusiva de incubar el huevo durante todo el invierno profundo (junio a agosto), soportando un ayuno estricto de entre 110 y 120 días consecutivos. Durante este tiempo, el macho no ingiere ningún alimento y depende únicamente de su capa de grasa corporal. El huevo se mantiene suspendido sobre las patas del pingüino, cubierto por un pliegue de piel densamente plumas conocida como la "bolsa de incubación", que lo mantiene a unos 36 °C.

Ante estas condiciones extremas, los pingüinos han desarrollado el *huddle* o agrupamiento. La posición dentro del grupo no es estática: los individuos de los bordes exteriores se mueven gradualmente hacia el interior, generando un movimiento continuo. Sin embargo, este desplazamiento colectivo masivo y la alta densidad de la aglomeración incrementan el riesgo de perturbaciones mecánicas: choques, tropezones o empujones entre los agentes. Si un macho pierde el contacto con su huevo y este cae al hielo descubierto, el embrión se enfrenta a una ventana crítica de supervivencia hidrotérmica: debido al frío extremo y al efecto del viento, **el huevo se vuelve inviable (muere) en un lapso de 1 a 3 minutos** si no es recuperado inmediatamente.

El problema que se desea estudiar mediante simulación es: ¿cómo logra una colonia de pingüinos emperador autorregularse para maximizar la supervivencia del grupo y de sus embriones, balanceando la necesidad termodinámica de rotación del *huddle* con el riesgo estocástico de pérdida y congelación de huevos bajo las distintas fases del invierno antártico?

---

## 2. Alcance

El alcance de este proyecto define con claridad qué aspectos del fenómeno son incluidos en la simulación, cuáles quedan fuera, y cuáles son las suposiciones adoptadas para simplificar el modelo sin perder su esencia.

### 2.1 Lo que incluye la simulación

* Una colonia de pingüinos representada por un número configurable de agentes (individuos), entre **20 y 200**, con características individuales como temperatura corporal, nivel de energía y posición dentro del grupo. El valor por defecto es de 80 individuos.
* Un entorno con temperatura ambiente variable que simula las condiciones del invierno antártico, incluyendo la dirección e intensidad del viento.
* El comportamiento de movimiento de los pingüinos: los individuos de los bordes se desplazan hacia el interior cuando su temperatura corporal cae por debajo de un umbral crítico configurable (por defecto 34 °C).
* La transferencia de calor entre individuos vecinos y la pérdida de calor hacia el ambiente exterior, esta última mayor en los individuos del borde expuesto al viento.
* El consumo de energía de cada individuo a lo largo del tiempo, y la posibilidad de que un individuo no sobreviva si su energía llega a cero o si su temperatura corporal desciende por debajo del umbral letal de hipotermia (por defecto 28 °C).
* Indicadores de resultado como: temperatura promedio del grupo, tasa de supervivencia, tiempo promedio en el borde vs. el centro, eficiencia energética colectiva, distribución de muertes y registro cronológico de eventos.
* Un ciclo temporal dividido en las **Fases del Invierno Antártico**, con una duración total de **92 días**: Fase de Inicio de Incubación (Junio, 30 días), Fase de Invierno Profundo (Julio, 31 días) y Fase de Pre-Eclosión (Agosto, 31 días).
* El estado fisiológico de ayuno crónico en los agentes machos, modelado como una tasa de decaimiento energético base que se acelera con el estrés térmico y con un multiplicador propio de cada fase.
* La simulación del "Objeto Huevo" asociado a una proporción de los agentes, el cual posee una variable de estado (*Estable*, *Expuesto*, *Congelado*) y un temporizador de exposición crítico.
* **Eventos estocásticos de pérdida de huevo** causados por la densidad de contacto físico y la velocidad de movimiento de los agentes dentro del *huddle*, con probabilidades diferenciadas para el interior y el borde.
* Un temporizador de enfriamiento crítico (*Cooling Timer*) para los huevos expuestos al hielo, dependiente de la temperatura exterior y la velocidad del viento, con un valor por defecto de 180 segundos.
* **Escenarios preconfigurados** que el usuario puede activar para estudiar condiciones climáticas específicas: Línea Base, Invierno Prolongado y Tormentas Superiores.
* Una **interfaz web** con Landing Page educativa, panel de parámetros, visualización 2D y 3D, modales informativos y modales de resultados.
* **Modales de configuración** que permiten ajustar parámetros de simulación, colores del modelo, selección de personaje y configuración avanzada.

### 2.2 Lo que no incluye la simulación

* No se modelará el cortejo, la cópula ni la producción del huevo. La simulación inicia inmediatamente después de que las hembras parten al mar. Tampoco se simula la alimentación de la cría post-eclosión.
* No se consideran diferencias anatómicas entre individuos como el tamaño corporal o el grosor de la capa de grasa.
* No se modela la búsqueda de alimento ni el regreso al mar, ya que la simulación se enfoca únicamente en el período de invierno en tierra.
* No se simulan interacciones sociales más complejas como jerarquías, agresión o comunicación verbal entre individuos.
* El terreno se considerará plano y homogéneo, sin accidentes geográficos como crestas de hielo o pendientes.

### 2.3 Supuestos del Modelo

* Todos los pingüinos comienzan con el mismo nivel de energía inicial (100%) y la misma temperatura corporal (38 °C) al inicio de la simulación.
* La transferencia de calor entre individuos es proporcional a la diferencia de temperatura entre ellos y al número de vecinos directos, siguiendo una tasa de transferencia configurable.
* El movimiento hacia el interior es determinista: si la temperatura de un individuo cae bajo el umbral crítico y se encuentra en el borde, este se moverá al espacio interior disponible más cercano.
* El entorno térmico se modela como una temperatura exterior variable por fase, con valores dentro de rangos definidos y un patrón de viento que cambia a lo largo del tiempo.
* La probabilidad de que un pingüino pierda su huevo aumenta cuando el agente se encuentra en las zonas de mayor turbulencia o reordenamiento del *huddle* (zonas de transición borde-interior).
* Si un agente pierde su huevo, detiene su comportamiento de avance térmico regular y entra en un estado de "búsqueda local" en las celdas adyacentes durante un tiempo límite (rango biológico de 60 a 180 segundos).
* Un huevo en el hielo que no sea recuperado antes de que su temporizador llegue a cero se considera congelado y cuenta como pérdida reproductiva, pero el agente macho continúa en la simulación intentando sobrevivir por sí mismo.
* Aproximadamente un 60% de los pingüinos de la colonia porta un huevo al inicio de la simulación, lo cual representa la proporción biológica realista de machos en etapa de incubación.
* La escala temporal del simulador se fija en 1 paso = 1 minuto, lo que permite modelar con precisión los eventos de enfriamiento rápido del huevo (1 a 3 minutos) frente a los meses de invierno.

---

## 3. Modelo Conceptual

El modelo conceptual describe de manera abstracta los componentes del sistema, sus relaciones y los mecanismos que gobiernan el comportamiento de la simulación, antes de pasar a su implementación computacional.

### 3.1 Tipo de Modelo

Se utiliza un modelo basado en agentes (MBA), también conocido como Agent-Based Model (ABM). Este tipo de simulación es el más adecuado para este problema, ya que permite representar a cada pingüino como un agente autónomo con sus propios atributos y reglas de comportamiento, y observar cómo el comportamiento colectivo emerge a partir de las interacciones individuales.

El espacio de simulación es una cuadrícula bidimensional (grilla) configurable (por defecto 40×40), donde cada celda puede ser ocupada por un pingüino, un huevo caído o estar vacía. El tiempo avanza en pasos discretos (1 paso = 1 minuto), y en cada paso se evalúan las condiciones de cada agente y se actualizan sus atributos y posición.

### 3.2 Enfoque Metodológico: PASSI

El proyecto se adscribe a la metodología **PASSI** (*Process for Agent Societies Specification and Implementation*), un marco de la ingeniería de sistemas multi-agente cuyo modelo de "sociedad de agentes" resulta particularmente adecuado para representar la colonia de pingüinos emperador. PASSI fue seleccionada porque su organización de la colonia como una sociedad de agentes con roles bien definidos, tareas concretas y protocolos de interacción claros se ajusta de manera natural al fenómeno estudiado: cada pingüino cumple un rol, todos se comunican a través de reglas simples, y el resultado global del grupo surge de esas interacciones locales.

La aplicación de los conceptos centrales de PASSI al proyecto se concreta en los siguientes elementos:

* **Sociedad de Agentes:** la colonia entera se modela como una sociedad en la que los pingüinos macho cooperan para sobrevivir al invierno y proteger sus huevos.
* **Roles:** cada pingüino puede adoptar distintos roles a lo largo de la simulación: *pingüino de borde* (expuesto al viento), *pingüino de interior* (protegido por sus vecinos) o *pingüino en búsqueda* (cuando ha perdido su huevo y está intentando recuperarlo).
* **Tareas:** se definen tareas concretas que cada agente ejecuta en cada paso: *moverse* dentro de la grilla, *transferir calor* con los vecinos, *generar calor interno* mediante termogénesis cuando la temperatura corporal es baja, *cuidar el huevo* sobre las patas, y *rescatar el huevo* si se ha caído al hielo.
* **Entorno:** la grilla espacial, el viento, la temperatura y las fases del invierno constituyen el entorno compartido que condiciona el comportamiento de todos los agentes por igual.
* **Interacciones:** el intercambio de calor entre vecinos, las rotaciones de posición en el *huddle* y el protocolo de búsqueda y rescate de huevos constituyen los protocolos formales de interacción entre los agentes.

### 3.3 Componentes del Sistema

#### a) Entidad: Pingüino (Agente)

Cada pingüino es un agente con los siguientes atributos:

* **Posición (x, y):** Coordenada dentro de la grilla.
* **Temperatura corporal (T_corp):** Temperatura interna en °C, que varía según la pérdida o ganancia de calor. Valor inicial 38 °C.
* **Nivel de energía (E):** Reserva energética del individuo (porcentaje de grasa). Disminuye con el tiempo; si llega a 0, el individuo muere. Valor inicial 100%.
* **Umbral de hipotermia:** Temperatura corporal mínima por debajo de la cual el pingüino muere (por defecto 28 °C).
* **Umbral crítico:** Temperatura corporal a la cual el pingüino del borde activa la regla de movimiento hacia el interior (por defecto 34 °C).
* **Estado físico:** Puede ser "en borde" (expuesto al ambiente) o "en interior" (protegido por otros individuos).
* **Estado conductual:** *Normal*, *Buscando Huevo* o *Muerto*.
* **Número de vecinos:** Cantidad de pingüinos adyacentes en la grilla.
* **Tiene Huevo:** Booleano (Verdadero/Falso). Aproximadamente el 60% de los agentes porta un huevo.
* **ID Huevo Asociado:** Identificador único del huevo que porta.
* **Tiempo en borde, en interior y en búsqueda:** Contadores acumulativos para análisis de comportamiento.

#### b) Entidad: Entorno

* **Temperatura exterior (T_ext):** Temperatura del ambiente antártico en cada paso de tiempo, variable según la fase del invierno.
* **Viento (dirección e intensidad):** Factor que incrementa la pérdida de calor en los individuos del borde expuesto.
* **Grilla espacial:** El área bidimensional donde se posicionan los agentes.
* **Fase actual:** Indicador de la etapa del invierno en curso, con su temperatura, viento y multiplicador energético propios.

#### c) Entidad: Huevo (Sub-Agente)

* **ID:** Identificador.
* **Posición (x, y):** Coordenada en la grilla (si es perdido, toma la celda del hielo donde cayó).
* **Estado:** *Estable* (dentro de la bolsa de incubación), *Enfriándose* (en el hielo) o *Congelado*.
* **Tiempo de Exposición:** Contador regresivo en segundos (180 por defecto). Cuando llega a cero, el huevo pasa a estado *Congelado* y el embrión muere.

#### d) Entidad: Tiempo

* **Día actual:** Indicador del día de simulación en curso (1 a 92).
* **Fase actual:** Bloque del invierno en el que se encuentra la simulación.
* **Paso actual:** Unidad mínima de tiempo (1 paso = 1 minuto).
* **Estado de la simulación:** Corriendo, pausada o finalizada.

### 3.4 Reglas de Comportamiento

En cada paso de tiempo, cada agente ejecuta las siguientes reglas en orden:

1. **Actualización del entorno:** El sistema actualiza la temperatura exterior, la intensidad y dirección del viento según la fase del invierno en curso.
2. **Cálculo de pérdida de calor:** Cada agente calcula su pérdida de calor según su posición (borde o interior), la diferencia entre su temperatura corporal y la exterior, y la velocidad del viento. Los agentes del borde pierden calor a una tasa muy superior a los del interior.
3. **Transferencia de calor entre vecinos:** Los pingüinos adyacentes intercambian calor de manera proporcional a la diferencia de temperatura entre ellos.
4. **Termogénesis:** Si un agente dispone de reservas energéticas, puede generar calor interno adicional cuando su temperatura corporal cae por debajo del valor óptimo (38 °C), a costa de un mayor consumo de energía.
5. **Pérdida estocástica del huevo:** Si un agente se mueve y porta un huevo, existe una probabilidad básica P_loss = 0.5% de soltarlo. Si la celda adyacente corresponde al borde expuesto, la probabilidad sube a 1.5% por la inestabilidad mecánica y térmica.
6. **Degradación del huevo expuesto:** Si un huevo pasa al estado *Expuesto*, su temporizador comienza a decrementarse en cada paso.
7. **Comportamiento de recuperación:** El agente que perdió el huevo cambia su estado conductual a *Buscando Huevo* y prioriza moverse hacia la celda donde quedó el huevo sobre cualquier regla de confort térmico.
8. **Muerte del embrión:** Si el temporizador del huevo llega a cero, el huevo pasa a estado *Congelado*. El agente regresa al estado *Normal*, pero con *Tiene_Huevo = Falso*.
9. **Verificación de hipotermia:** Si la temperatura corporal de un agente desciende por debajo del umbral de hipotermia, el agente muere.
10. **Verificación de inanición:** Si la energía de un agente llega a cero, el agente muere, dejando su huevo (si lo porta) permanentemente expuesto.
11. **Decisión de movimiento:** Un agente del borde cuya temperatura corporal ha caído por debajo del umbral crítico intenta moverse al espacio interior disponible más cercano.
12. **Actualización de estadísticas:** Se recalculan y registran los indicadores del sistema (temperatura promedio, número de sobrevivientes, distribución del grupo, etc.).

### 3.5 Fases del Invierno Antártico

La simulación cubre 92 días, organizados en tres fases que reproducen el recrudecimiento progresivo del clima antártico:

| Fase | Nombre | Mes | Duración | Temperatura | Viento | Multiplicador Energético |
|------|--------|-----|----------|-------------|--------|--------------------------|
| 0 | Inicio de Incubación | Junio | 30 días | -25 °C a -35 °C | 40 – 80 km/h | 1.0 |
| 1 | Invierno Profundo | Julio | 31 días | -40 °C a -60 °C | 80 – 200 km/h | 1.5 |
| 2 | Pre-Eclosión | Agosto | 31 días | -20 °C a -30 °C | 50 – 60 km/h | 1.1 |

La fase de Invierno Profundo es la más demandante: el multiplicador energético elevado refleja el estrés metabólico que enfrentan los agentes en el punto más crítico del invierno.

### 3.6 Escenarios de Simulación

La aplicación ofrece al usuario tres escenarios preconfigurados, además de la posibilidad de ajustar libremente los parámetros:

* **Línea Base:** Reproduce las condiciones estándar del invierno antártico. Bajo este escenario se espera una supervivencia media del 80% al 85% de la colonia, manteniendo los parámetros rotacionales predeterminados.
* **Invierno Prolongado:** Modela una prolongación del frío severo extremo, con un estrés general superior al habitual. Esto fuerza una mortalidad selectiva, que afecta principalmente a los agentes más débiles de la colonia.
* **Tormentas Superiores:** Simula ráfagas de viento superiores a 180 km/h, capaces de disolver la integridad estructural de los bordes del *huddle*. El escenario pone de manifiesto el efecto dominó mediante el cual la destrucción de la periferia arrastra la del centro.

### 3.7 Variables de Entrada y Salida

#### Variables de entrada

* **Número de pingüinos en la colonia (N):** Define la población inicial de agentes en la grilla. Configurable entre 20 y 200, en pasos de 5. Representa exclusivamente a la población de machos incubadores. Valor por defecto: 80.
* **Perfil térmico y climático ambiental (Temperatura exterior y Velocidad del viento):** Define la temperatura en grados Celsius y la velocidad del viento en km/h. Estas variables cambian según la fase del invierno para simular el recrudecimiento del clima antártico, alcanzando mínimos de hasta -60 °C y vientos de 200 km/h.
* **Duración de las Fases del Invierno Antártico:** Bloques de tiempo que dividen la simulación en tres etapas biológicas. Configurables en duración, temperatura y viento.
* **Reserva lipídica inicial (Energía inicial) y Tasa de Consumo Energético:** Energía metabólica base con la que inician los machos para afrontar el ayuno prolongado. La tasa de consumo varía dinámicamente: es mínima si el agente está protegido en el interior del *huddle* y muy alta si está expuesto al viento en el borde.
* **Temperatura corporal inicial:** Valor estándar del ave (38 °C por defecto).
* **Umbral crítico de temperatura:** Límite por debajo del cual el agente del borde activa la regla de movimiento hacia el interior del grupo. Configurable entre 30 °C y 37 °C. Valor por defecto: 34 °C.
* **Umbral de hipotermia:** Temperatura corporal por debajo de la cual el pingüino muere. Configurable. Valor por defecto: 28 °C.
* **Probabilidad estocástica de pérdida del huevo (P_pérdida):** Factor de probabilidad (por defecto 0.5% en interior, 1.5% en borde) que determina la posibilidad de que un agente suelte accidentalmente su huevo.
* **Tiempo límite de viabilidad del huevo expuesto (t_max_huevo):** Ventana crítica de congelación en el hielo descubierto. Valor por defecto: 180 segundos.
* **Radio de búsqueda local (R_búsqueda):** Cantidad de celdas adyacentes en las cuales el agente padre, tras perder el huevo, tiene visión para iniciar el protocolo de rastreo y recuperación. Valor por defecto: 2 celdas.
* **Equivalencia del paso de tiempo (Delta_t):** Factor de escala temporal del simulador, fijado en 1 paso = 1 minuto.

#### Variables de salida

* **Tasa de supervivencia de agentes padres:** Porcentaje final de pingüinos machos que logran finalizar la simulación con niveles de energía mayores a cero. Mide la eficiencia del *huddle* como sistema de conservación energética.
* **Tasa de éxito de incubación de huevos:** Porcentaje de huevos que llegan en estado viable al final de la simulación. Es el indicador principal del éxito reproductivo y biológico de la colonia.
* **Censo y distribución de causas de mortalidad:** Contador que diferencia la pérdida de embriones por dos factores específicos: muerte por congelación directa del huevo (cayó al hielo y no fue rescatado) y muerte por inanición del progenitor (el padre murió por agotar sus reservas, dejando el huevo desamparado).
* **Distribución del tiempo por estado conductual:** Tiempo promedio acumulado que los individuos pasan en cada uno de los estados posibles: en el borde (gasto energético alto), en el interior (recuperación térmica) o en estado de búsqueda y rescate en el hielo fuera del grupo.
* **Curva de consumo energético promedio y por fase:** Gráfico del decaimiento de las reservas de grasa de la colonia a lo largo del tiempo. Permite identificar cuál de las tres fases del invierno genera el mayor estrés metabólico en el sistema.
* **Distribución espacial del calor y mapa de densidad:** Matriz bidimensional que registra la evolución de las temperaturas corporales en la grilla y la forma del *huddle*, permitiendo visualizar el comportamiento colectivo.
* **Eficiencia de rescate de la colonia:** Relación matemática entre el número total de huevos desprendidos versus el número de huevos recuperados con éxito antes de congelarse.
* **Registro cronológico de eventos:** Bitácora detallada de los eventos relevantes de la simulación (muertes, pérdida de huevos, recuperaciones, cambios de fase, etc.), accesible desde el modal de estadísticas avanzadas.

---

## 4. Implementación Computacional

La implementación del modelo se realizó como una aplicación web SPA (Single Page Application) en React, con visualización 2D sobre Canvas y visualización 3D sobre Three.js. A continuación se describen los componentes principales de la implementación.

### 4.1 Arquitectura del Software

La aplicación se organiza en los siguientes módulos:

* **Módulo de simulación (`src/simulation/`):** Contiene la lógica del modelo basado en agentes. Incluye las clases `Engine` (motor principal de la simulación), `Penguin` (definición del agente), `Egg` (sub-agente huevo), `Grid` (grilla espacial), `Environment` (entorno climático) y `constants` (constantes del modelo).
* **Módulo de componentes (`src/components/`):** Contiene la interfaz de usuario. Se divide en la Landing Page, el panel de parámetros, la vista de simulación, los paneles activos, los modales (resultados, estadísticas avanzadas, configuración, colores, selección de personaje, informativos, confirmación) y los componentes 3D (terreno antártico, modelos de pingüinos, huevos caídos, iluminación, partículas de nieve).
* **Módulo de utilidades (`src/utils/`):** Funciones auxiliares como verificación de disponibilidad de modelos GLTF.

El motor de simulación se ejecuta en pasos discretos de 1 minuto simulado. La aplicación permite al usuario configurar la velocidad de ejecución, pausar, reanudar, reiniciar y forzar la finalización de la simulación.

### 4.2 Landing Page

La Landing Page es la cara visible del proyecto y tiene como objetivo presentar la simulación a cualquier persona, incluso sin formación técnica. Se estructura en las siguientes secciones:

* **Hero:** Presenta el título "Simulación del Agrupamiento de Pingüinos Emperador" y un párrafo introductorio que explica en lenguaje sencillo qué es el *huddle* y qué se puede hacer con la simulación. Un botón principal invita a iniciar la simulación.
* **Tres estadísticas destacadas (clickeables):** Cada estadística abre un modal informativo que la explica en detalle:
  * **20-200 Pingüinos en el Huddle:** Rango configurable de la colonia.
  * **92 Días de Duración del Invierno:** Período total de la incubación, dividido en las tres fases.
  * **≤ 28 °C Muerte por Hipotermia:** Umbral letal de temperatura corporal.
* **Cuatro recuadros temáticos (Bento):** Presentan la pregunta de investigación, el problema del frío, la solución de la rotación, y la justificación de la simulación. Mantienen una tipografía y estilo consistentes, con iconografía prominente.
* **Entorno Parametrizado:** Tres tarjetas explican el rol del borde, el centro (*the huddle*) y el huevo.
* **Estructura del Agente y Señales de Peligro:** Detallan los atributos vitales de un pingüino y las dos señales críticas de riesgo (muerte por hipotermia y muerte del embrión).
* **Escenarios que se Pueden Probar:** Invierno Normal, Frío Extremo y Tormentas Fuertes.
* **Ciclos del Sistema (interactuable):** Cuatro tarjetas describen los bucles de retroalimentación del sistema. El usuario puede arrastrar horizontalmente para explorarlas, en lugar de un desplazamiento automático.
* **Sección Multi-Agente (PASSI):** Una sección dedicada explica que el proyecto es un simulador multi-agente basado en la metodología PASSI, y lista los conceptos aplicados: Sociedad de Agentes, Roles, Tareas, Entorno e Interacciones.
* **Footer:** Cierre institucional con el logo y la información del proyecto.

### 4.3 Panel de Parámetros

Antes de iniciar la simulación, el usuario accede al panel de parámetros, donde puede configurar:

* El **tamaño de la colonia** (20 a 200 pingüinos).
* Los **parámetros fisiológicos** de los pingüinos: temperatura corporal, energía inicial, umbrales de hipotermia y crítico, probabilidades de pérdida de huevo, factor de termogénesis.
* Los **parámetros termodinámicos**: tasa de transferencia de calor, pérdida de calor en interior y borde.
* Los **parámetros de cada fase del invierno** (0, 1 y 2): duración, temperatura mínima y máxima, velocidad mínima y máxima del viento, multiplicador energético.
* El **modelo de visualización** (2D o 3D), el **modo de día/noche**, los **efectos de nieve** y la **personalización de colores**.
* La **selección de personaje** para los pingüinos, con modelos predefinidos o la posibilidad de importar un modelo GLTF.

Desde el panel también se puede acceder a los modales de configuración general, configuración de colores y selección de personaje.

### 4.4 Visualización 2D y 3D

La simulación puede visualizarse en dos modalidades:

* **Visualización 2D (Canvas):** Vista cenital de la grilla donde cada celda muestra el estado de los agentes. Los colores indican la temperatura corporal, la pertenencia al borde o al interior, y la presencia de huevos. Es la vista por defecto del panel de parámetros, útil para apreciar la estructura del *huddle*.
* **Visualización 3D (Three.js):** Representación tridimensional inmersiva con terreno antártico, iluminación dinámica, partículas de nieve, modelos de pingüinos animados y huevos caídos en el hielo. Permite apreciar el comportamiento colectivo con mayor realismo.

Ambas vistas se actualizan en tiempo real conforme avanza la simulación.

### 4.5 Modales del Sistema

La aplicación incorpora los siguientes modales:

* **Modal de Estadísticas Avanzadas:** Gráficos de la evolución temporal de la temperatura promedio, la energía promedio, el número de agentes vivos y la tasa de supervivencia, junto con el registro cronológico de eventos.
* **Modal de Resultados:** Se muestra automáticamente al finalizar la simulación. Resume la tasa de supervivencia de los pingüinos, la tasa de eclosión de los huevos, el balance térmico y la eficiencia de la colonia.
* **Modal de Configuración:** Permite modificar en detalle todos los parámetros del modelo (fisiología, termodinámica, fases, huevos, búsqueda).
* **Modal de Configuración de Colores:** Personaliza los colores del huevo, del modo búsqueda y de otros elementos visuales.
* **Modal de Selección de Personaje:** Permite elegir entre distintos modelos de pingüino para la visualización 3D, incluyendo la posibilidad de importar un modelo GLTF propio.
* **Modales Informativos:** Asociados a las tres estadísticas de la Landing Page, explican en detalle el rango de pingüinos, las fases de los 92 días y el umbral de hipotermia.
* **Modal de Confirmación:** Solicita confirmación al usuario antes de acciones destructivas como reiniciar la simulación descartando los resultados.
* **Pantalla de Carga (Loading Screen):** Indicador visual mostrado durante la inicialización de la simulación y la transición entre vistas.

---

## 5. Conclusiones

En el desarrollo de este proyecto se logró construir un simulador basado en agentes funcional, capaz de reproducir con razonable fidelidad la dinámica de agrupamiento de los pingüinos emperador durante el invierno antártico, así como el efecto de las condiciones climáticas extremas y de los eventos estocásticos sobre la supervivencia de la colonia y de sus huevos.

El modelo conceptual basado en agentes resultó ser el enfoque más apropiado para capturar el comportamiento emergente de la colonia a partir de reglas individuales simples. La aplicación de la metodología PASSI permitió estructurar la colonia como una sociedad de agentes con roles, tareas e interacciones claramente definidas, lo que facilitó tanto el diseño como la implementación.

La interfaz web desarrollada (Landing Page, panel de parámetros, visualización 2D y 3D, modales informativos y de resultados) hace que la simulación sea accesible tanto para usuarios sin formación técnica, que pueden explorar el fenómeno a través de la Landing Page y los modales explicativos, como para investigadores o estudiantes, que pueden ajustar parámetros detallados y analizar los resultados mediante los gráficos y el registro de eventos.

Como trabajo futuro, el modelo podría extenderse incorporando mayor heterogeneidad entre los individuos (por ejemplo, diferencias etarias o de tamaño corporal), dinámicas de comunicación entre los agentes, accidentes geográficos del terreno, o la integración con datos climáticos reales de la Antártida para validar cuantitativamente los resultados de la simulación.
