import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poncho",
  description: "Control de obras, destajos, nomina, materiales y evidencias.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
