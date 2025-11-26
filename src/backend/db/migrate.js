import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "../../..");
const schemaPath = path.join(rootDir, "database", "schema.sql");

const runMigrations = () => {
  console.log("[MIGRATION] Starting database migrations");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  db.exec(schema, (err) => {
    if (err) {
      console.error("[MIGRATION] Error while running migrations", err);
    } else {
      console.log("[MIGRATION] Database ready");
    }
  });
};

runMigrations();