/**
 * Launcher apps for the virtual phone + 3D screen texture.
 * Icons are original simplified artwork (24×24 SVG paths), not official logos.
 * The order reproduces the launcher seen in the reference photo.
 */
export type AppId =
  | "telegram" | "maps" | "gallery"
  | "youtube" | "music" | "whatsapp"
  | "settings" | "phone" | "contacts";

export type AppIcon = {
  id: AppId;
  bg: [string, string]; // gradient top → bottom
  paths: { d: string; fill: string; evenOdd?: boolean }[];
};

export const APPS: AppIcon[] = [
  {
    id: "telegram",
    bg: ["#3CB4F0", "#1E93D2"],
    paths: [{ d: "M4.6 11.6 18.6 6.2c.7-.3 1.3.2 1.1 1l-2.4 11.2c-.2.8-.8 1-1.4.6l-3.6-2.7-1.8 1.7c-.2.2-.4.3-.7.3l.3-3.7 6.6-6c.3-.3-.1-.4-.4-.2l-8.2 5.2-3.5-1.1c-.8-.2-.8-.8.1-1.1z", fill: "#FFFFFF" }],
  },
  {
    id: "maps",
    bg: ["#FFFFFF", "#EDEFF2"],
    paths: [
      { d: "M12 2.8a6.4 6.4 0 0 0-6.4 6.4c0 4.8 6.4 12 6.4 12s6.4-7.2 6.4-12A6.4 6.4 0 0 0 12 2.8z", fill: "#F0433A" },
      { d: "M12 6.9a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z", fill: "#FFFFFF" },
    ],
  },
  {
    id: "gallery",
    bg: ["#FFFFFF", "#EEF1F5"],
    paths: [
      { d: "M4 5.5h16v13H4z", fill: "#4A90E2" },
      { d: "M4 18.5l5.2-6.2 3.6 4 2.4-2.6 4.8 4.8z", fill: "#3DBE6B" },
      { d: "M16.2 7.6a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z", fill: "#FFD23F" },
    ],
  },
  {
    id: "youtube",
    bg: ["#FFFFFF", "#F1F1F1"],
    paths: [
      { d: "M3.2 8.4c.2-1.6 1.2-2.6 2.8-2.7C8 5.5 10 5.4 12 5.4s4 .1 6 .3c1.6.1 2.6 1.1 2.8 2.7.2 1.2.2 2.4.2 3.6s0 2.4-.2 3.6c-.2 1.6-1.2 2.6-2.8 2.7-2 .2-4 .3-6 .3s-4-.1-6-.3c-1.6-.1-2.6-1.1-2.8-2.7C3 14.4 3 13.2 3 12s0-2.4.2-3.6z", fill: "#F2271C" },
      { d: "M10 9v6l5.2-3z", fill: "#FFFFFF" },
    ],
  },
  {
    id: "music",
    bg: ["#26262A", "#121214"],
    paths: [{ d: "M12 2.5l1.3 6.2 4.6-4.4-2.7 5.8 6.3-.7-5.6 3 5.6 3-6.3-.7 2.7 5.8-4.6-4.4L12 21.5l-1.3-6.2-4.6 4.4 2.7-5.8-6.3.7 5.6-3-5.6-3 6.3.7-2.7-5.8 4.6 4.4z", fill: "#FFD60A" }],
  },
  {
    id: "whatsapp",
    bg: ["#4CDB6E", "#24B34B"],
    paths: [
      { d: "M12 3.6a8.3 8.3 0 0 0-7.2 12.5L3.6 20.4l4.4-1.1A8.3 8.3 0 1 0 12 3.6zm0 1.6a6.7 6.7 0 1 1-3.5 12.4l-.3-.2-2.4.6.6-2.3-.2-.3A6.7 6.7 0 0 1 12 5.2z", fill: "#FFFFFF" },
      { d: "M9.4 8.2c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.6 1 1.4 1.8 2.5 2.3.2.1.4.1.5-.1l.6-.7c.1-.2.3-.2.5-.1l1.7.8c.2.1.3.2.3.4 0 .5-.2 1.1-.6 1.4-.5.4-1.1.5-1.7.4-2.5-.6-4.6-2.6-5.4-5-.2-.7 0-1.6.5-2.1.1-.2.3-.4.6-.4z", fill: "#FFFFFF" },
    ],
  },
  {
    id: "settings",
    bg: ["#8E9097", "#5F6168"],
    paths: [{ d: "M10.6 3h2.8l.4 2.3 1.6.7 1.9-1.4 2 2-1.4 1.9.7 1.6 2.3.4v2.8l-2.3.4-.7 1.6 1.4 1.9-2 2-1.9-1.4-1.6.7-.4 2.3h-2.8l-.4-2.3-1.6-.7-1.9 1.4-2-2 1.4-1.9-.7-1.6L3 13.4v-2.8l2.3-.4.7-1.6-1.4-1.9 2-2 1.9 1.4 1.6-.7zM12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z", fill: "#FFFFFF", evenOdd: true }],
  },
  {
    id: "phone",
    bg: ["#4CDB6E", "#22B04A"],
    paths: [{ d: "M7.4 3.8c.5 0 .9.3 1.1.7l1.2 2.8c.2.5.1 1-.3 1.3L8.1 9.8a10.4 10.4 0 0 0 4.9 4.9l1.2-1.3c.3-.4.9-.5 1.3-.3l2.8 1.2c.5.2.8.7.7 1.2l-.3 2.4c-.1.6-.6 1-1.2 1C10.4 18.6 5 13.2 4.9 6.1c0-.6.4-1.1 1-1.2z", fill: "#FFFFFF" }],
  },
  {
    id: "contacts",
    bg: ["#FF9F43", "#F07B1A"],
    paths: [
      { d: "M12 5.2a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8z", fill: "#FFFFFF" },
      { d: "M5.6 18.6c.6-3.1 3.2-5 6.4-5s5.8 1.9 6.4 5c.1.4-.2.7-.6.7H6.2c-.4 0-.7-.3-.6-.7z", fill: "#FFFFFF" },
    ],
  },
];

export const APP_LABELS_EN: Record<AppId, string> = {
  telegram: "Telegram", maps: "Maps", gallery: "Gallery", youtube: "YouTube", music: "Music",
  whatsapp: "WhatsApp", settings: "Settings", phone: "Phone", contacts: "Contacts",
};
