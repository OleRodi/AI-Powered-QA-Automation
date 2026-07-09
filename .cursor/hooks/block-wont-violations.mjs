#!/usr/bin/env node
/**
 * afterFileEdit hook — block mechanically-checkable constitution WON'T violations
 * under tests/** and pages/**.
 *
 * Matcher in hooks.json is tool type "Write" (not a path). Path filtering is here
 * via file_path from stdin JSON.
 *
 * Exit 2 = BLOCK; exit 0 = allow.
 *
 * Input (stdin JSON):
 *   { "file_path": "<abs path>", "edits": [{ "old_string": "...", "new_string": "..." }] }
 */

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    setTimeout(() => resolve(data), 2000).unref?.();
  });
}

function normalizePath(filePath) {
  return String(filePath ?? "").replace(/\\/g, "/");
}

function isInScope(filePath) {
  const norm = normalizePath(filePath);
  return /(^|\/)(tests|pages)\//.test(norm);
}

function stripLineComment(line) {
  const idx = line.indexOf("//");
  if (idx === -1) return line;
  // Keep URLs like https:// and strings with // — crude: only strip if // is outside quotes.
  let inSingle = false;
  let inDouble = false;
  let inTick = false;
  for (let i = 0; i < line.length - 1; i++) {
    const c = line[i];
    const prev = line[i - 1];
    if (c === "'" && !inDouble && !inTick && prev !== "\\") inSingle = !inSingle;
    else if (c === '"' && !inSingle && !inTick && prev !== "\\") inDouble = !inDouble;
    else if (c === "`" && !inSingle && !inDouble && prev !== "\\") inTick = !inTick;
    else if (c === "/" && line[i + 1] === "/" && !inSingle && !inDouble && !inTick) {
      return line.slice(0, i);
    }
  }
  return line;
}

/** Code-ish text with line comments removed (keeps strings). */
function codeOnly(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map(stripLineComment)
    .join("\n");
}

function countExpect(text) {
  let active = 0;
  let commented = 0;
  const lines = String(text ?? "").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trimStart();
    let idx = line.indexOf("expect(");
    while (idx !== -1) {
      const before = line.slice(0, idx);
      const lineComment = before.indexOf("//");
      const isLineCommented = lineComment !== -1 && lineComment < idx;
      const isBlockCommented =
        trimmed.startsWith("*") || trimmed.startsWith("/*") || before.includes("/*");
      if (isLineCommented || isBlockCommented) commented++;
      else active++;
      idx = line.indexOf("expect(", idx + 1);
    }
  }
  return { active, commented };
}

function hasWaitForTimeout(text) {
  return /\.waitForTimeout\s*\(/.test(text);
}

function hasXPathLocator(text) {
  // page.locator('//...') | locator("xpath=...") | locator(`//div`)
  return /\.locator\s*\(\s*(['"`])\s*(?:xpath\s*=|\/)/i.test(text);
}

function hasAnyType(text) {
  return (
    /:\s*any\b/.test(text) ||
    /\bas\s+any\b/.test(text) ||
    /<\s*any\s*>/.test(text) ||
    /\b(?:Promise|Array|ReadonlyArray|Set|Map|Record)\s*<[^>]*\bany\b/.test(text)
  );
}

function hasHardcodedCredential(text) {
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (/process\.env/.test(line)) continue;
    if (
      /(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|bearer)\s*[:=]\s*['"][^'"]{2,}['"]/i.test(
        line
      )
    ) {
      return true;
    }
    if (/Bearer\s+[A-Za-z0-9\-._~+/]{8,}=*/.test(line)) return true;
    // Literal Didaxis login email (conventions bad example)
    if (/\.fill\(\s*['"][^'"]*@didaxis\.[^'"]+['"]\s*\)/i.test(line)) return true;
    // Password field filled with a string literal
    if (/Password[^)]*\)\.fill\(\s*['"][^'"]+['"]/i.test(line)) return true;
  }
  return false;
}

function hasDescribeTag(text) {
  // test.describe('name', { tag: '@x' }, () => {})
  // test.describe({ tag: '@x' }, () => {})  — uncommon but block
  const re = /test\.describe(?:\.\w+)?\s*\(/g;
  let m;
  while ((m = re.exec(text))) {
    const slice = text.slice(m.index, m.index + 400);
    // Options object with tag before the callback — not test() tags
    if (/test\.describe(?:\.\w+)?\s*\(\s*(?:[`'"][^`'"]*[`'"]\s*,\s*)?\{[^}]*\btag\s*:/.test(slice)) {
      return true;
    }
  }
  return false;
}

/** Patterns that must not appear newly in an edit's new_string. */
const INTRODUCED_CHECKS = [
  {
    id: "waitForTimeout",
    test: hasWaitForTimeout,
    message: "page.waitForTimeout / .waitForTimeout() — use web-first assertions instead",
  },
  {
    id: "xpath",
    test: hasXPathLocator,
    message: "XPath locator (.locator('//...') or xpath=) — use getByRole / getByLabel",
  },
  {
    id: "any",
    test: hasAnyType,
    message: "`any` type — type the fixture, POM, and API shapes",
  },
  {
    id: "credential",
    test: hasHardcodedCredential,
    message: "hardcoded credential — use process.env / CI secrets",
  },
  {
    id: "describe-tag",
    test: hasDescribeTag,
    message: "tag on test.describe() — tag individual test(...) only",
  },
];

function allow(reason) {
  console.error(`[block-wont-violations] allow: ${reason}`);
  process.exit(0);
}

function block(reason) {
  console.error(
    `[block-wont-violations] BLOCKED: ${reason}\n` +
      `Constitution WON'T — fix the violation (do not weaken tests or hardcode secrets).`
  );
  process.exit(2);
}

function introduced(oldText, newText, testFn) {
  const oldCode = codeOnly(oldText);
  const newCode = codeOnly(newText);
  return testFn(newCode) && !testFn(oldCode);
}

async function main() {
  const raw = await readStdin();
  let input;
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    block("could not parse hook input JSON");
    return;
  }

  const filePath = input.file_path ?? input.filePath;
  if (!isInScope(filePath)) {
    allow(`out of scope (${filePath ?? "unknown"}) — only tests/** and pages/**`);
  }

  const edits = Array.isArray(input.edits) ? input.edits : [];
  if (edits.length === 0) allow("no edits reported");

  // --- Introduced WON'T patterns in new_string ---
  for (const edit of edits) {
    const oldStr = edit.old_string ?? edit.oldString ?? "";
    const newStr = edit.new_string ?? edit.newString ?? "";
    for (const check of INTRODUCED_CHECKS) {
      if (introduced(oldStr, newStr, check.test)) {
        block(`${check.message} in ${filePath}`);
      }
    }
  }

  // --- Removed / weakened expect( (tests only; POMs should not assert) ---
  const underTests = /(^|\/)tests\//.test(normalizePath(filePath));
  if (underTests) {
    let oldActive = 0;
    let newActive = 0;
    let oldCommented = 0;
    let newCommented = 0;
    for (const edit of edits) {
      const o = countExpect(edit.old_string ?? edit.oldString);
      const n = countExpect(edit.new_string ?? edit.newString);
      oldActive += o.active;
      newActive += n.active;
      oldCommented += o.commented;
      newCommented += n.commented;
    }

    if (newActive < oldActive) {
      block(
        `active expect( count dropped ${oldActive} -> ${newActive} in ${filePath} ` +
          `(assertion deleted or commented out)`
      );
    }
    if (newCommented > oldCommented) {
      block(
        `expect( commented out in ${filePath} ` +
          `(commented expect( ${oldCommented} -> ${newCommented})`
      );
    }
  }

  allow(`clean (${normalizePath(filePath)})`);
}

main();
