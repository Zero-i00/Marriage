import type { Metadata } from "next";
import "./globals.css";
import type { PropsWithChildren } from "react";
import { Footer } from "@/shared/components/layout/footer";
import {Montserrat} from "next/dist/compiled/@next/font/dist/google";
import {SEO_DESCRIPTION, SEO_KEYWORDS, SEO_URL, SITE_NAME} from "@/shared/constants/seo.constant";

const montserrat = Montserrat({
    weight: '300',
    variable: "--font-montserrat",
    subsets: ['latin', 'cyrillic'],
    style: ['normal']
})


export const metadata: Metadata = {
    metadataBase: new URL(SEO_URL),
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`
    },
    description: SEO_DESCRIPTION,
    keywords: SEO_KEYWORDS,
    openGraph: {
        title: SITE_NAME,
        description: SEO_DESCRIPTION,
        siteName: SITE_NAME,
        type: 'website',
        locale: 'ru_RU',
        url: SEO_URL,
        images: [{ url: '/seo/preview.wepb', width: 400, height: 400, alt: SITE_NAME }],
    },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" className={`h-full antialiased`}>
      <body className={`${montserrat.variable} min-h-full flex flex-col`}>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
