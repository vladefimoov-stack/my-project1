import type { AppId } from "./apps";

/** Order of apps in the list launcher (like the real device's home screen). */
export const LAUNCHER_ORDER: AppId[] = ["whatsapp", "telegram", "phone", "contacts", "maps", "youtube", "music", "gallery", "settings"];
/** Sparse A–Z index on the right edge, as on the real device. */
export const AZ = "★ACDFGIJMPSTUW•";

// fixed tables: some runtimes ship without full Lithuanian locale data
const LT_WD = ["Sk", "Pr", "An", "Tr", "Kt", "Pn", "Št"];
const LT_MO = ["saus.", "vas.", "kov.", "bal.", "geg.", "birž.", "liep.", "rugp.", "rugs.", "spal.", "lapkr.", "gruod."];

/** Date line shown at the top of the list launcher: "Mon, Nov 9" / "Pr, lapkr. 9" / "Mo., 9. Nov.". */
export function launcherDate(locale: string, d = new Date()) {
  try {
    if (locale === "lt") return `${LT_WD[d.getDay()]}, ${LT_MO[d.getMonth()]} ${d.getDate()}`;
    const tag = locale === "de" ? "de-DE" : "en-US";
    return new Intl.DateTimeFormat(tag, { weekday: "short", month: "short", day: "numeric" }).format(d);
  } catch {
    return d.toDateString().slice(0, 10);
  }
}
