/**
 * Environment
 * Manages Antarctic winter conditions: temperature, wind, phases
 */
import { PHASE_LIST, MINUTES_PER_DAY, WIND_DIRECTIONS } from './constants.js';

export class Environment {
  constructor(config = {}) {
    this.config = config;
    this.temperature = -25;
    this.windSpeed = 50;
    this.windDirection = 'S';
    this.windAngle = Math.PI; // South = down
    
    this.updatePhaseList();
    this.currentPhase = this.phaseList[0];
    this.currentPhaseIndex = 0;
    this.dayInPhase = 0;
    this.totalDay = 0;
    this.step = 0;
  }

  updatePhaseList() {
    const c = this.config;
    this.phaseList = [
      {
        id: 0,
        name: 'Inicio de Incubación',
        month: 'Junio',
        tempRange: [c?.phase0TempMin ?? -25, c?.phase0TempMax ?? -35],
        windRange: [c?.phase0WindMin ?? 40, c?.phase0WindMax ?? 80],
        durationDays: c?.phase0Duration ?? 30,
        energyMultiplier: c?.phase0EnergyMultiplier ?? 1.0,
        description: 'Frío moderado, reservas energéticas altas'
      },
      {
        id: 1,
        name: 'Invierno Profundo',
        month: 'Julio',
        tempRange: [c?.phase1TempMax ?? -60, c?.phase1TempMin ?? -40], // Ensure order min -> max
        windRange: [c?.phase1WindMin ?? 80, c?.phase1WindMax ?? 200],
        durationDays: c?.phase1Duration ?? 31,
        energyMultiplier: c?.phase1EnergyMultiplier ?? 2.0,
        description: 'Frío extremo y vientos máximos, reservas críticas'
      },
      {
        id: 2,
        name: 'Pre-Eclosión',
        month: 'Agosto',
        tempRange: [c?.phase2TempMax ?? -30, c?.phase2TempMin ?? -20], // Ensure order min -> max
        windRange: [c?.phase2WindMin ?? 50, c?.phase2WindMax ?? 60],
        durationDays: c?.phase2Duration ?? 31,
        energyMultiplier: c?.phase2EnergyMultiplier ?? 1.3,
        description: 'Temperaturas en ascenso, energía límite'
      }
    ];
  }

  /**
   * Update environment for current step
   */
  update(step) {
    this.step = step;
    this.totalDay = Math.floor(step / MINUTES_PER_DAY);
    
    // Determine phase
    let dayAccum = 0;
    for (let i = 0; i < this.phaseList.length; i++) {
      if (this.totalDay < dayAccum + this.phaseList[i].durationDays) {
        this.currentPhaseIndex = i;
        this.currentPhase = this.phaseList[i];
        this.dayInPhase = this.totalDay - dayAccum;
        break;
      }
      dayAccum += this.phaseList[i].durationDays;
    }

    // Calculate temperature with daily variation
    const phase = this.currentPhase;
    const phaseProgress = this.dayInPhase / phase.durationDays;
    const [tMin, tMax] = phase.tempRange;
    
    // Smooth transition: start warm, get colder, then warm again
    const baseTemp = tMin + (tMax - tMin) * Math.sin(phaseProgress * Math.PI);
    
    // Daily cycle: slightly warmer during "day" (though it's dark)
    const minuteOfDay = step % MINUTES_PER_DAY;
    const dailyVariation = 2 * Math.sin((minuteOfDay / MINUTES_PER_DAY) * 2 * Math.PI);
    
    // Add some noise
    const noise = (Math.random() - 0.5) * 1.5;
    
    this.temperature = Math.max(-75, Math.min(-10, baseTemp + dailyVariation + noise));

    // Wind speed with gusts
    const [wMin, wMax] = phase.windRange;
    const baseWind = wMin + (wMax - wMin) * (0.5 + 0.5 * Math.sin(phaseProgress * Math.PI));
    const gustNoise = (Math.random() - 0.5) * 30;
    this.windSpeed = Math.max(10, Math.min(250, baseWind + gustNoise));

    // Wind direction shifts slowly
    if (step % (MINUTES_PER_DAY * 2) === 0) {
      const dirIdx = Math.floor(Math.random() * WIND_DIRECTIONS.length);
      this.windDirection = WIND_DIRECTIONS[dirIdx];
      this.windAngle = (dirIdx / WIND_DIRECTIONS.length) * 2 * Math.PI;
    }
  }

  /** Get the wind effect multiplier based on position relative to wind */
  getWindEffect(x, y, centerX, centerY) {
    // Penguins on the windward side lose more heat
    const dx = x - centerX;
    const dy = y - centerY;
    const angle = Math.atan2(dy, dx);
    const windAlignment = Math.cos(angle - this.windAngle);
    return Math.max(0, windAlignment); // 0 = leeward, 1 = windward
  }

  /** Phase progress as 0-1 */
  get phaseProgress() {
    return this.dayInPhase / this.currentPhase.durationDays;
  }

  /** Overall simulation progress as 0-1 */
  get totalProgress() {
    const totalDays = this.phaseList.reduce((s, p) => s + p.durationDays, 0);
    return Math.min(1, this.totalDay / totalDays);
  }

  get phaseEnergyMultiplier() {
    return this.currentPhase.energyMultiplier;
  }
}
