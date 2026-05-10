import React from "react";
import { Play, RotateCcw, Save } from "lucide-react";
import { useGame } from "../../hooks/useGame";

export default function MainMenu() {
  const startGame = useGame((s) => s.startGame);
  const reset = useGame((s) => s.reset);
  const save = useGame((s) => s.save);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[min(92vw,760px)] rounded-3xl border border-white/10 bg-zinc-950/90 p-8 text-white shadow-2xl">
        <p className="text-xs uppercase tracking-[0.35em] text-yellow-300/80">La Rioja Agro-Tycoon</p>
        <h1 className="mt-3 text-4xl font-black md:text-6xl">Crisis, logística y vino.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">
          Gestioná deuda, transporte, vivienda, investigación y exportaciones sobre la escena 3D ya existente.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <button onClick={startGame} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 font-semibold text-black hover:bg-yellow-200">
            <Play className="h-4 w-4" /> Jugar
          </button>
          <button onClick={save} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10">
            <Save className="h-4 w-4" /> Guardar
          </button>
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10">
            <RotateCcw className="h-4 w-4" /> Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
}