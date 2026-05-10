export type GamePhase = 'menu' | 'playing' | 'paused';
export type PanelId = 'economy' | 'rrhh' | 'infrastructure' | 'housing' | 'research' | 'export';
export type TerrainType = 'plain' | 'hill' | 'river' | 'stone';
export type WeatherType = 'sunny' | 'windy' | 'zonda' | 'storm' | 'drought';
export type WorkerType = 'permanent' | 'golondrina';
export type BuildingType =
  | 'depot'
  | 'road'
  | 'bridge'
  | 'well'
  | 'vineyard'
  | 'winery'
  | 'warehouse'
  | 'camp'
  | 'farm_house'
  | 'pro_house'
  | 'canteen'
  | 'clinic'
  | 'tractor_shop'
  | 'soil_cleaning'
  | 'leveling';

export type ResearchId = 'manual' | 'tractors' | 'pressurized_irrigation' | 'drones' | 'tenders';

export interface TileData {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  z: number;
  terrain: TerrainType;
  resource: 'vine' | 'olive' | 'nut';
  unlocked: boolean;
  road: boolean;
  bridge: boolean;
  cleaned: boolean;
  leveled: boolean;
  blocked: boolean;
  moisture: number;
  elevation: number;
}

export interface BuildingData {
  id: string;
  type: BuildingType;
  tileId: string;
  level: number;
  workersRequired: number;
  production: number;
  active: boolean;
}

export interface WorkerData {
  id: string;
  name: string;
  type: WorkerType;
  morale: number;
  experience: number;
  health: number;
  homeTileId: string | null;
  assignedBuildingId: string | null;
}

export interface TechNodeData {
  id: ResearchId;
  label: string;
  cost: number;
  tier: number;
  unlocked: boolean;
  prerequisites: ResearchId[];
  description: string;
}

export interface ShipmentData {
  id: string;
  market: 'Brazil' | 'China' | 'Europe';
  amountUsd: number;
  dueMonthIndex: number;
}

export interface EventLogItem {
  id: string;
  title: string;
  detail: string;
  kind: 'info' | 'success' | 'warning' | 'error';
  createdAt: number;
}

export interface GameStoreState {
  phase: GamePhase;
  activePanel: PanelId;
  selectedTileId: string | null;
  hoveredTileId: string | null;
  month: number;
  year: number;
  pesos: number;
  debtPesos: number;
  inflationRate: number;
  inflationAccumulated: number;
  usdCash: number;
  usdPending: ShipmentData[];
  officialUsdRate: number;
  moraleAverage: number;
  cashFlow: number;
  weather: WeatherType;
  strike: boolean;
  tilesById: Record<string, TileData>;
  tileIds: string[];
  buildingsById: Record<string, BuildingData>;
  workersById: Record<string, WorkerData>;
  techTree: Record<ResearchId, TechNodeData>;
  contracts: Array<{
    id: string;
    name: string;
    market: 'Brazil' | 'China' | 'Europe';
    premiumUsdBonus: number;
    unlocked: boolean;
  }>;
  logs: EventLogItem[];
}

export interface GameExportPayload {
  version: 1;
  state: GameStoreState;
}
