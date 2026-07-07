#!/usr/bin/env node
// afterFileEdit hook: block edits that weaken a test under tests/**.
// An edit is "weakening" if, within the changed region, it either:
//   1. reduces the number of active `expect(` calls (an assertion was deleted), or
//   2. comments out an `expect(` that used to be active.
// Blocks by exiting with code 2; allows by exiting 0. Only inspects files under tests/.
//
// Input (stdin JSON, Cursor afterFileEdit):
//   { "file_path": "<abs path>", "edits": [{ "old_string": "...", "new_string": "..." }], ... }

function readStdin() {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    // If nothing is piped, don't hang forever.
    setTimeout(() => resolve(data), 2000).unref?.();
  });
}

// Count `expect(` occurrences, split into active vs commented-out.
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

function isUnderTests(filePath) {
  const norm = String(filePath ?? "").replace(/\\/g, "/");
  return /(^|\/)tests\//.test(norm);
}

function allow(reason) {
  if (reason) console.error(`[block-weakened-tests] allow: ${reason}`);
  process.exit(0);
}

function block(reason) {
  const msg =
    `[block-weakened-tests] BLOCKED: ${reason}\n` +
    `Refusing to weaken a test. Do not delete or comment out an assertion to make a test pass — ` +
    `fix the app or raise the conflict instead.`;
  console.error(msg);
  // exit code 2 = block the action (equivalent to permission: "deny")
  process.exit(2);
}

async function main() {
  const raw = await readStdin();
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    // failClosed is set in hooks.json, so invalid JSON already blocks; be explicit anyway.
    block("could not parse hook input JSON");
    return;
  }

  const filePath = input.file_path ?? input.filePath;
  if (!isUnderTests(filePath)) allow(`not a test file (${filePath ?? "unknown"})`);

  const edits = Array.isArray(input.edits) ? input.edits : [];
  if (edits.length === 0) allow("no edits reported");

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
        `(an assertion was deleted or commented out).`
    );
  }

  if (newCommented > oldCommented) {
    block(
      `an expect( was commented out in ${filePath} ` +
        `(commented expect( count ${oldCommented} -> ${newCommented}).`
    );
  }

  allow(`assertions intact (active expect( ${oldActive} -> ${newActive})`);
}

main();
