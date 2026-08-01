import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { schema } from "./schema";

const globalDatabase = globalThis as typeof globalThis & {
  neoTraceDatabase?: Database.Database;
};

function databasePath() {
  const configured = process.env.DATABASE_PATH ?? "./data/neotrace.sqlite";
  return path.resolve(process.cwd(), configured);
}

export function getDatabase() {
  if (!globalDatabase.neoTraceDatabase) {
    const filename = databasePath();
    mkdirSync(path.dirname(filename), { recursive: true });
    const database = new Database(filename);
    database.pragma("foreign_keys = ON");
    database.exec(schema);
    globalDatabase.neoTraceDatabase = database;
  }

  return globalDatabase.neoTraceDatabase;
}

