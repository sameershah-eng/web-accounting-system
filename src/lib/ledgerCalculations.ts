import { JournalEntry, BasAccount } from '../types';
import { BAS_ACCOUNTS } from '../data/basAccounts';

export interface AccountSummary {
  account: BasAccount;
  debitTurnover: number;
  creditTurnover: number;
  netTurnover: number; // For assets/expenses: debit - credit. For liabilities/equity/revenue: credit - debit
  balance: number;
  transactions: Array<{
    verNum: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
  }>;
}

export function computeLedger(entries: JournalEntry[], companyId: string): Map<number, AccountSummary> {
  const ledger = new Map<number, AccountSummary>();

  // Initialize with BAS accounts
  BAS_ACCOUNTS.forEach(acc => {
    ledger.set(acc.number, {
      account: acc,
      debitTurnover: 0,
      creditTurnover: 0,
      netTurnover: 0,
      balance: 0,
      transactions: [],
    });
  });

  // Filter entries for the company
  const compEntries = entries.filter(e => e.companyId === companyId);

  // Accumulate
  compEntries.forEach(entry => {
    entry.rows.forEach(row => {
      let accSummary = ledger.get(row.account);
      if (!accSummary) {
        // Fallback account definition
        const fallbackAcc: BasAccount = {
          number: row.account,
          name: row.accountName || `Konto ${row.account}`,
          type: row.account < 2000 ? 'Tillgångar' : row.account < 3000 ? 'Skulder och eget kapital' : row.account < 4000 ? 'Rörelsens intäkter' : 'Övriga externa kostnader',
          class: Math.floor(row.account / 1000),
        };
        accSummary = {
          account: fallbackAcc,
          debitTurnover: 0,
          creditTurnover: 0,
          netTurnover: 0,
          balance: 0,
          transactions: [],
        };
        ledger.set(row.account, accSummary);
      }

      const d = Number(row.debit) || 0;
      const c = Number(row.credit) || 0;

      accSummary.debitTurnover += d;
      accSummary.creditTurnover += c;
      accSummary.transactions.push({
        verNum: entry.verNum,
        date: entry.date,
        description: row.description || entry.description,
        debit: d,
        credit: c,
      });
    });
  });

  // Compute final balances according to account classes
  ledger.forEach((val) => {
    // Class 1 (Assets) and Class 4, 5, 6, 7, 8 (Costs) naturally have debit balances
    // Class 2 (Liabilities/Equity) and Class 3 (Revenues) naturally have credit balances
    if (val.account.class === 1 || val.account.class >= 4) {
      val.balance = val.debitTurnover - val.creditTurnover;
      val.netTurnover = val.debitTurnover - val.creditTurnover;
    } else {
      val.balance = val.creditTurnover - val.debitTurnover;
      val.netTurnover = val.creditTurnover - val.debitTurnover;
    }
  });

  return ledger;
}

export interface IncomeStatementReport {
  revenues: { items: { name: string; amount: number }[]; total: number };
  rawMaterials: { items: { name: string; amount: number }[]; total: number };
  otherExternalCosts: { items: { name: string; amount: number }[]; total: number };
  personnelCosts: { items: { name: string; amount: number }[]; total: number };
  depreciation: { items: { name: string; amount: number }[]; total: number };
  operatingProfit: number;
  financialItems: { items: { name: string; amount: number }[]; total: number };
  taxExpense: number;
  netProfit: number;
}

export function computeIncomeStatement(entries: JournalEntry[], companyId: string): IncomeStatementReport {
  const ledger = computeLedger(entries, companyId);

  const revenues = { items: [] as { name: string; amount: number }[], total: 0 };
  const rawMaterials = { items: [] as { name: string; amount: number }[], total: 0 };
  const otherExternalCosts = { items: [] as { name: string; amount: number }[], total: 0 };
  const personnelCosts = { items: [] as { name: string; amount: number }[], total: 0 };
  const depreciation = { items: [] as { name: string; amount: number }[], total: 0 };
  const financialItems = { items: [] as { name: string; amount: number }[], total: 0 };
  let taxExpense = 0;

  ledger.forEach((val) => {
    if (val.debitTurnover === 0 && val.creditTurnover === 0) return;

    const accNum = val.account.number;
    // Class 3: Revenues
    if (accNum >= 3000 && accNum < 4000) {
      const amt = val.creditTurnover - val.debitTurnover;
      if (amt !== 0) {
        revenues.items.push({ name: `${accNum} ${val.account.name}`, amount: amt });
        revenues.total += amt;
      }
    }
    // Class 4: Raw materials / goods
    else if (accNum >= 4000 && accNum < 5000) {
      const amt = val.debitTurnover - val.creditTurnover;
      if (amt !== 0) {
        rawMaterials.items.push({ name: `${accNum} ${val.account.name}`, amount: amt });
        rawMaterials.total += amt;
      }
    }
    // Class 5 & 6: Other external costs
    else if (accNum >= 5000 && accNum < 7000) {
      const amt = val.debitTurnover - val.creditTurnover;
      if (amt !== 0) {
        otherExternalCosts.items.push({ name: `${accNum} ${val.account.name}`, amount: amt });
        otherExternalCosts.total += amt;
      }
    }
    // Class 7: Personnel
    else if (accNum >= 7000 && accNum < 7800) {
      const amt = val.debitTurnover - val.creditTurnover;
      if (amt !== 0) {
        personnelCosts.items.push({ name: `${accNum} ${val.account.name}`, amount: amt });
        personnelCosts.total += amt;
      }
    }
    // Depreciation 7800-7899
    else if (accNum >= 7800 && accNum < 8000) {
      const amt = val.debitTurnover - val.creditTurnover;
      if (amt !== 0) {
        depreciation.items.push({ name: `${accNum} ${val.account.name}`, amount: amt });
        depreciation.total += amt;
      }
    }
    // Class 8: Financial items
    else if (accNum >= 8000 && accNum < 8900) {
      // Interest cost vs interest income
      const amt = (accNum < 8400) ? (val.creditTurnover - val.debitTurnover) : -(val.debitTurnover - val.creditTurnover);
      if (amt !== 0) {
        financialItems.items.push({ name: `${accNum} ${val.account.name}`, amount: amt });
        financialItems.total += amt;
      }
    }
    else if (accNum === 8910) {
      taxExpense += (val.debitTurnover - val.creditTurnover);
    }
  });

  const totalCosts = rawMaterials.total + otherExternalCosts.total + personnelCosts.total + depreciation.total;
  const operatingProfit = revenues.total - totalCosts;
  const profitBeforeTax = operatingProfit + financialItems.total;
  
  // If no tax booked yet, calculate 20.6% standard Swedish corporate tax on positive profit
  const actualTax = taxExpense > 0 ? taxExpense : (profitBeforeTax > 0 ? Math.round(profitBeforeTax * 0.206) : 0);
  const netProfit = profitBeforeTax - actualTax;

  return {
    revenues,
    rawMaterials,
    otherExternalCosts,
    personnelCosts,
    depreciation,
    operatingProfit,
    financialItems,
    taxExpense: actualTax,
    netProfit,
  };
}

export interface BalanceSheetReport {
  fixedAssets: { items: { name: string; amount: number }[]; total: number };
  currentAssets: { items: { name: string; amount: number }[]; total: number };
  totalAssets: number;
  equity: { items: { name: string; amount: number }[]; total: number };
  longTermLiabilities: { items: { name: string; amount: number }[]; total: number };
  currentLiabilities: { items: { name: string; amount: number }[]; total: number };
  totalEquityAndLiabilities: number;
  isBalanced: boolean;
  difference: number;
  netProfit: number;
}

export function computeBalanceSheet(entries: JournalEntry[], companyId: string): BalanceSheetReport {
  const ledger = computeLedger(entries, companyId);
  const isReport = computeIncomeStatement(entries, companyId);

  const fixedAssets = { items: [] as { name: string; amount: number }[], total: 0 };
  const currentAssets = { items: [] as { name: string; amount: number }[], total: 0 };
  const equity = { items: [] as { name: string; amount: number }[], total: 0 };
  const longTermLiabilities = { items: [] as { name: string; amount: number }[], total: 0 };
  const currentLiabilities = { items: [] as { name: string; amount: number }[], total: 0 };

  ledger.forEach((val) => {
    if (val.debitTurnover === 0 && val.creditTurnover === 0) return;
    const num = val.account.number;

    // Assets (Class 1)
    if (num >= 1000 && num < 2000) {
      const netVal = val.debitTurnover - val.creditTurnover;
      if (netVal !== 0) {
        if (num < 1400) {
          fixedAssets.items.push({ name: `${num} ${val.account.name}`, amount: netVal });
          fixedAssets.total += netVal;
        } else {
          currentAssets.items.push({ name: `${num} ${val.account.name}`, amount: netVal });
          currentAssets.total += netVal;
        }
      }
    }
    // Equity & Liabilities (Class 2)
    else if (num >= 2000 && num < 3000) {
      const netVal = val.creditTurnover - val.debitTurnover;
      if (netVal !== 0) {
        if (num < 2100) {
          equity.items.push({ name: `${num} ${val.account.name}`, amount: netVal });
          equity.total += netVal;
        } else if (num >= 2300 && num < 2400) {
          longTermLiabilities.items.push({ name: `${num} ${val.account.name}`, amount: netVal });
          longTermLiabilities.total += netVal;
        } else {
          currentLiabilities.items.push({ name: `${num} ${val.account.name}`, amount: netVal });
          currentLiabilities.total += netVal;
        }
      }
    }
  });

  // Add årets beräknade resultat to equity if not already closed
  equity.items.push({ name: '2099 Årets beräknade resultat', amount: isReport.netProfit });
  equity.total += isReport.netProfit;

  const totalAssets = fixedAssets.total + currentAssets.total;
  const totalEquityAndLiabilities = equity.total + longTermLiabilities.total + currentLiabilities.total;
  const difference = Math.abs(totalAssets - totalEquityAndLiabilities);
  const isBalanced = difference < 1.0;

  return {
    fixedAssets,
    currentAssets,
    totalAssets,
    equity,
    longTermLiabilities,
    currentLiabilities,
    totalEquityAndLiabilities,
    isBalanced,
    difference,
    netProfit: isReport.netProfit,
  };
}

export interface VatReport {
  periodLabel: string;
  ruta05_sales25: number;
  ruta06_sales12: number;
  ruta07_sales6: number;
  ruta10_outputVat25: number;
  ruta11_outputVat12: number;
  ruta12_outputVat6: number;
  totalOutputVat: number;
  ruta48_inputVat: number;
  ruta49_vatToPayOrRefund: number; // positive = to pay, negative = to receive
}

export function computeVatReport(entries: JournalEntry[], companyId: string): VatReport {
  const compEntries = entries.filter(e => e.companyId === companyId);

  let ruta05 = 0;
  let ruta06 = 0;
  let ruta07 = 0;
  let ruta10 = 0;
  let ruta11 = 0;
  let ruta12 = 0;
  let ruta48 = 0;

  compEntries.forEach(entry => {
    entry.rows.forEach(r => {
      // Sales accounts
      if (r.account === 3001 || r.account === 3041) {
        ruta05 += (Number(r.credit) || 0) - (Number(r.debit) || 0);
      } else if (r.account === 3002) {
        ruta06 += (Number(r.credit) || 0) - (Number(r.debit) || 0);
      } else if (r.account === 3003) {
        ruta07 += (Number(r.credit) || 0) - (Number(r.debit) || 0);
      }

      // VAT accounts
      if (r.account === 2611) {
        ruta10 += (Number(r.credit) || 0) - (Number(r.debit) || 0);
      } else if (r.account === 2621) {
        ruta11 += (Number(r.credit) || 0) - (Number(r.debit) || 0);
      } else if (r.account === 2631) {
        ruta12 += (Number(r.credit) || 0) - (Number(r.debit) || 0);
      } else if (r.account === 2641) {
        ruta48 += (Number(r.debit) || 0) - (Number(r.credit) || 0);
      }
    });
  });

  const totalOutputVat = Math.max(0, ruta10) + Math.max(0, ruta11) + Math.max(0, ruta12);
  const ruta49 = totalOutputVat - Math.max(0, ruta48);

  return {
    periodLabel: 'Helår 2026 (Ackumulerat)',
    ruta05_sales25: Math.max(0, ruta05),
    ruta06_sales12: Math.max(0, ruta06),
    ruta07_sales6: Math.max(0, ruta07),
    ruta10_outputVat25: Math.max(0, ruta10),
    ruta11_outputVat12: Math.max(0, ruta11),
    ruta12_outputVat6: Math.max(0, ruta12),
    totalOutputVat,
    ruta48_inputVat: Math.max(0, ruta48),
    ruta49_vatToPayOrRefund: ruta49,
  };
}
