"use client";

import { product } from "@/config/product";

export function QuantityStepper({
  value,
  onChange,
  labels,
  id,
}: {
  value: number;
  onChange: (v: number) => void;
  labels: { decrease: string; increase: string; quantity: string };
  id?: string;
}) {
  return (
    <div className="inline-flex h-12 items-center rounded-full border border-line" role="group" aria-label={labels.quantity}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={labels.decrease}
        className="flex h-12 w-12 items-center justify-center rounded-full text-[20px] transition-colors hover:bg-mist disabled:opacity-30"
      >
        −
      </button>
      <output id={id} aria-live="polite" className="w-8 text-center text-[16px] font-medium tabular-nums">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= product.maxQuantity}
        aria-label={labels.increase}
        className="flex h-12 w-12 items-center justify-center rounded-full text-[20px] transition-colors hover:bg-mist disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
