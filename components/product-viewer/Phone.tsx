"use client";

import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { product } from "@/config/product";
import { PhoneModel, type PhoneModelProps } from "./PhoneModel";

function GLBPhone({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={product.model.glbScale} />;
}

/**
 * Renders the production GLB when `product.model.glbUrl` is set,
 * otherwise the provisional procedural model.
 */
export function Phone(props: PhoneModelProps) {
  const url = product.model.glbUrl;
  if (url) {
    return (
      <Suspense fallback={<PhoneModel {...props} />}>
        <GLBPhone url={url} />
      </Suspense>
    );
  }
  return <PhoneModel {...props} />;
}
