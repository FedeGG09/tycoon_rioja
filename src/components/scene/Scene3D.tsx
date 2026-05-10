import React, { Suspense, memo } from "react";
import { AdaptiveDpr, AdaptiveEvents, ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { shallow } from "zustand/shallow";
import { BUILDING_CATALOG } from "../../game/constants";
import { useGame } from "../../hooks/useGame";

const TileMesh = memo(function TileMesh({ tileId }: { tileId: string }) {
  const { tile, selected, building } = useGame((s) => {
    const tile = s.tilesById[tileId];
    const building = Object.values(s.buildingsById).find((b) => b.tileId === tileId) ?? null;
    return {
      tile,
      selected: s.selectedTileId === tileId,
      building,
    };
  }, shallow);

  if (!tile) return null;

  const color =
    tile.terrain === "river"
      ? "#2757b8"
      : tile.terrain === "hill"
        ? "#7c6a54"
        : tile.terrain === "stone"
          ? "#8d8d93"
          : "#547a45";

  return (
    <group
      position={[tile.x, tile.y, tile.z]}
      onClick={(e) => {
        e.stopPropagation();
        useGame.getState().selectTile(tileId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        useGame.getState().hoverTile(tileId);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        useGame.getState().hoverTile(null);
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <planeGeometry args={[7.9, 7.9]} />
        <meshStandardMaterial color={color} roughness={0.95} metalness={0.02} />
      </mesh>

      {tile.terrain === "river" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <planeGeometry args={[7.1, 7.1]} />
          <meshStandardMaterial color="#4aa7ff" transparent opacity={0.35} />
        </mesh>
      ) : null}

      {selected ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[3.3, 3.9, 32]} />
          <meshBasicMaterial color="#f4d35e" />
        </mesh>
      ) : null}

      {building && building.type !== "depot" ? (
        <group position={[0, 0.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2.4, 1.2 + building.level * 0.2, 2.4]} />
            <meshStandardMaterial color={BUILDING_CATALOG[building.type].color} roughness={0.8} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
});

function SceneContent() {
  const tileIds = useGame((s) => s.tileIds);
  const weather = useGame((s) => s.weather);
  const morale = useGame((s) => s.moraleAverage);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[20, 30, 15]} intensity={1.8} castShadow />
      <fog attach="fog" args={[weather === "zonda" ? "#101829" : "#050816", 45, 180]} />
      {tileIds.map((id) => (
        <TileMesh key={id} tileId={id} />
      ))}
      <ContactShadows opacity={0.35} scale={60} blur={2.4} far={24} />
      <OrbitControls enablePan={false} minDistance={25} maxDistance={120} maxPolarAngle={1.2} />
      <mesh position={[-28, 16, -28]} visible={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial />
      </mesh>
      <group position={[-32, 24, -32]}>
        <mesh>
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshBasicMaterial />
        </mesh>
      </group>
      <HtmlOverlay morale={morale} />
    </>
  );
}

function HtmlOverlay({ morale }: { morale: number }) {
  return (
    <Html center position={[-52, 18, -48]}>
      <div className="rounded-2xl border border-white/10 bg-black/60 px-4 py-2 text-sm text-white">
        Moral promedio {Math.round(morale)}%
      </div>
    </Html>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0">
      <Canvas shadows camera={{ position: [35, 42, 45], fov: 45 }}>
        <Suspense fallback={null}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}