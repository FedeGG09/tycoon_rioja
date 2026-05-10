import React, { Suspense, memo, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { useGame } from '../../hooks/useGame';
import { BUILDING_CATALOG, TILE_SIZE } from '../../game/constants';
import type { BuildingType } from '../../types/game';
import * as THREE from 'three';
import { shallow } from 'zustand/shallow';

function TileMesh({ tileId }: { tileId: string }) {
  const { tile, selected, hovered, building } = useGame((s) => {
    const tile = s.tilesById[tileId];
    const building = Object.values(s.buildingsById).find((b) => b.tileId === tileId) ?? null;
    return { tile, selected: s.selectedTileId === tileId, hovered: s.hoveredTileId === tileId, building };
  }, shallow);

  if (!tile) return null;

  const color = tile.terrain === 'river' ? '#2757b8' : tile.terrain === 'hill' ? '#7c6a54' : tile.terrain === 'stone' ? '#8d8d93' : '#547a45';
  const active = tile.unlocked || tile.road || tile.bridge || tile.id === 'tile-10-10';

  return (
    <group position={[tile.x, tile.y, tile.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow onClick={(e) => { e.stopPropagation(); useGame.getState().selectTile(tileId); }} onPointerOver={(e) => { e.stopPropagation(); useGame.getState().hoverTile(tileId); }} onPointerOut={(e) => { e.stopPropagation(); useGame.getState().hoverTile(null); }}>
        <planeGeometry args={[TILE_SIZE - 0.6, TILE_SIZE - 0.6]} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0.03} transparent opacity={active ? 1 : 0.38} emissive={selected ? '#f4d35e' : hovered ? '#96d4ff' : '#000000'} emissiveIntensity={selected ? 0.18 : 0.04} />
      </mesh>
      {tile.terrain === 'river' ? <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}><ringGeometry args={[2.1, 3.2, 24]} /><meshBasicMaterial color="#69b7ff" transparent opacity={0.55} side={THREE.DoubleSide} /></mesh> : null}
      {selected ? <Html center position={[0, 1.5, 0]}><div className="rounded-full border border-white/15 bg-black/75 px-3 py-1 text-[11px] font-semibold text-white shadow-lg">{tile.terrain.toUpperCase()} · {tile.resource.toUpperCase()}</div></Html> : null}
      {building && building.type !== 'depot' ? <Html center position={[0, 1.05, 0]}><div className="rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white/90">{BUILDING_CATALOG[building.type].label} N{building.level}</div></Html> : null}
    </group>
  );
}

const TileMeshMemo = memo(TileMesh);

function BuildingMesh({ buildingId }: { buildingId: string }) {
  const { building, tile } = useGame((s) => ({ building: s.buildingsById[buildingId], tile: s.buildingsById[buildingId] ? s.tilesById[s.buildingsById[buildingId].tileId] : undefined }), shallow);
  if (!building || !tile) return null;
  const spec = BUILDING_CATALOG[building.type];
  const y = tile.y + 0.25;
  if (building.type === 'depot') {
    return <group position={[tile.x, y, tile.z]}><mesh castShadow receiveShadow><boxGeometry args={[3.8, 1.6, 3.8]} /><meshStandardMaterial color="#f4d35e" roughness={0.75} /></mesh><Html center position={[0, 1.6, 0]}><div className="rounded-full bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">ALMACÉN</div></Html></group>;
  }
  return <group position={[tile.x, y, tile.z]}><mesh castShadow receiveShadow><boxGeometry args={[2.4, 1.4 + building.level * 0.18, 2.4]} /><meshStandardMaterial color={spec.color} roughness={0.85} emissive={building.active ? '#111111' : '#000000'} emissiveIntensity={building.active ? 0.08 : 0.01} /></mesh><mesh position={[0, 0.95 + building.level * 0.12, 0]} castShadow><coneGeometry args={[1.1, 0.9, 4]} /><meshStandardMaterial color={building.active ? '#ffffff' : '#666666'} roughness={0.95} /></mesh><Html center position={[0, 2.05, 0]}><div className="rounded-full border border-white/10 bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white">{spec.label} · N{building.level}</div></Html></group>;
}

function WorkerMesh({ workerId }: { workerId: string }) {
  const worker = useGame((s) => s.workersById[workerId]);
  const building = useGame((s) => worker?.assignedBuildingId ? s.buildingsById[worker.assignedBuildingId] : null);
  const tile = useGame((s) => building ? s.tilesById[building.tileId] : null);
  if (!worker || !tile) return null;
  return <group position={[tile.x, tile.y + 1.8, tile.z]}><mesh castShadow><capsuleGeometry args={[0.18, 0.6, 4, 8]} /><meshStandardMaterial color={worker.type === 'permanent' ? '#ffd166' : '#f4a261'} /></mesh><mesh position={[0, 0.55, 0]} castShadow><sphereGeometry args={[0.16, 16, 16]} /><meshStandardMaterial color={worker.morale < 20 ? '#ef476f' : '#d9f99d'} /></mesh></group>;
}

function SceneContent() {
  const tileIds = useGame((s) => s.tileIds);
  const buildingIds = useGame((s) => Object.keys(s.buildingsById));
  const workerIds = useGame((s) => Object.keys(s.workersById));
  const weather = useGame((s) => s.weather);
  const morale = useGame((s) => s.moraleAverage);
  const background = weather === 'zonda' ? '#101829' : '#050816';
  return <>
    <color attach="background" args={[background]} />
    <ambientLight intensity={0.92} />
    <directionalLight position={[30, 40, 20]} intensity={1.4} castShadow />
    <fog attach="fog" args={[background, 90, 220]} />
    {tileIds.map((id) => <TileMeshMemo key={id} tileId={id} />)}
    {buildingIds.map((id) => <BuildingMesh key={id} buildingId={id} />)}
    {workerIds.map((id) => <WorkerMesh key={id} workerId={id} />)}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow><planeGeometry args={[240, 240]} /><meshStandardMaterial color="#0a1524" roughness={1} /></mesh>
    <ContactShadows opacity={0.34} scale={120} blur={2.6} far={45} />
    <Html position={[-68, 46, 0]} center><div className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] text-white/80 backdrop-blur-md">Moral promedio {Math.round(morale)}%</div></Html>
    <OrbitControls enablePan={false} enableZoom minDistance={65} maxDistance={200} maxPolarAngle={1.22} minPolarAngle={0.32} />
  </>;
}

export default function Scene3D() {
  return <div className="absolute inset-0"><Canvas shadows dpr={[1, 1.8]} camera={{ position: [60, 70, 88], fov: 48 }}><Suspense fallback={null}><AdaptiveDpr pixelated /><AdaptiveEvents /><SceneContent /></Suspense></Canvas></div>;
}
