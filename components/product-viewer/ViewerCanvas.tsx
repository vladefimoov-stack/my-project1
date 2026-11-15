"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { CameraControls, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Phone } from "./Phone";
import { StudioLights } from "./StudioLights";
import { VIEWS, type ViewId } from "@/lib/views";
import type { AppId } from "@/lib/apps";

export type ViewRequest = { id: ViewId; nonce: number };

type Props = {
  request: ViewRequest;
  autoRotate: boolean;
  active: boolean; // false when scrolled out of view → stop rendering
  labels: Record<AppId, string>;
  onInteract: () => void;
  onReady?: () => void;
};

const IDLE_MS = 6000;

function Rig({ request, autoRotate, onInteract }: Pick<Props, "request" | "autoRotate" | "onInteract">) {
  const ref = useRef<CameraControls>(null);
  const lastInput = useRef(0);
  const first = useRef(true);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const v = VIEWS[request.id];
    c.setLookAt(...v.position, ...v.target, !first.current);
    if (!first.current) lastInput.current = performance.now();
    first.current = false;
  }, [request]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const on = () => {
      lastInput.current = performance.now();
      onInteract();
    };
    c.addEventListener("controlstart", on);
    return () => c.removeEventListener("controlstart", on);
  }, [onInteract]);

  useFrame((_, dt) => {
    const c = ref.current;
    if (!c || !autoRotate) return;
    if (performance.now() - lastInput.current < IDLE_MS) return;
    c.rotate(Math.min(dt, 0.05) * 0.35, 0, false);
  });

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={0.9}
      maxDistance={6}
      minPolarAngle={0.12}
      maxPolarAngle={Math.PI - 0.12}
      smoothTime={0.45}
      draggingSmoothTime={0.12}
      dollySpeed={0.6}
      truckSpeed={0}
    />
  );
}

export default function ViewerCanvas({ request, autoRotate, active, labels, onInteract, onReady }: Props) {
  const dprMax = typeof window !== "undefined" && window.innerWidth < 768 ? 1.75 : 2;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, dprMax]}
      camera={{ fov: 30, near: 0.05, far: 50, position: VIEWS.hero.position }}
      gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, powerPreference: "high-performance" }}
      onCreated={() => onReady?.()}
      style={{ touchAction: "none" }}
      aria-hidden="true"
    >
      <StudioLights />
      <Phone screenLabels={labels} />
      <ContactShadows position={[0, -0.72, 0]} opacity={0.35} scale={3.5} blur={2.8} far={1.4} resolution={512} frames={1} />
      <Rig request={request} autoRotate={autoRotate} onInteract={onInteract} />
    </Canvas>
  );
}
