/**
 * Grid - 2D spatial grid for agent placement
 */
import { GRID_SIZE } from './constants.js';

export class Grid {
  constructor(size = GRID_SIZE) {
    this.size = size;
    this.cells = new Array(size * size).fill(null);
  }

  idx(x, y) {
    return y * this.size + x;
  }

  inBounds(x, y) {
    return x >= 0 && x < this.size && y >= 0 && y < this.size;
  }

  get(x, y) {
    if (!this.inBounds(x, y)) return null;
    return this.cells[this.idx(x, y)];
  }

  set(x, y, value) {
    if (!this.inBounds(x, y)) return;
    this.cells[this.idx(x, y)] = value;
  }

  clear(x, y) {
    if (!this.inBounds(x, y)) return;
    this.cells[this.idx(x, y)] = null;
  }

  isEmpty(x, y) {
    return this.inBounds(x, y) && this.cells[this.idx(x, y)] === null;
  }

  getNeighbors(x, y) {
    const neighbors = [];
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (this.inBounds(nx, ny)) {
        const cell = this.get(nx, ny);
        if (cell) neighbors.push(cell);
      }
    }
    return neighbors;
  }

  getEmptyNeighbors(x, y) {
    const empty = [];
    const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (this.isEmpty(nx, ny)) {
        empty.push({ x: nx, y: ny });
      }
    }
    return empty;
  }

  getEmptyInRadius(x, y, radius) {
    const empty = [];
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx, ny = y + dy;
        if (this.isEmpty(nx, ny)) {
          empty.push({ x: nx, y: ny, dist: Math.abs(dx) + Math.abs(dy) });
        }
      }
    }
    return empty.sort((a, b) => a.dist - b.dist);
  }

  /** Find center of mass of occupied cells */
  getCenter() {
    let sumX = 0, sumY = 0, count = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.get(x, y)) {
          sumX += x; sumY += y; count++;
        }
      }
    }
    return count > 0 ? { x: sumX / count, y: sumY / count } : { x: this.size / 2, y: this.size / 2 };
  }

  /** Calculate distance from point to center of mass */
  distToCenter(x, y, center) {
    return Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
  }

  /** Get the max distance of any penguin from center */
  getMaxRadius(center) {
    let maxDist = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.get(x, y)) {
          const dist = this.distToCenter(x, y, center);
          if (dist > maxDist) maxDist = dist;
        }
      }
    }
    return maxDist;
  }

  clone() {
    const g = new Grid(this.size);
    g.cells = [...this.cells];
    return g;
  }
}
