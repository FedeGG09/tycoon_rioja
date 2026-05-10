import React from 'react';
import { useGame } from '../../hooks/useGame';
import { BUILDING_CATALOG } from '../../game/constants';
import type { BuildingType } from '../../types/game';

const items: BuildingType[] = ['road', 'bridge', 'well', 'soil_cleaning', 'leveling', 'tractor_shop'];

export default function InfrastructureMenu() {
  const build = useGame((s) => s.build);
  const selectedTileId = useGame((s) => s.selectedTileId);
  return (
    <div className="grid gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/75">Seleccioná un tile y levantá la red logística. Sin camino al almacén central, la parcela queda inactiva.</div>
      {items.map((type) => {
        const spec = BUILDING_CATALOG[type];
        return (
          <button key={type} disabled={!selectedTileId} onClick={() => build(type)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white">{spec.label}</div>
              <div className="h-3 w-3 rounded-full" style={{ background: spec.color }} />
            </div>
            <div className="mt-1 text-sm text-white/65">${spec.cost.toLocaleString('es-AR')}</div>
          </button>
        );
      })}
    </div>
  );
}
