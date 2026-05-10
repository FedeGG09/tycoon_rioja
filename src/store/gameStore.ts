import { create } from "zustand";
import { BUILDING_CATALOG, CENTRAL_UNLOCK_RADIUS, DEFAULT_WORKERS, GRID_SIZE, INITIAL_DEBT, INFLATION_BASE, INFLATION_VOLATILITY, MONTHLY_INTEREST, OFFICIAL_USD_RATE, RESEARCH_TREE, STORAGE_KEY, TILE_SIZE } from "../game/constants";
import type {
  BuildingData,
  ContractData,
  EventLogItem,
  GameExportPayload,
  GameStoreState,
  PanelId,
  ResearchId,
  ShipmentData,
  TerrainType,
  TileData,
  WorkerData,
  WeatherType,
} from "../types/game";

type GameActions = {
  startGame: () => void;
  togglePause: () => void;
  setPanel: (panel: PanelId) => void;
  selectTile: (tileId: string | null) => void;
  hoverTile: (tileId: string | null) => void;
  build: (type: keyof typeof BUILDING_CATALOG) => void;
  research: (id: ResearchId) => void;
  tick: () => void;
  save: () => void;
  load: (payload: GameExportPayload) => void;
  reset: () => void;
};

type Store = GameStoreState & GameActions;

const now = () => Date.now();

function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function terrainFor(row: number, col: number): TerrainType {
  const mid = (GRID_SIZE - 1) / 2;
  const dist = Math.hypot(row - mid, col - mid);
  if (row === 9 || row === 10) return "river";
  if (dist > 7.8 && dist < 9.8) return "hill";
  if ((row + col) % 11 === 0) return "stone";
  return "plain";
}

function resourceFor(row: number, col: number): "vine" | "olive" | "nut" {
  const k = (row * GRID_SIZE + col) % 3;
  return k === 0 ? "vine" : k === 1 ? "olive" : "nut";
}

function createTiles(): Record<string, TileData> {
  const map: Record<string, TileData> = {};
  const center = (GRID_SIZE - 1) / 2;

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const id = `tile-${row}-${col}`;
      const x = (col - center) * TILE_SIZE;
      const z = (row - center) * TILE_SIZE;
      const terrain = terrainFor(row, col);
      const unlocked = Math.hypot(row - center, col - center) <= CENTRAL_UNLOCK_RADIUS;
      const elevation = terrain === "hill" ? 1.4 : terrain === "stone" ? 0.9 : terrain === "river" ? -0.45 : 0;
      map[id] = {
        id,
        row,
        col,
        x,
        y: elevation,
        z,
        terrain,
        resource: resourceFor(row, col),
        unlocked,
        road: false,
        bridge: false,
        cleaned: terrain !== "stone",
        leveled: terrain !== "hill",
        blocked: terrain === "hill" || terrain === "stone",
        moisture: terrain === "river" ? 1 : clamp(0.35 + ((row * 17 + col * 13) % 100) / 250, 0.15, 0.95),
        elevation,
      };
    }
  }

  const depotTile = map["tile-10-10"];
  if (depotTile) {
    depotTile.unlocked = true;
    depotTile.blocked = false;
  }

  return map;
}

function createInitialBuildings(): Record<string, BuildingData> {
  const depot: BuildingData = {
    id: "b-depot",
    type: "depot",
    tileId: "tile-10-10",
    level: 1,
    workersRequired: 0,
    production: 0,
    active: true,
  };

  return { [depot.id]: depot };
}

function createInitialContracts(): ContractData[] {
  return [
    { id: "c-br", name: "Exportar vino a Brasil", market: "Brazil", premiumUsdBonus: 0.2, unlocked: true },
    { id: "c-cn", name: "Exportar nuez a China", market: "China", premiumUsdBonus: 0.2, unlocked: true },
    { id: "c-eu", name: "Exportar vino a Europa", market: "Europe", premiumUsdBonus: 0.15, unlocked: false },
  ];
}

function createInitialLogs(): EventLogItem[] {
  return [
    { id: uid("log"), title: "Sistema listo", detail: "La Rioja Agro-Tycoon arrancó con deuda operativa y mapa central desbloqueado.", kind: "info", createdAt: now() },
  ];
}

function averageMorale(workers: Record<string, WorkerData>) {
  const list = Object.values(workers);
  return list.length ? list.reduce((a, b) => a + b.morale, 0) / list.length : 0;
}

function eligibleResearchIds(state: GameStoreState): ResearchId[] {
  return (Object.keys(state.techTree) as ResearchId[]).filter((id) => {
    const node = state.techTree[id];
    return !node.unlocked && node.prerequisites.every((req) => state.techTree[req].unlocked);
  });
}

function applyMonthlySimulation(state: GameStoreState): Partial<GameStoreState> {
  const researchDrone = state.techTree.drones.unlocked;
  const pressurized = state.techTree.pressurized_irrigation.unlocked;
  const tractorUnlocked = state.techTree.tractors.unlocked;

  const buildings = Object.values(state.buildingsById);
  const workers = Object.values(state.workersById);

  const depots = buildings.filter((b) => b.type === "warehouse");
  const wells = buildings.filter((b) => b.type === "well");
  const roads = buildings.filter((b) => b.type === "road");
  const houses = buildings.filter((b) => b.type === "camp" || b.type === "farm_house" || b.type === "pro_house");
  const productionBuildings = buildings.filter((b) => b.type === "vineyard" || b.type === "winery");
  const supportBuildings = buildings.filter((b) => b.type === "canteen" || b.type === "clinic");

  const moraleBoost = houses.reduce((sum, b) => {
    const spec = BUILDING_CATALOG[b.type];
    return sum + (spec.supportMorale ?? 0) * b.level;
  }, 0);

  const supportMorale = supportBuildings.reduce((sum, b) => {
    const spec = BUILDING_CATALOG[b.type];
    return sum + (spec.supportMorale ?? 0) * b.level;
  }, 0);

  const morale = clamp(averageMorale(state.workersById) + moraleBoost * 0.04 + supportMorale * 0.03 - (state.weather === "zonda" ? 20 : 0) - (state.strike ? 30 : 0), 0, 100);

  const activeWorkers = workers.filter((w) => w.morale > 20).length;
  const baseCapacity = productionBuildings.reduce((sum, b) => sum + BUILDING_CATALOG[b.type].production * b.level, 0);
  const workFactor = clamp(activeWorkers / Math.max(1, productionBuildings.reduce((sum, b) => sum + b.workersRequired, 0)), 0.25, 1);

  const waterCoverage = wells.length > 0 ? 1 : 0.5;
  const weatherPenalty = state.weather === "drought" ? 0.7 : state.weather === "storm" ? 0.6 : state.weather === "zonda" ? 0.75 : 1;
  const droneBonus = researchDrone ? 1.4 : 1;
  const irrigationBonus = pressurized ? 1.15 : waterCoverage;
  const tractorBonus = tractorUnlocked ? 1.25 : 1;

  const production = baseCapacity * workFactor * irrigationBonus * weatherPenalty * droneBonus * tractorBonus;
  const pesosIncome = production * 1200;
  const debtInterest = Math.abs(state.debtPesos) * MONTHLY_INTEREST;
  const inflation = state.inflationRate + INFLATION_VOLATILITY * (Math.random() * 2 - 1);
  const nextInflationRate = clamp(inflation, 0.04, 0.12);

  const usdExport = Math.max(0, production * 0.28);
  const pending: ShipmentData[] = [...state.usdPending];

  if (usdExport > 0) {
    pending.push({
      id: uid("ship"),
      market: state.contracts.find((c) => c.unlocked)?.market ?? "Brazil",
      amountUsd: usdExport * (1 - 0.12),
      dueMonthIndex: state.month + 3,
    });
  }

  const released = pending.filter((s) => s.dueMonthIndex <= state.month + 1);
  const stillPending = pending.filter((s) => s.dueMonthIndex > state.month + 1);
  const usdCash = state.usdCash + released.reduce((sum, s) => sum + s.amountUsd, 0);

  const pesosFromUsd = usdCash * state.officialUsdRate;
  const pesosAfterExpenses = state.pesos + pesosIncome + pesosFromUsd - debtInterest - 180_000;
  const newDebt = pesosAfterExpenses < 0 ? pesosAfterExpenses : state.debtPesos + debtInterest * 0.15;

  const soldPesos = pesosAfterExpenses > 0 ? pesosAfterExpenses : 0;

  return {
    month: state.month + 1,
    year: state.year + Math.floor((state.month + 1) / 12),
    pesos: soldPesos,
    debtPesos: newDebt,
    inflationRate: nextInflationRate,
    inflationAccumulated: state.inflationAccumulated + nextInflationRate,
    usdCash: 0,
    usdPending: stillPending,
    moraleAverage: morale,
    cashFlow: pesosIncome - debtInterest - 180_000,
    weather: nextWeather(state.weather),
    strike: morale < 20,
    logs: [
      ...state.logs,
      {
        id: uid("log"),
        title: "Cierre mensual",
        detail: `Producción ${Math.round(production)}. ${released.length} envíos cobrados.`,
        kind: morale < 20 ? "warning" : "success",
        createdAt: now(),
      },
    ].slice(-8),
  };
}

function nextWeather(current: WeatherType): WeatherType {
  const roll = Math.random();
  if (roll < 0.15) return "zonda";
  if (roll < 0.25) return "drought";
  if (roll < 0.35) return "storm";
  if (roll < 0.55) return "windy";
  return current === "zonda" ? "sunny" : "sunny";
}

function persist(state: GameStoreState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state }));
}

function loadFromStorage(): Partial<GameStoreState> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameExportPayload;
    return parsed.state;
  } catch {
    return null;
  }
}

const baseState: GameStoreState = {
  phase: "menu",
  activePanel: "economy",
  selectedTileId: "tile-10-10",
  hoveredTileId: null,
  month: 1,
  year: 2026,
  pesos: 0,
  debtPesos: INITIAL_DEBT,
  inflationRate: INFLATION_BASE,
  inflationAccumulated: INFLATION_BASE,
  usdCash: 0,
  usdPending: [],
  officialUsdRate: OFFICIAL_USD_RATE,
  moraleAverage: 75,
  cashFlow: 0,
  weather: "sunny",
  strike: false,
  tilesById: createTiles(),
  tileIds: [],
  buildingsById: createInitialBuildings(),
  workersById: Object.fromEntries(DEFAULT_WORKERS.map((w) => [w.id, w])),
  techTree: { ...RESEARCH_TREE },
  contracts: createInitialContracts(),
  logs: createInitialLogs(),
};

baseState.tileIds = Object.keys(baseState.tilesById);

const loaded = loadFromStorage();

export const useGameStore = create<Store>((set, get) => ({
  ...baseState,
  ...(loaded ?? {}),

  startGame: () => set({ phase: "playing" }),
  togglePause: () => set((s) => ({ phase: s.phase === "paused" ? "playing" : "paused" })),
  setPanel: (panel) => set({ activePanel: panel }),
  selectTile: (tileId) => set({ selectedTileId: tileId }),
  hoverTile: (tileId) => set({ hoveredTileId: tileId }),

  build: (type) => {
    const state = get();
    const tileId = state.selectedTileId;
    if (!tileId) return;

    const tile = state.tilesById[tileId];
    if (!tile) return;

    const cost = BUILDING_CATALOG[type].cost;
    if (state.pesos < cost && type !== "depot") {
      set((s) => ({
        logs: [
          ...s.logs,
          { id: uid("log"), title: "Fondos insuficientes", detail: `No alcanza para construir ${BUILDING_CATALOG[type].label}.`, kind: "error", createdAt: now() },
        ].slice(-8),
      }));
      return;
    }

    if (tile.blocked && type !== "soil_cleaning" && type !== "leveling") {
      set((s) => ({
        logs: [
          ...s.logs,
          { id: uid("log"), title: "Terreno bloqueado", detail: "Primero limpiá o nivelá la parcela.", kind: "warning", createdAt: now() },
        ].slice(-8),
      }));
      return;
    }

    const occupied = Object.values(state.buildingsById).find((b) => b.tileId === tileId);
    if (occupied && occupied.type !== "depot") {
      set((s) => ({
        logs: [
          ...s.logs,
          { id: uid("log"), title: "Parcela ocupada", detail: "Esa parcela ya tiene un edificio.", kind: "warning", createdAt: now() },
        ].slice(-8),
      }));
      return;
    }

    const id = uid("b");
    const building: BuildingData = {
      id,
      type,
      tileId,
      level: 1,
      workersRequired: BUILDING_CATALOG[type].workersRequired,
      production: BUILDING_CATALOG[type].production,
      active: true,
    };

    set((s) => {
      const nextPesos = type === "depot" ? s.pesos : s.pesos - cost;
      const nextBuildings = { ...s.buildingsById, [id]: building };
      return {
        pesos: nextPesos,
        buildingsById: nextBuildings,
        logs: [
          ...s.logs,
          { id: uid("log"), title: "Construcción completada", detail: `${BUILDING_CATALOG[type].label} en ${tileId}.`, kind: "success", createdAt: now() },
        ].slice(-8),
      };
    });
  },

  research: (id) => {
    const state = get();
    const node = state.techTree[id];
    if (!node || node.unlocked) return;
    if (!node.prerequisites.every((req) => state.techTree[req].unlocked)) return;
    if (state.pesos < node.cost) return;

    set((s) => ({
      pesos: s.pesos - node.cost,
      techTree: { ...s.techTree, [id]: { ...s.techTree[id], unlocked: true } },
      logs: [
        ...s.logs,
        { id: uid("log"), title: "I+D completado", detail: node.label, kind: "success", createdAt: now() },
      ].slice(-8),
    }));
  },

  tick: () => {
    const state = get();
    if (state.phase !== "playing") return;

    const next = applyMonthlySimulation(state);

    set((s) => {
      const merged: GameStoreState = {
        ...s,
        ...next,
        techTree: s.techTree,
        buildingsById: s.buildingsById,
        tilesById: s.tilesById,
        workersById: s.workersById,
        contracts: s.contracts,
        selectedTileId: s.selectedTileId,
        hoveredTileId: s.hoveredTileId,
        activePanel: s.activePanel,
        phase: s.phase,
      };
      persist(merged);
      return merged;
    });
  },

  save: () => {
    persist(get());
    set((s) => ({
      logs: [
        ...s.logs,
        { id: uid("log"), title: "Guardado", detail: "Partida guardada en localStorage.", kind: "info", createdAt: now() },
      ].slice(-8),
    }));
  },

  load: (payload) => {
    set({ ...payload.state });
  },

  reset: () => {
    const resetState: GameStoreState = {
      ...baseState,
      tilesById: createTiles(),
      tileIds: Object.keys(createTiles()),
      buildingsById: createInitialBuildings(),
      workersById: Object.fromEntries(DEFAULT_WORKERS.map((w) => [w.id, w])),
      techTree: { ...RESEARCH_TREE },
      contracts: createInitialContracts(),
      logs: createInitialLogs(),
    };
    set(resetState);
    persist(resetState);
  },
}));

export function useGame<T>(selector: (state: Store) => T) {
  return useGameStore(selector);
}

export function useGameActions() {
  return useGameStore((s) => ({
    startGame: s.startGame,
    togglePause: s.togglePause,
    setPanel: s.setPanel,
    selectTile: s.selectTile,
    hoverTile: s.hoverTile,
    build: s.build,
    research: s.research,
    tick: s.tick,
    save: s.save,
    load: s.load,
    reset: s.reset,
  }));
}