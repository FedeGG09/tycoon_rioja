import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Download, TriangleAlert } from 'lucide-react';
import { useGame } from '../../hooks/useGame';

export default function MainMenu() {
  const startGame = useGame((s) => s.startGame);
  const resetGame = useGame((s) => s.resetGame);
  const exportSave = useGame((s) => s.exportSave);

  const download = () => {
    const json = JSON.stringify(exportSave(), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rioja-tycoon-save.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-[min(94vw,760px)] rounded-[28px] border border-white/10 bg-zinc-950/95 p-8 shadow-2xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-yellow-300/70">La Rioja Agro-Tycoon</div>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-6xl">Simulación agro-industrial en crisis</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70 md:text-base">Construí infraestructura, activá la red logística, equilibrá deuda, inflación, exportaciones y bienestar social sin matar los FPS.</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-200"><TriangleAlert className="h-5 w-5" /></div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <button onClick={startGame} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-4 py-3 font-semibold text-black hover:bg-yellow-200"><Play className="h-4 w-4" />Jugar</button>
          <button onClick={resetGame} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10"><RotateCcw className="h-4 w-4" />Reiniciar</button>
          <button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10"><Download className="h-4 w-4" />Exportar save</button>
        </div>
      </motion.div>
    </div>
  );
}
