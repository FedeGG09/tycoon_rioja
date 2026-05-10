import React from "react";
import { useGame } from "../../hooks/useGame";

export default function TopBar() {
  const pesos = useGame((s) => s.pesos);
  const debtPesos = useGame((s) => s.debtPesos);
  const usdPending = useGame((s) => s.usdPending);
  const inflationRate = useGame((s) => s.inflationRate);
  const moraleAverage = useGame((s) => s.moraleAverage);
  const month = useGame((s) => s.month);
  const year = useGame((s) => s.year);

  return (
    <div className="absolute left-0 top-0 z-20 w-full px-4 pt-4">
      <div className="grid gap-3 md:grid-cols-5">
        <Card label="Deuda" value={`-$${Math.abs(Math.round(debtPesos)).toLocaleString("es-AR")}`} danger />
        <Card label="Pesos" value={`$${Math.round(pesos).toLocaleString("es-AR")}`} />
        <Card label="USD pendientes" value={`${usdPending.length} envíos`} />
        <Card label="Inflación" value={`${Math.round(inflationRate * 100)}%`} />
        <Card label="Moral" value={`${Math.round(moraleAverage)}%`} subtitle={`${month}/${year}`} />
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  subtitle,
  danger,
}: {
  label: string;
  value: string;
  subtitle?: string;
  danger?: boolean;
}) {
  return (
    <div className={`rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md ${danger ? "border-red-500/30 bg-red-950/70" : "border-white/10 bg-black/45"}`}>
      <div className="text-[10px] uppercase tracking-[0.35em] text-white/55">{label}</div>
      <div className="mt-1 text-xl font-black text-white">{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-white/60">{subtitle}</div> : null}
    </div>
  );
}