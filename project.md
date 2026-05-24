AGRUPACIÓN DE PINGÜINOS EMPERADOR EN EL INVIERNO ANTÁRTICO

AGUIRRE TENJO DIEGO FERNANDO

ARIAS TENJO CAMILO ANDRES

SIMULACIÓN DE COMPUTADORES

INGENIERO:

JOSE OSBALDO ROJAS MORENO

 

UNIVERSIDAD PEDAGÓGICA Y TECNOLÓGICA DE COLOMBIA

FACULTAD DE INGENIERÍA

INGENIERÍA DE SISTEMAS Y COMPUTACIÓN

/2026

[**1\. DEFINICIÓN DEL PROBLEMA	4**](#1.-definición-del-problema)

[**2\. ALCANCE	4**](#2.-alcance)

[2.1 Lo que incluye la simulación	4](#2.1-lo-que-incluye-la-simulación)

[2.2 Lo que no incluye la simulación	5](#2.2-lo-que-no-incluye-la-simulación)

[2.3 Supuestos del Modelo	5](#2.3-supuestos-del-modelo)

[**3\. MODELO CONCEPTUAL	5**](#3.-modelo-conceptual)

[3.1 Tipo de Modelo	5](#3.1-tipo-de-modelo)

[3.2 Componentes del Sistema	5](#3.2-componentes-del-sistema)

[3.3 Reglas de Comportamiento	6](#3.3-reglas-de-comportamiento)

[3.4 Descripción Conceptual del Modelo	6](#3.4-descripción-conceptual-del-modelo)

[3.5 Variables de Entrada y Salida	6](#3.5-variables-de-entrada-y-salida)

[**4\. CONCLUSIONES	7**](#4.-conclusiones)

## 

## **1\. DEFINICIÓN DEL PROBLEMA** {#1.-definición-del-problema}

Los pingüinos emperador (*Aptenodytes forsteri*) son la especie de pingüino más grande del mundo y habitan la Antártida, uno de los entornos más hostiles del planeta. Durante el invierno antártico, las temperaturas pueden descender hasta los \-60°C y los vientos superar los 200 km/h. A diferencia de la mayoría de las aves, los pingüinos emperador se reproducen precisamente en esta época de oscuridad perpetua.

Tras la puesta del huevo a principios del invierno (fase de oviposición entre mayo y junio), las hembras agotan sus reservas energéticas y parten inmediatamente en un viaje de más de 100 km hacia el océano abierto para alimentarse. Esto deja a los machos con la responsabilidad exclusiva de incubar el huevo durante todo el invierno profundo (junio a agosto), soportando un ayuno estricto de entre 110 y 120 días consecutivos. Durante este tiempo, el macho no ingiere ningún alimento y depende únicamente de su capa de grasa corporal. El huevo se mantiene suspendido sobre las patas del pingüino, cubierto por un pliegue de piel densamente plumas conocida como la "bolsa de incubación", que lo mantiene a unos 36 °C.

Ante estas condiciones extremas, los pingüinos han desarrollado el *huddle* o agrupamiento. La posición dentro del grupo no es estática: los individuos de los bordes exteriores se mueven gradualmente hacia el interior, generando un movimiento continuo. Sin embargo, este desplazamiento colectivo masivo y la alta densidad de la aglomeración incrementan el riesgo de perturbaciones mecánicas: choques, tropezones o empujones entre los agentes. Si un macho pierde el contacto con su huevo y este cae al hielo descubierto, el embrión se enfrenta a una ventana crítica de supervivencia hidrotérmica: debido al frío extremo y al efecto del viento, **el huevo se vuelve inviable (muere) en un lapso de 1 a 3 minutos** si no es recuperado inmediatamente.

El problema que se desea estudiar mediante simulación es: ¿cómo logra una colonia de pingüinos emperador autorregularse para maximizar la supervivencia del grupo y de sus embriones, balanceando la necesidad termodinámica de rotación del *huddle* con el riesgo estocástico de pérdida y congelación de huevos bajo las distintas fases del invierno antártico?

## **2\. ALCANCE** {#2.-alcance}

El alcance de este proyecto define con claridad qué aspectos del fenómeno serán incluidos en la simulación, cuáles quedan fuera, y cuáles son las suposiciones adoptadas para simplificar el modelo sin perder su esencia.

### **2.1 Lo que incluye la simulación** {#2.1-lo-que-incluye-la-simulación}

* Una colonia de pingüinos representada por un número fijo de agentes (individuos), con características individuales como temperatura corporal, nivel de energía y posición dentro del grupo.  
* Un entorno con temperatura ambiente variable que simula las condiciones del invierno antártico, incluyendo la dirección e intensidad del viento.  
* El comportamiento de movimiento de los pingüinos: los individuos de los bordes se desplazan hacia el interior cuando su temperatura corporal cae por debajo de un umbral crítico.  
* La transferencia de calor entre individuos vecinos y la pérdida de calor hacia el ambiente exterior.  
* El consumo de energía de cada individuo a lo largo del tiempo, y la posibilidad de que un individuo no sobreviva si su energía llega a cero.  
* Indicadores de resultado como: temperatura promedio del grupo, tasa de supervivencia, tiempo promedio en el borde vs. el centro, y eficiencia energética colectiva.  
* Un ciclo temporal dividido en las **Fases del Invierno Antártico**: Fase de Inicio de Incubación (Junio \- frío moderado, reservas energéticas altas), Fase de Invierno Profundo (Julio \- frío extremo y vientos máximos, reservas energéticas críticas) y Fase de Eclosión (Agosto \- temperaturas en lento ascenso, energía límite).  
* El estado fisiológico de ayuno crónico en los agentes machos, modelado como una tasa de decaimiento energético base que se acelera con el estrés térmico.  
* La simulación del "Objeto Huevo" asociado a cada agente, el cual posee una variable de estado (*Protegido*, *Expuesto*, *Congelado*).  
* **Eventos estocásticos de pérdida de huevo** causados por la densidad de contacto físico y la velocidad de movimiento de los agentes dentro del *huddle*.  
* Un temporizador de enfriamiento crítico (*Cooling Timer*) para los huevos expuestos al hielo, dependiente de la temperatura exterior y la velocidad del viento.

### **2.2 Lo que no incluye la simulación** {#2.2-lo-que-no-incluye-la-simulación}

* No se modelará el cortejo, la cópula ni la producción del huevo. La simulación inicia inmediatamente después de que las hembras parten al mar. Tampoco se simula la alimentación de la cría post-eclosión.   
* No se consideran diferencias anatómicas entre individuos como el tamaño corporal o el grosor de la capa de grasa.  
* No se modela la búsqueda de alimento ni el regreso al mar, ya que la simulación se enfoca únicamente en el período de invierno en tierra.  
* No se simulan interacciones sociales más complejas como jerarquías, agresión o comunicación entre individuos.  
* El terreno se considerará plano y homogéneo, sin accidentes geográficos como crestas de hielo o pendientes.

### **2.3 Supuestos del Modelo** {#2.3-supuestos-del-modelo}

* Todos los pingüinos comienzan con el mismo nivel de energía y temperatura corporal al inicio de la simulación.  
* La transferencia de calor entre individuos es proporcional a la diferencia de temperatura entre ellos y al número de vecinos directos.  
* El movimiento hacia el interior es determinístico: si la temperatura de un individuo cae bajo el umbral, este se moverá al espacio interior disponible más cercano.  
* El entorno térmico se modela como una temperatura exterior constante durante cada paso de tiempo, con variaciones entre pasos según un patrón definido.  
* La probabilidad de que un pingüino pierda su huevo aumenta exponencialmente si el agente se encuentra en las zonas de mayor turbulencia o reordenamiento del *huddle* (zonas de transición borde-interior).  
* Si un agente pierde su huevo, detiene su comportamiento de avance térmico regular y entra en un estado de "búsqueda local" en las celdas adyacentes vacías durante un tiempo límite (rango biológico de 60 a 180 segundos).  
* Un huevo en el hielo que no sea recuperado antes de que su temporizador llegue a cero se considera congelado y cuenta como pérdida reproductiva, pero el agente macho continúa en la simulación intentando sobrevivir por sí mismo.

## **3\. MODELO CONCEPTUAL** {#3.-modelo-conceptual}

El modelo conceptual describe de manera abstracta los componentes del sistema, sus relaciones y los mecanismos que gobiernan el comportamiento de la simulación, antes de pasar a su implementación computacional.

### **3.1 Tipo de Modelo** {#3.1-tipo-de-modelo}

Se utilizará un modelo basado en agentes (MBA), también conocido como Agent-Based Model (ABM). Este tipo de simulación es el más adecuado para este problema, ya que permite representar a cada pingüino como un agente autónomo con sus propios atributos y reglas de comportamiento, y observar cómo el comportamiento colectivo emerge a partir de las interacciones individuales.

El espacio de simulación será una cuadrícula bidimensional (grilla), donde cada celda puede ser ocupada por un pingüino o estar vacía. El tiempo avanzará en pasos discretos, y en cada paso se evaluarán las condiciones de cada agente y se actualizarán sus atributos y posición.

### **3.2 Componentes del Sistema** {#3.2-componentes-del-sistema}

**a) Entidad: Pingüino (Agente)**

Cada pingüino es un agente con los siguientes atributos:

* **Posición (x, y):** Coordenada dentro de la grilla.  
* **Temperatura corporal (T\_corp):** Temperatura interna en °C, que varía según la pérdida o ganancia de calor.  
* **Nivel de energía (E):** Reserva energética del individuo. Disminuye con el tiempo; si llega a 0, el individuo no sobrevive.  
* **Estado:** Puede ser "en borde" (expuesto al ambiente) o "en interior" (protegido por otros individuos).  
* **Número de vecinos:** Cantidad de pingüinos adyacentes en la grilla.  
* **Tiene Huevo:** Booleano (Verdadero/Falso).  
* **ID Huevo Asociado:** Identificador único del huevo que porta.  
* **Reserva Grasa Crono:** Nivel de energía metabólica que decrece exponencialmente según el gasto por termorregulación.  
* **Estado Conductual:** (Normal, Buscando Huevo).

**b) Entidad: Entorno**

* **Temperatura exterior (T\_ext):** Temperatura del ambiente antártico en cada paso de tiempo.  
* **Viento (dirección e intensidad):** Factor que incrementa la pérdida de calor en los individuos del borde expuesto.  
* **Grilla espacial:** El área bidimensional donde se posicionan los agentes.

**c) Entidad: Huevo (Sub-Agente o Matriz de Objetos)**

* **ID:** Identificador.  
* **Posición (x, y):** Coordenada en la grilla (si es perdido, toma la celda del hielo donde cayó).  
* **Estado Térmico:** (Estable \[dentro de la bolsa\], Enfriándose \[en el hielo\], Congelado).  
* **Tiempo Exposición:** Contador regresivo en segundos (pasos de simulación cortos). Su valor inicial se calcula según las condiciones climáticas del paso actual mediante la fórmula adaptada:  
  *Tiempo\_Límite \= 180 \- (Text \* \-2) \- (Viento \* 0.5)*


### **3.3 Reglas de Comportamiento** {#3.3-reglas-de-comportamiento}

En cada paso de tiempo, cada agente ejecuta las siguientes reglas en orden:

* **Pérdida Estocástica del Huevo:** En cada paso de tiempo, si un agente se mueve o cambia de posición con un vecino debido a la dinámica rotativa, existe una probabilidad básica Ploss \= 0.005 (0.5% por movimiento) de soltar el huevo. Si la celda adyacente tiene una alta densidad de vientos (borde), la probabilidad sube a 1.5% debido a la inestabilidad por el frío.  
* **Degradación del Huevo Expuesto:** Si un huevo pasa al estado *Expuesto*, disminuye su Tiempo\_Exposición en cada unidad de tiempo.  
* **Comportamiento de Recuperación:** El agente que perdió el huevo cambia su Estado\_Conductual a *Buscando Huevo*. En el siguiente paso, priorizará moverse hacia la celda donde quedó el huevo sobre cualquier regla de confort térmico.  
* **Muerte del Embrión:** Si Tiempo\_Exposición \<= 0, el huevo cambia a *Congelado*. El agente vuelve a estado *Normal* pero con Tiene\_Huevo \= Falso.  
* **Ajuste del Gasto Energético por Fase:** En la Fase de Invierno Profundo (Paso de simulación X a Y), la penalización energética por estar en el borde se duplica. Si la energía total del pingüino llega a 0, el agente fallece, dejando el huevo permanentemente expuesto en esa celda.

### **3.4 Descripción Conceptual del Modelo** {#3.4-descripción-conceptual-del-modelo}

A continuación se presenta una descripción esquemática del flujo del modelo. En cada ciclo de simulación (paso de tiempo), el sistema sigue el siguiente proceso general:

* El entorno actualiza la temperatura exterior y la intensidad del viento.  
* Cada agente calcula su pérdida de calor según su posición (borde o interior) y las condiciones del entorno.  
* Se produce la transferencia de calor entre agentes vecinos.  
* Cada agente actualiza su nivel de energía y evalúa si debe moverse.  
* Se registran los indicadores del sistema (temperatura promedio, número de sobrevivientes, distribución del grupo).  
* Se repite el ciclo hasta cumplir el tiempo total de simulación.

### **3.5 Variables de Entrada y Salida** {#3.5-variables-de-entrada-y-salida}

**Variables de entrada**

Aquí tienes las listas completamente limpias, utilizando solo texto plano y formato Markdown básico para que puedas copiar y pegar directamente en tu archivo sin problemas de símbolos o códigos extraños.

## **3.5 Variables de Entrada y Salida**

### **Variables de Entrada**

* **Número de pingüinos en la colonia (N):** Define la población inicial de agentes en la grilla. En esta simulación, representa exclusivamente a la población de machos incubadores, dado que las hembras han migrado al océano. Es una variable crítica para evaluar cómo la masa del grupo influye en la retención del calor.  
* **Perfil térmico y climático ambiental (Temperatura exterior y Velocidad del viento):** Define la temperatura en grados Celsius y la velocidad del viento en km/h. Estas variables no son constantes, sino que cambian según la fase del invierno para simular el recrudecimiento del clima antártico, alcanzando mínimos de hasta \-60 grados Celsius y vientos de 200 km/h.  
* **Duración de las Fases del Invierno Antártico:** Bloques de tiempo que dividen la simulación en tres etapas biológicas: Fase 1 (Inicio de incubación / Junio), Fase 2 (Invierno profundo / Julio) y Fase 3 (Pre-eclosión / Agosto). Permite simular el desgaste acumulativo de los agentes.  
* **Reserva lipídica inicial (Energía inicial) y Tasa de Consumo Energético:** Energía metabólica base con la que inician los machos para afrontar el ayuno prolongado de 110 a 120 días. La tasa de consumo varía dinámicamente: es mínima si el agente está protegido en el interior del huddle y muy alta si está expuesto al viento en el borde.  
* **Temperatura corporal inicial y Umbral Crítico:** La temperatura interna estándar del ave (aproximadamente 38 grados Celsius) y el límite por debajo del cual el agente entra en estado de hipotermia o activa la regla de movimiento hacia el interior del grupo.  
* **Probabilidad estocástica de pérdida del huevo (P\_pérdida):** Factor de probabilidad (definido estadísticamente entre 1% y 3%) que determina la posibilidad de que un agente suelte accidentalmente su huevo debido a la fricción física, colisiones y reordenamiento mecánico durante las rotaciones del huddle.  
* **Tiempo límite de viabilidad del huevo expuesto (t\_max\_huevo):** Ventana crítica de congelación en el hielo descubierto. Se calcula en cada paso según la severidad de la temperatura exterior y el viento, simulando el rango real de supervivencia del embrión (entre 60 y 180 segundos) antes de morir por congelación.  
* **Radio de búsqueda local (R\_búsqueda):** Cantidad de celdas adyacentes en la grilla en las cuales el agente padre, tras perder el huevo, tiene visión para iniciar el protocolo de rastreo y recuperación.  
* **Equivalencia del paso de tiempo (Delta\_t):** Factor de escala temporal del simulador, fijado en 1 paso \= 1 minuto. Esta escala es indispensable para que los eventos de enfriamiento rápido del huevo (1 a 3 minutos) puedan modelarse con precisión frente a los meses de invierno.

**Variables de salida**

* **Tasa de supervivencia de agentes padres:** Porcentaje final de pingüinos machos que logran finalizar la simulación con niveles de energía mayores a cero. Mide la eficiencia del huddle como sistema de conservación energética.  
* **Tasa de éxito de incubación de huevos:** Porcentaje de huevos que llegan en estado viable al final de la Fase 3\. Es el indicador principal del éxito reproductivo y biológico de la colonia.  
* **Censo y distribución de causas de mortalidad:** Contador que diferencia la pérdida de embriones por dos factores específicos:  
  * Muerte por congelación directa: El huevo cayó al hielo y no fue rescatado a tiempo.  
  * Muerte por inanición del progenitor: El agente padre murió por agotar sus reservas energéticas, dejando el huevo desamparado.  
* **Distribución del tiempo por estado conductual:** Tiempo promedio acumulado que los individuos pasan en cada uno de los tres estados posibles: en el borde (gasto energético alto), en el interior (recuperación térmica) o en estado de búsqueda y rescate en el hielo fuera del grupo.  
* **Curva de consumo energético promedio y por fase:** Gráfico del decaimiento de las reservas de grasa de la colonia a lo largo del tiempo. Permite identificar cuál de las tres fases del invierno genera el mayor estrés metabólico en el sistema.  
* **Distribución espacial del calor y mapa de densidad:** Matriz bidimensional que registra la evolución de las temperaturas corporales en la grilla y la forma del huddle, permitiendo visualizar el comportamiento colectivo.  
* **Eficiencia de rescate de la colonia:** Relación matemática entre el número total de huevos desprendidos versus el número de huevos recuperados con éxito antes de congelarse. Mide la efectividad del protocolo de búsqueda de los agentes.

## **4\. CONCLUSIONES** {#4.-conclusiones}

En esta primera fase del proyecto se logró establecer una base sólida para el desarrollo de la simulación. Se identificó con claridad el problema a estudiar: la dinámica de agrupamiento de los pingüinos emperador como estrategia colectiva de supervivencia al frío extremo del invierno antártico.

El alcance delimitado permite que la simulación sea manejable y enfocada, evitando la incorporación de variables que complejizarían innecesariamente el modelo en esta etapa. Los supuestos adoptados son razonables y están respaldados por el conocimiento existente sobre el comportamiento de esta especie.

El modelo conceptual propuesto, de tipo basado en agentes sobre una grilla discreta, es el más apropiado para capturar el comportamiento emergente de la colonia a partir de reglas individuales simples. Las variables, entidades y reglas definidas constituyen el punto de partida para la siguiente fase, que consistirá en la formalización matemática del modelo y su implementación computacional.  
