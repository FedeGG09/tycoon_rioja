import React from "react";
import { useGame } from "../../hooks/useGame";

type WorkerType = {
  id: string;
  name: string;
  morale: number;
  experience: number;
  type: string;
};

const EMPTY_WORKERS: WorkerType[] = [];

export default function LeftPanel() {
  const workers = useGame((s) => s.workers) ?? EMPTY_WORKERS;

  return (
    <aside className="absolute left-4 top-24 z-20 w-[320px] rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">RRHH</h2>

        <p className="text-xs text-zinc-400">
          Gestión de trabajadores y moral
        </p>
      </div>

      <div className="space-y-2">
        {workers.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/5 p-4 text-sm text-zinc-400">
            No hay trabajadores disponibles.
          </div>
        ) : (
          workers.map((worker: WorkerType) => (
            <div
              key={worker.id}
              className="rounded-xl border border-white/5 bg-white/5 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {worker.name}
                </span>

                <span
                  className={`text-xs ${
                    worker.morale < 30
                      ? "text-red-400"
                      : worker.morale < 60
                        ? "text-yellow-400"
                        : "text-green-400"
                  }`}
                >
                  Moral {worker.morale}%
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                <span>EXP {worker.experience}</span>
                <span>{worker.type}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}