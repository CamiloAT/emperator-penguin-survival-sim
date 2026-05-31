/**
 * Penguin Agent
 * Each penguin is an autonomous agent with individual attributes
 */
import { Egg, EGG_STATE } from './Egg.js';
import {
  DEFAULT_BODY_TEMP, DEFAULT_ENERGY, CRITICAL_TEMP_THRESHOLD,
  ENERGY_DECAY_BASE, ENERGY_DECAY_BORDER, HEAT_TRANSFER_RATE,
  HEAT_LOSS_INTERIOR, HEAT_LOSS_BORDER_BASE,
  EGG_LOSS_PROB_NORMAL, EGG_LOSS_PROB_BORDER, EGG_SEARCH_RADIUS
} from './constants.js';

export const PENGUIN_STATE = {
  NORMAL: 'normal',
  SEARCHING_EGG: 'searching_egg',
  DEAD: 'dead'
};

let penguinIdCounter = 0;

export class Penguin {
  constructor(x, y, config = {}) {
    this.id = ++penguinIdCounter;
    this.x = x;
    this.y = y;
    this.config = config;
    this.bodyTemp = config.bodyTemp || DEFAULT_BODY_TEMP;
    this.energy = config.energy || DEFAULT_ENERGY;
    this.state = PENGUIN_STATE.NORMAL;
    this.isBorder = false;
    this.neighborCount = 0;
    
    // Solo ~60% de los pingüinos tienen huevo
    this.hasEgg = Math.random() < 0.6;
    this.egg = this.hasEgg ? new Egg(this.id) : null;
    if (this.egg) {
      this.egg.maxExposureTime = config.eggSearchTimeLimit || 180;
    }
    
    this.fatReserve = this.energy;

    // Tracking
    this.timeBorder = 0;
    this.timeInterior = 0;
    this.timeSearching = 0;
    this.moved = false;
    this.searchTarget = null;
  }

  get isAlive() {
    return this.state !== PENGUIN_STATE.DEAD;
  }

  /**
   * Calculate heat loss per step
   */
  calculateHeatLoss(extTemp, windSpeed, windDir) {
    if (!this.isAlive) return 0;

    const windChill = windSpeed * 0.01;
    const baseBorderLoss = this.config.heatLossBorderBase ?? HEAT_LOSS_BORDER_BASE;
    const baseInteriorLoss = this.config.heatLossInterior ?? HEAT_LOSS_INTERIOR;
    
    if (this.isBorder) {
      // Border penguins lose more heat, wind effect is significant
      return baseBorderLoss + windChill * 0.005 + (this.bodyTemp - extTemp) * 0.0001;
    } else {
      // Interior penguins are protected
      return baseInteriorLoss + (this.bodyTemp - extTemp) * 0.00001;
    }
  }

  /**
   * Heat transfer from neighbors
   */
  applyHeatTransfer(neighbors) {
    if (!this.isAlive || neighbors.length === 0) return;
    
    let heatGain = 0;
    const transferRate = this.config.heatTransferRate ?? HEAT_TRANSFER_RATE;
    for (const neighbor of neighbors) {
      if (neighbor.isAlive) {
        const diff = neighbor.bodyTemp - this.bodyTemp;
        heatGain += diff * transferRate * 0.1;
      }
    }
    this.bodyTemp += heatGain / Math.max(1, neighbors.length);
  }

  /**
   * Update energy consumption
   */
  updateEnergy(phaseMultiplier = 1.0, extraThermogenesisCost = 0) {
    if (!this.isAlive) return;

    const decayBorder = this.config.energyDecayBorder ?? ENERGY_DECAY_BORDER;
    const decayBase = this.config.energyDecayBase ?? ENERGY_DECAY_BASE;
    const baseDecay = this.isBorder ? decayBorder : decayBase;
    
    const defaultBodyTemp = this.config.bodyTemp ?? DEFAULT_BODY_TEMP;
    const thermoStress = Math.max(0, (defaultBodyTemp - this.bodyTemp) * 0.0001);
    const totalDecay = (baseDecay + thermoStress) * phaseMultiplier + extraThermogenesisCost;
    
    this.energy -= totalDecay;
    this.fatReserve -= totalDecay * 0.8;

    if (this.energy <= 0) {
      this.energy = 0;
      this.die();
    }
  }

  /**
   * Check if penguin should try to move to interior
   */
  shouldMoveInward(criticalTemp = CRITICAL_TEMP_THRESHOLD) {
    return this.isAlive && this.isBorder && this.bodyTemp < criticalTemp && this.state === PENGUIN_STATE.NORMAL;
  }

  /**
   * Stochastic egg loss check
   * Returns true if egg was lost
   */
  checkEggLoss(hasMoved, baseProbNormal = EGG_LOSS_PROB_NORMAL, baseProbBorder = EGG_LOSS_PROB_BORDER) {
    if (!this.isAlive || !this.hasEgg || this.egg.state !== EGG_STATE.STABLE) return false;
    if (!hasMoved) return false;

    const prob = this.isBorder ? baseProbBorder : baseProbNormal;
    
    if (Math.random() < prob) {
      this.loseEgg();
      return true;
    }
    return false;
  }

  /** Drop the egg at current position */
  loseEgg() {
    if (!this.egg) return;
    this.hasEgg = false;
    this.egg.drop(this.x, this.y, 0, 0); // temp/wind set externally
    this.state = PENGUIN_STATE.SEARCHING_EGG;
    this.searchTarget = { x: this.x, y: this.y };
  }

  /** Try to recover egg if nearby */
  tryRecoverEgg(grid) {
    if (this.state !== PENGUIN_STATE.SEARCHING_EGG || !this.egg) return false;
    if (this.egg.state === EGG_STATE.FROZEN) {
      this.state = PENGUIN_STATE.NORMAL;
      this.hasEgg = false;
      return false;
    }

    // Pingüino debe buscar por al menos 15 minutos (pasos) para que sea visible la animación
    if (this.timeSearching < 15) return false;

    // Check if egg is at current position or adjacent
    const dx = Math.abs(this.x - this.egg.x);
    const dy = Math.abs(this.y - this.egg.y);
    if (dx <= 1 && dy <= 1) {
      this.egg.recover();
      this.hasEgg = true;
      this.state = PENGUIN_STATE.NORMAL;
      this.searchTarget = null;
      this.timeSearching = 0;
      return true;
    }
    return false;
  }

  /** Kill the penguin */
  die() {
    this.state = PENGUIN_STATE.DEAD;
    if (this.hasEgg) {
      this.loseEgg();
      this.state = PENGUIN_STATE.DEAD; // Override the searching state
    }
  }

  /**
   * Track time spent in each state
   */
  trackState() {
    if (!this.isAlive) return;
    if (this.state === PENGUIN_STATE.SEARCHING_EGG) {
      this.timeSearching++;
    } else if (this.isBorder) {
      this.timeBorder++;
    } else {
      this.timeInterior++;
    }
  }
}

export function resetPenguinIdCounter() {
  penguinIdCounter = 0;
}

