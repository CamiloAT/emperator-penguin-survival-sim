/**
 * Simulation Engine
 * Main loop controlling the ABM simulation
 * Optimized: avoids per-frame allocations, caches values, Fisher-Yates shuffle
 */
import { Grid } from './Grid.js';
import { Penguin, PENGUIN_STATE, resetPenguinIdCounter } from './Penguin.js';
import { EGG_STATE, resetEggIdCounter } from './Egg.js';
import { Environment } from './Environment.js';
import { GRID_SIZE, MINUTES_PER_DAY } from './constants.js';

export class SimulationEngine {
  constructor(config = {}) {
    this.config = config;
    this.colonySize = config.colonySize || 80;
    this.gridSize = config.gridSize || GRID_SIZE;
    this.stepsPerTick = config.stepsPerTick || 60;
    this.grid = null;
    this.penguins = [];
    this.env = null;
    this.step = 0;
    this.running = false;
    this.finished = false;
    this.events = [];
    this.stats = {
      history: [],
      eggsLost: 0,
      eggsRecovered: 0,
      eggsFrozen: 0,
      penguinsDead: 0,
      deathsByHypothermia: 0,
      deathsByStarvation: 0,
      totalEggsDropped: 0
    };
    this.droppedEggs = [];

    // Cache config values for hot loop (avoids ?? per step)
    this.cfg = {
      heatTransferRate: config.heatTransferRate ?? 0.15,
      maxThermogenesis: config.maxThermogenesis ?? 0.008,
      thermogenesisEnergyFactor: config.thermogenesisEnergyFactor ?? 0.05,
      hypothermiaTemp: config.hypothermiaTemp ?? 28,
      bodyTemp: config.bodyTemp ?? 38,
      criticalTemp: config.criticalTemp ?? 34,
      eggLossProb: config.eggLossProb ?? 0.005,
      eggLossProbBorder: config.eggLossProbBorder ?? 0.015,
      energyDecayBase: config.energyDecayBase ?? 0.0002,
      energyDecayBorder: config.energyDecayBorder ?? 0.0008,
      heatLossBorderBase: config.heatLossBorderBase ?? 0.002,
      heatLossInterior: config.heatLossInterior ?? 0.0002,
    };

    // Build dynamic phase list
    this.updatePhaseList();
    const totalDays = this.phaseList.reduce((s, p) => s + p.durationDays, 0);
    this.totalSteps = totalDays * MINUTES_PER_DAY;
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
        tempRange: [c?.phase1TempMax ?? -60, c?.phase1TempMin ?? -40],
        windRange: [c?.phase1WindMin ?? 80, c?.phase1WindMax ?? 200],
        durationDays: c?.phase1Duration ?? 31,
        energyMultiplier: c?.phase1EnergyMultiplier ?? 1.5,
        description: 'Frío extremo y vientos máximos, reservas críticas'
      },
      {
        id: 2,
        name: 'Pre-Eclosión',
        month: 'Agosto',
        tempRange: [c?.phase2TempMax ?? -30, c?.phase2TempMin ?? -20],
        windRange: [c?.phase2WindMin ?? 50, c?.phase2WindMax ?? 60],
        durationDays: c?.phase2Duration ?? 31,
        energyMultiplier: c?.phase2EnergyMultiplier ?? 1.1,
        description: 'Temperaturas en ascenso, energía límite'
      }
    ];
  }

  /** Initialize the simulation */
  init() {
    resetPenguinIdCounter();
    resetEggIdCounter();

    this.grid = new Grid(this.gridSize);
    this.env = new Environment(this.config);
    this.penguins = [];
    this.step = 0;
    this.running = false;
    this.finished = false;
    this.events = [];
    this.droppedEggs = [];
    this.stats = {
      history: [],
      eggsLost: 0,
      eggsRecovered: 0,
      eggsFrozen: 0,
      penguinsDead: 0,
      deathsByHypothermia: 0,
      deathsByStarvation: 0,
      totalEggsDropped: 0
    };

    // Place penguins in a tight circle (start huddled)
    const cx = Math.floor(this.gridSize / 2);
    const cy = Math.floor(this.gridSize / 2);
    const scatterRadius = Math.min(this.gridSize * 0.25, Math.sqrt(this.colonySize) * 1.2);

    let placed = 0;
    let attempts = 0;
    while (placed < this.colonySize && attempts < this.colonySize * 20) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * scatterRadius;
      let x = cx + Math.floor(Math.cos(angle) * r);
      let y = cy + Math.floor(Math.sin(angle) * r);
      x = Math.max(1, Math.min(this.gridSize - 2, x));
      y = Math.max(1, Math.min(this.gridSize - 2, y));

      if (this.grid.isEmpty(x, y)) {
        const p = new Penguin(x, y, this.config);
        this.penguins.push(p);
        this.grid.set(x, y, p);
        placed++;
      }
    }
    this.updateBorderStatus();
    this.env.update(0);

    this.addEvent('simulation_start', 'La colonia ha llegado al sitio de anidación. Comienza el duro invierno antártico.');

    return this.getState();
  }

  /** Fisher-Yates in-place shuffle (avoids sort allocation) */
  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  }

  /** Force-finish the simulation */
  forceFinish() {
    this.finished = true;
    this.running = false;
    this.addEvent('simulation_end', 'La simulación fue detenida manualmente.');
    return this.getState();
  }

  /** Run one tick of the simulation */
  tick() {
    if (this.finished) return this.getState();

    const cfg = this.cfg;

    for (let s = 0; s < this.stepsPerTick; s++) {
      this.step++;

      if (this.step >= this.totalSteps) {
        this.finished = true;
        this.running = false;
        this.addEvent('simulation_end', 'La simulación ha finalizado. Los polluelos están por eclosionar.');
        break;
      }

      // 1. Update environment
      const prevPhaseIndex = this.env.currentPhaseIndex;
      this.env.update(this.step);
      if (prevPhaseIndex !== undefined && prevPhaseIndex !== this.env.currentPhaseIndex) {
        this.addEvent('phase_change', `Cambio de clima: La colonia ha entrado en la fase '${this.env.currentPhase.name}'.`);
      }

      // 2. Update border status (every 10 steps for perf)
      if (this.step % 10 === 0) {
        this.updateBorderStatus();
      }

      const center = this.grid.getCenter();
      const phaseMultiplier = this.env.phaseEnergyMultiplier;

      // 3. Process each penguin (shuffle in-place)
      this.shuffleArray(this.penguins);

      for (let i = 0; i < this.penguins.length; i++) {
        const p = this.penguins[i];
        if (!p.isAlive) continue;

        // a) Heat loss
        const windChill = this.env.windSpeed * 0.01;
        let heatLoss;
        if (p.isBorder) {
          heatLoss = cfg.heatLossBorderBase + windChill * 0.003 + (p.bodyTemp - this.env.temperature) * 0.00005;
        } else {
          heatLoss = cfg.heatLossInterior + (p.bodyTemp - this.env.temperature) * 0.000005;
        }

        const windEffect = this.env.getWindEffect(p.x, p.y, center.x, center.y);
        const totalHeatLoss = heatLoss * (1 + windEffect * 0.3);

        // b) Heat transfer from neighbors (inline for perf)
        let heatGain = 0;
        let nCount = 0;
        const dirs = Grid.DIRS;
        for (let d = 0; d < 8; d++) {
          const nx = p.x + dirs[d][0], ny = p.y + dirs[d][1];
          if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
            const neighbor = this.grid.cells[ny * this.gridSize + nx];
            if (neighbor && neighbor.isAlive) {
              heatGain += (neighbor.bodyTemp - p.bodyTemp) * cfg.heatTransferRate * 0.1;
              nCount++;
            }
          }
        }
        const avgHeatGain = nCount > 0 ? heatGain / nCount : 0;

        // c) Active Metabolic Thermogenesis (Homeostasis)
        const netHeatExchange = totalHeatLoss - avgHeatGain;
        let metabolicHeat = 0;
        let thermogenesisEnergyCost = 0;

        if (p.energy > 0 && netHeatExchange > 0) {
          // Thermogenesis capacity scales gently with energy (sqrt curve, not linear)
          const capacityFraction = Math.sqrt(p.energy / 100);
          metabolicHeat = Math.min(netHeatExchange, cfg.maxThermogenesis * capacityFraction);
          thermogenesisEnergyCost = metabolicHeat * cfg.thermogenesisEnergyFactor;
        }

        // d) Update body temperature
        p.bodyTemp += metabolicHeat - netHeatExchange;
        if (p.bodyTemp > cfg.bodyTemp) p.bodyTemp = cfg.bodyTemp;

        // e) Energy consumption (base metabolism + thermogenesis cost)
        const baseDecay = p.isBorder ? cfg.energyDecayBorder : cfg.energyDecayBase;
        const thermoStress = p.bodyTemp < cfg.bodyTemp ? (cfg.bodyTemp - p.bodyTemp) * 0.00002 : 0;
        const totalDecay = (baseDecay + thermoStress) * phaseMultiplier + thermogenesisEnergyCost;
        p.energy -= totalDecay;
        p.fatReserve -= totalDecay * 0.8;

        // f) Check death: Hypothermia
        if (p.bodyTemp <= cfg.hypothermiaTemp) {
          p.energy = Math.max(0, p.energy);
          p.die();
          this.stats.penguinsDead++;
          this.stats.deathsByHypothermia++;
          this.grid.clear(p.x, p.y);
          if (p.egg && p.egg.state === EGG_STATE.EXPOSED) {
            this.droppedEggs.push(p.egg);
          }
          this.addEvent('penguin_death', `Pingüino #${p.id} ha muerto por hipotermia (${p.bodyTemp.toFixed(1)}°C). Día ${this.env.totalDay}.`);
          continue;
        }

        // g) Check death: Starvation
        if (p.energy <= 0) {
          p.energy = 0;
          p.die();
          this.stats.penguinsDead++;
          this.stats.deathsByStarvation++;
          this.grid.clear(p.x, p.y);
          if (p.egg && p.egg.state === EGG_STATE.EXPOSED) {
            this.droppedEggs.push(p.egg);
          }
          this.addEvent('penguin_death', `Pingüino #${p.id} ha muerto por inanición (energía agotada). Día ${this.env.totalDay}.`);
          continue;
        }

        // h) If searching for egg
        if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
          p.timeSearching++;
          if (p.tryRecoverEgg(this.grid)) {
            this.stats.eggsRecovered++;
            this.droppedEggs = this.droppedEggs.filter(e => e.id !== p.egg.id);
            this.addEvent('egg_recovered', `Pingüino #${p.id} recuperó su huevo exitosamente.`);
          } else {
            this.moveToward(p, p.egg.x, p.egg.y);
          }
          continue;
        }

        // i) Movement - huddle rotation
        p.moved = false;
        if (p.isBorder && p.bodyTemp < cfg.criticalTemp && p.state === PENGUIN_STATE.NORMAL) {
          this.moveTowardCenter(p, center);
          p.moved = true;
        }

        // j) Stochastic egg loss
        if (p.moved && p.hasEgg && p.egg && p.egg.state === EGG_STATE.STABLE) {
          const prob = p.isBorder ? cfg.eggLossProbBorder : cfg.eggLossProb;
          if (Math.random() < prob) {
            p.hasEgg = false;
            
            // Huevo se desliza por el viento 2 a 4 celdas
            const windDir = [Math.cos(this.env.windAngle), Math.sin(this.env.windAngle)];
            const rollDist = 2 + Math.floor(Math.random() * 3);
            let ex = Math.round(p.x + windDir[0] * rollDist);
            let ey = Math.round(p.y + windDir[1] * rollDist);
            ex = Math.max(1, Math.min(this.gridSize - 2, ex));
            ey = Math.max(1, Math.min(this.gridSize - 2, ey));

            p.egg.drop(ex, ey, this.env.temperature, this.env.windSpeed);
            p.state = PENGUIN_STATE.SEARCHING_EGG;
            p.searchTarget = { x: ex, y: ey };
            p.timeSearching = 0;
            this.droppedEggs.push(p.egg);
            this.stats.totalEggsDropped++;
            this.stats.eggsLost++;
            this.addEvent('egg_lost', `¡Pingüino #${p.id} perdió su huevo! Se deslizó por el hielo.`);
          }
        }

        // k) Track state
        if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
          p.timeSearching++;
        } else if (p.isBorder) {
          p.timeBorder++;
        } else {
          p.timeInterior++;
        }
      }

      // 4. Update exposed eggs
      for (let i = this.droppedEggs.length - 1; i >= 0; i--) {
        const egg = this.droppedEggs[i];
        if (egg.state === EGG_STATE.EXPOSED) {
          egg.calculateMaxExposure(this.env.temperature, this.env.windSpeed);
          if (egg.updateExposure(1)) {
            this.stats.eggsFrozen++;
            this.stats.eggsLost--;
            this.addEvent('egg_frozen', `Un huevo se congeló en el hielo. Exposición total agotada.`);
          }
        }
        if (egg.state !== EGG_STATE.EXPOSED) {
          this.droppedEggs.splice(i, 1);
        }
      }

      // 5. Record stats every simulated hour
      if (this.step % 60 === 0) {
        this.recordStats();
      }
    }

    return this.getState();
  }

  /** Update which penguins are on the border vs interior */
  updateBorderStatus() {
    for (let i = 0; i < this.penguins.length; i++) {
      const p = this.penguins[i];
      if (!p.isAlive) continue;
      let aliveCount = 0;
      const dirs = Grid.DIRS;
      for (let d = 0; d < 8; d++) {
        const nx = p.x + dirs[d][0], ny = p.y + dirs[d][1];
        if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
          const cell = this.grid.cells[ny * this.gridSize + nx];
          if (cell && cell.isAlive) aliveCount++;
        }
      }
      p.isBorder = aliveCount < 6;
      p.neighborCount = aliveCount;
    }
  }

  /** Move penguin toward center of huddle */
  moveTowardCenter(penguin, center) {
    const dx = center.x - penguin.x;
    const dy = center.y - penguin.y;
    if (dx * dx + dy * dy < 1) return;

    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);
    const candidates = [
      { x: penguin.x + stepX, y: penguin.y + stepY },
      { x: penguin.x + stepX, y: penguin.y },
      { x: penguin.x, y: penguin.y + stepY }
    ];

    for (const pos of candidates) {
      if (this.grid.isEmpty(pos.x, pos.y)) {
        this.grid.clear(penguin.x, penguin.y);
        penguin.x = pos.x;
        penguin.y = pos.y;
        this.grid.set(pos.x, pos.y, penguin);
        return;
      }
    }

    // Try swapping with a warmer interior penguin
    for (const pos of candidates) {
      const other = this.grid.get(pos.x, pos.y);
      if (other && other.isAlive && !other.isBorder && other.bodyTemp > penguin.bodyTemp + 1) {
        this.grid.set(penguin.x, penguin.y, other);
        this.grid.set(pos.x, pos.y, penguin);
        const tmpX = penguin.x, tmpY = penguin.y;
        penguin.x = pos.x; penguin.y = pos.y;
        other.x = tmpX; other.y = tmpY;
        other.moved = true;
        return;
      }
    }
  }

  /** Move penguin toward a specific target */
  moveToward(penguin, tx, ty) {
    const dx = tx - penguin.x;
    const dy = ty - penguin.y;
    const stepX = dx === 0 ? 0 : Math.sign(dx);
    const stepY = dy === 0 ? 0 : Math.sign(dy);
    const candidates = [
      { x: penguin.x + stepX, y: penguin.y + stepY },
      { x: penguin.x + stepX, y: penguin.y },
      { x: penguin.x, y: penguin.y + stepY }
    ];

    for (const pos of candidates) {
      if (this.grid.isEmpty(pos.x, pos.y)) {
        this.grid.clear(penguin.x, penguin.y);
        penguin.x = pos.x;
        penguin.y = pos.y;
        this.grid.set(pos.x, pos.y, penguin);
        return;
      }
    }
  }

  /** Record statistics at current step */
  recordStats() {
    let aliveCount = 0, sumTemp = 0, sumEnergy = 0, borderCount = 0, viableEggs = 0;
    for (let i = 0; i < this.penguins.length; i++) {
      const p = this.penguins[i];
      if (p.isAlive) {
        aliveCount++;
        sumTemp += p.bodyTemp;
        sumEnergy += p.energy;
        if (p.isBorder) borderCount++;
      }
      if (p.hasEgg && p.egg && p.egg.state === EGG_STATE.STABLE) viableEggs++;
    }

    this.stats.history.push({
      step: this.step,
      day: this.env.totalDay,
      hour: Math.floor((this.step % MINUTES_PER_DAY) / 60),
      alive: aliveCount,
      dead: this.stats.penguinsDead,
      avgTemp: aliveCount > 0 ? Math.round((sumTemp / aliveCount) * 10) / 10 : 0,
      avgEnergy: aliveCount > 0 ? Math.round((sumEnergy / aliveCount) * 10) / 10 : 0,
      temperature: Math.round(this.env.temperature * 10) / 10,
      windSpeed: Math.round(this.env.windSpeed),
      viableEggs,
      borderCount,
      interiorCount: aliveCount - borderCount,
      eggsFrozen: this.stats.eggsFrozen,
      phase: this.env.currentPhaseIndex
    });
  }

  /** Add event to log */
  addEvent(type, message) {
    this.events.push({
      step: this.step,
      day: this.env.totalDay,
      type,
      message,
      timestamp: Date.now()
    });
    if (this.events.length > 500) {
      this.events = this.events.slice(-500);
    }
  }

  /** Get current simulation state for rendering */
  getState() {
    let aliveCount = 0, sumTemp = 0, sumEnergy = 0, borderCount = 0, viableEggs = 0;
    for (let i = 0; i < this.penguins.length; i++) {
      const p = this.penguins[i];
      if (p.isAlive) {
        aliveCount++;
        sumTemp += p.bodyTemp;
        sumEnergy += p.energy;
        if (p.isBorder) borderCount++;
      }
      if (p.hasEgg && p.egg && p.egg.state === EGG_STATE.STABLE) viableEggs++;
    }

    return {
      step: this.step,
      day: this.env ? this.env.totalDay : 0,
      running: this.running,
      finished: this.finished,
      environment: this.env ? {
        temperature: this.env.temperature,
        windSpeed: this.env.windSpeed,
        windDirection: this.env.windDirection,
        windAngle: this.env.windAngle,
        phase: this.env.currentPhase,
        phaseIndex: this.env.currentPhaseIndex,
        phaseProgress: this.env.phaseProgress,
        totalProgress: this.env.totalProgress,
        dayInPhase: this.env.dayInPhase,
        phaseList: this.env.phaseList
      } : null,
      colony: {
        total: this.colonySize,
        alive: aliveCount,
        dead: this.stats.penguinsDead,
        avgTemp: aliveCount > 0 ? sumTemp / aliveCount : 0,
        avgEnergy: aliveCount > 0 ? sumEnergy / aliveCount : 0,
        borderCount,
        interiorCount: aliveCount - borderCount,
        viableEggs,
        survivalRate: (aliveCount / this.colonySize) * 100,
        eggSurvivalRate: (viableEggs / this.colonySize) * 100
      },
      eggs: {
        total: this.colonySize,
        viable: viableEggs,
        dropped: this.droppedEggs.length,
        frozen: this.stats.eggsFrozen,
        recovered: this.stats.eggsRecovered,
        totalDropped: this.stats.totalEggsDropped,
        rescueEfficiency: (this.stats.eggsRecovered + this.stats.eggsFrozen) > 0
          ? (this.stats.eggsRecovered / (this.stats.eggsRecovered + this.stats.eggsFrozen)) * 100
          : 100
      },
      penguins: this.penguins,
      droppedEggs: this.droppedEggs,
      gridSize: this.gridSize,
      events: [...this.events],
      stats: this.stats
    };
  }
}
