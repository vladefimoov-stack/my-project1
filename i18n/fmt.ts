/** Replace {placeholders} in a translated string. (Kept separate so client code doesn't bundle the dictionaries.) */
export function fmt(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
