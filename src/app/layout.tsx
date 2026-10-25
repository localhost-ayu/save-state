import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, Instrument_Serif, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { ThemeStyle } from "@/features/appearance/components/theme-style";
import { DEFAULT_THEME } from "@/features/appearance/theme";
import { publicEnv } from "@/lib/env";
import "./globals.css";

const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--font-serif", subsets: ["latin"], weight: "400" });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: "Save State", template: "%s · Save State" },
  description: "Diário pessoal de jogos: biblioteca, progresso, troféus e memórias.",
  appleWebApp: { capable: true, title: "Save State", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: DEFAULT_THEME.background.color,
};

const fontVariables = [grotesk, mono, bricolage, serif, inter].map((font) => font.variable).join(" ");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <ThemeStyle theme={DEFAULT_THEME} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
