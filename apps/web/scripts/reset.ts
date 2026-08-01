import { rmSync } from "node:fs";
import path from "node:path";

const configured = process.env.DATABASE_PATH ?? "./data/neotrace.sqlite";
const filename = path.resolve(process.cwd(), configured);
for (const suffix of ["", "-shm", "-wal", "-journal"]) rmSync(`${filename}${suffix}`, { force: true });
rmSync(path.resolve(process.cwd(), process.env.SCREENSHOT_DIR ?? "./uploads/screenshots"), { recursive: true, force: true });
console.log(`Removed local database and screenshots under ${process.cwd()}.`);

