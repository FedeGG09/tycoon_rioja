import React from "react";
import { useGame } from "../../hooks/useGame";

export default function LeftPanel() {
  const workers = useGame((s) => Object.values(s.workersById));
  const strike = useGame((s) => s.strike);
  const activePanel = useGame((s) => s.activePanel);
  const setPanel = useGame((s) => s.setPanel);

  return (
    <aside className="absolute left-4 top-28 z-20 w-[min(92vw,320px)] rounded-3xl border border-white/10 bg-black/50 p-4 text-white shadow-2xl backdrop-blur-md">
      <div className="flex gap-2">
        <Tab active={activePanel === "rrhh"} onClick={() => setPanel("rrhh")}>
          RRHH
        </Tab>
        <Tab active={activePanel === "housing"} onClick={() => setPanel("housing")}>
          Vivienda
        </Tab>
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
          <div className="font-semibold">Estado general</div>
          <div className="mt-1 text-white/70">
            {strike ? "Huelga activa por moral baja." : "Operación normal."}
          </div>
        </div>

        {workers.map((w) => (
          <div key={w.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{w.name}</div>
              <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wide">
                {w.type}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-white/70">
              <span>Moral {Math.round(w.morale)}%</span>
              <span>XP {Math.round(w.experience)}</span>
              <span>Salud {Math.round(w.health)}%</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${active ? "bg-yellow-300 text-black" : "bg-white/5 text-white hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}