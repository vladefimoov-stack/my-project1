import "../globals.css";

export const metadata = { robots: { index: false, follow: false } };

export default function RenderLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "transparent" }}>{children}</body>
    </html>
  );
}
