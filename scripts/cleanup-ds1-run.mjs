import "dotenv/config";
import { deleteProgramsByIds, getAllPrograms } from "../support/delete-program.ts";

const RUN_START = 1779848450000;
const RUN_END = 1779848590000;

function isDs1RunProgram(name) {
  const tsMatches = [...name.matchAll(/(\d{13})/g)].map((match) => Number(match[1]));
  if (!tsMatches.some((ts) => ts >= RUN_START && ts <= RUN_END)) {
    return false;
  }

  return (
    /^Web Development 2026 \d{13}$/.test(name) ||
    /^Web Development 2026 \d{13} [AB]+$/.test(name) ||
    /^Data Science 2026 \d{13}$/.test(name) ||
    /^Web Development 2026: Front-End & API \(Evening\) \d{13}$/.test(name) ||
    /^Web Development \d{13}$/.test(name) ||
    /^   Web Development 2026 \d{13}   $/.test(name)
  );
}

const all = await getAllPrograms();
const targets = all.filter((program) => isDs1RunProgram(program.name));

console.log("Scope: ds1-create-program.spec.ts run only");
console.log("Found via GET:", targets.length);

for (const program of targets) {
  const label =
    program.name.length > 70 ? `${program.name.slice(0, 67)}...` : program.name;
  console.log(`- ${program.id} (${label})`);
}

if (targets.length === 0) {
  process.exit(0);
}

const results = await deleteProgramsByIds(targets.map((program) => program.id));
const deleted = results.filter((result) => result.ok);
const failed = results.filter((result) => !result.ok && result.status !== 404);

console.log("Deleted:", deleted.length);
for (const result of deleted) {
  console.log(`- ${result.id}`);
}

console.log("Failed:", failed.length === 0 ? "none" : failed.length);
for (const result of failed) {
  console.warn(`- ${result.id}: ${result.status} ${result.message}`);
}
