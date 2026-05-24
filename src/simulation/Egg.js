/**
 * Egg Entity
 * Sub-agent representing the egg each penguin carries
 */
export const EGG_STATE = {
  STABLE: 'stable',       // Protected inside brood pouch
  EXPOSED: 'exposed',     // On the ice, cooling down
  FROZEN: 'frozen'        // Dead (time ran out)
};

let eggIdCounter = 0;

export class Egg {
  constructor(parentId) {
    this.id = ++eggIdCounter;
    this.parentId = parentId;
    this.state = EGG_STATE.STABLE;
    this.x = null;
    this.y = null;
    this.exposureTime = 0;     // Time spent exposed (seconds/steps)
    this.maxExposureTime = 180; // Will be recalculated based on conditions
    this.recovered = false;
  }

  /**
   * Calculate the maximum exposure time based on environmental conditions
   * Formula: Tiempo_Límite = 180 - (Text * -2) - (Viento * 0.5)
   */
  calculateMaxExposure(temperature, windSpeed) {
    // temperature is negative, so Text * -2 means colder = less time
    this.maxExposureTime = Math.max(60, Math.min(180, 
      180 - (temperature * -2) - (windSpeed * 0.5)
    ));
  }

  /** Drop egg at a position on the ice */
  drop(x, y, temperature, windSpeed) {
    this.state = EGG_STATE.EXPOSED;
    this.x = x;
    this.y = y;
    this.exposureTime = 0;
    this.calculateMaxExposure(temperature, windSpeed);
  }

  /** Update exposed egg - returns true if frozen */
  updateExposure(deltaTime = 1) {
    if (this.state !== EGG_STATE.EXPOSED) return false;
    this.exposureTime += deltaTime;
    if (this.exposureTime >= this.maxExposureTime) {
      this.state = EGG_STATE.FROZEN;
      return true;
    }
    return false;
  }

  /** Recover egg */
  recover() {
    if (this.state === EGG_STATE.EXPOSED) {
      this.state = EGG_STATE.STABLE;
      this.recovered = true;
      this.x = null;
      this.y = null;
      return true;
    }
    return false;
  }

  /** Remaining exposure time percentage */
  get exposureProgress() {
    if (this.state !== EGG_STATE.EXPOSED) return 0;
    return this.exposureTime / this.maxExposureTime;
  }
}

export function resetEggIdCounter() {
  eggIdCounter = 0;
}
