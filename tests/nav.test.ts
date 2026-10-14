import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { defaultProgress, type Question } from "../lib/learning.ts";
import { continueTarget, nextGuideHref, weakSection } from "../lib/continue.ts";
import { APP_ROUTES, DOORS, backFor, crumbsFor, doorFor, nextFor, type Door } from "../lib/nav.ts";

function pageRoutes(dir = join(process.cwd(), "app"), prefix = ""): string[] {
  const found: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      const segment = name.startsWith("(") ? "" : name;
      found.push(...pageRoutes(full, segment ? `${prefix}/${segment}` : prefix));
    } else if (name === "page.tsx") {
      found.push(prefix === "" ? "/" : `${prefix}/`);
    }
  }
  return found;
}

const expected: Record<string, Door | null> = {
  "/": null,
  "/learn/": null,
  "/notes/": null,
  "/settings/": null,
};

for (const route of APP_ROUTES) {
  if (route.startsWith("/bible/") || ["/read/", "/section/", "/notebook/", "/cram/", "/glossary/", "/topics/"].includes(route)) {
    expected[route] = "learn";
  }
}
for (const route of ["/practice/", "/practice/pokklong/", "/review/", "/exam/", "/drills/", "/flashcards/", "/games/", "/cheatsheet/"]) {
  expected[route] = "practise";
}
for (const route of ["/library/", "/rights/", "/polls/", "/civic/", "/amend/", "/news/", "/memory/", "/sources/", "/research/"]) {
  expected[route] = "explore";
}

test("every page route maps to one door, and the active door matches", () => {
  const pages = pageRoutes().filter((route) => route !== "/bible/[id]/");
  const guidePages = APP_ROUTES.filter((route) => route.startsWith("/bible/") && route !== "/bible/");
  const routes = [...new Set([...pages, ...guidePages])].sort();
  assert.deepEqual(routes, [...APP_ROUTES].sort());
  for (const route of routes) {
    assert.equal(doorFor(route), expected[route], route);
  }
  assert.deepEqual(DOORS.map((door) => door.id), ["learn", "practise", "explore"]);
  assert.equal(doorFor("/bible/rights/"), "learn");
  assert.equal(doorFor("/practice/"), "practise");
  assert.equal(doorFor("/practice/pokklong/"), "practise");
  assert.equal(doorFor("/news/"), "explore");
  assert.equal(doorFor("/"), null);
});

test("every page except home ends with one Next link and a Back link", () => {
  for (const route of APP_ROUTES) {
    const next = nextFor(route, route === "/section/" ? { section: 36 } : {});
    const back = backFor(route, route === "/section/" ? { section: 36 } : {});
    if (route === "/") {
      assert.equal(next, null);
      assert.equal(back, null);
      continue;
    }
    assert.ok(next, route);
    assert.match(next!.label.en, /^Next: /);
    assert.match(next!.label.th, /^ต่อไป: /);
    assert.match(next!.label.zh, /^下一步：/);
    assert.ok(back, route);
    assert.match(back!.label.en, /^← Back to /);
  }
  const section = nextFor("/section/", { section: 36 });
  assert.equal(section?.href, "/practice/?check=3");
  assert.equal(nextFor("/exam/")?.href, "/practice/?session=mixed");
  assert.equal(nextFor("/news/")?.href, "/rights/");
  assert.equal(nextFor("/review/")?.href, "/bible/");
  assert.match(backFor("/bible/courts/")!.label.en, /Back to Learn/);
  assert.match(backFor("/section/", { section: 36 })!.label.en, /Back to Ch 3/);
  assert.equal(crumbsFor("/bible/history/")[1].label.en, "History");
  assert.equal(crumbsFor("/bible/cabinet/")[1].label.en, "Cabinet");
  assert.equal(crumbsFor("/bible/transitory/")[1].label.en, "Transitory provisions");
  const check = crumbsFor("/practice/", { check: 3 });
  assert.deepEqual(check.map((crumb) => crumb.label.en), ["Learn", "Ch 3", "Short check"]);
  assert.equal(backFor("/practice/", { check: 3 })?.href, "/read/?c=3");
  assert.match(crumbsFor("/practice/", { drill: 36 })[1].label.en, /Drill s\.36/);
  assert.equal(backFor("/practice/", { drill: 36 })?.href, "/section/?n=36");
});

test("home continue prefers due review, then a weak-section drill, then the guide", () => {
  const questions = [
    { id: "a", sections: [36] },
    { id: "b", sections: [36] },
    { id: "c", sections: [158] },
  ] as Pick<Question, "id" | "sections">[];
  const fresh = defaultProgress();
  assert.equal(continueTarget({ due: 0, weak: null, lastSection: null }).kind, "guide");
  assert.equal(continueTarget({ due: 0, weak: null, lastSection: null }).href, "/bible/history/");
  assert.equal(weakSection(questions, fresh), null);
  const missed = defaultProgress();
  missed.questions.a = { correct: false, level: 0, due: 0 };
  missed.questions.b = { correct: false, level: 0, due: 0 };
  assert.equal(weakSection(questions, missed), 36);
  assert.equal(continueTarget({ due: 2, weak: 36, lastSection: 36 }).href, "/practice/?session=mixed");
  assert.equal(continueTarget({ due: 0, weak: 36, lastSection: 10 }).href, "/practice/?session=drill&section=36");
  assert.equal(nextGuideHref(36), "/bible/duties-state-policy/");
  assert.equal(continueTarget({ due: 0, weak: null, lastSection: 36 }).href, "/bible/duties-state-policy/");
});
