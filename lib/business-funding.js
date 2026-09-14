import { ensureSqliteTable } from '@/lib/db/ensure-sqlite-table.js';
import { serialPkSql } from '@/lib/db/schema-helpers.js';
import {
  accountBalance,
  accountBalanceAsOf,
  currentDrawerId,
  deleteJournalBySource,
  ensureAccountingSchema,
  postJournal,
} from '@/lib/accounting.js';
import { nepalDateString } from '@/lib/report-dates.js';

export const BUSINESS_FUNDING_CODE = '1050';
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

export async function ensureBusinessFundingSchema(db) {
  await ensureAccountingSchema(db);
  const pk = serialPkSql(db);
  await ensureSqliteTable(db, `CREATE TABLE IF NOT EXISTS business_funding_transactions (
    ${pk}, transaction_date DATE NOT NULL, transaction_type TEXT NOT NULL DEFAULT 'investment',
    amount REAL NOT NULL, note TEXT, created_by INTEGER, journal_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

export async function addBusinessInvestment(db, { amount, date, note, createdBy }) {
  const value = round2(amount);
  if (!(value > 0)) throw Object.assign(new Error('Investment amount must be greater than zero.'), { status: 400 });
  const transactionDate = date || nepalDateString();
  await ensureBusinessFundingSchema(db);

  return db.transaction(async (tx) => {
    const result = await tx.run(
      `INSERT INTO business_funding_transactions
         (transaction_date, transaction_type, amount, note, created_by)
       VALUES (?, 'investment', ?, ?, ?)`,
      [transactionDate, value, String(note || '').trim() || null, createdBy || null]
    );
    const id = result.lastInsertRowid;
    const journalId = await postJournal(tx, {
      entry_date: transactionDate,
      memo: `Owner investment${note ? ` — ${String(note).trim()}` : ''}`,
      source_type: 'business_funding_investment',
      source_id: id,
      created_by: createdBy || null,
      lines: [
        { code: BUSINESS_FUNDING_CODE, debit: value, credit: 0, memo: 'Funds available' },
        { code: '3010', debit: 0, credit: value, memo: 'Owner capital invested' },
      ],
    });
    await tx.run(`UPDATE business_funding_transactions SET journal_id=? WHERE id=?`, [journalId, id]);
    return tx.get(`SELECT * FROM business_funding_transactions WHERE id=?`, [id]);
  });
}

async function firstFundingDeficit(db) {
  return db.get(
    `SELECT entry_date, running_balance FROM (
       SELECT x.entry_date,
              SUM(SUM(CASE WHEN a.type IN ('asset','expense')
                           THEN jl.debit-jl.credit ELSE jl.credit-jl.debit END))
                OVER (ORDER BY x.entry_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_balance
       FROM journal_entries x
       JOIN journal_lines jl ON jl.journal_id=x.id
       JOIN accounts a ON a.id=jl.account_id
       WHERE a.code=?
       GROUP BY x.entry_date
     ) dated_balances
     WHERE running_balance < -0.005
     ORDER BY entry_date LIMIT 1`,
    [BUSINESS_FUNDING_CODE]
  );
}

/** Correct when an existing investment became available without adding it twice. */
export async function updateBusinessInvestment(db, { id, date, note }) {
  const investmentId = Number(id);
  if (!Number.isInteger(investmentId) || investmentId <= 0) {
    throw Object.assign(new Error('Choose a valid Business Funding investment.'), { status: 400 });
  }
  await ensureBusinessFundingSchema(db);

  return db.transaction(async (tx) => {
    const existing = await tx.get(
      `SELECT * FROM business_funding_transactions WHERE id=? AND transaction_type='investment'`,
      [investmentId]
    );
    if (!existing) throw Object.assign(new Error('Business Funding investment not found.'), { status: 404 });

    const transactionDate = String(date || existing.transaction_date || '').slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(transactionDate)) {
      throw Object.assign(new Error('Enter a valid investment date.'), { status: 400, code: 'validation' });
    }
    const cleanNote = String(note || '').trim() || null;
    await deleteJournalBySource(tx, 'business_funding_investment', investmentId);
    await tx.run(
      `UPDATE business_funding_transactions SET transaction_date=?, note=?, journal_id=NULL WHERE id=?`,
      [transactionDate, cleanNote, investmentId]
    );
    const journalId = await postJournal(tx, {
      entry_date: transactionDate,
      memo: `Owner investment${cleanNote ? ` — ${cleanNote}` : ''}`,
      source_type: 'business_funding_investment',
      source_id: investmentId,
      created_by: existing.created_by || null,
      lines: [
        { code: BUSINESS_FUNDING_CODE, debit: existing.amount, credit: 0, memo: 'Funds available' },
        { code: '3010', debit: 0, credit: existing.amount, memo: 'Owner capital invested' },
      ],
    });
    await tx.run(`UPDATE business_funding_transactions SET journal_id=? WHERE id=?`, [journalId, investmentId]);

    const deficit = await firstFundingDeficit(tx);
    if (deficit) {
      const shortfall = round2(Math.abs(deficit.running_balance));
      throw Object.assign(
        new Error(`This date would leave Business Funding short by Rs ${shortfall.toFixed(2)} on ${String(deficit.entry_date).slice(0, 10)}.`),
        { status: 409, code: 'business_funding_history_conflict', shortfall, transaction_date: String(deficit.entry_date).slice(0, 10) }
      );
    }
    return tx.get(`SELECT * FROM business_funding_transactions WHERE id=?`, [investmentId]);
  });
}

export async function businessFundingProfile(db, { limit = 100 } = {}) {
  await ensureBusinessFundingSchema(db);
  const totals = await db.get(
    `SELECT COALESCE(SUM(amount),0) AS total_invested, COUNT(*) AS investment_count
     FROM business_funding_transactions WHERE transaction_type='investment'`
  );
  const available = await accountBalance(db, BUSINESS_FUNDING_CODE);
  const history = await db.all(
    `SELECT x.id, x.entry_date, x.memo, x.source_type, x.source_id, x.created_at,
            u.full_name AS created_by_name,
            COALESCE(SUM(CASE WHEN a.code=? THEN jl.debit-jl.credit ELSE 0 END),0) AS amount
     FROM journal_entries x
     JOIN journal_lines jl ON jl.journal_id=x.id
     JOIN accounts a ON a.id=jl.account_id
     LEFT JOIN users u ON u.id=x.created_by
     WHERE x.source_type IN ('business_funding_investment','business_funding_use')
        OR (x.source_type='expense' AND EXISTS (
          SELECT 1 FROM journal_lines used JOIN accounts used_account ON used_account.id=used.account_id
          WHERE used.journal_id=x.id AND used_account.code=? AND used.credit>0
        ))
        OR (x.source_type='reversal' AND EXISTS (
          SELECT 1 FROM journal_entries original
          WHERE original.id=x.source_id AND (
            original.source_type='business_funding_use'
            OR (original.source_type='expense' AND EXISTS (
              SELECT 1 FROM journal_lines original_line JOIN accounts original_account ON original_account.id=original_line.account_id
              WHERE original_line.journal_id=original.id AND original_account.code=? AND original_line.credit>0
            ))
          )
        ))
     GROUP BY x.id, x.entry_date, x.memo, x.source_type, x.source_id, x.created_at, u.full_name
     ORDER BY x.entry_date DESC, x.id DESC LIMIT ?`,
    [BUSINESS_FUNDING_CODE, BUSINESS_FUNDING_CODE, BUSINESS_FUNDING_CODE, Number(limit) || 100]
  );
  return {
    totalInvested: round2(totals?.total_invested),
    investmentCount: Number(totals?.investment_count || 0),
    totalUsed: round2(Number(totals?.total_invested || 0) - available),
    availableBalance: round2(available),
    history: history.map((row) => ({ ...row, amount: round2(row.amount) })),
  };
}

/**
 * Ensure the selected cash/bank account can pay a dated expense. If it cannot,
 * require explicit consent, then transfer only the shortfall from Business Funding.
 * Existing transfer journals are removed first so expense edits are idempotent.
 */
export async function prepareExpenseFunding(db, expense, paymentCode) {
  await ensureBusinessFundingSchema(db);
  await deleteJournalBySource(db, 'business_funding_use', expense.id);
  if (!['1010', '1020'].includes(paymentCode)) return { amount: 0 };

  const date = expense.expense_date || expense.date || nepalDateString();
  const historicalDrawer = paymentCode === '1010' && expense.business_day_id
    ? await db.get(
        `SELECT drawer_id FROM drawer_sessions WHERE business_day_id=? ORDER BY opened_at,id LIMIT 1`,
        [expense.business_day_id]
      ).catch(() => null)
    : null;
  const drawerId = paymentCode === '1010' ? (historicalDrawer?.drawer_id || await currentDrawerId(db)) : null;
  const scoped = paymentCode === '1010' ? { drawerId } : {};
  let balance = round2(await accountBalanceAsOf(db, paymentCode, date, scoped));
  if (paymentCode === '1010' && expense.business_day_id) {
    const day = await db.get(
      `SELECT status,opening_cash FROM business_days WHERE id=?`,
      [expense.business_day_id]
    ).catch(() => null);
    if (day?.status === 'closed') {
      const movement = await db.get(
        `SELECT COALESCE(SUM(jl.debit-jl.credit),0) AS amount
         FROM journal_lines jl JOIN journal_entries je ON je.id=jl.journal_id
         JOIN accounts a ON a.id=jl.account_id
         WHERE je.business_day_id=? AND a.code='1010'
           AND COALESCE(je.source_type,'') NOT IN ('drawer_open','opening_cash_movement','opening_cash_alignment')`,
        [expense.business_day_id]
      );
      balance = round2(Number(day.opening_cash || 0) + Number(movement?.amount || 0));
    }
  }
  const shortfall = round2(Math.max(0, Number(expense.amount || 0) - balance));
  if (!(shortfall > 0)) return { amount: 0, balance };

  const available = round2(await accountBalanceAsOf(db, BUSINESS_FUNDING_CODE, date));
  if (!expense.use_business_funding) {
    throw Object.assign(
      new Error(`${paymentCode === '1010' ? 'Cash' : 'Bank'} would be short by Rs ${shortfall.toFixed(2)} on ${date}. Use Business Funding?`),
      { status: 409, code: 'business_funding_required', shortfall, available, payment_balance: balance, transaction_date: date }
    );
  }
  if (available + 0.001 < shortfall) {
    throw Object.assign(
      new Error(`Business Funding has Rs ${available.toFixed(2)} available on ${date}, but Rs ${shortfall.toFixed(2)} is required.`),
      { status: 409, code: 'business_funding_insufficient', shortfall, available, transaction_date: date }
    );
  }

  await postJournal(db, {
    entry_date: date,
    memo: `Business Funding used for ${expense.description || `expense #${expense.id}`}`,
    source_type: 'business_funding_use',
    source_id: expense.id,
    created_by: expense.logged_by || null,
    business_day_id: expense.business_day_id || null,
    lines: [
      { code: paymentCode, debit: shortfall, credit: 0, drawer_id: drawerId, memo: 'Funding top-up' },
      { code: BUSINESS_FUNDING_CODE, debit: 0, credit: shortfall, memo: 'Used for expense' },
    ],
  });
  return { amount: shortfall, balance, available };
}
