import React from 'react';
import { AlertCircle, Flame, ClipboardList } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { Panel } from './Panel';

export default function BottomBar() {
  const logs = useGame((s) => s.logs.slice(-4));
  const strike = useGame((s) => s.strike);

  return (
    <div className="absolute bottom-0 left-0 z-20 w-full p-3">
      <Panel className="mx-auto max-w-[1400px]">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="flex items-center gap-3 text-sm text-white/80">
            <AlertCircle className={`h-4 w-4 ${strike ? 'text-red-300' : 'text-yellow-300'}`} />
            <span>{strike ? 'Huelga activa: la moral cayó por debajo del 20%.' : 'Operación estable. Mantener caja positiva y red logística conectada.'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <Flame className="h-4 w-4 text-orange-300" />
            <span>Viento Zonda, sequía o deuda alta reducen producción y moral.</span>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center gap-2 text-white/80">
              <ClipboardList className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.3em]">Log de eventos</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/10 bg-black/35 p-3">
                  <div className="text-sm font-semibold text-white">{log.title}</div>
                  <div className="mt-1 text-sm text-white/70">{log.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
