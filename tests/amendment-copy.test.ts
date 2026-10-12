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
