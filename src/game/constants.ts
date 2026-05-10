import type { BuildingType, ResearchId, TechNodeData, WorkerData } from "../types/game";

export const GRID_SIZE = 20;
export const CENTRAL_UNLOCK_RADIUS = 3;
export const TILE_SIZE = 8.5;
export const STORAGE_KEY = "rioja-tycoon-refactor-save-v1";

export const BUILDING_CATALOG: Record<
  BuildingType,
  {
    label: string;
    category: "infrastructure" | "production" | "housing" | "support" | "utility";
    cost: number;
    workersRequired: number;
    production: number;
    color: string;
    supportMorale?: number;
    storageBonus?: number;
    radius?: number;
  }
> = {
  depot: {
    label: "Almacén Central",
    category: "support",
    cost: 0,
    workersRequired: 0,
    production: 0,
    color: "#f4d35e",
  },
  road: {
    label: "Camino de Tierra",
    category: "infrastructure",
    cost: 25_000,
    workersRequired: 0,
    production: 0,
    color: "#8a6742",
  },
  bridge: {
    label: "Puente",
    category: "infrastructure",
    cost: 120_000,
    workersRequired: 0,
    production: 0,
    color: "#9c8c7a",
  },
  well: {
    label: "Pozo de Agua",
    category: "utility",
    cost: 160_000,
    workersRequired: 1,
    production: 0,
    color: "#5cc8ff",
    radius: 4,
  },
  vineyard: {
    label: "Finca de Vid",
    category: "production",
    cost: 210_000,
    workersRequired: 6,
    production: 110,
    color: "#58b368",
  },
  winery: {
    label: "Bodega",
    category: "production",
    cost: 340_000,
    workersRequired: 8,
    production: 95,
    color: "#d9a066",
  },
  warehouse: {
    label: "Depósito",
    category: "support",
    cost: 180_000,
    workersRequired: 2,
    production: 0,
    color: "#8fa3b3",
    storageBonus: 180,
  },
  camp: {
    label: "Campamento",
    category: "housing",
    cost: 50_000,
    workersRequired: 0,
    production: 0,
    color: "#c77d5c",
    supportMorale: 6,
  },
  farm_house: {
    label: "Casa de Finca",
    category: "housing",
    cost: 140_000,
    workersRequired: 0,
    production: 0,
    color: "#d98b6a",
    supportMorale: 12,
  },
  pro_house: {
    label: "Barrio Pro",
    category: "housing",
    cost: 360_000,
    workersRequired: 0,
    production: 0,
    color: "#efb97c",
    supportMorale: 20,
  },
  canteen: {
    label: "Comedor Comunitario",
    category: "support",
    cost: 110_000,
    workersRequired: 1,
    production: 0,
    color: "#b89b7a",
    supportMorale: 10,
  },
  clinic: {
    label: "Puesto de Salud",
    category: "support",
    cost: 130_000,
    workersRequired: 1,
    production: 0,
    color: "#8bc6c1",
    supportMorale: 9,
  },
  tractor_shop: {
    label: "Taller de Tractores",
    category: "support",
    cost: 280_000,
    workersRequired: 4,
    production: 0,
    color: "#d6d6d6",
  },
  soil_cleaning: {
    label: "Limpieza de Suelo",
    category: "infrastructure",
    cost: 85_000,
    workersRequired: 0,
    production: 0,
    color: "#bfa27a",
  },
  leveling: {
    label: "Nivelación de Terreno",
    category: "infrastructure",
    cost: 190_000,
    workersRequired: 0,
    production: 0,
    color: "#9ca3af",
  },
};

export const RESEARCH_TREE: Record<ResearchId, TechNodeData> = {
  manual: {
    id: "manual",
    label: "Herramientas Manuales",
    cost: 0,
    tier: 1,
    unlocked: true,
    prerequisites: [],
    description: "Base operativa para mano de obra intensiva.",
  },
  tractors: {
    id: "tractors",
    label: "Tractores",
    cost: 420_000,
    tier: 2,
    unlocked: false,
    prerequisites: ["manual"],
    description: "1 tractor reemplaza hasta 5 trabajadores en campo.",
  },
  pressurized_irrigation: {
    id: "pressurized_irrigation",
    label: "Riego Presurizado",
    cost: 580_000,
    tier: 3,
    unlocked: false,
    prerequisites: ["tractors"],
    description: "Elimina la dependencia del radio de pozos.",
  },
  drones: {
    id: "drones",
    label: "Drones",
    cost: 490_000,
    tier: 3,
    unlocked: false,
    prerequisites: ["tractors"],
    description: "Mitiga pérdidas por clima en un 40%.",
  },
  tenders: {
    id: "tenders",
    label: "Licitaciones Premium",
    cost: 750_000,
    tier: 3,
    unlocked: false,
    prerequisites: ["pressurized_irrigation", "drones"],
    description: "Desbloquea mercados premium con +20% USD.",
  },
};

export const DEFAULT_WORKERS: WorkerData[] = [
  { id: "w-1", name: "Aníbal Aballay", type: "permanent", morale: 78, experience: 18, health: 94, homeTileId: null, assignedBuildingId: null },
  { id: "w-2", name: "Andrea Funes", type: "permanent", morale: 74, experience: 22, health: 96, homeTileId: null, assignedBuildingId: null },
  { id: "w-3", name: "Gonzalo Bazán", type: "permanent", morale: 69, experience: 12, health: 90, homeTileId: null, assignedBuildingId: null },
  { id: "w-4", name: "Mariela Ocampo", type: "golondrina", morale: 61, experience: 6, health: 88, homeTileId: null, assignedBuildingId: null },
  { id: "w-5", name: "Ezequiel Luna", type: "golondrina", morale: 58, experience: 4, health: 85, homeTileId: null, assignedBuildingId: null },
  { id: "w-6", name: "Sofía Páez", type: "golondrina", morale: 66, experience: 8, health: 91, homeTileId: null, assignedBuildingId: null },
  { id: "w-7", name: "Claudio Díaz", type: "permanent", morale: 80, experience: 26, health: 97, homeTileId: null, assignedBuildingId: null },
  { id: "w-8", name: "Camila Quiroga", type: "permanent", morale: 71, experience: 14, health: 89, homeTileId: null, assignedBuildingId: null },
];

export const INITIAL_DEBT = -14_100_000;
export const OFFICIAL_USD_RATE = 1150;
export const EXPORT_RETENTION = 0.12;
export const INFLATION_BASE = 0.06;
export const INFLATION_VOLATILITY = 0.02;
export const MONTHLY_INTEREST = 0.028;