
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  DOCKED = 'DOCKED',
  GAMEOVER = 'GAMEOVER',
  HIGHSCORE_ENTRY = 'HIGHSCORE_ENTRY' // New state for entering name
}

export enum MineralType {
  IRON = 'Iron',
  COBALT = 'Cobalt',
  SILICON = 'Silicon',
  TITANIUM = 'Titanium',
  GOLD = 'Gold',
  URANIUM = 'Uranium',
  KRONOS = 'Kronos Crystal'
}

export interface Point {
  x: number;
  y: number;
}

export interface Asteroid {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  vertices: Point[]; // For the jagged vector look
  type: MineralType;
  health: number;
  maxHealth: number;
  rotation: number;
  rotationSpeed: number;
  isHeating: boolean;
}

export interface Particle {
  id?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  text?: string; // For floating text effects
}

export type LootType = MineralType | 'FUEL';

export interface Loot {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: LootType;
  amount: number;
  life: number;
}

export interface Alien {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  stolenCargo: { [key in MineralType]?: number };
  totalStolenCount: number;
  state: 'CHASING' | 'DRAINING' | 'FLEEING';
  drainTimer: number;
  wobbleAngle: number;
}

export interface ShipConfig {
  maxFuel: number;
  fuelConsumptionRate: number; // Per frame idle
  thrustConsumptionRate: number; // Per frame thrusting
  maxCargo: number;
  acceleration: number;
  maxSpeed: number;
  rotationSpeed: number;
  miningPower: number;
  miningRange: number;
}

export interface PlayerState {
  credits: number;
  lifetimeEarnings: number; // Score
  totalCargoDelivered: number; // Stat
  missionsCompleted: number; // Stat
  currentFuel: number;
  cargo: { [key in MineralType]: number };
  shipConfig: ShipConfig;
  position: Point;
  velocity: Point;
  rotation: number; // Radians
}

export interface UpgradeCost {
  level: number;
  cost: number;
  value: number; // The actual stat value
}

export interface HighScore {
  name: string;
  score: number;
  missions: number;
  cargo: number;
  date: string;
}
