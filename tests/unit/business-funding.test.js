import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PosDatabase } from '../../lib/db/index.js';
import { accountBalance, accountBalanceAsOf, ensureAccountingSchema, postExpenseJournal } from '../../lib/accounting.js';
import { addBusinessInvestment, businessFundingProfile, updateBusinessInvestment } from '../../lib/business-funding.js';

const dbPath = path.join(os.tmpdir(), `business-funding-test-${process.pid}-${Date.now()}.db`);
const db = new PosDatabase(dbPath);

test.after(() => {
  try { db.close(); } catch { /* already closed */ }
  for (const suffix of ['', '-shm', '-wal']) {
    try { fs.unlinkSync(`${dbPath}${suffix}`); } catch { /* already gone */ }
  }
});

test('funding requires consent, respects dates, and replaces transfers on edit', async () => {
  await ensureAccountingSchema(db);
  await addBusinessInvestment(db, { amount: 1000, date: '2026-01-10', note: 'Opening capital', createdBy: 1 });

  await assert.rejects(
    () => db.transaction((tx) => postExpenseJournal(tx, {
      id: 91, amount: 600, description: 'Stock', payment_method: 'cash', expense_date: '2026-01-11', logged_by: 1,
    })),
    (error) => error.code === 'business_funding_required' && error.shortfall === 600 && error.available === 1000
  );

  await assert.rejects(
    () => db.transaction((tx) => postExpenseJournal(tx, {
      id: 92, amount: 100, description: 'Earlier expense', payment_method: 'cash', expense_date: '2026-01-09', logged_by: 1, use_business_funding: true,
    })),
    (error) => error.code === 'business_funding_insufficient' && error.available === 0
  );

  await db.transaction((tx) => postExpenseJournal(tx, {
    id: 91, amount: 600, description: 'Stock', payment_method: 'cash', expense_date: '2026-01-11', logged_by: 1, use_business_funding: true,
  }));
  assert.equal(await accountBalance(db, '1050'), 400);
  assert.equal(await accountBalance(db, '1010'), 0);

  await db.transaction((tx) => postExpenseJournal(tx, {
    id: 91, amount: 800, description: 'Stock corrected', payment_method: 'cash', expense_date: '2026-01-11', logged_by: 1, use_business_funding: true,
  }));
  assert.equal(await accountBalance(db, '1050'), 200);
  assert.equal(await accountBalance(db, '1010'), 0);

  const profile = await businessFundingProfile(db);
  assert.equal(profile.totalInvested, 1000);
  assert.equal(profile.totalUsed, 800);
  assert.equal(profile.availableBalance, 200);

  assert.equal(await accountBalance(db, '3010'), -1000, 'owner investment is a capital credit, not revenue');
  assert.equal(await accountBalance(db, '5020'), 800, 'the corrected expense is recognized exactly once');
  assert.equal(await accountBalance(db, '4010'), 0, 'business funding never creates sales revenue');
  assert.equal((await db.get(`SELECT COUNT(*) AS count FROM business_funding_transactions`)).count, 1);
  assert.equal((await db.get(`SELECT COUNT(*) AS count FROM journal_entries WHERE source_type='business_funding_use' AND source_id=91`)).count, 1);
  assert.equal((await db.get(`SELECT COUNT(*) AS count FROM journal_entries WHERE source_type='expense' AND source_id=91`)).count, 1);
});

test('explicit Business Funding and Owner Pocket payments never create cash or bank movement', async () => {
  const fundingBefore = await accountBalance(db, '1050');
  const cashBefore = await accountBalance(db, '1010');
  const bankBefore = await accountBalance(db, '1020');
  const equityBefore = await accountBalance(db, '3010');

  await postExpenseJournal(db, {
    id: 93, amount: 125, description: 'Paid from funding', payment_method: 'business_funding', expense_date: '2026-01-11', logged_by: 1,
  });
  await postExpenseJournal(db, {
    id: 94, amount: 75, description: 'Paid personally', payment_method: 'owner_pocket', expense_date: '2026-01-11', logged_by: 1,
  });

  assert.equal(await accountBalance(db, '1050'), fundingBefore - 125);
  assert.equal(await accountBalance(db, '1010'), cashBefore);
  assert.equal(await accountBalance(db, '1020'), bankBefore);
  assert.equal(await accountBalance(db, '3010'), equityBefore - 75);
  assert.equal(await accountBalance(db, '5020'), 1000);
  const profile = await businessFundingProfile(db);
  assert.ok(profile.history.some((row) => row.source_type === 'expense' && Number(row.source_id) === 93 && Number(row.amount) === -125));
  assert.ok(!profile.history.some((row) => row.source_type === 'expense' && Number(row.source_id) === 94), 'Owner Pocket must not appear as Business Funding use');

  await assert.rejects(
    () => postExpenseJournal(db, {
      id: 95, amount: 9999, description: 'Too much', payment_method: 'business_funding', expense_date: '2026-01-11', logged_by: 1,
    }),
    (error) => error.code === 'business_funding_insufficient'
  );
});

test('an investment date can be corrected without duplicating funds or breaking history', async () => {
  const investment = await db.get(`SELECT * FROM business_funding_transactions ORDER BY id LIMIT 1`);
  await updateBusinessInvestment(db, { id: investment.id, date: '2026-01-08', note: 'Entered late' });

  assert.equal(await accountBalanceAsOf(db, '1050', '2026-01-09'), 1000);
  assert.equal((await db.get(`SELECT transaction_date FROM business_funding_transactions WHERE id=?`, [investment.id])).transaction_date, '2026-01-08');
  assert.equal((await db.get(`SELECT COUNT(*) AS count FROM business_funding_transactions`)).count, 1);
  assert.equal((await db.get(`SELECT COUNT(*) AS count FROM journal_entries WHERE source_type='business_funding_investment' AND source_id=?`, [investment.id])).count, 1);

  await assert.rejects(
    () => updateBusinessInvestment(db, { id: investment.id, date: '2026-01-12', note: 'Too late' }),
    (error) => error.code === 'business_funding_history_conflict' && error.transaction_date === '2026-01-11'
  );
  assert.equal((await db.get(`SELECT transaction_date FROM business_funding_transactions WHERE id=?`, [investment.id])).transaction_date, '2026-01-08');
});
