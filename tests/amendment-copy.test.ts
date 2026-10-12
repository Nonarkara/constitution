import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Inspect the actual localized teaching rules; the statutory boundary differs
// between readings, so a correct corpus alone cannot protect this surface.
const source = ts.createSourceFile("CheatSheet.tsx", readFileSync(new URL(
  "../components/CheatSheet.tsx", import.meta.url,
), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const rules = new Map<string, string[]>();
function visit(node: ts.Node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === "amendmentSteps") {
    assert.ok(node.initializer && ts.isArrayLiteralExpression(node.initializer));
    for (const item of node.initializer.elements) {
      assert.ok(ts.isObjectLiteralExpression(item));
      const properties = item.properties.filter(ts.isPropertyAssignment);
      const step = properties.find(p => p.name.getText(source) === "step")?.initializer;
      const rule = properties.find(p => p.name.getText(source) === "rule")?.initializer;
      assert.ok(step && ts.isStringLiteral(step) && rule && ts.isCallExpression(rule));
      rules.set(step.text, rule.arguments.slice(1).map(value => {
        assert.ok(ts.isStringLiteral(value));
        return value.text;
      }));
    }
  }
  ts.forEachChild(node, visit);
}
visit(source);

test("all three teaching languages preserve section 256's distinct vote boundaries", () => {
  const first = rules.get("02")!, third = rules.get("05")!;
  assert.equal(first.length, 3);
  assert.equal(third.length, 3);
  for (let i = 0; i < 3; i++) {
    assert.match(first[i], /≥ 350/);
    assert.match(third[i], /≥ 351/);
    assert.doesNotMatch(third[i], /≥ 350/);
    assert.match(third[i], /700/); // numerical example has its denominator
  }
  assert.match(first[0], /ไม่น้อยกว่ากึ่งหนึ่ง/);
  assert.match(first[1], /At least half/);
  assert.match(first[2], /不少于.*半数/);
  assert.match(third[0], /มากกว่ากึ่งหนึ่ง/);
  assert.match(third[1], /More than half/);
  assert.match(third[2], /超过.*半数/);
});

const translations: string[][] = [];
function collect(node: ts.Node) {
  if (ts.isCallExpression(node) && node.expression.getText(source) === "tr") {
    const args = node.arguments.slice(1);
    if (args.length === 3 && args.every(ts.isStringLiteral)) {
      translations.push(args.map(arg => (arg as ts.StringLiteral).text));
    }
  }
  ts.forEachChild(node, collect);
}
collect(source);

test("decree summaries distinguish prospective disapproval from invalidity from inception", () => {
  const approval = translations.find(row => row[1].startsWith("The Cabinet submits the decree"))!;
  const court = translations.find(row => row[1].startsWith("Before that House approves"))!;
  assert.ok(approval && court);
  const prospective = [/วันถัดจากวันประกาศ/, /day after Gazette publication/, /次日起生效/];
  const retrospective = [/ไม่มีผลใช้บังคับมาแต่ต้น/, /ineffective from the outset/, /自始无效/];
  const reviewGrounds = [/ม\.172 วรรคหนึ่ง/, /Sec 172 paragraph 1/, /第172条第1款/];
  for (let i = 0; i < 3; i++) {
    assert.match(approval[i], prospective[i]);
    assert.match(court[i], retrospective[i]);
    assert.match(court[i], reviewGrounds[i]);
  }
});

test("section 26 safeguards are present in each learner language", () => {
  const law = translations.find(row => row[1].startsWith("Where the Constitution provides no conditions"))!;
  const reasons = translations.find(row => row[1].startsWith("In that case, reasons and necessity"))!;
  const generality = translations.find(row => row[1].startsWith("The law must apply generally"))!;
  assert.ok(law && reasons && generality);
  assert.match(law[0], /หลักนิติธรรม.*เกินสมควรแก่เหตุ.*ศักดิ์ศรีความเป็นมนุษย์/);
  assert.match(law[1], /rule of law.*disproportionate.*human dignity/);
  assert.match(law[2], /法治.*过度.*尊严/);
  assert.match(reasons[0], /เหตุผลและความจำเป็น/);
  assert.match(reasons[1], /reasons and necessity/);
  assert.match(reasons[2], /理由和必要性/);
  assert.match(generality[0], /ทั่วไป/);
  assert.match(generality[1], /generally/);
  assert.match(generality[2], /普遍适用/);
});
