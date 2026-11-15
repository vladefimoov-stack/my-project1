"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { fmt } from "@/i18n/dictionaries";
import { useCart, clampQty } from "@/components/layout/CartProvider";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatPrice, product } from "@/config/product";
import { COUNTRIES, orderSchema, type OrderResponse } from "@/lib/order-schema";

type Field = "name" | "email" | "country" | "phone" | "quantity" | "consent";
type Status = "idle" | "submitting" | "success" | "error";

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function CheckoutDialog() {
  const { dict, locale } = useI18n();
  const c = dict.checkout;
  const { checkoutOpen, closeCheckout, quantity, setQuantity, colour } = useCart();

  const [form, setForm] = useState({ name: "", email: "", country: "", phone: "", consent: false, website: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [serverFields, setServerFields] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [reference, setReference] = useState("");
  const startedAt = useRef(Date.now());
  const idemKey = useRef<string>("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  // pre-fill country from the language (visitor can change it)
  useEffect(() => {
    if (checkoutOpen && !form.country) {
      setForm((f) => ({ ...f, country: locale === "lt" ? "LT" : locale === "de" ? "DE" : "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutOpen]);

  useEffect(() => {
    if (!checkoutOpen) return;
    lastFocus.current = document.activeElement as HTMLElement;
    startedAt.current = Date.now();
    if (!idemKey.current) idemKey.current = newKey();
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstRef.current?.focus(), 80);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
      lastFocus.current?.focus?.();
    };
  }, [checkoutOpen]);

  const countryNames = useMemo(() => {
    let dn: Intl.DisplayNames | null = null;
    try {
      dn = new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      /* old browser */
    }
    return COUNTRIES.map((code) => ({ code, name: dn?.of(code) ?? code })).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);

  const payload = {
    ...form,
    phone: form.phone,
    quantity,
    colour,
    locale,
    startedAt: startedAt.current,
    idempotencyKey: idemKey.current || "pending-key-000000",
  };
  const parsed = orderSchema.safeParse(payload);
  const invalid = new Set<string>(parsed.success ? [] : parsed.error.issues.map((i) => String(i.path[0])));
  serverFields.forEach((f) => invalid.add(f));
  const show = (f: Field) => touched[f] && invalid.has(f);

  const errText: Record<Field, string> = {
    name: c.errors.name,
    email: c.errors.email,
    country: c.errors.country,
    phone: c.errors.phone,
    quantity: fmt(c.errors.quantity, { max: product.maxQuantity }),
    consent: c.errors.consent,
  };

  const close = () => {
    if (status === "submitting") return;
    if (status === "success") {
      window.dispatchEvent(new Event("kl:clear-bag"));
      setForm({ name: "", email: "", country: "", phone: "", consent: false, website: "" });
      setTouched({});
      setStatus("idle");
      idemKey.current = "";
    }
    if (status === "error") setStatus("idle");
    closeCheckout();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
    if (e.key === "Tab" && dialogRef.current) {
      const els = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([tabindex="-1"]), select');
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setTouched({ name: true, email: true, country: true, phone: true, quantity: true, consent: true });
    setServerFields([]);
    if (!parsed.success) {
      const first = parsed.error.issues[0]?.path[0];
      if (first) dialogRef.current?.querySelector<HTMLElement>(`[name="${String(first)}"]`)?.focus();
      return;
    }
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as OrderResponse | null;
      if (res.ok && data?.ok) {
        setReference(data.reference);
        setStatus("success");
        return;
      }
      setStatus("error");
      if (data && !data.ok) {
        if (data.error === "rate") setErrorMsg(c.errors.rate);
        else if (data.error === "invalid") {
          setServerFields(data.fields ?? []);
          setErrorMsg(c.errors.invalid);
        } else setErrorMsg(c.errors.server);
      } else setErrorMsg(c.errors.server);
    } catch {
      setStatus("error");
      setErrorMsg(c.errors.network);
    }
  };

  const total = product.price * quantity;
  const consentParts = c.consent.split("{privacy}");
  const field = (f: Field) => (show(f) ? "border-red-500 focus:border-red-600" : "");

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            onKeyDown={onKeyDown}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92dvh] w-full max-w-[880px] overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
          >
            <button
              type="button"
              onClick={close}
              aria-label={dict.common.close}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-mist hover:bg-line"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            {status === "success" ? (
              <div className="flex flex-col items-center px-6 py-16 text-center sm:px-16" role="status" aria-live="polite">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <h2 id="checkout-title" className="mt-6 text-[28px] font-semibold tracking-tight">
                  {c.success.title}
                </h2>
                <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink/70">{c.success.text}</p>
                <p className="mt-6 rounded-full bg-mist px-4 py-2 font-mono text-[13px]">
                  {c.success.reference}: <strong>{reference}</strong>
                </p>
                <button type="button" onClick={close} className="btn-primary mt-8 px-10">
                  {c.success.done}
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-[1fr_300px]">
                <form onSubmit={submit} noValidate className="px-6 pb-8 pt-8 sm:px-10">
                  <h2 id="checkout-title" className="pr-12 text-[26px] font-semibold tracking-tight">
                    {c.title}
                  </h2>
                  <p className="mt-2 text-[14px] text-stone">{c.subtitle}</p>

                  <div className="mt-6 grid gap-4">
                    <div>
                      <label htmlFor="co-name" className="mb-1.5 block text-[13px] font-medium">
                        {c.name}
                      </label>
                      <input
                        ref={firstRef}
                        id="co-name"
                        name="name"
                        autoComplete="name"
                        value={form.name}
                        maxLength={100}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                        aria-invalid={show("name")}
                        aria-describedby={show("name") ? "co-name-err" : undefined}
                        className={`field ${field("name")}`}
                      />
                      {show("name") && <p id="co-name-err" className="mt-1 text-[12px] text-red-600">{errText.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="co-email" className="mb-1.5 block text-[13px] font-medium">
                        {c.email}
                      </label>
                      <input
                        id="co-email"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={form.email}
                        maxLength={200}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                        aria-invalid={show("email")}
                        aria-describedby={show("email") ? "co-email-err" : undefined}
                        className={`field ${field("email")}`}
                      />
                      {show("email") && <p id="co-email-err" className="mt-1 text-[12px] text-red-600">{errText.email}</p>}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="co-country" className="mb-1.5 block text-[13px] font-medium">
                          {c.country}
                        </label>
                        <select
                          id="co-country"
                          name="country"
                          autoComplete="country"
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          onBlur={() => setTouched((t) => ({ ...t, country: true }))}
                          aria-invalid={show("country")}
                          aria-describedby={show("country") ? "co-country-err" : undefined}
                          className={`field appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")] bg-[right_1rem_center] bg-no-repeat pr-10 ${field("country")}`}
                        >
                          <option value="">{c.selectCountry}</option>
                          {countryNames.map((x) => (
                            <option key={x.code} value={x.code}>
                              {x.name}
                            </option>
                          ))}
                          <option value="OTHER">{c.otherCountry}</option>
                        </select>
                        {show("country") && <p id="co-country-err" className="mt-1 text-[12px] text-red-600">{errText.country}</p>}
                      </div>
                      <div>
                        <label htmlFor="co-phone" className="mb-1.5 block text-[13px] font-medium">
                          {c.phone} <span className="font-normal text-stone">({c.optional})</span>
                        </label>
                        <input
                          id="co-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={form.phone}
                          maxLength={30}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                          aria-invalid={show("phone")}
                          aria-describedby={show("phone") ? "co-phone-err" : undefined}
                          className={`field ${field("phone")}`}
                        />
                        {show("phone") && <p id="co-phone-err" className="mt-1 text-[12px] text-red-600">{errText.phone}</p>}
                      </div>
                    </div>
                    <div>
                      <span className="mb-1.5 block text-[13px] font-medium">{c.quantity}</span>
                      <QuantityStepper
                        value={quantity}
                        onChange={(v) => setQuantity(clampQty(v))}
                        labels={{ decrease: dict.purchase.decrease, increase: dict.purchase.increase, quantity: c.quantity }}
                      />
                    </div>

                    {/* honeypot — hidden from people, bots tend to fill it */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                      <label htmlFor="co-website">Website</label>
                      <input
                        id="co-website"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ink/75">
                        <input
                          type="checkbox"
                          name="consent"
                          checked={form.consent}
                          onChange={(e) => {
                            setForm({ ...form, consent: e.target.checked });
                            setTouched((t) => ({ ...t, consent: true }));
                          }}
                          aria-invalid={show("consent")}
                          className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
                        />
                        <span>
                          {consentParts[0]}
                          <Link href={`/${locale}/privacy`} target="_blank" className="link-underline text-ink">
                            {c.privacyLink}
                          </Link>
                          {consentParts[1]}
                        </span>
                      </label>
                      {show("consent") && <p className="mt-1 pl-8 text-[12px] text-red-600">{errText.consent}</p>}
                    </div>
                  </div>

                  {status === "error" && (
                    <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                      {errorMsg}
                    </p>
                  )}

                  <button type="submit" className="btn-primary mt-6 w-full" disabled={status === "submitting"} aria-busy={status === "submitting"}>
                    {status === "submitting" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                        {c.submitting}
                      </>
                    ) : status === "error" ? (
                      c.retry
                    ) : (
                      c.submit
                    )}
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-stone">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                    </svg>
                    {c.noPayment}
                  </p>
                </form>

                <aside className="border-t border-line bg-mist px-6 py-8 md:rounded-r-[28px] md:border-l md:border-t-0">
                  <h3 className="text-[13px] font-medium uppercase tracking-[0.14em] text-stone">{c.summary}</h3>
                  <div className="mt-5 flex items-center gap-4">
                    <div className="relative h-24 w-16 shrink-0 rounded-xl bg-white">
                      <Image src="/images/renders/front.webp" alt="" fill sizes="64px" className="object-contain p-1.5" />
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-[13px] text-stone">{(dict.purchase.colours as Record<string, string>)[colour] ?? colour}</p>
                    </div>
                  </div>
                  <dl className="mt-6 space-y-2 text-[14px]">
                    <div className="flex justify-between">
                      <dt className="text-stone">{c.unitPrice}</dt>
                      <dd>{formatPrice(product.price, locale)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-stone">{c.quantity}</dt>
                      <dd>× {quantity}</dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-3 text-[16px] font-semibold">
                      <dt>{c.total}</dt>
                      <dd>{formatPrice(total, locale)}</dd>
                    </div>
                  </dl>
                  <p className="mt-6 text-[12px] leading-relaxed text-stone">{dict.purchase.testNotice}</p>
                </aside>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
