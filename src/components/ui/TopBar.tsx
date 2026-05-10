import React from 'react';
import { Wind } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { Metric, Panel } from './Panel';

export default function TopBar() {
  const state = useGame((s) => ({
    debtPesos: s.debtPesos,
    pesos: s.pesos,
    usdPending: s.usdPending.reduce((sum, item) => sum + item.amountUsd, 0),
    inflationRate: s.inflationRate,
    moraleAverage: s.moraleAverage,
    month: s.month,
    year: s.year,
    weather: s.weather,
  }));

  return (
    <div className="absolute left-0 top-0 z-20 w-full p-3">
      <Panel className="mx-auto max-w-[1400px]">
        <div className="flex flex-wrap items-center gap-3">
          <Metric label="Deuda" value={`-$${Math.abs(state.debtPesos).toLocaleString('es-AR')}`} tone="text-red-300" />
          <Metric label="Pesos" value={`$${Math.round(state.pesos).toLocaleString('es-AR')}`} tone="text-emerald-200" />
          <Metric label="USD pendientes" value={`$${state.usdPending.toFixed(0)} (3 meses)`} tone="text-sky-200" />
          <Metric label="Inflación" value={`${(state.inflationRate * 100).toFixed(1)}%`} tone="text-amber-200" />
          <Metric label="Moral promedio" value={`${Math.round(state.moraleAverage)}%`} tone="text-violet-200" />
          <Metric label="Tiempo" value={`${state.month.toString().padStart(2, '0')}/${state.year}`} tone="text-white" />
          <Metric label="Clima" value={state.weather === 'zonda' ? 'Viento Zonda' : state.weather === 'storm' ? 'Tormenta' : state.weather === 'drought' ? 'Sequía' : 'Normal'} tone="text-cyan-200" />
          <div className="ml-auto flex items-center gap-2 text-white/70">
            <Wind className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.35em]">La Rioja Agro-Tycoon</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
