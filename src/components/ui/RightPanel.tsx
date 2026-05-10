import React from "react";
import { useGame } from "../../hooks/useGame";

export default function RightPanel() {
  const techTree = useGame((s) => s.techTree);
  const contracts = useGame((s) => s.contracts);
  const pesos = useGame((s) => s.pesos);
  const research = useGame((s) => s.research);
  const activePanel = useGame((s) => s.activePanel);
  const setPanel = useGame((s) => s.setPanel);

  return (
    <aside className="absolute right-4 top-28 z-20 w-[min(92vw,340px)] rounded-3xl border border-white/10 bg-black/50 p-4 text-white shadow-2xl backdrop-blur-md">
      <div className="flex gap-2">
        <Tab active={activePanel === "research"} onClick={() => setPanel("research")}>
          I+D
        </Tab>
        <Tab active={activePanel === "export"} onClick={() => setPanel("export")}>
          Export
        </Tab>
      </div>

      <div className="mt-4 space-y-3">
        {Object.values(techTree).map((node) => (
          <button
            key={node.id}
            disabled={node.unlocked || pesos < node.cost || !node.prerequisites.every((req) => techTree[req].unlocked)}
            onClick={() => research(node.id)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold">{node.label}</div>
              <span className="text-xs text-white/65">T{node.tier}</span>
            </div>
            <div className="mt-1 text-xs text-white/65">{node.description}</div>
            <div className="mt-2 text-xs text-white/70">
              {node.unlocked ? "Desbloqueado" : `Costo $${node.cost.toLocaleString("es-AR")}`}
            </div>
          </button>
        ))}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="text-sm font-semibold">Licitaciones</div>
          <div className="mt-2 space-y-2 text-sm text-white/75">
            {contracts.map((c) => (
              <div key={c.id} className="rounded-xl bg-black/25 px-3 py-2">
                {c.name} · +{Math.round(c.premiumUsdBonus * 100)}% USD
              </div>
            ))}
          </div>
        </div>
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