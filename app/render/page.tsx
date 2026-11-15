import { notFound } from "next/navigation";
import RenderStage from "@/components/product-viewer/RenderStage";

/**
 * Internal route used by `npm run renders` to produce product renders
 * (and the exported GLB) from the 3D model. Disabled in production unless
 * ENABLE_RENDER_ROUTE=true.
 */
export default async function RenderPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_RENDER_ROUTE !== "true") notFound();
  const sp = await searchParams;
  return <RenderStage view={sp.view ?? "hero"} bg={sp.bg} />;
}
