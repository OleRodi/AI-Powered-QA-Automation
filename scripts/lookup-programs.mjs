import "dotenv/config";
import { getAllPrograms } from "../support/delete-program.ts";

const names = process.argv.slice(2);
const all = await getAllPrograms();

for (const name of names) {
  const match = all.find((program) => program.name === name);
  console.log(name, match ? `FOUND ${match.id}` : "NOT FOUND");
}
