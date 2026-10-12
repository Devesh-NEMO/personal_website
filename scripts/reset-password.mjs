/**
 * `npm run reset-password` — set (or reset) the admin password.
 *
 * Writes a fresh bcrypt hash into ADMIN_PASSWORD_HASH in `.env.local`, and
 * creates SESSION_SECRET if it is missing. It never touches MONGODB_URI or
 * ADMIN_EMAIL, so it is safe to run on a configured project.
 *
 * Usage:
 *   npm run reset-password                 (prompts twice for the new password)
 *   npm run reset-password -- 'newpass'    (non-interactive)
 *
 * This is the recovery path when you are locked out: everything else in the
 * admin panel is behind the login, so the password has to be settable from
 * outside the app. On Vercel, set the printed values as environment variables
 * instead (see the note the script prints at the end).
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import crypto from "node:crypto";

import bcrypt from "bcryptjs";

const ENV_PATH = path.join(process.cwd(), ".env.local");
const MIN_LENGTH = 8;

/** Replace `KEY=...` if present, otherwise append it, preserving every other line. */
function upsert(text, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(text)) return text.replace(pattern, line);

  const separator = text === "" || text.endsWith("\n") ? "" : "\n";
  return `${text}${separator}${line}\n`;
}

/** Read KEY=value from an env file, ignoring comments. */
function readValue(text, key) {
  const match = text.match(new RegExp(`^${key}=(.*)$`, "m"));
  return match ? match[1].trim() : "";
}

async function promptPassword() {
  const rl = readline.createInterface({ input, output });
  try {
    const first = await rl.question("New admin password: ");
    const second = await rl.question("Confirm password: ");
    if (first !== second) {
      console.error("Passwords did not match.");
      process.exit(1);
    }
    return first;
  } finally {
    rl.close();
  }
}

const fromArg = process.argv[2];
const password = fromArg ?? (await promptPassword());

if (!password) {
  console.error("No password given.");
  process.exit(1);
}
if (password.length < MIN_LENGTH) {
  console.error(`Password must be at least ${MIN_LENGTH} characters.`);
  process.exit(1);
}

let envText = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";

// Next.js expands `$NAME` in .env files (dotenv-expand). A bcrypt hash is full
// of `$` (e.g. `$2b$12$...`), so pasting it raw silently corrupts it — the `$2b`
// and `$12` segments get consumed as variable references. Escaping each `$` as
// `\$` makes the loader produce the original hash. (Vercel's dashboard does no
// expansion, so paste the raw hash there.)
const escapedHash = (await bcrypt.hash(password, 12)).replace(/\$/g, "\\$");
envText = upsert(envText, "ADMIN_PASSWORD_HASH", escapedHash);

let createdSecret = false;
if (!readValue(envText, "SESSION_SECRET")) {
  envText = upsert(envText, "SESSION_SECRET", crypto.randomBytes(48).toString("base64url"));
  createdSecret = true;
}

fs.writeFileSync(ENV_PATH, envText);
// Tighten permissions even when the file already existed (mode on writeSync
// only applies at creation).
try {
  fs.chmodSync(ENV_PATH, 0o600);
} catch {
  // Non-POSIX filesystem; skip silently.
}

console.log(`Updated ADMIN_PASSWORD_HASH in ${path.relative(process.cwd(), ENV_PATH)}`);
if (createdSecret) console.log("Generated a new SESSION_SECRET (none was set).");
if (!readValue(envText, "ADMIN_EMAIL")) {
  console.log("Note: ADMIN_EMAIL is still empty — set it to the login address.");
}

console.log(
  "\nLocal: restart the dev server so it picks up the change.\n" +
    "Vercel: set ADMIN_PASSWORD_HASH (and SESSION_SECRET if it changed) in\n" +
    "Project → Settings → Environment Variables, then redeploy. Paste the RAW\n" +
    "hash there (no backslashes) — only .env files need the escaping.",
);
