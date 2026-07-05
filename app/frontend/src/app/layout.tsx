import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import type { PropsWithChildren } from "react";
import { Providers } from "@/app/providers";
import { Footer } from "@/shared/components/layout/footer";
import {
  SEO_DESCRIPTION,
  SEO_URL,
  SITE_NAME,
} from "@/shared/constants/seo.constant";

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  style: ["normal"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SEO_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SEO_DESCRIPTION,
  robots: { index: false, follow: false },
  openGraph: {
    title: SITE_NAME,
    description: SEO_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "ru_RU",
    url: SEO_URL,
    images: [
      { url: "/seo/preview.webp", width: 1200, height: 630, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" className={`h-full antialiased`}>
      <body className={`${montserrat.variable} min-h-full flex flex-col`}>
        <Providers>
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
