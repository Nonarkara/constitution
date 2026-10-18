import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "รัฐธรรมนูญ ๒๕๖๐ อ่านให้เข้าใจ · The Thai Constitution, read to understand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

const font = (file: string) => readFile(join(process.cwd(), "design/fonts", file));

// The share card people see first in LINE and WhatsApp: paper, ink, one amber bar.
export default async function Image() {
  const [thai, thaiBold, sans, mono] = await Promise.all([
    font("ibm-plex-sans-thai-0.ttf"),
    font("ibm-plex-sans-thai-2.ttf"),
    font("jost-400.ttf"),
    font("jetbrains-mono-0.ttf"),
  ]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", color: "#24251f", padding: "72px 80px", borderTop: "24px solid #f59e0b", fontFamily: "Plex" }}>
        <div style={{ display: "flex", fontSize: 28 }}>
          <span>รัฐธรรมนูญแห่งราชอาณาจักรไทย</span>
          <span style={{ fontFamily: "Mono", marginLeft: 18 }}>2560 / 2017</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 600, lineHeight: 1.25 }}>อ่านให้เข้าใจ</div>
          <div style={{ fontSize: 40, lineHeight: 1.5 }}>เดาก่อน อ่านตัวบท ฟัง แล้วลองตอบ ทั้ง 279 มาตรา</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Sans", fontSize: 30, borderTop: "3px solid #24251f", paddingTop: 24 }}>
          <span>The Thai Constitution, read to understand</span>
          <span style={{ fontFamily: "Mono" }}>constitution.nonarkara.org</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Plex", data: thai, weight: 400 },
        { name: "Plex", data: thaiBold, weight: 600 },
        { name: "Sans", data: sans, weight: 400 },
        { name: "Mono", data: mono, weight: 400 },
      ],
    },
  );
}
