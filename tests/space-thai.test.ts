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

test("a literal mask character cannot consume a quotation or section reference", () => {
  const original = `\uE000 ${SENT} “ข้อความเดิม  คงไว้” ตามมาตรา 30`;
  const spaced = spaceThaiText(original);
  assert.equal(spaced.replace(/\s+/g, ""), original.replace(/\s+/g, ""));
  assert.ok(spaced.includes("“ข้อความเดิม  คงไว้”"));
  assert.ok(spaced.includes("มาตรา 30"));
  assert.equal(spaceThaiText(spaced), spaced);
});
