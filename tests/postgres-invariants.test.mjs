import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(import.meta.url);
const { Pool } = require("pg");

// Strong safety fence: NEVER connect to Neon or a production DATABASE_URL here.
const expected = "postgres://postgres:ci_only@127.0.0.1:5432/jis_ci";
if (process.env.DATABASE_URL !== expected || process.env.CI_ISOLATED_POSTGRES !== "yes") {
  throw new Error("Postgres invariant tests require the disposable localhost CI database only.");
}
const pool = new Pool({ connectionString: expected, max: 4 });

async function fixture() {
  await pool.query(`
    DROP TABLE IF EXISTS ci_payments, ci_orders, ci_coupons, ci_stock;
    CREATE TABLE ci_coupons(id integer PRIMARY KEY, used_count integer NOT NULL, usage_limit integer);
    CREATE TABLE ci_orders(id integer PRIMARY KEY, status text NOT NULL, payment_status text NOT NULL, created_at timestamptz NOT NULL);
    CREATE TABLE ci_payments(order_id integer PRIMARY KEY, metadata jsonb, channel text);
    CREATE TABLE ci_stock(id integer PRIMARY KEY, stock integer NOT NULL);
    INSERT INTO ci_coupons VALUES(1,0,1);
    INSERT INTO ci_orders VALUES(1,'pending','pending',now()-interval '7 hours');
    INSERT INTO ci_payments VALUES(1,null,'whatsapp');
    INSERT INTO ci_stock VALUES(1,0);
  `);
}

test("PostgreSQL conditional coupon updates serialize the final redemption", async () => {
  await fixture();
  const a = await pool.connect();
  const b = await pool.connect();
  try {
    await a.query("BEGIN"); await b.query("BEGIN");
    const first = await a.query("UPDATE ci_coupons SET used_count=used_count+1 WHERE id=1 AND (usage_limit IS NULL OR used_count<usage_limit) RETURNING id");
    const secondPromise = b.query("UPDATE ci_coupons SET used_count=used_count+1 WHERE id=1 AND (usage_limit IS NULL OR used_count<usage_limit) RETURNING id");
    await a.query("COMMIT");
    const second = await secondPromise;
    await b.query("COMMIT");
    assert.equal(first.rowCount, 1);
    assert.equal(second.rowCount, 0);
    assert.equal((await pool.query("SELECT used_count FROM ci_coupons WHERE id=1")).rows[0].used_count, 1);
  } finally {
    await a.query("ROLLBACK").catch(() => {});
    await b.query("ROLLBACK").catch(() => {});
    a.release(); b.release();
  }
});

test("reported payment wins the order lock and blocks an overdue cancellation", async () => {
  await fixture();
  const reporter = await pool.connect();
  const expirer = await pool.connect();
  try {
    await reporter.query("BEGIN"); await expirer.query("BEGIN");
    const lock = await reporter.query("UPDATE ci_orders SET status='pending' WHERE id=1 AND status='pending' AND payment_status='pending' RETURNING id");
    assert.equal(lock.rowCount, 1);
    const expiry = expirer.query(`UPDATE ci_orders o SET status='cancelled' WHERE o.id=1 AND o.status='pending' AND o.payment_status='pending' AND o.created_at<=now()-interval '6 hours' AND NOT EXISTS(SELECT 1 FROM ci_payments p WHERE p.order_id=o.id AND p.metadata->>'transferReportedAt' IS NOT NULL) RETURNING id`);
    await reporter.query("UPDATE ci_payments SET metadata=jsonb_build_object('transferReportedAt', now()::text) WHERE order_id=1");
    await reporter.query("COMMIT");
    const result = await expiry;
    await expirer.query("COMMIT");
    assert.equal(result.rowCount, 0);
    assert.equal((await pool.query("SELECT status FROM ci_orders WHERE id=1")).rows[0].status, "pending");
  } finally {
    await reporter.query("ROLLBACK").catch(() => {});
    await expirer.query("ROLLBACK").catch(() => {});
    reporter.release(); expirer.release();
  }
});

test("concurrent cancellation releases stock and coupon use once", async () => {
  await fixture();
  await pool.query("UPDATE ci_coupons SET used_count=1 WHERE id=1");
  const cancel = async () => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const changed = await client.query("UPDATE ci_orders SET status='cancelled' WHERE id=1 AND status<>'cancelled' RETURNING id");
      if (changed.rowCount) {
        await client.query("UPDATE ci_stock SET stock=stock+1 WHERE id=1");
        await client.query("UPDATE ci_coupons SET used_count=greatest(0,used_count-1) WHERE id=1");
      }
      await client.query("COMMIT");
      return changed.rowCount;
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  };
  const results = await Promise.all([cancel(), cancel()]);
  assert.deepEqual(results.sort(), [0,1]);
  assert.equal((await pool.query("SELECT stock FROM ci_stock WHERE id=1")).rows[0].stock, 1);
  assert.equal((await pool.query("SELECT used_count FROM ci_coupons WHERE id=1")).rows[0].used_count, 0);
});

test.after(async () => { await pool.end(); });
