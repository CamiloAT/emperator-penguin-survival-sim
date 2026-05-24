/**
 * Simulation Engine
 * Main loop controlling the ABM simulation
 */
import { Grid } from './Grid.js';
import { Penguin, PENGUIN_STATE, resetPenguinIdCounter } from './Penguin.js';
import { EGG_STATE, resetEggIdCounter } from './Egg.js';
import { Environment } from './Environment.js';
import { GRID_SIZE, EGG_SEARCH_RADIUS, MINUTES_PER_DAY, PHASE_LIST } from './constants.js';

export class SimulationEngine {
  constructor(config = {}) {
    this.colonySize = config.colonySize || 80;
    this.gridSize = config.gridSize || GRID_SIZE;
    this.stepsPerTick = config.stepsPerTick || 60; // How many sim steps per animation frame
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
      totalEggsDropped: 0
    };
    this.droppedEggs = []; // Eggs on the ground
    this.totalSteps = PHASE_LIST.reduce((s, p) => s + p.durationDays, 0) * MINUTES_PER_DAY;
  }

  /** Initialize the simulation */
  init() {
    resetPenguinIdCounter();
    resetEggIdCounter();
    
    this.grid = new Grid(this.gridSize);
    this.env = new Environment();
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
      totalEggsDropped: 0
    };

    // Place penguins in a circular huddle pattern at center
    const cx = Math.floor(this.gridSize / 2);
    const cy = Math.floor(this.gridSize / 2);
    const radius = Math.ceil(Math.sqrt(this.colonySize / Math.PI));
    
    let placed = 0;
    // Spiral outward from center
    for (let r = 0; r <= radius + 5 && placed < this.colonySize; r++) {
      for (let dx = -r; dx <= r && placed < this.colonySize; dx++) {
        for (let dy = -r; dy <= r && placed < this.colonySize; dy++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue; // Only ring
          const x = cx + dx, y = cy + dy;
          if (Math.sqrt(dx * dx + dy * dy) <= radius + 2 && this.grid.isEmpty(x, y)) {
            const p = new Penguin(x, y);
            this.penguins.push(p);
            this.grid.set(x, y, p);
            placed++;
          }
        }
      }
    }

    // Fill inner holes
    for (let r = 0; r <= radius && placed < this.colonySize; r++) {
      for (let dx = -r; dx <= r && placed < this.colonySize; dx++) {
        for (let dy = -r; dy <= r && placed < this.colonySize; dy++) {
          const x = cx + dx, y = cy + dy;
          if (this.grid.isEmpty(x, y) && Math.sqrt(dx * dx + dy * dy) <= radius) {
            const p = new Penguin(x, y);
            this.penguins.push(p);
            this.grid.set(x, y, p);
            placed++;
          }
        }
      }
    }

    this.updateBorderStatus();
    this.env.update(0);

    return this.getState();
  }

  /** Run one tick of the simulation */
  tick() {
    if (this.finished) return this.getState();

    for (let s = 0; s < this.stepsPerTick; s++) {
      this.step++;
      
      // Check if simulation is complete
      if (this.step >= this.totalSteps) {
        this.finished = true;
        this.running = false;
        this.addEvent('simulation_end', 'La simulación ha finalizado. Los polluelos están por eclosionar.');
        break;
      }

      // 1. Update environment
      this.env.update(this.step);

      // 2. Update border status
      this.updateBorderStatus();

      const center = this.grid.getCenter();

      // 3. Process each penguin
      const shuffled = [...this.penguins].sort(() => Math.random() - 0.5);
      
      for (const p of shuffled) {
        if (!p.isAlive) continue;

        // a) Heat loss
        const heatLoss = p.calculateHeatLoss(this.env.temperature, this.env.windSpeed, this.env.windDirection);
        const windEffect = this.env.getWindEffect(p.x, p.y, center.x, center.y);
        p.bodyTemp -= heatLoss * (1 + windEffect * 0.5);

        // b) Heat transfer from neighbors
        const neighbors = this.grid.getNeighbors(p.x, p.y);
        p.neighborCount = neighbors.length;
        p.applyHeatTransfer(neighbors);

        // c) Energy consumption
        p.updateEnergy(this.env.phaseEnergyMultiplier);

        // d) Check death
        if (!p.isAlive) {
          this.stats.penguinsDead++;
          this.grid.clear(p.x, p.y);
          if (p.egg.state === EGG_STATE.EXPOSED) {
            this.droppedEggs.push(p.egg);
          }
          if (this.step % MINUTES_PER_DAY < this.stepsPerTick) {
            this.addEvent('penguin_death', `Pingüino #${p.id} ha muerto por inanición. Día ${this.env.totalDay}.`);
          }
          continue;
        }

        // e) If searching for egg
        if (p.state === PENGUIN_STATE.SEARCHING_EGG) {
          p.timeSearching++;
          if (p.tryRecoverEgg(this.grid)) {
            this.stats.eggsRecovered++;
            this.droppedEggs = this.droppedEggs.filter(e => e.id !== p.egg.id);
            this.addEvent('egg_recovered', `Pingüino #${p.id} recuperó su huevo exitosamente.`);
          } else {
            // Move toward egg
            this.moveToward(p, p.egg.x, p.egg.y);
          }
          continue;
        }

        // f) Movement - huddle rotation
        p.moved = false;
        if (p.shouldMoveInward()) {
          this.moveTowardCenter(p, center);
          p.moved = true;
        }

        // g) Stochastic egg loss
        if (p.moved && p.checkEggLoss(true)) {
          p.egg.drop(p.x, p.y, this.env.temperature, this.env.windSpeed);
          this.droppedEggs.push(p.egg);
          this.stats.totalEggsDropped++;
          this.stats.eggsLost++;
          this.addEvent('egg_lost', `¡Pingüino #${p.id} perdió su huevo! Temp: ${this.env.temperature.toFixed(1)}°C`);
        }

        // h) Track state
        p.trackState();
      }

      // 4. Update exposed eggs
      for (const egg of this.droppedEggs) {
        if (egg.state === EGG_STATE.EXPOSED) {
          egg.calculateMaxExposure(this.env.temperature, this.env.windSpeed);
          if (egg.updateExposure(1)) {
            this.stats.eggsFrozen++;
            this.stats.eggsLost--;
            this.addEvent('egg_frozen', `Un huevo se congeló en el hielo. Exposición total agotada.`);
          }
        }
      }
      this.droppedEggs = this.droppedEggs.filter(e => e.state === EGG_STATE.EXPOSED);

      // 5. Record stats every simulated hour (60 steps)
      if (this.step % 60 === 0) {
        this.recordStats();
      }
    }

    return this.getState();
  }

  /** Update which penguins are on the border vs interior */
  updateBorderStatus() {
    for (const p of this.penguins) {
      if (!p.isAlive) continue;
      const neighbors = this.grid.getNeighbors(p.x, p.y);
      const aliveNeighbors = neighbors.filter(n => n.isAlive);
      // A penguin is on the border if it has < 6 neighbors (out of 8 possible)
      p.isBorder = aliveNeighbors.length < 6;
      p.neighborCount = aliveNeighbors.length;
    }
  }

  /** Move penguin toward center of huddle */
  moveTowardCenter(penguin, center) {
    const dx = center.x - penguin.x;
    const dy = center.y - penguin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    const stepX = Math.sign(dx);
    const stepY = Math.sign(dy);

    // Try to move closer to center
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
        // Swap positions
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
    const alive = this.penguins.filter(p => p.isAlive);
    const avgTemp = alive.length > 0 
      ? alive.reduce((s, p) => s + p.bodyTemp, 0) / alive.length 
      : 0;
    const avgEnergy = alive.length > 0
      ? alive.reduce((s, p) => s + p.energy, 0) / alive.length
      : 0;
    const viableEggs = this.penguins.filter(p => p.hasEgg && p.egg.state === EGG_STATE.STABLE).length;
    const borderCount = alive.filter(p => p.isBorder).length;

    this.stats.history.push({
      step: this.step,
      day: this.env.totalDay,
      hour: Math.floor((this.step % MINUTES_PER_DAY) / 60),
      alive: alive.length,
      dead: this.stats.penguinsDead,
      avgTemp: Math.round(avgTemp * 10) / 10,
      avgEnergy: Math.round(avgEnergy * 10) / 10,
      temperature: Math.round(this.env.temperature * 10) / 10,
      windSpeed: Math.round(this.env.windSpeed),
      viableEggs,
      borderCount,
      interiorCount: alive.length - borderCount,
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
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
  }

  /** Get current simulation state for rendering */
  getState() {
    const alive = this.penguins.filter(p => p.isAlive);
    const viableEggs = this.penguins.filter(p => p.hasEgg && p.egg.state === EGG_STATE.STABLE).length;

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
        dayInPhase: this.env.dayInPhase
      } : null,
      colony: {
        total: this.colonySize,
        alive: alive.length,
        dead: this.stats.penguinsDead,
        avgTemp: alive.length > 0 ? alive.reduce((s, p) => s + p.bodyTemp, 0) / alive.length : 0,
        avgEnergy: alive.length > 0 ? alive.reduce((s, p) => s + p.energy, 0) / alive.length : 0,
        borderCount: alive.filter(p => p.isBorder).length,
        interiorCount: alive.filter(p => !p.isBorder).length,
        viableEggs,
        survivalRate: (alive.length / this.colonySize) * 100,
        eggSurvivalRate: (viableEggs / this.colonySize) * 100
      },
      eggs: {
        total: this.colonySize,
        viable: viableEggs,
        dropped: this.droppedEggs.length,
        frozen: this.stats.eggsFrozen,
        recovered: this.stats.eggsRecovered,
        totalDropped: this.stats.totalEggsDropped,
        rescueEfficiency: this.stats.totalEggsDropped > 0 
          ? (this.stats.eggsRecovered / this.stats.totalEggsDropped) * 100 
          : 100
      },
      penguins: this.penguins,
      droppedEggs: this.droppedEggs,
      gridSize: this.gridSize,
      events: this.events.slice(-20),
      stats: this.stats
    };
  }
}
