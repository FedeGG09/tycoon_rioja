import React from 'react';
import { Building2, Cpu, Hammer, House, LineChart, Truck } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { Panel, SectionTitle } from './Panel';
import ResearchMenu from './ResearchMenu';
import InfrastructureMenu from './InfrastructureMenu';
import HousingMenu from './HousingMenu';
import EconomyMenu from './EconomyMenu';

const tabs = [
  { id: 'research', label: 'I+D', icon: Cpu },
  { id: 'infrastructure', label: 'Infra', icon: Hammer },
  { id: 'housing', label: 'Vivienda', icon: House },
  { id: 'economy', label: 'Economía', icon: LineChart },
  { id: 'export', label: 'Licit.', icon: Truck },
] as const;

export default function RightPanel() {
  const activePanel = useGame((s) => s.activePanel);
  const setActivePanel = useGame((s) => s.setActivePanel);

  return (
    <div className="absolute right-3 top-[96px] z-20 w-[380px]">
      <Panel className="max-h-[calc(100vh-180px)] overflow-y-auto">
        <SectionTitle eyebrow="Gestión" title="I+D, infraestructura y finanzas" subtitle="Paneles desacoplados para no castigar la escena." />
        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activePanel === tab.id;
            return (
              <button key={tab.id} onClick={() => setActivePanel(tab.id)} className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${selected ? 'bg-yellow-300 text-black' : 'border border-white/10 bg-white/5 text-white/75 hover:bg-white/10'}`}>
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          {activePanel === 'research' ? <ResearchMenu /> : null}
          {activePanel === 'infrastructure' ? <InfrastructureMenu /> : null}
          {activePanel === 'housing' ? <HousingMenu /> : null}
          {activePanel === 'economy' ? <EconomyMenu /> : null}
          {activePanel === 'export' ? <EconomyMenu exportOnly /> : null}
        </div>
      </Panel>
    </div>
  );
}
