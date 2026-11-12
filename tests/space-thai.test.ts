import test from "node:test";
import assert from "node:assert/strict";
// @ts-ignore .mjs authoring script
import { spaceThaiText } from "../scripts/authoring/space-thai.mjs";

const SENT =
  "สมาชิกวุฒิสภาตั้งกระทู้ถามรัฐมนตรีในเรื่องที่อยู่ในหน้าที่ของรัฐมนตรี แต่คณะรัฐมนตรีเห็นว่าเรื่องนั้นยังไม่ควรเปิดเผย เพราะเกี่ยวกับความปลอดภัยของแผ่นดิน";

test("spacing adds spaces only: a glossary term ending mid-word must not eat characters", () => {
  const out = spaceThaiText(SENT);
  assert.equal(out.replace(/\s+/g, ""), SENT.replace(/\s+/g, ""));
  assert.ok(out.includes("รัฐมนตรี แต่") || out.includes("ของรัฐมนตรี"));
});

test("spacing never cuts เปิดเผย", () => {
  assert.ok(!spaceThaiText(SENT).includes("เปิด เผย"));
});
