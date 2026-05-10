import React from 'react';
import { Download, Percent, Globe2 } from 'lucide-react';
import { useGame } from '../../hooks/useGame';

export default function EconomyMenu({ exportOnly = false }: { exportOnly?: boolean }) {
  const state = useGame((s) => ({
    pesos: s.pesos,
    debtPesos: s.debtPesos,
    usdCash: s.usdCash,
    usdPending: s.usdPending,
    officialUsdRate: s.officialUsdRate,
    inflationRate: s.inflationRate,
    cashFlow: s.cashFlow,
    contracts: s.contracts,
    exportSave: s.exportSave,
    boostMorale: s.boostMorale,
  }));

  const download = () => {
    const json = JSON.stringify(state.exportSave(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rioja-tycoon-save.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-3">
      {!exportOnly ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Caja</div><div className="mt-1 text-lg font-semibold text-emerald-200">${Math.round(state.pesos).toLocaleString('es-AR')}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Deuda</div><div className="mt-1 text-lg font-semibold text-red-200">-$${Math.abs(Math.round(state.debtPesos)).toLocaleString('es-AR')}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-[10px] uppercase tracking-[0.3em] text-white/45">USD en caja</div><div className="mt-1 text-lg font-semibold text-sky-200">${state.usdCash.toFixed(1)}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Inflación</div><div className="mt-1 text-lg font-semibold text-amber-200">{(state.inflationRate * 100).toFixed(1)}%</div></div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/75">USD pendientes: {state.usdPending.length} envío(s). Liquidación a 3 meses con retención del 12%.</div>
          <button onClick={state.boostMorale} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 font-semibold text-black hover:bg-yellow-200"><Percent className="h-4 w-4" />Intervención social</button>
        </>
      ) : null}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2 text-white/80"><Globe2 className="h-4 w-4" /><span className="text-xs uppercase tracking-[0.3em]">Licitaciones</span></div>
        <div className="mt-3 grid gap-2">
          {state.contracts.map((contract) => (
            <div key={contract.id} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between"><div className="font-semibold text-white">{contract.name}</div><div className={`text-xs ${contract.unlocked ? 'text-emerald-300' : 'text-white/45'}`}>{contract.unlocked ? '+ premium' : 'bloqueado'}</div></div>
              <div className="mt-1 text-sm text-white/65">Mercado {contract.market} · +{Math.round(contract.premiumUsdBonus * 100)}% USD</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10"><Download className="h-4 w-4" />Exportar JSON</button>
    </div>
  );
}
