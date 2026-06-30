import type { Metadata } from "next";
import { Lora, Nunito, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import BackgroundDecor from "@/components/BackgroundDecor";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Word Box",
  description: "Личный кабинет ученика английского языка",
  appleWebApp: {
    capable: true,
    title: "Word Box",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${lora.variable} ${nunito.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <BackgroundDecor />
        <div className="relative flex flex-col flex-1" style={{ zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
