import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEY, RESEARCH_TREE } from '../game/constants';
import { applyConstruction, applyMonthTick, averageMorale, canBuildAt, createDefaultState, createDefaultWorkers, logItem, researchCanUnlock, serializeState } from '../game/logic';
import type { BuildingType, GameExportPayload, GameStoreState, PanelId, ResearchId } from '../types/game';

type GameActions = {
  startGame: () => void;
  resetGame: () => void;
  togglePause: () => void;
  selectTile: (tileId: string | null) => void;
  hoverTile: (tileId: string | null) => void;
  setActivePanel: (panel: PanelId) => void;
  build: (type: BuildingType) => void;
  research: (id: ResearchId) => void;
  assignWorker: (workerId: string, buildingId: string | null) => void;
  addHome: (workerId: string, tileId: string | null) => void;
  tick: () => void;
  exportSave: () => GameExportPayload;
  importSave: (payload: GameExportPayload) => void;
  loadFromFile: (json: string) => void;
  boostMorale: () => void;
};

const initial = createDefaultState();
const initialWorkers = createDefaultWorkers();

export const useGameStore = create<GameStoreState & GameActions>()(
  persist(
    (set, get) => ({
      ...initial,
      workersById: initialWorkers,
      startGame: () => set({ phase: 'playing' }),
      resetGame: () => set({ ...createDefaultState(), workersById: createDefaultWorkers() }),
      togglePause: () => set((state) => ({ phase: state.phase === 'playing' ? 'paused' : 'playing' })),
      selectTile: (tileId) => set({ selectedTileId: tileId }),
      hoverTile: (tileId) => set({ hoveredTileId: tileId }),
      setActivePanel: (panel) => set({ activePanel: panel }),
      build: (type) => {
        const state = get();
        const tileId = state.selectedTileId;
        if (!tileId) return set({ logs: [...state.logs, logItem('Seleccioná una parcela', 'Primero elegí un tile para construir.', 'warning')].slice(-18) });
        if (!canBuildAt(state, tileId, type).ok) return set({ logs: [...state.logs, logItem('Construcción bloqueada', canBuildAt(state, tileId, type).reason, 'warning')].slice(-18) });
        const next = applyConstruction(state, tileId, type);
        set({ ...next, moraleAverage: averageMorale(next.workersById) });
      },
      research: (id) => {
        const state = get();
        const node = state.techTree[id];
        if (node.unlocked) return;
        if (!researchCanUnlock(state, id)) return set({ logs: [...state.logs, logItem('I+D bloqueado', `${node.label} requiere prerequisitos.`, 'warning')].slice(-18) });
        if (state.pesos < node.cost) return set({ logs: [...state.logs, logItem('Caja insuficiente', `No alcanza para ${node.label}.`, 'error')].slice(-18) });
        set((current) => ({
          pesos: current.pesos - node.cost,
          techTree: { ...current.techTree, [id]: { ...current.techTree[id], unlocked: true } },
          contracts: current.contracts.map((c) => c.id === 'c-europe' && id === 'tenders' ? { ...c, unlocked: true } : c),
          logs: [...current.logs, logItem('I+D completado', `${node.label} desbloqueado.`, 'success')].slice(-18),
        }));
      },
      assignWorker: (workerId, buildingId) => set((state) => ({ workersById: { ...state.workersById, [workerId]: { ...state.workersById[workerId], assignedBuildingId: buildingId } } })),
      addHome: (workerId, tileId) => set((state) => ({ workersById: { ...state.workersById, [workerId]: { ...state.workersById[workerId], homeTileId: tileId } } })),
      tick: () => set((state) => {
        if (state.phase !== 'playing') return state;
        const next = applyMonthTick(state);
        return { ...next, moraleAverage: averageMorale(next.workersById) };
      }),
      exportSave: () => serializeState(get()),
      importSave: (payload) => set(payload.state),
      loadFromFile: (json) => {
        try {
          const parsed = JSON.parse(json) as GameExportPayload;
          if (parsed.version === 1) set(parsed.state);
        } catch {
          set((state) => ({ logs: [...state.logs, logItem('Importación fallida', 'El JSON no pudo leerse.', 'error')].slice(-18) }));
        }
      },
      boostMorale: () => set((state) => ({
        workersById: Object.fromEntries(Object.entries(state.workersById).map(([id, worker]) => [id, { ...worker, morale: Math.min(100, worker.morale + 5) }])),
        logs: [...state.logs, logItem('Acción social', 'La moral subió por intervención de bienestar.', 'success')].slice(-18),
      })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        phase: state.phase,
        activePanel: state.activePanel,
        selectedTileId: state.selectedTileId,
        hoveredTileId: state.hoveredTileId,
        month: state.month,
        year: state.year,
        pesos: state.pesos,
        debtPesos: state.debtPesos,
        inflationRate: state.inflationRate,
        inflationAccumulated: state.inflationAccumulated,
        usdCash: state.usdCash,
        usdPending: state.usdPending,
        officialUsdRate: state.officialUsdRate,
        moraleAverage: state.moraleAverage,
        cashFlow: state.cashFlow,
        weather: state.weather,
        strike: state.strike,
        tilesById: state.tilesById,
        tileIds: state.tileIds,
        buildingsById: state.buildingsById,
        workersById: state.workersById,
        techTree: state.techTree,
        contracts: state.contracts,
        logs: state.logs,
      }),
    },
  ),
);
