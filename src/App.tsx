import React, { useEffect } from 'react';
import Scene3D from './components/scene/Scene3D';
import TopBar from './components/ui/TopBar';
import BottomBar from './components/ui/BottomBar';
import LeftPanel from './components/ui/LeftPanel';
import RightPanel from './components/ui/RightPanel';
import MainMenu from './components/ui/MainMenu';
import { useGame } from './hooks/useGame';

export default function App() {
  const phase = useGame((s) => s.phase);
  const tick = useGame((s) => s.tick);

  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(interval);
  }, [phase, tick]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050816]">
      <Scene3D />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />
      <TopBar />
      <LeftPanel />
      <RightPanel />
      <BottomBar />
      {phase === 'menu' ? <MainMenu /> : null}
    </div>
  );
}
