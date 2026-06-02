import { useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
} from "reactflow";
import "reactflow/dist/style.css";

/* ─── Custom Edge con etiqueta centrada ─────────────────────────────────── */
function LabeledEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style }) {
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "none",
            background: "#0d1117",
            border: "1px solid #30363d",
            borderRadius: 4,
            padding: "2px 7px",
            fontSize: 11,
            fontWeight: 700,
            color: data.color || "#e6edf3",
            fontFamily: "sans-serif",
            whiteSpace: "nowrap",
          }}>
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

/* ─── Nodo: Rectángulo (proceso / acción) ───────────────────────────────── */
function ProcesoNode({ data }) {
  const colors = {
    inicio:   { bg: "#161b22", border: "#388bfd", text: "#79c0ff", accent: "#388bfd" },
    proceso:  { bg: "#161b22", border: "#3fb950", text: "#7ee787", accent: "#3fb950" },
    accion:   { bg: "#161b22", border: "#bc8cff", text: "#d2a8ff", accent: "#bc8cff" },
    resultado:{ bg: "#161b22", border: "#f78166", text: "#ffa198", accent: "#f78166" },
    fin:      { bg: "#161b22", border: "#f0883e", text: "#ffb77c", accent: "#f0883e" },
    loop:     { bg: "#161b22", border: "#56d364", text: "#56d364", accent: "#56d364" },
  };
  const c = colors[data.tipo] || colors.proceso;
  return (
    <div style={{
      background: c.bg,
      border: `2px solid ${c.border}`,
      borderRadius: data.tipo === "inicio" || data.tipo === "fin" ? 50 : 8,
      padding: "12px 20px",
      minWidth: 180,
      maxWidth: 230,
      boxShadow: `0 0 12px ${c.accent}33, 0 2px 8px rgba(0,0,0,0.6)`,
      textAlign: "center",
      position: "relative",
    }}>
      <Handle type="target" position={Position.Top}    style={{ background: c.border, width: 10, height: 10, border: `2px solid ${c.bg}` }} id="top-target" />
      <Handle type="source" position={Position.Top}    style={{ background: c.border, width: 10, height: 10, border: `2px solid ${c.bg}` }} id="top-source" />

      <Handle type="target" position={Position.Left}   style={{ background: c.border, width: 10, height: 10, border: `2px solid ${c.bg}` }} id="left-target" />
      <Handle type="source" position={Position.Left}   style={{ background: c.border, width: 10, height: 10, border: `2px solid ${c.bg}` }} id="left-source" />

      <Handle type="target" position={Position.Right}  style={{ background: c.border, width: 10, height: 10, border: `2px solid ${c.bg}` }} id="right-target" />
      <Handle type="source" position={Position.Right}  style={{ background: c.border, width: 10, height: 10, border: `2px solid ${c.bg}` }} id="right-source" />

      <div style={{ fontSize: 12, fontWeight: 700, color: c.text, lineHeight: 1.4, fontFamily: "'Segoe UI', sans-serif" }}>
        {data.label}
      </div>
      {data.sub && (
        <div style={{ fontSize: 10, color: "#8b949e", marginTop: 4, fontFamily: "sans-serif" }}>{data.sub}</div>
      )}

      <Handle type="target" position={Position.Bottom} style={{ background: c.border, width: 10, height: 10, border: `2px solid ${c.bg}` }} id="bottom-target" />
      <Handle type="source" position={Position.Bottom} style={{ background: c.border, width: 10, height: 10, border: `2px solid ${c.bg}` }} id="bottom-source" />
    </div>
  );
}

/* ─── Nodo: Diamante (decisión) ─────────────────────────────────────────── */
function DecisionNode({ data }) {
  const size = data.size || 130;
  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      {/* Handles */}
      <Handle type="target" position={Position.Top}    style={{ top: 0,        left: "50%",  background: "#e3b341", width: 10, height: 10, border: "2px solid #0d1117", transform: "translateX(-50%)" }} id="top-target" />
      <Handle type="source" position={Position.Top}    style={{ top: 0,        left: "50%",  background: "#e3b341", width: 10, height: 10, border: "2px solid #0d1117", transform: "translateX(-50%)" }} id="top-source" />

      <Handle type="target" position={Position.Bottom} style={{ bottom: 0,     left: "50%",  background: "#e3b341", width: 10, height: 10, border: "2px solid #0d1117", transform: "translateX(-50%)" }} id="bottom-target" />
      <Handle type="source" position={Position.Bottom} style={{ bottom: 0,     left: "50%",  background: "#e3b341", width: 10, height: 10, border: "2px solid #0d1117", transform: "translateX(-50%)" }} id="bottom-source" />

      <Handle type="target" position={Position.Right}  style={{ top: "50%",    right: 0,     background: "#e3b341", width: 10, height: 10, border: "2px solid #0d1117", transform: "translateY(-50%)" }} id="right-target" />
      <Handle type="source" position={Position.Right}  style={{ top: "50%",    right: 0,     background: "#e3b341", width: 10, height: 10, border: "2px solid #0d1117", transform: "translateY(-50%)" }} id="right-source" />

      <Handle type="target" position={Position.Left}   style={{ top: "50%",    left: 0,      background: "#e3b341", width: 10, height: 10, border: "2px solid #0d1117", transform: "translateY(-50%)" }} id="left-target" />
      <Handle type="source" position={Position.Left}   style={{ top: "50%",    left: 0,      background: "#e3b341", width: 10, height: 10, border: "2px solid #0d1117", transform: "translateY(-50%)" }} id="left-source" />

      {/* Diamante SVG */}
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0 }}>
        <polygon
          points={`${size/2},4 ${size-4},${size/2} ${size/2},${size-4} 4,${size/2}`}
          fill="#1c1f24"
          stroke="#e3b341"
          strokeWidth="2.5"
          style={{ filter: "drop-shadow(0 0 8px #e3b34155)" }}
        />
      </svg>

      {/* Texto centrado */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: size, height: size,
        display: "flex", alignItems: "center", justifyContent: "center",
        textAlign: "center",
        padding: "16px",
        boxSizing: "border-box",
        fontSize: 10.5,
        fontWeight: 700,
        color: "#f0c040",
        fontFamily: "'Segoe UI', sans-serif",
        lineHeight: 1.3,
        pointerEvents: "none",
      }}>
        {data.label}
      </div>
    </div>
  );
}

const nodeTypes = { proceso: ProcesoNode, decision: DecisionNode };
const edgeTypes = { labeled: LabeledEdge };

/* ─── NODOS ─────────────────────────────────────────────────────────────── */
/*
  Columna central X = 380
  Ramas derecha  X = 680
  Ramas izquierda X = 80
*/
const CX = 380;  // centro
const RX = 660;  // rama derecha
const LX = 80;   // rama izquierda

const W = 200;   // ancho nodo proceso

const nodes = [

  /* ── 0. INICIO ───────────────────────────────────────────────────────── */
  { id: "s0", type: "proceso", position: { x: CX - W/2, y: 0 },
    data: { label: "INICIO: La colonia llega a la Antártida", tipo: "inicio" } },

  /* ── 1. Inicializar ──────────────────────────────────────────────────── */
  { id: "p1", type: "proceso", position: { x: CX - W/2, y: 120 },
    data: { label: "Inicializar N pingüinos en grilla 2D", sub: "T_corp = 37°C · E = E₀ · Huevo seguro", tipo: "proceso" } },

  /* ── 2. Entorno del paso ─────────────────────────────────────────────── */
  { id: "p2", type: "proceso", position: { x: CX - W/2, y: 250 },
    data: { label: "Actualizar entorno (paso t)", sub: "T_ext · V_viento · R_solar · HR", tipo: "proceso" } },

  /* ── 3. Calcular T aparente ──────────────────────────────────────────── */
  { id: "p3", type: "proceso", position: { x: CX - W/2, y: 380 },
    data: { label: "Calcular Temperatura Aparente", sub: "T_ap = f(T_ext, V_viento, HR)", tipo: "proceso" } },

  /* ── 4. Evaluar cada pingüino ────────────────────────────────────────── */
  { id: "p4", type: "proceso", position: { x: CX - W/2, y: 510 },
    data: { label: "Para cada pingüino i:", sub: "Evaluar posición r_i y estado del huevo", tipo: "accion" } },

  /* ── 5. Calcular pérdida de calor ────────────────────────────────────── */
  { id: "p5", type: "proceso", position: { x: CX - W/2, y: 640 },
    data: { label: "Calcular pérdida de calor ΔT_i", sub: "ΔT = α·(T_corp − T_ap)·(1 + β·r_i)", tipo: "proceso" } },

  /* ── 6. Transferencia calor vecinos ──────────────────────────────────── */
  { id: "p6", type: "proceso", position: { x: CX - W/2, y: 770 },
    data: { label: "Transferencia de calor con vecinos", sub: "ΔT_v = γ · Σ(T_j − T_i) / N_vec", tipo: "proceso" } },

  /* ── 7. Actualizar T_corp ────────────────────────────────────────────── */
  { id: "p7", type: "proceso", position: { x: CX - W/2, y: 900 },
    data: { label: "Actualizar T corporal", sub: "T_corp(t+1) = T_corp − ΔT + ΔT_v", tipo: "proceso" } },

  /* ── 8. Actualizar energía ───────────────────────────────────────────── */
  { id: "p8", type: "proceso", position: { x: CX - W/2, y: 1030 },
    data: { label: "Consumir energía", sub: "E(t+1) = E(t) − C_e   donde C_e ∝ |ΔT|", tipo: "proceso" } },

  /* ── D1. ¿E > 0? ─────────────────────────────────────────────────────── */
  { id: "d1", type: "decision", position: { x: CX - 65, y: 1150 },
    data: { label: "¿Su energía\nes mayor a 0?\n(Supervivencia)", size: 130 } },

  /* ── R1. Muerte ──────────────────────────────────────────────────────── */
  { id: "r1", type: "proceso", position: { x: 860, y: 1165 },
    data: { label: "Pingüino muere", sub: "Retirar de la simulación", tipo: "resultado" } },

  /* ── D5. ¿Se le cae el huevo? ────────────────────────────────────────── */
  { id: "d5", type: "decision", position: { x: CX - 65, y: 1350 },
    data: { label: "¿Evento aleatorio:\nSe le cae\nel huevo?\n(f(r_i))", size: 130 } },

  /* ── D6. ¿Lo recupera? ───────────────────────────────────────────────── */
  { id: "d6", type: "decision", position: { x: RX - 65, y: 1350 },
    data: { label: "¿Logra\nrecuperarlo\na tiempo?", size: 130 } },

  /* ── R2. Huevo muere ─────────────────────────────────────────────────── */
  { id: "r2", type: "proceso", position: { x: RX + 50, y: 1530 },
    data: { label: "El huevo se congela", sub: "Pingüino pierde su cría", tipo: "resultado" } },

  /* ── D2. ¿T < umbral? ────────────────────────────────────────────────── */
  { id: "d2", type: "decision", position: { x: CX - 65, y: 1700 },
    data: { label: "¿T. Corporal\nestá bajo el\numbral de frío?", size: 130 } },

  /* ── D4. ¿Hay espacio? ───────────────────────────────────────────────── */
  { id: "d4", type: "decision", position: { x: LX - 30, y: 1680 },
    data: { label: "¿Hay espacio\nen el interior\ndel grupo?", size: 130 } },

  /* ── A1. Mover al interior ───────────────────────────────────────────── */
  { id: "a1", type: "proceso", position: { x: LX - 80, y: 1880 },
    data: { label: "Mover al interior del huddle", sub: "r_i ← r_i − Δr", tipo: "accion" } },

  /* ── A2. Mantener posición ───────────────────────────────────────────── */
  { id: "a2", type: "proceso", position: { x: RX, y: 1825 },
    data: { label: "Continuar rotando por el borde", sub: "r_i ← r_i + Δr (movimiento regular)", tipo: "accion" } },

  /* ── P9. ¿Fin de agentes? ────────────────────────────────────────────── */
  { id: "p9", type: "decision", position: { x: CX - 65, y: 1950 },
    data: { label: "¿Quedan más\npingüinos por\nevaluar?", size: 130 } },

  /* ── P10. Calcular indicadores ───────────────────────────────────────── */
  { id: "p10", type: "proceso", position: { x: CX - W/2, y: 2150 },
    data: { label: "Registrar estadísticas de la colonia (cierre del día)", sub: "Supervivencia, temp. promedio y energía total consumida", tipo: "proceso" } },

  /* ── D3. ¿t < T_max? ────────────────────────────────────────────────── */
  { id: "d3", type: "decision", position: { x: CX - 65, y: 2270 },
    data: { label: "¿Faltan días\npara terminar\nel invierno?", size: 130 } },

  /* ── P11. t+1 ────────────────────────────────────────────────────────── */
  { id: "p11", type: "proceso", position: { x: -200, y: 2280 },
    data: { label: "Avanzar el tiempo\nen 1 paso", sub: "Siguiente día en la simulación", tipo: "loop" } },

  /* ── FIN. Resultados ─────────────────────────────────────────────────── */
  { id: "fin", type: "proceso", position: { x: CX - 120, y: 2450 },
    data: { label: "Exportar resultados", sub: "Supervivencia · T_prom · Movilidad · E_total", tipo: "resultado" } },

  /* ── END ─────────────────────────────────────────────────────────────── */
  { id: "end", type: "proceso", position: { x: CX - W/2, y: 2550 },
    data: { label: "FIN DE LA SIMULACIÓN", tipo: "fin" } },
];

/* ─── EDGES ─────────────────────────────────────────────────────────────── */
const solid = (color = "#3fb950") => ({
  type: "labeled",
  markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 },
  style: { stroke: color, strokeWidth: 2 },
});

const edges = [
  // Flujo principal ─────────────────────────────────────────────────────────
  { id: "e01",  source: "s0",  target: "p1",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#388bfd") },
  { id: "e12",  source: "p1",  target: "p2",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#3fb950") },
  { id: "e23",  source: "p2",  target: "p3",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#3fb950") },
  { id: "e34",  source: "p3",  target: "p4",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#3fb950") },
  { id: "e45",  source: "p4",  target: "p5",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#3fb950") },
  { id: "e56",  source: "p5",  target: "p6",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#3fb950") },
  { id: "e67",  source: "p6",  target: "p7",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#3fb950") },
  { id: "e78",  source: "p7",  target: "p8",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#3fb950") },
  { id: "e8d1", source: "p8",  target: "d1",  sourceHandle: "bottom-source", targetHandle: "top-target", ...solid("#3fb950") },

  // D1 → muerte (No, E = 0)
  { id: "d1r1", source: "d1",  sourceHandle: "right-source", target: "r1", targetHandle: "left-target",
    ...solid("#f78166"), data: { label: "No (muere)", color: "#f78166" }, type: "labeled" },

  // D1 → D5 (Sí, sigue vivo)
  { id: "d1d5", source: "d1",  sourceHandle: "bottom-source", target: "d5", targetHandle: "top-target",
    ...solid("#56d364"), data: { label: "Sí (vivo)", color: "#56d364" }, type: "labeled" },

  // D5 → D2 (No cae)
  { id: "d5d2", source: "d5", sourceHandle: "bottom-source", target: "d2", targetHandle: "top-target",
    ...solid("#56d364"), data: { label: "No (seguro)", color: "#56d364" }, type: "labeled" },

  // D5 → D6 (Sí cae)
  { id: "d5d6", source: "d5", sourceHandle: "right-source", target: "d6", targetHandle: "left-target",
    ...solid("#f78166"), data: { label: "Sí (se cae)", color: "#f78166" }, type: "labeled" },

  // D6 → D2 (Sí recupera)
  { id: "d6d2", source: "d6", sourceHandle: "bottom-source", target: "d2", targetHandle: "right-target",
    ...solid("#56d364"), data: { label: "Sí (lo recupera)", color: "#56d364" }, type: "smoothstep" },

  // D6 → R2 (No recupera)
  { id: "d6r2", source: "d6", sourceHandle: "right-source", target: "r2", targetHandle: "top-target",
    ...solid("#f78166"), data: { label: "No (lo pierde)", color: "#f78166" }, type: "labeled" },

  // R2 → D2 (continúa el pingüino sin huevo)
  { id: "r2d2", source: "r2", sourceHandle: "bottom-source", target: "d2", targetHandle: "right-target",
    ...solid("#e3b341"), type: "smoothstep" },

  // D2 → D4 (Sí, T < umbral)
  { id: "d2d4", source: "d2", sourceHandle: "left-source", target: "d4", targetHandle: "right-target",
    ...solid("#56d364"), data: { label: "Sí (frío)", color: "#56d364" }, type: "labeled" },

  // D2 → A2 (No, T ok) 
  { id: "d2a2", source: "d2", sourceHandle: "right-source", target: "a2", targetHandle: "left-target",
    ...solid("#f78166"), data: { label: "No (temperatura ok)", color: "#f78166" }, type: "labeled" },

  // D4 → A1 (Sí, hay espacio)
  { id: "d4a1", source: "d4", sourceHandle: "bottom-source", target: "a1", targetHandle: "top-target",
    ...solid("#56d364"), data: { label: "Sí → mover adentro", color: "#56d364" }, type: "labeled" },

  // D4 → A2 (No, no hay espacio)
  { id: "d4a2", source: "d4", sourceHandle: "top-source", target: "a2", targetHandle: "top-target",
    ...solid("#f78166"), data: { label: "No → rotar en borde", color: "#f78166" }, type: "labeled" },

  // a1 → p9
  { id: "a1p9", source: "a1", sourceHandle: "bottom-source", target: "p9", targetHandle: "left-target",
    ...solid("#bc8cff"), type: "smoothstep" },

  // a2 → p9
  { id: "a2p9", source: "a2", sourceHandle: "bottom-source", target: "p9", targetHandle: "right-target",
    ...solid("#e3b341"), type: "smoothstep" },

  // r1 → p9 (Si muere, seguir evaluando el resto)
  { id: "r1p9", source: "r1", sourceHandle: "bottom-source", target: "p9", targetHandle: "right-target",
    ...solid("#f78166"), type: "smoothstep" },

  // p9 → p4 (Sí, evaluar siguiente pingüino -> BUCLE INTERNO)
  { id: "p9p4", source: "p9", sourceHandle: "top-source", target: "p4", targetHandle: "right-target",
    ...solid("#56d364"), data: { label: "Sí (siguiente agente)", color: "#56d364" }, type: "smoothstep",
    style: { stroke: "#56d364", strokeWidth: 2, strokeDasharray: "6 4" } },

  // p9 → p10 (No, fin de pingüinos en este paso)
  { id: "p9p10", source: "p9", sourceHandle: "bottom-source", target: "p10", targetHandle: "top-target",
    ...solid("#f78166"), data: { label: "No (continuar flujo)", color: "#f78166" }, type: "labeled" },

  // p10 → d3
  { id: "p10d3", source: "p10", sourceHandle: "bottom-source", target: "d3", targetHandle: "top-target", ...solid("#3fb950") },

  // d3 → t+1 (Sí, continuar)
  { id: "d3p11", source: "d3", sourceHandle: "left-source", target: "p11", targetHandle: "right-target",
    ...solid("#56d364"), data: { label: "Sí → continuar", color: "#56d364" }, type: "labeled" },

  // p11 → p2 (loop)
  { id: "p11p2",
    source: "p11", sourceHandle: "top-source",
    target: "p2",  targetHandle: "left-target",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#56d364", width: 16, height: 16 },
    style: { stroke: "#56d364", strokeWidth: 2, strokeDasharray: "6 4" },
    label: "↩ siguiente paso de tiempo",
    labelStyle: { fill: "#56d364", fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: "#0d1117" },
    labelBgPadding: [4, 6],
  },

  // d3 → fin (No, terminado)
  { id: "d3fin", source: "d3", sourceHandle: "bottom-source", target: "fin", targetHandle: "top-target",
    ...solid("#f78166"), data: { label: "No → fin", color: "#f78166" }, type: "labeled" },

  // fin → end
  { id: "fine", source: "fin", sourceHandle: "bottom-source", target: "end", targetHandle: "top-target", ...solid("#f0883e") },
];

/* ─── Leyenda ────────────────────────────────────────────────────────────── */
function Legend() {
  const items = [
    { color: "#388bfd", shape: "pill",    label: "Inicio / Fin" },
    { color: "#3fb950", shape: "rect",    label: "Proceso / cálculo" },
    { color: "#bc8cff", shape: "rect",    label: "Acción del agente" },
    { color: "#e3b341", shape: "diamond", label: "Decisión" },
    { color: "#f78166", shape: "rect",    label: "Resultado / muerte" },
    { color: "#56d364", shape: "dashed",  label: "Flujo: Sí / continúa" },
    { color: "#f78166", shape: "dashed",  label: "Flujo: No / termina" },
    { color: "#bc8cff", shape: "dashed",  label: "Flujo: movimiento" },
  ];
  return (
    <div style={{
      position: "absolute", top: 60, left: 16, zIndex: 100,
      background: "rgba(13,17,23,0.95)", border: "1px solid #30363d",
      borderRadius: 10, padding: "12px 16px",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#8b949e", marginBottom: 8, letterSpacing: 1.5, fontFamily: "sans-serif", textTransform: "uppercase" }}>
        Leyenda
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
          {it.shape === "diamond" ? (
            <svg width={14} height={14}><polygon points="7,1 13,7 7,13 1,7" fill="#1c1f24" stroke={it.color} strokeWidth="1.5" /></svg>
          ) : (
            <div style={{
              width: it.shape === "dashed" ? 18 : 12,
              height: it.shape === "dashed" ? 2 : 10,
              borderRadius: it.shape === "pill" ? 5 : it.shape === "rect" ? 2 : 0,
              background: it.shape === "dashed" ? "transparent" : it.color,
              border: it.shape === "dashed" ? `2px dashed ${it.color}` : "none",
              flexShrink: 0,
            }} />
          )}
          <span style={{ fontSize: 10, color: "#c9d1d9", fontFamily: "sans-serif" }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── App ────────────────────────────────────────────────────────────────── */
export default function PinguinosFlowchart() {
  const [nodes_, , onNodesChange] = useNodesState(nodes);
  const [edges_, , onEdgesChange] = useEdgesState(edges);

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0d1117", position: "relative", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{
        position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
        zIndex: 100, textAlign: "center", pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3", letterSpacing: 1.5, fontFamily: "sans-serif" }}>
          🐧 SIMULACIÓN · AGRUPAMIENTO DE PINGÜINOS EMPERADOR
        </div>
        <div style={{ fontSize: 10, color: "#8b949e", marginTop: 2 }}>
          Modelo Basado en Agentes · Invierno Antártico · UPTC 2026
        </div>
      </div>

      <Legend />

      <ReactFlow
        nodes={nodes_}
        edges={edges_}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.08}
        maxZoom={2}
        style={{ background: "#0d1117" }}
        defaultEdgeOptions={{ type: "labeled" }}
      >
        <Background color="#161b22" gap={28} size={1.2} />
        <Controls style={{ bottom: 16, right: 16, top: "auto" }} />
        <MiniMap
          nodeColor={(n) => {
            const m = { proceso: "#3fb950", decision: "#e3b341", inicio: "#388bfd" };
            const t = n.data?.tipo || "";
            if (t === "inicio" || t === "fin") return "#388bfd";
            if (t === "resultado") return "#f78166";
            if (t === "accion") return "#bc8cff";
            if (t === "loop") return "#56d364";
            if (n.type === "decision") return "#e3b341";
            return "#3fb950";
          }}
          style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8 }}
          maskColor="rgba(13,17,23,0.75)"
        />
      </ReactFlow>
    </div>
  );
}