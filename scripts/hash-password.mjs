/**
 * `npm run hash-password` — prints a bcrypt hash of a password so it can be put
 * in ADMIN_PASSWORD_HASH in .env.local.
 *
 * Usage:
 *   npm run hash-password                (prompts for the password)
 *   npm run hash-password -- 'mypassword'
 */
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function getPassword() {
  const fromArg = process.argv[2];
  if (fromArg) return fromArg;

  const rl = readline.createInterface({ input, output });
  const password = await rl.question("Password: ");
  rl.close();
  return password;
}

const password = await getPassword();
if (!password) {
  console.error("No password given. Pass one as an argument or type it at the prompt.");
  process.exit(1);
}

// 12 rounds: ~0.2-0.3s per hash on a laptop, comfortably above the OWASP
// minimum for an admin password, and fast enough to be pleasant to run.
const hash = await bcrypt.hash(password, 12);

// Next.js expands `$NAME` in .env files (dotenv-expand), and a bcrypt hash is
// full of `$`, so a raw paste into .env.local would be silently corrupted.
// Print the escaped form (each `$` as `\$`) so it is safe to paste there.
// Vercel's dashboard does no expansion — use the raw hash there.
console.log(hash.replace(/\$/g, "\\$"));
console.error(
  "\nPaste the line above as ADMIN_PASSWORD_HASH in .env.local (the backslashes\n" +
    "are required there). On Vercel, use the value WITHOUT backslashes:\n" +
    `  ${hash}`,
);