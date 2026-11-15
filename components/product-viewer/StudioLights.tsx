"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Procedural studio lighting — no HDR download required.
 * Softboxes rendered into an environment map give the glass and body
 * realistic reflections.
 */
export function StudioLights({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.25 * intensity} />
      <directionalLight position={[2.5, 4, 3.5]} intensity={1.6 * intensity} />
      <directionalLight position={[-3, 1.5, -3]} intensity={0.9 * intensity} color="#dfe6ff" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#151517"]} />
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} rotation-x={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[-4, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[4, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 0.5, 5]} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[0, 1, -5]} rotation-y={Math.PI} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={1.2} position={[2, 2, 3]} scale={1.2} />
      </Environment>
    </>
  );
}
