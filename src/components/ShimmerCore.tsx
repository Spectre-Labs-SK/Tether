import { Float, MeshDistortMaterial } from '@react-three/drei';

type ShimmerCoreProps = {
  mode: 'MILITARY' | 'ETHER';
  staticLevel: number; // 0-100
};

export function ShimmerCore({ mode, staticLevel }: ShimmerCoreProps) {
  const color = mode === 'MILITARY' ? '#1e293b' : '#6d28d9';
  // Scale the 0-100 staticLevel to a 0-1 range for the distort prop.
  const distortion = staticLevel / 100;

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <sphereGeometry args={[1.5, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={distortion}
          speed={2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}