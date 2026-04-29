import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { usePatternStore } from '../stores/patternStore';

const LERP = 0.04;

// Pre-allocate a scratch Color so useFrame never allocates new THREE.Color() at 60fps.
const _targetColor = new THREE.Color('#1e293b');

export function ShimmerCore() {
  // DistortMaterialImpl is not exported from @react-three/drei — approximate the type
  // using MeshPhysicalMaterial plus the distort/speed extensions. The ref cast on
  // the JSX element handles the incompatibility between this type and Ref<DistortMaterialImpl>.
  const materialRef = useRef<THREE.MeshPhysicalMaterial & { distort: number; speed: number }>(null!);

  // floatIntensity and floatSpeed are React props on <Float> — they cannot be
  // mutated in useFrame. Read them reactively here (outside Canvas render loop)
  // so <Float> re-renders only on domain transitions, not every frame.
  const floatIntensity = usePatternStore((state) => state.target.floatIntensity);
  const floatSpeed = usePatternStore((state) => state.target.floatSpeed);

  useFrame(() => {
    if (!materialRef.current) return;
    // Use getState() (non-reactive) — never call usePatternStore() inside useFrame.
    const { target } = usePatternStore.getState();
    const mat = materialRef.current;

    mat.distort = THREE.MathUtils.lerp(mat.distort, target.distort, LERP);
    mat.speed = THREE.MathUtils.lerp(mat.speed ?? 2, target.speed, LERP);
    mat.metalness = THREE.MathUtils.lerp(mat.metalness, target.metalness, LERP);
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      target.emissiveIntensity,
      LERP,
    );

    _targetColor.set(target.color);
    mat.color.lerp(_targetColor, LERP);
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.5} floatIntensity={floatIntensity}>
      <mesh scale={1.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={materialRef as unknown as any}
          color="#1e293b"
          distort={0.15}
          speed={1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}
