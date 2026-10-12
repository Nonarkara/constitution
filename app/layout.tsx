import type { Metadata, Viewport } from "next";
import { Provider } from "@/components/Provider";
import { Shell } from "@/components/Shell";
import { themeScript } from "@/lib/theme";
import "./globals.css";
const description =
  "อ่านรัฐธรรมนูญ พ.ศ. 2560 ครบ 279 มาตรา ไฮไลต์ จดโน้ต ฟัง ฝึกตอบ และทบทวน เป็นภาษาไทย อังกฤษ และจีน · Read, highlight, listen to and practise the Thai Constitution in Thai, English and Chinese.";
export const metadata: Metadata = {
  metadataBase: new URL("https://constitution.nonarkara.org"),
  title: { default: "รัฐธรรมนูญ • อ่านให้เข้าใจ", template: "%s · รัฐธรรมนูญ" },
  description,
  openGraph: {
    type: "website",
    siteName: "รัฐธรรมนูญ • อ่านให้เข้าใจ",
    locale: "th_TH",
    title: "รัฐธรรมนูญ • อ่านให้เข้าใจ",
    description,
  },
  twitter: { card: "summary_large_image" },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "รัฐธรรมนูญ",
    statusBarStyle: "default",
  },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
