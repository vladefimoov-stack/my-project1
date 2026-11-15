/** Camera presets [position, target] in scene units (phone ≈ 1.32 tall). */
export type ViewId =
  | "front" | "keypad" | "back" | "side" | "edges"
  | "hero" | "threeQuarterFront" | "threeQuarterBack" | "keypadClose" | "screenClose" | "scale";

export const VIEWS: Record<ViewId, { position: [number, number, number]; target: [number, number, number] }> = {
  front: { position: [0, 0.02, 3.3], target: [0, 0, 0] },
  keypad: { position: [0.15, -0.75, 1.55], target: [0, -0.36, 0] },
  back: { position: [0, 0.05, -3.3], target: [0, 0, 0] },
  side: { position: [3.2, 0.25, 0.55], target: [0, 0, 0] },
  edges: { position: [1.5, 1.9, 2.0], target: [0, 0.15, 0] },
  hero: { position: [1.25, 0.3, 3.0], target: [0, -0.02, 0] },
  threeQuarterFront: { position: [1.7, 0.45, 2.6], target: [0, 0, 0] },
  threeQuarterBack: { position: [-1.9, 0.5, -2.45], target: [0, 0, 0] },
  keypadClose: { position: [-0.42, -0.72, 1.3], target: [0, -0.37, 0] },
  screenClose: { position: [0.32, 0.5, 1.2], target: [0, 0.27, 0] },
  scale: { position: [0.32, 0, 3.6], target: [0.32, 0, 0] },
};
