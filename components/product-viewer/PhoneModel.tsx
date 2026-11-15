"use client";

/**
 * PROVISIONAL PROCEDURAL 3D MODEL
 * ---------------------------------------------------------------
 * A genuine 3D reconstruction (real geometry, separate meshes and materials
 * for body, glass, screen, every key, D-pad, camera module and ports) built
 * from the reference photographs. It is NOT a scan or a CAD model of the real
 * product: dimensions in lib/device.ts are estimates.
 *
 * Replace with a production GLB by setting `product.model.glbUrl` — the
 * viewer will load it instead without any other code change.
 */

import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { DEVICE, keypadLayout } from "@/lib/device";
import { canvasTexture, makeBackLogoCanvas, makeKeyLabelCanvas, makeScreenCanvas } from "@/lib/textures";
import { product } from "@/config/product";
import type { AppId } from "@/lib/apps";

const S = 0.01; // mm → scene units
const { width: W, height: H, depth: D } = DEVICE;
const FRONT = D / 2;
const BACK = -D / 2;

function roundedRectShape(w: number, h: number, rTop: number, rBottom = rTop) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + rBottom, y);
  s.lineTo(x + w - rBottom, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rBottom);
  s.lineTo(x + w, y + h - rTop);
  s.quadraticCurveTo(x + w, y + h, x + w - rTop, y + h);
  s.lineTo(x + rTop, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rTop);
  s.lineTo(x, y + rBottom);
  s.quadraticCurveTo(x, y, x + rBottom, y);
  return s;
}

function extrudeCentered(shape: THREE.Shape, depth: number, bevel: number, segments = 4) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(depth - bevel * 2, 0.01),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: segments,
    curveSegments: 24,
  });
  g.translate(0, 0, -(depth - bevel * 2) / 2);
  g.computeVertexNormals();
  return g;
}

export type PhoneModelProps = {
  screenLabels?: Record<AppId, string>;
  screenDate?: string;
  bodyColor?: string;
  keyColor?: string;
};

export const PhoneModel = forwardRef<THREE.Group, PhoneModelProps>(function PhoneModel(
  { screenLabels, screenDate, bodyColor = product.colours[0].body, keyColor = product.colours[0].keys },
  ref
) {
  const layout = useMemo(() => keypadLayout(), []);

  const geo = useMemo(() => {
    const body = extrudeCentered(roundedRectShape(W - 2.8, H - 2.8, DEVICE.cornerRadius - 1.4), D, 1.4, 6);
    const glass = extrudeCentered(roundedRectShape(DEVICE.glass.width, DEVICE.glass.height, DEVICE.cornerRadius - 1, 0.8), 0.6, 0.15, 3);
    const plateH = layout.top - layout.bottom + 1.6;
    const plate = extrudeCentered(roundedRectShape(W - DEVICE.keypad.side * 2 + 0.8, plateH, 0.8, DEVICE.cornerRadius - 1.3), 0.4, 0.08, 2);
    const camModule = extrudeCentered(roundedRectShape(DEVICE.camera.w, DEVICE.camera.h, DEVICE.camera.w / 2), 1.1, 0.35, 4);
    const earpiece = extrudeCentered(roundedRectShape(10, 0.9, 0.45), 0.15, 0.04, 2);
    const usb = extrudeCentered(roundedRectShape(8.6, 2.8, 1.4), 1, 0.1, 2);
    const rocker = extrudeCentered(roundedRectShape(1.6, 18, 0.8), 1.4, 0.3, 3);
    // D-pad: lathe profiles (outer ring + centre button) for a machined look
    const ringPts = [
      [DEVICE.dpad.inner + 0.6, 0], [DEVICE.dpad.inner + 0.6, 0.4], [DEVICE.dpad.inner + 0.8, 0.55],
      [DEVICE.dpad.outer - 0.3, 0.55], [DEVICE.dpad.outer, 0.4], [DEVICE.dpad.outer, 0],
    ].reverse().map(([r, y]) => new THREE.Vector2(r, y));
    const dpadRing = new THREE.LatheGeometry(ringPts, 64);
    dpadRing.rotateX(Math.PI / 2);
    const btnPts = [
      [0, 0.62], [DEVICE.dpad.inner - 0.5, 0.6], [DEVICE.dpad.inner - 0.1, 0.5], [DEVICE.dpad.inner, 0.3], [DEVICE.dpad.inner, 0],
    ].reverse().map(([r, y]) => new THREE.Vector2(r, y));
    const dpadBtn = new THREE.LatheGeometry(btnPts, 64);
    dpadBtn.rotateX(Math.PI / 2);
    return { body, glass, plate, plateH, camModule, earpiece, usb, rocker, dpadRing, dpadBtn };
  }, [layout]);

  const tex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const screen = canvasTexture(makeScreenCanvas(screenLabels, "12:48", screenDate));
    const logo = canvasTexture(makeBackLogoCanvas(product.brand));
    const keyLabels = new Map<string, THREE.CanvasTexture>();
    for (const k of layout.keys) keyLabels.set(k.def.id, canvasTexture(makeKeyLabelCanvas(k.def, k.w / k.h)));
    return { screen, logo, keyLabels };
  }, [layout, screenLabels, screenDate]);

  const mat = useMemo(
    () => ({
      body: new THREE.MeshPhysicalMaterial({ color: bodyColor, roughness: 0.62, metalness: 0.08, clearcoat: 0.12, clearcoatRoughness: 0.6 }),
      keys: new THREE.MeshPhysicalMaterial({ color: keyColor, roughness: 0.5, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.45 }),
      plate: new THREE.MeshStandardMaterial({ color: "#040405", roughness: 0.9 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#020203", roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 0.35 }),
      dark: new THREE.MeshStandardMaterial({ color: "#060607", roughness: 0.6 }),
      lens: new THREE.MeshPhysicalMaterial({ color: "#07080B", roughness: 0.02, metalness: 0.3, clearcoat: 1, clearcoatRoughness: 0 }),
      lensRing: new THREE.MeshStandardMaterial({ color: "#9A9CA3", roughness: 0.28, metalness: 1 }),
      camBody: new THREE.MeshPhysicalMaterial({ color: "#151619", roughness: 0.15, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 }),
      flash: new THREE.MeshStandardMaterial({ color: "#F4EBD0", roughness: 0.3, emissive: "#3a3326" }),
    }),
    [bodyColor, keyColor]
  );

  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g instanceof THREE.BufferGeometry && g.dispose());
      Object.values(mat).forEach((m) => m.dispose());
      if (tex) {
        tex.screen.dispose();
        tex.logo.dispose();
        tex.keyLabels.forEach((t) => t.dispose());
      }
    },
    [geo, mat, tex]
  );

  const glassY = H / 2 - DEVICE.glass.top - DEVICE.glass.height / 2;
  const screenY = H / 2 - DEVICE.screen.top - DEVICE.screen.height / 2;
  const keyDepth = 0.45;
  const cam = { x: W / 2 - DEVICE.camera.x, y: H / 2 - DEVICE.camera.y };

  return (
    <group ref={ref} scale={S} name="KeylineOne">
      {/* ── Body ─────────────────────────────── */}
      <mesh name="Body" geometry={geo.body} material={mat.body} castShadow receiveShadow />

      {/* ── Front: glass + display ───────────── */}
      <mesh name="FrontGlass" geometry={geo.glass} material={mat.glass} position={[0, glassY, FRONT + 0.15]} />
      {tex && (
        <mesh name="Display" position={[0, screenY, FRONT + 0.46]}>
          <planeGeometry args={[DEVICE.screen.width, DEVICE.screen.height]} />
          <meshBasicMaterial map={tex.screen} toneMapped={false} />
        </mesh>
      )}
      <mesh name="Earpiece" geometry={geo.earpiece} material={mat.dark} position={[0, H / 2 - 3.6, FRONT + 0.47]} />
      <mesh name="FrontCamera" position={[-W / 2 + DEVICE.frontCamera.x, H / 2 - DEVICE.frontCamera.y, FRONT + 0.47]}>
        <circleGeometry args={[DEVICE.frontCamera.r, 24]} />
        <meshPhysicalMaterial color="#0B0D14" roughness={0.05} clearcoat={1} />
      </mesh>

      {/* ── Keypad ───────────────────────────── */}
      <mesh
        name="KeypadPlate"
        geometry={geo.plate}
        material={mat.plate}
        position={[0, (layout.top + layout.bottom) / 2, FRONT + 0.02]}
      />
      {layout.keys.map((k) => (
        <group key={k.def.id} name={`Key_${k.def.id}`} position={[k.x, k.y, FRONT + keyDepth / 2 + 0.05]}>
          <RoundedBox args={[k.w, k.h, keyDepth]} radius={0.18} smoothness={3} material={mat.keys} castShadow />
          {tex && (
            <mesh position={[0, 0, keyDepth / 2 + 0.01]}>
              <planeGeometry args={[k.w * 0.9, k.h * 0.9]} />
              <meshBasicMaterial map={tex.keyLabels.get(k.def.id)} transparent toneMapped={false} depthWrite={false} />
            </mesh>
          )}
        </group>
      ))}
      <group name="DPad" position={[0, layout.dpadY, FRONT + 0.05]}>
        <mesh name="DPadRing" geometry={geo.dpadRing} material={mat.keys} castShadow />
        <mesh name="DPadCentre" geometry={geo.dpadBtn} material={mat.keys} castShadow />
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[DEVICE.dpad.outer + 0.3, 64]} />
          <meshStandardMaterial color="#040405" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Back: camera module + wordmark ───── */}
      <group name="RearCamera" position={[cam.x, cam.y, BACK - 0.35]}>
        <mesh geometry={geo.camModule} material={mat.camBody} />
        {[1, -1].map((s) => (
          <group key={s} position={[0, s * 4.7, -0.56]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh material={mat.lensRing}>
              <cylinderGeometry args={[3.25, 3.25, 0.3, 48]} />
            </mesh>
            <mesh material={mat.lens} position={[0, -0.16, 0]}>
              <cylinderGeometry args={[2.6, 2.6, 0.06, 48]} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh name="Flash" material={mat.flash} position={[cam.x - 8, cam.y + 5.5, BACK - 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.2, 32]} />
      </mesh>
      {tex && (
        <mesh name="BackWordmark" position={[0, -6, BACK - 0.01]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[22, 5.5]} />
          <meshBasicMaterial map={tex.logo} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      )}
      {/* speaker holes */}
      <group name="Speaker" position={[0, -H / 2 + 12, BACK - 0.01]} rotation={[0, Math.PI, 0]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[(i - 3) * 2.1, 0, 0]} material={mat.dark}>
            <circleGeometry args={[0.55, 16]} />
          </mesh>
        ))}
      </group>

      {/* ── Edges: USB-C, mic, side keys (positions assumed — verify) ── */}
      <mesh name="USBPort" geometry={geo.usb} material={mat.dark} position={[0, -H / 2 + 0.38, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh name="MicBottom" material={mat.dark} position={[9, -H / 2 + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
      </mesh>
      <mesh name="MicTop" material={mat.dark} position={[-12, H / 2 - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
      </mesh>
      <mesh name="SideRocker" geometry={geo.rocker} material={mat.body} position={[W / 2 + 0.25, 28, 0]} rotation={[0, Math.PI / 2, 0]} />
      <mesh name="SideKey" geometry={geo.rocker} material={mat.body} position={[W / 2 + 0.25, 8, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 0.55, 1]} />
    </group>
  );
});
