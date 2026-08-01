import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NeoTrace AI",
  description: "A private, local-first browser activity journal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

