/** Fictional demo data — no real people, numbers or media. */
export const CONTACTS = [
  { id: "anna", name: "Anna", phone: "+00 123 456 7801", hue: 200 },
  { id: "ben", name: "Ben Keller", phone: "+00 123 456 7802", hue: 20 },
  { id: "dovile", name: "Dovilė", phone: "+00 123 456 7803", hue: 280 },
  { id: "emma", name: "Emma", phone: "+00 123 456 7804", hue: 330 },
  { id: "jonas", name: "Jonas", phone: "+00 123 456 7805", hue: 140 },
  { id: "lena", name: "Lena Vogel", phone: "+00 123 456 7806", hue: 45 },
  { id: "marius", name: "Marius", phone: "+00 123 456 7807", hue: 175 },
  { id: "sofia", name: "Sofia", phone: "+00 123 456 7808", hue: 0 },
  { id: "tomas", name: "Tomas", phone: "+00 123 456 7809", hue: 230 },
];

/** Procedural "photos" (pure CSS) for gallery + video thumbnails */
export const SCENES = [
  "linear-gradient(180deg,#7EC8F5 0%,#BFE3F7 45%,#3D6B4F 46%,#2C4D39 100%)",
  "radial-gradient(40% 30% at 70% 35%,#FFE7A3,transparent 70%),linear-gradient(180deg,#FF9A62 0%,#F05A6E 45%,#3A2350 100%)",
  "linear-gradient(180deg,#9AD0EC 0%,#E6F4FA 50%,#1F7DB5 51%,#0E4A75 100%)",
  "radial-gradient(30% 22% at 30% 30%,#FFF,transparent 70%),linear-gradient(180deg,#1C2541 0%,#3A506B 60%,#0B132B 100%)",
  "linear-gradient(135deg,#F6D365 0%,#FDA085 100%)",
  "linear-gradient(180deg,#D7E9D2 0%,#A6CBA0 50%,#557A55 100%)",
  "radial-gradient(60% 50% at 50% 60%,#FFC371,transparent 70%),linear-gradient(180deg,#141E30,#243B55)",
  "linear-gradient(160deg,#E0E0E0 0%,#BDBDBD 40%,#7A7A7A 100%)",
  "linear-gradient(180deg,#89F7FE 0%,#66A6FF 100%)",
];

/** mountain silhouette overlay used on some scenes */
export const MOUNTAINS =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60' preserveAspectRatio='none'%3E%3Cpath d='M0 60 L0 38 L18 22 L30 34 L46 14 L64 36 L76 26 L100 44 L100 60Z' fill='%23000' fill-opacity='.28'/%3E%3C/svg%3E\") bottom/100% 60% no-repeat";
