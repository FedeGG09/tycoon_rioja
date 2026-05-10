import React, { Suspense, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { useGame } from "../../hooks/useGame";
import { BUILDING_CATALOG } from "../../game/constants";

const TileMesh = memo(function TileMesh({
  tileId,
}: {
  tileId: string;
}) {
  const tile = useGame((s) => s.tilesById[tileId]);

  const selectedTileId = useGame((s) => s.selectedTileId);

  const buildingsById = useGame((s) => s.buildingsById);

  const building =
    Object.values(buildingsById).find((b) => b.tileId === tileId) ??
    null;

  if (!tile) return null;

  const selected = selectedTileId === tileId;

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
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.9, 7.9]} />

        <meshStandardMaterial
          color={color}
          roughness={0.95}
          metalness={0.02}
        />
      </mesh>

      {tile.terrain === "river" ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.03, 0]}
        >
          <planeGeometry args={[7.1, 7.1]} />

          <meshStandardMaterial
            color="#4aa7ff"
            transparent
            opacity={0.35}
          />
        </mesh>
      ) : null}

      {selected ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.06, 0]}
        >
          <ringGeometry args={[3.3, 3.9, 32]} />

          <meshBasicMaterial color="#f4d35e" />
        </mesh>
      ) : null}

      {building && building.type !== "depot" ? (
        <group position={[0, 0.15, 0]}>
          <mesh castShadow>
            <boxGeometry
              args={[2.4, 1.2 + building.level * 0.2, 2.4]}
            />

            <meshStandardMaterial
              color={
                BUILDING_CATALOG[building.type]?.color ??
                "#c084fc"
              }
              roughness={0.8}
            />
          </mesh>
        </group>
      ) : null}
    </group>
  );
});

function SceneContent() {
  const tileIds = useGame((s) => s.tileIds);

  const weather = useGame((s) => s.weather);

  const background =
    weather === "zonda" ? "#101829" : "#050816";

  return (
    <>
      <color attach="background" args={[background]} />

      <ambientLight intensity={0.8} />

      <directionalLight
        position={[20, 30, 15]}
        intensity={1.4}
      />

      {tileIds.map((id) => (
        <TileMesh key={id} tileId={id} />
      ))}

      <ContactShadows
        opacity={0.25}
        scale={50}
        blur={2}
        far={20}
      />

      <OrbitControls
        enablePan={false}
        minDistance={25}
        maxDistance={120}
        maxPolarAngle={1.2}
      />
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{
          position: [35, 42, 45],
          fov: 45,
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}