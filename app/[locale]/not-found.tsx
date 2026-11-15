import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="text-[36px] font-semibold tracking-tight">Page not found</h1>
      <Link href="/" className="btn-primary">
        Home
      </Link>
    </main>
  );
}
