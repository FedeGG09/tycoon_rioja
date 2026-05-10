import React from "react";
import { useGame } from "../../hooks/useGame";

export default function BottomBar() {
  const logs = useGame((s) => s.logs);
  const weather = useGame((s) => s.weather);
  const debtPesos = useGame((s) => s.debtPesos);

  return (
    <div className="absolute bottom-0 left-0 z-20 w-full px-4 pb-4">
      <div className="rounded-3xl border border-white/10 bg-black/50 px-4 py-3 text-white shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span>Clima: {weather}</span>
          <span>Deuda activa: -${Math.abs(Math.round(debtPesos)).toLocaleString("es-AR")}</span>
          <span>Eventos: {logs.length}</span>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {logs.slice(-4).map((log) => (
            <div key={log.id} className="min-w-[240px] rounded-2xl bg-white/5 px-3 py-2 text-sm">
              <div className="font-semibold">{log.title}</div>
              <div className="text-white/65">{log.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}