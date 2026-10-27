import type { Metadata } from "next";
import { Geist_Mono, Inter, Inter_Tight } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { I18nProvider } from "@/lib/i18n/provider";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-inter" });
const interTight = Inter_Tight({ subsets: ["latin", "latin-ext", "cyrillic"], weight: ["600", "700", "800"], variable: "--font-inter-tight" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: {
      default: t("app.title"),
      template: `%s | ${t("app.title")}`,
    },
    description: t("app.description"),
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, messages } = await getI18n();
  return (
    <html lang={locale} className={`${inter.variable} ${interTight.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} messages={messages}>
          <SiteHeader />
          {children}
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
