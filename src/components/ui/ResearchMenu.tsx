import React from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { RESEARCH_TREE } from '../../game/constants';
import { useGame } from '../../hooks/useGame';

export default function ResearchMenu() {
  const tech = useGame((s) => s.techTree);
  const research = useGame((s) => s.research);
  const pesos = useGame((s) => s.pesos);

  return (
    <div className="grid gap-3">
      {Object.values(RESEARCH_TREE).map((node) => {
        const state = tech[node.id];
        const prereqOk = node.prerequisites.every((pr) => tech[pr].unlocked);
        const afford = pesos >= node.cost;
        return (
          <button key={node.id} disabled={state.unlocked || !prereqOk || !afford} onClick={() => research(node.id)} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45">
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-white">{node.label}</div>
              {state.unlocked ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Lock className="h-4 w-4 text-white/45" />}
            </div>
            <div className="mt-1 text-sm text-white/65">{node.description}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/55">
              <span className="rounded-full bg-black/25 px-2 py-1">Tier {node.tier}</span>
              <span className="rounded-full bg-black/25 px-2 py-1">${node.cost.toLocaleString('es-AR')}</span>
              <span className="rounded-full bg-black/25 px-2 py-1">{prereqOk ? 'prerequisitos ok' : 'bloqueado'}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
