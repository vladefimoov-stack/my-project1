"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { Phone } from "./Phone";
import { PhoneModel } from "./PhoneModel";
import { StudioLights } from "./StudioLights";
import { VIEWS, type ViewId } from "@/lib/views";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { launcherDate } from "@/lib/launcher";
import type { AppId } from "@/lib/apps";

declare global {
  interface Window {
    __RENDER_READY?: boolean;
    __exportGLB?: () => Promise<string>;
  }
}

function CameraRig({ view }: { view: ViewId }) {
  const { camera } = useThree();
  const frames = useRef(0);
  useEffect(() => {
    const v = VIEWS[view] ?? VIEWS.hero;
    camera.position.set(...v.position);
    camera.lookAt(...v.target);
    camera.updateProjectionMatrix();
  }, [camera, view]);
  useFrame(() => {
    frames.current++;
    if (frames.current === 30) window.__RENDER_READY = true;
  });
  return null;
}

function BankCard() {
  // ISO/IEC 7810 ID-1: 85.6 × 53.98 × 0.76 mm, corner radius ≈ 3.2 mm
  return (
    <group position={[0.275 + 0.12 + 0.27, -0.66 + 0.428, 0]} rotation={[0, 0, Math.PI / 2]} scale={0.01}>
      <RoundedBox args={[85.6, 53.98, 0.76]} radius={0.35} smoothness={2}>
        <meshPhysicalMaterial color="#D9DADF" roughness={0.35} clearcoat={0.6} />
      </RoundedBox>
      <mesh position={[-25, 6, 0.39]}>
        <planeGeometry args={[11, 8.5]} />
        <meshStandardMaterial color="#C9B37E" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Exporter() {
  const { scene } = useThree();
  useEffect(() => {
    window.__exportGLB = async () => {
      const target = scene.getObjectByName("KalmPhone");
      if (!target) throw new Error("model not found");
      const exporter = new GLTFExporter();
      const result = (await exporter.parseAsync(target, { binary: true, onlyVisible: true })) as ArrayBuffer;
      let bin = "";
      const bytes = new Uint8Array(result);
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    };
  }, [scene]);
  return null;
}

export default function RenderStage({ view, bg, lang }: { view: string; bg?: string; lang?: string }) {
  const v = (view in VIEWS ? view : "hero") as ViewId;
  const locale = isLocale(lang) ? lang : "en";
  const labels = getDictionary(locale).demo.apps as Record<AppId, string>;
  // fixed date so renders are reproducible
  const date = launcherDate(locale, new Date(2026, 10, 9));
  return (
    <div style={{ position: "fixed", inset: 0, background: bg ? `#${bg}` : "transparent" }}>
      <Canvas
        dpr={2}
        gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ fov: 30, near: 0.05, far: 50 }}
      >
        <CameraRig view={v} />
        <StudioLights />
        {v === "scale" ? <PhoneModel screenLabels={labels} screenDate={date} /> : <Phone screenLabels={labels} screenDate={date} />}
        {v === "scale" && <BankCard />}
        {(v === "hero" || v === "threeQuarterFront" || v === "front" || v === "scale") && (
          <ContactShadows position={[0, -0.665, 0]} opacity={0.4} scale={4} blur={2.6} far={1.2} resolution={512} />
        )}
        <Exporter />
      </Canvas>
    </div>
  );
}
