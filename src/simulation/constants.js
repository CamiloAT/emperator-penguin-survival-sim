/**
 * Simulation Constants
 * All parameters for the Emperor Penguin ABM simulation
 */

// Winter phases (Antarctic winter: June-August)
export const PHASES = {
  INCUBATION_START: {
    id: 0,
    name: 'Inicio de Incubación',
    month: 'Junio',
    tempRange: [-25, -35],
    windRange: [40, 80],
    durationDays: 30,
    energyMultiplier: 1.0,
    description: 'Frío moderado, reservas energéticas altas'
  },
  DEEP_WINTER: {
    id: 1,
    name: 'Invierno Profundo',
    month: 'Julio',
    tempRange: [-40, -60],
    windRange: [80, 200],
    durationDays: 31,
    energyMultiplier: 2.0,
    description: 'Frío extremo y vientos máximos, reservas críticas'
  },
  PRE_HATCHING: {
    id: 2,
    name: 'Pre-Eclosión',
    month: 'Agosto',
    tempRange: [-30, -20],
    windRange: [50, 60],
    durationDays: 31,
    energyMultiplier: 1.3,
    description: 'Temperaturas en ascenso, energía límite'
  }
};

export const PHASE_LIST = [PHASES.INCUBATION_START, PHASES.DEEP_WINTER, PHASES.PRE_HATCHING];

// Time scale: 1 step = 1 minute
export const MINUTES_PER_DAY = 1440;
export const TOTAL_DAYS = 92; // ~3 months
export const TOTAL_STEPS = TOTAL_DAYS * MINUTES_PER_DAY;

// Penguin defaults
export const DEFAULT_BODY_TEMP = 38.0;     // °C
export const CRITICAL_TEMP_THRESHOLD = 34.0; // °C - triggers movement to interior
export const HYPOTHERMIA_TEMP = 30.0;       // °C - danger zone
export const DEFAULT_ENERGY = 100.0;        // Percentage (lipid reserve)
export const ENERGY_DECAY_BASE = 0.0002;    // Per step, at interior
export const ENERGY_DECAY_BORDER = 0.0008;   // Per step, at border
export const HEAT_TRANSFER_RATE = 0.15;     // Between neighbors per step
export const HEAT_LOSS_INTERIOR = 0.0005;    // Per step, interior
export const HEAT_LOSS_BORDER_BASE = 0.004;  // Per step, border base

// Egg parameters
export const EGG_LOSS_PROB_NORMAL = 0.005;  // 0.5% per movement
export const EGG_LOSS_PROB_BORDER = 0.015;  // 1.5% at border
export const EGG_INCUBATION_TEMP = 36.0;    // °C inside brood pouch
export const EGG_SEARCH_RADIUS = 2;         // Cells
export const EGG_SEARCH_TIME_LIMIT = 180;   // Seconds (steps since 1 step = 1 min, but we simulate sub-steps)

// Grid
export const DEFAULT_COLONY_SIZE = 80;
export const GRID_SIZE = 40;

// Visualization
export const CELL_SIZE = 14;

// Wind directions
export const WIND_DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
