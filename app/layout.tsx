import type { Metadata, Viewport } from "next";
import { Provider } from "@/components/Provider";
import { Shell } from "@/components/Shell";
import "./globals.css";
export const metadata: Metadata = {
  title: "รัฐธรรมนูญ • อ่านให้เข้าใจ",
  description:
    "เรียนรัฐธรรมนูญ พ.ศ. 2560 อ่าน ฟัง ฝึกตอบ และทบทวน สำหรับติ๊กกี้และคนเตรียมสอบ",
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
    <html lang="th">
      <body>
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
