import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { site } from "@/content/site";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"], display: "swap" });
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.title} — A ${site.studio} Documentary`,
    template: `%s — ${site.title}`,
  },
  description: site.description,
  applicationName: site.title,
  keywords: [
    "Nation Divided",
    "documentary",
    "StockHouse Films",
    "political polarization",
    "2024 election",
    "American voters",
    "independent documentary",
  ],
  openGraph: {
    type: "website",
    siteName: site.title,
    title: `${site.title} — ${site.tagline}`,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.title} — ${site.tagline}`,
    description: site.description,
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#08090d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${instrument.variable} ${geist.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Mark JS as available (enables reveal animations) and restore the visitor's motion preference before paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=document.documentElement;d.classList.add('js');window.__ndFirstPath=location.pathname;try{if(localStorage.getItem('nd-motion')==='reduced')d.dataset.motion='reduced'}catch(e){}try{if(sessionStorage.getItem('nd-intro')||d.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches)d.dataset.intro='skip'}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh bg-ink text-ivory">{children}</body>
    </html>
  );
}
