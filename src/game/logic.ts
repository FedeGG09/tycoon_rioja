import { BUILDING_CATALOG, CENTRAL_UNLOCK_RADIUS, DEFAULT_WORKERS, EXPORT_RETENTION, GRID_SIZE, INFLATION_BASE, INFLATION_VOLATILITY, INITIAL_DEBT, MONTHLY_INTEREST, OFFICIAL_USD_RATE, RESEARCH_TREE, TILE_SIZE } from './constants';
import type { BuildingData, BuildingType, EventLogItem, GameExportPayload, GameStoreState, ResearchId, TileData, WeatherType } from '../types/game';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const distance = (ax: number, az: number, bx: number, bz: number) => Math.hypot(ax - bx, az - bz);
export const tileKey = (row: number, col: number) => `tile-${row}-${col}`;

function hash(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateTiles(): Record<string, TileData> {
  const tiles: Record<string, TileData> = {};
  const start = -((GRID_SIZE - 1) * TILE_SIZE) / 2;
  const center = (GRID_SIZE - 1) / 2;

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const x = start + col * TILE_SIZE;
      const z = start + row * TILE_SIZE;
      const noise = hash(row * 928371 + col * 192883 + 77);
      const terrain = noise > 0.92 ? 'river' : noise > 0.79 ? 'stone' : noise > 0.62 ? 'hill' : 'plain';
      const resource = ((row + col * 2) % 3 === 0 ? 'vine' : (row + col * 2) % 3 === 1 ? 'olive' : 'nut') as TileData['resource'];
      const elevation = terrain === 'hill' ? 3.2 + noise * 2.2 : terrain === 'stone' ? 1.8 + noise * 1.5 : terrain === 'river' ? -1.4 : 0.2 + noise * 0.8;
      const unlocked = Math.hypot(row - center, col - center) <= CENTRAL_UNLOCK_RADIUS;
      const blocked = terrain === 'hill' || terrain === 'stone' || terrain === 'river';

      tiles[tileKey(row, col)] = {
        id: tileKey(row, col),
        row,
        col,
        x,
        y: elevation,
        z,
        terrain,
        resource,
        unlocked,
        road: false,
        bridge: false,
        cleaned: terrain !== 'stone',
        leveled: terrain !== 'hill',
        blocked,
        moisture: clamp(0.28 + hash(row * 13 + col * 29) * 0.58, 0.12, 0.96),
        elevation,
      };
    }
  }

  const depotId = tileKey(Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2));
  tiles[depotId].unlocked = true;
  tiles[depotId].blocked = false;
  tiles[depotId].road = true;
  return tiles;
}

export function createInitialBuildings(tilesById: Record<string, TileData>): Record<string, BuildingData> {
  const centerId = tileKey(Math.floor(GRID_SIZE / 2), Math.floor(GRID_SIZE / 2));
  return {
    depot: { id: 'depot', type: 'depot', tileId: centerId, level: 1, workersRequired: 0, production: 0, active: true },
  };
}

export function createDefaultState(): Omit<GameStoreState, 'workersById'> {
  const tilesById = generateTiles();
  return {
    phase: 'menu',
    activePanel: 'economy',
    selectedTileId: null,
    hoveredTileId: null,
    month: 1,
    year: 2026,
    pesos: 0,
    debtPesos: INITIAL_DEBT,
    inflationRate: INFLATION_BASE,
    inflationAccumulated: 1,
    usdCash: 0,
    usdPending: [],
    officialUsdRate: OFFICIAL_USD_RATE,
    moraleAverage: 72,
    cashFlow: 0,
    weather: 'sunny',
    strike: false,
    tilesById,
    tileIds: Object.keys(tilesById),
    buildingsById: createInitialBuildings(tilesById),
    techTree: RESEARCH_TREE,
    contracts: [
      { id: 'c-brazil', name: 'Vino a Brasil', market: 'Brazil', premiumUsdBonus: 0.2, unlocked: false },
      { id: 'c-china', name: 'Nuez a China', market: 'China', premiumUsdBonus: 0.3, unlocked: false },
      { id: 'c-europe', name: 'Olivo a Europa', market: 'Europe', premiumUsdBonus: 0.25, unlocked: false },
    ],
    logs: [
      { id: 'log-start', title: 'Sistema listo', detail: 'La partida arranca con deuda crítica y base logística central.', kind: 'info', createdAt: Date.now() },
    ],
  };
}

export function createDefaultWorkers() {
  return DEFAULT_WORKERS.reduce<Record<string, (typeof DEFAULT_WORKERS)[number]>>((acc, w) => {
    acc[w.id] = { ...w };
    return acc;
  }, {});
}

export function currentMonthIndex(state: Pick<GameStoreState, 'year' | 'month'>) {
  return state.year * 12 + state.month;
}

export function averageMorale(workersById: GameStoreState['workersById']) {
  const workers = Object.values(workersById);
  if (!workers.length) return 0;
  return workers.reduce((sum, worker) => sum + worker.morale, 0) / workers.length;
}

export function logItem(title: string, detail: string, kind: EventLogItem['kind'] = 'info'): EventLogItem {
  return { id: `log-${Math.random().toString(36).slice(2, 9)}`, title, detail, kind, createdAt: Date.now() };
}

export function researchCanUnlock(state: GameStoreState, id: ResearchId) {
  return state.techTree[id].prerequisites.every((pr) => state.techTree[pr]?.unlocked);
}

export function computeConnectedTiles(state: GameStoreState) {
  const depot = state.buildingsById.depot;
  const startId = depot?.tileId;
  const visited = new Set<string>();
  if (!startId) return visited;

  const queue = [startId];
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const tile = state.tilesById[id];
    if (!tile) continue;
    for (const [dr, dc] of dirs) {
      const nid = tileKey(tile.row + dr, tile.col + dc);
      const next = state.tilesById[nid];
      if (!next) continue;
      const traversable = next.road || next.bridge || nid === startId;
      if (traversable && next.terrain !== 'river' && !visited.has(nid)) queue.push(nid);
      if (next.bridge && !visited.has(nid)) queue.push(nid);
    }
  }
  return visited;
}

export function computeWaterCoverage(state: GameStoreState) {
  const wells = Object.values(state.buildingsById).filter((b) => b.type === 'well' && b.active);
  const covered = new Set<string>();
  for (const tile of Object.values(state.tilesById)) {
    for (const well of wells) {
      const wt = state.tilesById[well.tileId];
      if (wt && distance(tile.row, tile.col, wt.row, wt.col) <= 4) {
        covered.add(tile.id);
        break;
      }
    }
  }
  return covered;
}

export function canBuildAt(state: GameStoreState, tileId: string, type: BuildingType) {
  const tile = state.tilesById[tileId];
  if (!tile) return { ok: false, reason: 'Parcela inválida' };
  if (Object.values(state.buildingsById).some((b) => b.tileId === tileId && b.type !== 'depot')) return { ok: false, reason: 'La parcela ya está ocupada' };
  if (type === 'bridge' && tile.terrain !== 'river') return { ok: false, reason: 'Puente solo sobre río' };
  if (type === 'soil_cleaning' && tile.terrain !== 'stone') return { ok: false, reason: 'Limpieza solo en piedra' };
  if (type === 'leveling' && tile.terrain !== 'hill') return { ok: false, reason: 'Nivelación solo en cerros' };
  const buildable = ['vineyard', 'winery', 'warehouse', 'camp', 'farm_house', 'pro_house', 'canteen', 'clinic', 'tractor_shop', 'well'].includes(type);
  if (buildable && !tile.unlocked) {
    return { ok: false, reason: 'La parcela aún no fue expandida' };
  }
  if (buildable && tile.terrain === 'river' && !tile.bridge) return { ok: false, reason: 'La parcela requiere puente' };
  if (buildable && tile.terrain === 'stone' && !tile.cleaned) return { ok: false, reason: 'La parcela requiere limpieza de suelo' };
  if (buildable && tile.terrain === 'hill' && !tile.leveled) return { ok: false, reason: 'La parcela requiere nivelación' };
  return { ok: true as const };
}

export function applyConstruction(state: GameStoreState, tileId: string, type: BuildingType): GameStoreState {
  const check = canBuildAt(state, tileId, type);
  if (!check.ok) return { ...state, logs: [...state.logs, logItem('Construcción bloqueada', check.reason, 'warning')].slice(-18) };

  const next: GameStoreState = {
    ...state,
    tilesById: { ...state.tilesById },
    buildingsById: { ...state.buildingsById },
    logs: [...state.logs],
  };

  const tile = next.tilesById[tileId];
  const cost = BUILDING_CATALOG[type].cost;
  if (type !== 'depot' && next.pesos < cost && type !== 'road') {
    return { ...state, logs: [...state.logs, logItem('Fondos insuficientes', `No alcanza para ${BUILDING_CATALOG[type].label}.`, 'error')].slice(-18) };
  }

  if (type !== 'depot' && type !== 'road' && type !== 'bridge' && type !== 'soil_cleaning' && type !== 'leveling') next.pesos -= cost;
  if (type === 'road') tile.road = true;
  if (type === 'bridge') tile.bridge = true;
  if (type === 'soil_cleaning') { tile.cleaned = true; tile.blocked = false; }
  if (type === 'leveling') { tile.leveled = true; tile.blocked = false; }
  if (type === 'well') tile.unlocked = true;

  if (!['road', 'bridge', 'soil_cleaning', 'leveling'].includes(type)) {
    const building: BuildingData = {
      id: `${type}-${tileId}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      tileId,
      level: 1,
      workersRequired: BUILDING_CATALOG[type].workersRequired,
      production: BUILDING_CATALOG[type].production,
      active: true,
    };
    next.buildingsById[building.id] = building;
  }

  next.logs.push(logItem('Construcción completada', `${BUILDING_CATALOG[type].label} en ${tileId}.`, 'success'));
  return next;
}

export function applyMonthTick(state: GameStoreState): GameStoreState {
  const connected = computeConnectedTiles(state);
  const waterCoverage = computeWaterCoverage(state);
  const tech = state.techTree;
  const researchFlags = {
    tractors: tech.tractors.unlocked,
    pressurized_irrigation: tech.pressurized_irrigation.unlocked,
    drones: tech.drones.unlocked,
    tenders: tech.tenders.unlocked,
  };

  const workers = { ...state.workersById };
  const buildings = { ...state.buildingsById };
  const weather: WeatherType = Math.random() < 0.1 ? 'zonda' : Math.random() < 0.2 ? 'storm' : Math.random() < 0.3 ? 'windy' : Math.random() < 0.4 ? 'drought' : state.weather;
  let pesos = state.pesos;
  let debtPesos = state.debtPesos * (1 + MONTHLY_INTEREST + state.inflationRate * 0.12);
  let usdCash = state.usdCash;
  let cashFlow = 0;
  const inflationRate = clamp(INFLATION_BASE + Math.random() * INFLATION_VOLATILITY, 0.06, 0.08);

  const supportMorale = Object.values(buildings).reduce((sum, building) => {
    const bonus = BUILDING_CATALOG[building.type].supportMorale ?? 0;
    return sum + bonus * building.level;
  }, 0);

  let strike = state.strike;
  for (const worker of Object.values(workers)) {
    const assigned = worker.assignedBuildingId ? buildings[worker.assignedBuildingId] : null;
    const home = worker.homeTileId ? state.tilesById[worker.homeTileId] : null;
    const work = assigned ? state.tilesById[assigned.tileId] : null;
    const travelPenalty = home && work && Math.hypot(home.row - work.row, home.col - work.col) > 5 ? 10 : 0;
    const climatePenalty = weather === 'zonda' ? 18 : weather === 'storm' ? 8 : 0;
    worker.morale = clamp(worker.morale + supportMorale * 0.02 - travelPenalty * 0.1 - climatePenalty - (pesos < 0 ? 6 : 0), 0, 100);
    worker.experience = clamp(worker.experience + (worker.type === 'permanent' ? 0.8 : 0.35), 0, 100);
    worker.health = clamp(worker.health + (worker.morale > 60 ? 0.3 : -0.4), 0, 100);
    if (worker.morale < 20) strike = true;
  }

  const totalWorkers = Object.keys(workers).length;
  let grapes = 0;
  let wine = 0;
  let exportUsd = 0;

  for (const building of Object.values(buildings)) {
    const tile = state.tilesById[building.tileId];
    if (!tile) continue;
    const active = connected.has(tile.id) || building.type === 'depot' || building.type === 'well' || building.type === 'bridge' || building.type === 'road';
    building.active = active && !strike;

    const baseWorkers = building.workersRequired * Math.max(1, building.level);
    const workerFactor = baseWorkers === 0 ? 1 : clamp(totalWorkers / Math.max(1, baseWorkers), 0.25, 1);
    const waterFactor = researchFlags.pressurized_irrigation || waterCoverage.has(tile.id) ? 1 : 0.5;
    const climateFactor = weather === 'zonda' ? (researchFlags.drones ? 0.72 : 0.5) : weather === 'storm' ? (researchFlags.drones ? 0.82 : 0.65) : weather === 'drought' ? 0.8 : 1;
    const mult = (strike ? 0 : 1) * workerFactor * waterFactor * climateFactor;

    if (building.type === 'vineyard') {
      const out = Math.round(building.production * building.level * mult);
      grapes += out;
      exportUsd += out * 0.012;
    }
    if (building.type === 'winery') {
      const out = Math.round(building.production * building.level * mult * 0.8);
      wine += out;
      exportUsd += out * 0.02;
    }
    if (building.type === 'warehouse') pesos += building.level * 1000;
    if (building.type === 'camp' || building.type === 'farm_house' || building.type === 'pro_house') cashFlow -= 1500 * building.level;
    if (building.type === 'canteen') cashFlow -= 800;
    if (building.type === 'clinic') cashFlow -= 1200;
  }

  const currentIndex = currentMonthIndex(state);
  const premiumMultiplier = 1 + (state.contracts.filter((c) => c.unlocked).reduce((sum, c) => sum + c.premiumUsdBonus, 0)) + (researchFlags.tenders ? 0.2 : 0);
  const shippedUsd = exportUsd * premiumMultiplier;
  if (shippedUsd > 0) {
    state.usdPending.push({ id: `usd-${Math.random().toString(36).slice(2, 8)}`, market: researchFlags.tenders ? 'Europe' : 'Brazil', amountUsd: shippedUsd, dueMonthIndex: currentIndex + 3 });
  }

  const matured = state.usdPending.filter((item) => item.dueMonthIndex <= currentIndex);
  const pending = state.usdPending.filter((item) => item.dueMonthIndex > currentIndex);
  const liquidatedUsd = matured.reduce((sum, item) => sum + item.amountUsd, 0);
  usdCash += liquidatedUsd;
  pesos += liquidatedUsd * state.officialUsdRate * (1 - EXPORT_RETENTION);

  const payroll = totalWorkers * 11000;
  pesos -= payroll;
  const inflationCost = Math.max(0, pesos) * inflationRate;
  pesos -= inflationCost;
  state.inflationAccumulated *= 1 + inflationRate;
  cashFlow += grapes * 70 + wine * 850 + liquidatedUsd * state.officialUsdRate - payroll - inflationCost;

  const moraleAverage = averageMorale(workers);
  if (cashFlow < 0) {
    for (const worker of Object.values(workers)) worker.morale = clamp(worker.morale - 3, 0, 100);
  }

  const logs = [...state.logs, { id: `log-${Math.random().toString(36).slice(2, 8)}`, title: 'Ciclo mensual', detail: `Clima ${weather}. +${grapes} uva, +${wine} vino, USD en tránsito ${shippedUsd.toFixed(1)}. Moral ${Math.round(moraleAverage)}%.`, kind: weather === 'zonda' || weather === 'storm' ? 'warning' : 'info', createdAt: Date.now() }].slice(-18);

  return {
    ...state,
    month: state.month >= 12 ? 1 : state.month + 1,
    year: state.month >= 12 ? state.year + 1 : state.year,
    pesos,
    debtPesos,
    usdCash,
    usdPending: pending,
    inflationRate,
    moraleAverage,
    cashFlow,
    weather,
    strike: strike || moraleAverage < 20,
    workersById: workers,
    buildingsById: buildings,
    logs,
  };
}

export function serializeState(state: GameStoreState): GameExportPayload {
  return { version: 1, state };
}
