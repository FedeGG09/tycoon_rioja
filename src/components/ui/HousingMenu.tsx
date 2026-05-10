import React from 'react';
import { useGame } from '../../hooks/useGame';
import { BUILDING_CATALOG } from '../../game/constants';
import type { BuildingType } from '../../types/game';

const items: BuildingType[] = ['camp', 'farm_house', 'pro_house', 'canteen', 'clinic'];

export default function HousingMenu() {
  const build = useGame((s) => s.build);
  const selectedTileId = useGame((s) => s.selectedTileId);
  return (
    <div className="grid gap-3">
      {items.map((type) => {
        const spec = BUILDING_CATALOG[type];
        return (
          <button key={type} disabled={!selectedTileId} onClick={() => build(type)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white">{spec.label}</div>
              <div className="h-3 w-3 rounded-full" style={{ background: spec.color }} />
            </div>
            <div className="mt-1 text-sm text-white/65">Costo ${spec.cost.toLocaleString('es-AR')}. Aporta moral y estabilidad social.</div>
          </button>
        );
      })}
    </div>
  );
}
