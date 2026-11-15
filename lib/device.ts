/**
 * Provisional physical layout of the device, in millimetres, reconstructed
 * from the reference photographs. Shared by the procedural 3D model and the
 * CSS virtual phone so both depict the same device.
 *
 * ⚠ All values are estimates from photos — verify against a physical sample.
 *    See docs/3D-MODEL.md for the verification checklist.
 */
export const DEVICE = {
  width: 55,
  height: 132,
  depth: 11.5,
  cornerRadius: 7,

  glass: { width: 51, height: 72.5, top: 2.5 }, // top = distance from body top edge
  screen: { width: 46, height: 61.3, top: 7.4 }, // 3:4 portrait active area

  keypad: { top: 76.8, side: 2.6, gap: 0.7 }, // top = distance from body top edge
  rows: { soft: 8.2, digit: 8.6 },
  dpad: { outer: 8.6, inner: 4.3 }, // radii

  camera: { x: 9.5, y: 13, w: 9.2, h: 19.5 }, // rear module centre offset from top-left (viewed from back)
} as const;

export type KeyId =
  | "softL" | "softR" | "call" | "end"
  | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "*" | "0" | "#"
  | "ok" | "up" | "down" | "left" | "right";

export type KeyDef = { id: KeyId; main: string; sub?: string; icon?: "alarm" | "back" | "call" | "end" };

export const SOFT_KEYS: { left: KeyDef[]; right: KeyDef[] } = {
  left: [
    { id: "softL", main: "", icon: "alarm" },
    { id: "call", main: "", icon: "call" },
  ],
  right: [
    { id: "softR", main: "", icon: "back" },
    { id: "end", main: "", icon: "end" },
  ],
};

export const DIGIT_KEYS: KeyDef[] = [
  { id: "1", main: "1", sub: "–" },
  { id: "2", main: "2", sub: "ABC" },
  { id: "3", main: "3", sub: "DEF" },
  { id: "4", main: "4", sub: "GHI" },
  { id: "5", main: "5", sub: "JKL" },
  { id: "6", main: "6", sub: "MNO" },
  { id: "7", main: "7", sub: "PQRS" },
  { id: "8", main: "8", sub: "TUV" },
  { id: "9", main: "9", sub: "WXYZ" },
  { id: "*", main: "*", sub: "+" },
  { id: "0", main: "0", sub: "␣" },
  { id: "#", main: "#", sub: "⇧" },
];

/** SVG path data (24×24) for key glyphs — used by both canvas textures and DOM */
export const KEY_GLYPHS: Record<NonNullable<KeyDef["icon"]>, string> = {
  alarm:
    "M12 6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm0 1.6a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zM11.2 9.5v3.8l2.9 1.8.8-1.3-2.1-1.3V9.5zM5.2 4.3l1.1 1.2L3.9 7.6 2.8 6.4zM18.8 4.3l2.4 2.1-1.1 1.2-2.4-2.1z",
  back: "M9.5 5.5 4 10.5l5.5 5v-3.3h5.2a3.3 3.3 0 0 1 0 6.6H12v1.9h2.7a5.2 5.2 0 0 0 0-10.4H9.5z",
  call: "M6.6 3.5c.5 0 .9.3 1.1.7l1.3 3c.2.5.1 1-.3 1.3L7.2 9.7a11 11 0 0 0 5.1 5.1l1.2-1.5c.3-.4.9-.5 1.3-.3l3 1.3c.5.2.8.7.7 1.2l-.3 2.6c-.1.6-.6 1-1.2 1C9.7 19 3.9 13.3 3.8 5.9c0-.6.4-1.1 1-1.2z",
  end: "M12 8.8c3.4 0 6.6 1.1 8.6 3 .4.4.5 1 .2 1.5l-1.2 1.8c-.3.5-.9.6-1.4.4l-2.6-1.1c-.4-.2-.7-.6-.7-1.1v-1.6a11 11 0 0 0-5.8 0v1.6c0 .5-.3.9-.7 1.1l-2.6 1.1c-.5.2-1.1 0-1.4-.4L3.2 13.3c-.3-.5-.2-1.1.2-1.5 2-1.9 5.2-3 8.6-3z",
};

/** keypad layout → key rectangles in mm (centre x/y, w, h) */
export function keypadLayout() {
  const W = DEVICE.width, H = DEVICE.height;
  const { keypad, rows, dpad } = DEVICE;
  const left = -W / 2 + keypad.side;
  const usable = W - keypad.side * 2;
  const top = H / 2 - keypad.top;
  const softW = (usable - (dpad.outer * 2 + keypad.gap * 2)) / 2;
  const keys: { def: KeyDef; x: number; y: number; w: number; h: number }[] = [];

  SOFT_KEYS.left.forEach((def, i) => {
    const y = top - rows.soft / 2 - i * (rows.soft + keypad.gap);
    keys.push({ def, x: left + softW / 2, y, w: softW, h: rows.soft });
  });
  SOFT_KEYS.right.forEach((def, i) => {
    const y = top - rows.soft / 2 - i * (rows.soft + keypad.gap);
    keys.push({ def, x: -left - softW / 2, y, w: softW, h: rows.soft });
  });
  const dpadY = top - rows.soft - keypad.gap / 2;
  const digitTop = top - rows.soft * 2 - keypad.gap * 2;
  const colW = (usable - keypad.gap * 2) / 3;
  DIGIT_KEYS.forEach((def, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    keys.push({
      def,
      x: left + colW / 2 + col * (colW + keypad.gap),
      y: digitTop - rows.digit / 2 - row * (rows.digit + keypad.gap),
      w: colW,
      h: rows.digit,
    });
  });
  const bottom = digitTop - rows.digit * 4 - keypad.gap * 3;
  return { keys, dpadY, top, bottom };
}

