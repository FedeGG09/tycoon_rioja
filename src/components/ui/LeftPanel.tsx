import React from 'react';
import { useGame } from '../../hooks/useGame';
import { Panel, SectionTitle } from './Panel';

export default function LeftPanel() {
  const workers = useGame((s) => Object.values(s.workersById));
  const assignWorker = useGame((s) => s.assignWorker);
  const addHome = useGame((s) => s.addHome);
  const buildings = useGame((s) => Object.values(s.buildingsById));
  const homes = buildings.filter((b) => b.type === 'camp' || b.type === 'farm_house' || b.type === 'pro_house');
  const facilities = buildings.filter((b) => b.type === 'vineyard' || b.type === 'winery' || b.type === 'warehouse' || b.type === 'canteen' || b.type === 'clinic' || b.type === 'tractor_shop');

  return (
    <div className="absolute left-3 top-[96px] z-20 w-[350px]">
      <Panel className="max-h-[calc(100vh-180px)] overflow-y-auto">
        <SectionTitle eyebrow="RRHH" title="Personal y bienestar" subtitle="Permanentes y golondrinas, moral, experiencia y vivienda asignada." />
        <div className="mt-4 grid gap-3">
          {workers.map((worker) => (
            <div key={worker.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-white">{worker.name}</div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white/45">{worker.type === 'permanent' ? 'Permanente' : 'Golondrina'}</div>
                </div>
                <div className={`rounded-full px-2 py-1 text-[11px] font-semibold ${worker.morale < 20 ? 'bg-red-500/20 text-red-200' : 'bg-emerald-500/15 text-emerald-200'}`}>
                  {Math.round(worker.morale)}% moral
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/70">
                <div className="rounded-xl bg-black/25 p-2">EXP {Math.round(worker.experience)}</div>
                <div className="rounded-xl bg-black/25 p-2">SALUD {Math.round(worker.health)}</div>
                <div className="rounded-xl bg-black/25 p-2">{worker.assignedBuildingId ? 'Asignado' : 'Libre'}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => assignWorker(worker.id, facilities[0]?.id ?? null)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10">Asignar primera finca</button>
                <button onClick={() => addHome(worker.id, homes[0]?.tileId ?? null)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10">Vivienda base</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
