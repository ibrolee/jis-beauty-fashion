/* CLI entry: `npm run db:seed` (use `-- --force` to re-run on a non-empty DB). */
import "dotenv/config";

async function main() {
  const { seedDatabase } = await import("../src/db/seed");
  const { pool } = await import("../src/db");
  await seedDatabase({ force: process.argv.includes("--force") });
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
