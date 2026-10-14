import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Company, 
  JournalEntry, 
  BankTransaction, 
  Employee, 
  PayrollRun, 
  YearEndState, 
  User, 
  AuditLogItem, 
  IntegrationStatus 
} from '../types';
import { SEED_COMPANIES } from '../data/seedClients';
import { SEED_EMPLOYEES, SEED_JOURNAL_ENTRIES, SEED_BANK_TRANSACTIONS, INITIAL_YEAR_END_STATE } from '../data/seedNorrstrom';
import { SEED_USERS, SEED_INTEGRATIONS, SEED_AUDIT_LOG } from '../data/seedSystem';
import { calculatePreliminaryTax, calculateEmployerContribution, calculateVacationAccrual } from '../lib/swedishTax';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AccountingContextType {
  companies: Company[];
  activeCompanyId: string;
  activeCompany: Company;
  setActiveCompanyId: (id: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  updateUserRole: (userId: string, role: User['role']) => void;
  toggleUserActive: (userId: string) => void;
  isClientView: boolean;
  setIsClientView: (val: boolean) => void;
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  deleteJournalEntry: (id: string) => void;
  bankTransactions: BankTransaction[];
  matchBankTransaction: (id: string, verId?: string) => void;
  createAndMatchBankTransaction: (transId: string, accountNum: number) => void;
  employees: Employee[];
  updateEmployee: (emp: Employee) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  payrollRuns: PayrollRun[];
  createPayrollRun: (period: string, payDate: string) => PayrollRun;
  lockAndPayPayrollRun: (id: string) => void;
  yearEndState: YearEndState;
  updateYearEndState: (updater: Partial<YearEndState>) => void;
  signYearEnd: (signerId: string) => void;
  integrations: IntegrationStatus[];
  toggleIntegration: (id: string) => void;
  auditLog: AuditLogItem[];
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  resetAllData: () => void;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPANIES: 'balans_companies_v1',
  ACTIVE_COMPANY_ID: 'balans_active_company_id_v1',
  CURRENT_USER_ID: 'balans_current_user_id_v1',
  USERS: 'balans_users_v1',
  JOURNAL_ENTRIES: 'balans_journal_entries_v1',
  BANK_TRANSACTIONS: 'balans_bank_transactions_v1',
  EMPLOYEES: 'balans_employees_v1',
  PAYROLL_RUNS: 'balans_payroll_runs_v1',
  YEAR_END: 'balans_year_end_v1',
  INTEGRATIONS: 'balans_integrations_v1',
  AUDIT_LOG: 'balans_audit_log_v1',
};

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [companies] = useState<Company[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return saved ? JSON.parse(saved) : SEED_COMPANIES;
  });

  const [activeCompanyId, setActiveCompanyIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
    return saved || 'norrstrom-bygg-ab';
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const found = users.find(u => u.id === savedId);
    return found || users[0];
  });

  const [isClientView, setIsClientView] = useState<boolean>(currentUser.role === 'Client');

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    return saved ? JSON.parse(saved) : SEED_JOURNAL_ENTRIES;
  });

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANK_TRANSACTIONS);
    return saved ? JSON.parse(saved) : SEED_BANK_TRANSACTIONS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return saved ? JSON.parse(saved) : SEED_EMPLOYEES;
  });

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYROLL_RUNS);
    if (saved) return JSON.parse(saved);

    // Initial seed payroll run for September 2026
    const lines = SEED_EMPLOYEES.map(emp => {
      const tax = calculatePreliminaryTax(emp.monthlySalary, emp.taxTable, emp.taxColumn);
      const ag = calculateEmployerContribution(emp.monthlySalary);
      const vac = calculateVacationAccrual(emp.monthlySalary);
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        personalId: emp.personalId,
        grossPay: emp.monthlySalary,
        taxRateApproximated: Math.round((tax / emp.monthlySalary) * 100),
        taxAmount: tax,
        employerContribution: ag,
        netPay: emp.monthlySalary - tax,
        vacationAccrual: vac,
        taxTable: emp.taxTable,
      };
    });

    const totalGross = lines.reduce((s, l) => s + l.grossPay, 0);
    const totalTax = lines.reduce((s, l) => s + l.taxAmount, 0);
    const totalAg = lines.reduce((s, l) => s + l.employerContribution, 0);
    const totalNet = lines.reduce((s, l) => s + l.netPay, 0);
    const totalVac = lines.reduce((s, l) => s + l.vacationAccrual, 0);

    const initialRun: PayrollRun = {
      id: 'pr-2026-09',
      companyId: 'norrstrom-bygg-ab',
      period: '2026-09',
      payDate: '2026-09-25',
      status: 'Utbetald',
      lines,
      totalGross,
      totalTax,
      totalEmployerContribution: totalAg,
      totalNet,
      totalVacationAccrual: totalVac,
      agiExported: true,
      journalEntryId: 'ver-9',
      createdAt: '2026-09-20 14:00',
    };

    return [initialRun];
  });

  const [yearEndState, setYearEndState] = useState<YearEndState>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.YEAR_END);
    return saved ? JSON.parse(saved) : INITIAL_YEAR_END_STATE;
  });

  const [integrations, setIntegrations] = useState<IntegrationStatus[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INTEGRATIONS);
    return saved ? JSON.parse(saved) : SEED_INTEGRATIONS;
  });

  const [auditLog, setAuditLog] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOG;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sync state to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, activeCompanyId);
  }, [activeCompanyId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK_TRANSACTIONS, JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYROLL_RUNS, JSON.stringify(payrollRuns));
  }, [payrollRuns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.YEAR_END, JSON.stringify(yearEndState));
  }, [yearEndState]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTEGRATIONS, JSON.stringify(integrations));
  }, [integrations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(auditLog));
  }, [auditLog]);

  // Active company object
  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0];

  const setActiveCompanyId = (id: string) => {
    setActiveCompanyIdState(id);
    const targetComp = companies.find(c => c.id === id);
    if (targetComp) {
      addToast({
        title: 'Företag växlat',
        message: `Arbetar nu i ${targetComp.name} (${targetComp.orgNr})`,
        type: 'info',
      });
      addAuditItem('Växlade aktivt företag', `Valde ${targetComp.name}`, id);
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    if (user.role === 'Client') {
      setIsClientView(true);
      setActiveCompanyIdState('norrstrom-bygg-ab');
    } else {
      setIsClientView(false);
    }
    addToast({
      title: 'Användare bytt',
      message: `Inloggad som ${user.name} (${user.role})`,
      type: 'info',
    });
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAuditItem = (action: string, details: string, companyIdOverride?: string) => {
    const targetCompId = companyIdOverride || activeCompanyId;
    const targetComp = companies.find(c => c.id === targetCompId);
    const newItem: AuditLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      companyName: targetComp ? targetComp.name : 'Okänt bolag',
      companyId: targetCompId,
    };
    setAuditLog(prev => [newItem, ...prev]);
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
    // Hard validation: debit must equal credit
    const totalDebit = entry.rows.reduce((sum, r) => sum + (Number(r.debit) || 0), 0);
    const totalCredit = entry.rows.reduce((sum, r) => sum + (Number(r.credit) || 0), 0);

    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.01) {
      const err = `Verifikationen balanserar inte. Debet (${totalDebit.toFixed(2)} kr) skiljer sig från Kredit (${totalCredit.toFixed(2)} kr) med ${diff.toFixed(2)} kr.`;
      addToast({ title: 'Kunde inte spara', message: err, type: 'error' });
      return { success: false, error: err };
    }

    if (entry.rows.length < 2) {
      const err = 'En verifikation måste innehålla minst två rader.';
      addToast({ title: 'Valideringsfel', message: err, type: 'error' });
      return { success: false, error: err };
    }

    // Determine next voucher number in series
    const companyEntries = journalEntries.filter(j => j.companyId === entry.companyId && j.series === entry.series);
    const nextNum = companyEntries.length + 1;
    const verNum = `${entry.series}${nextNum}`;

    const newEntry: JournalEntry = {
      ...entry,
      id: `ver-${Date.now()}`,
      verNum,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setJournalEntries(prev => [newEntry, ...prev]);
    addAuditItem('Bokförde verifikation', `Verifikation ${verNum}: ${entry.description} (${totalDebit.toFixed(2)} kr)`);
    addToast({
      title: 'Verifikation sparad',
      message: `${verNum} bokförd med ${entry.rows.length} konteringsrader.`,
      type: 'success',
    });

    return { success: true };
  };

  const deleteJournalEntry = (id: string) => {
    const entry = journalEntries.find(j => j.id === id);
    if (entry) {
      setJournalEntries(prev => prev.filter(j => j.id !== id));
      addAuditItem('Tog bort verifikation', `Tog bort verifikation ${entry.verNum} (${entry.description})`);
      addToast({
        title: 'Verifikation borttagen',
        message: `${entry.verNum} har makulerats ur verifikationslistan.`,
        type: 'info',
      });
    }
  };

  const matchBankTransaction = (id: string, verId?: string) => {
    setBankTransactions(prev =>
      prev.map(t => {
        if (t.id === id) {
          return { ...t, matched: true, matchedVerId: verId || `ver-${Date.now()}` };
        }
        return t;
      })
    );
    addAuditItem('Banktransaktion matchad', `Transaktion ID ${id} matchades mot bokföring.`);
    addToast({
      title: 'Transaktion matchad',
      message: 'Bankposten är nu avstämd mot huvudboken.',
      type: 'success',
    });
  };

  const createAndMatchBankTransaction = (transId: string, accountNum: number) => {
    const trans = bankTransactions.find(t => t.id === transId);
    if (!trans) return;

    const isDeposit = trans.amount > 0;
    const absAmount = Math.abs(trans.amount);

    // Auto-create journal voucher
    const rows = isDeposit
      ? [
          { id: 'r1', account: 1930, accountName: 'Företagskonto / Checkkonto', debit: absAmount, credit: 0 },
          { id: 'r2', account: accountNum, accountName: `Konto ${accountNum}`, debit: 0, credit: absAmount },
        ]
      : [
          { id: 'r1', account: accountNum, accountName: `Konto ${accountNum}`, debit: absAmount, credit: 0 },
          { id: 'r2', account: 1930, accountName: 'Företagskonto / Checkkonto', debit: 0, credit: absAmount },
        ];

    const result = addJournalEntry({
      companyId: activeCompanyId,
      verNum: '',
      series: 'A',
      date: trans.date,
      description: `Bankhändelse: ${trans.description}`,
      rows,
      createdBy: currentUser.name,
      status: 'Bokförd',
      source: 'Bankimport',
    });

    if (result.success) {
      matchBankTransaction(transId);
    }
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees(prev => prev.map(e => (e.id === emp.id ? emp : e)));
    addAuditItem('Uppdaterade anställd', `Ändrade data för ${emp.name} (${emp.role})`);
    addToast({
      title: 'Anställd sparad',
      message: `Uppgifterna för ${emp.name} har uppdaterats.`,
      type: 'success',
    });
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
    };
    setEmployees(prev => [...prev, newEmp]);
    addAuditItem('Ny anställd registrerad', `Lade till ${newEmp.name} (${newEmp.role})`);
    addToast({
      title: 'Anställd tillagd',
      message: `${newEmp.name} registrerad i anställningsregistret.`,
      type: 'success',
    });
  };

  const createPayrollRun = (period: string, payDate: string): PayrollRun => {
    const companyEmployees = employees.filter(e => e.companyId === activeCompanyId && e.active);

    const lines = companyEmployees.map(emp => {
      const tax = calculatePreliminaryTax(emp.monthlySalary, emp.taxTable, emp.taxColumn);
      const ag = calculateEmployerContribution(emp.monthlySalary);
      const vac = calculateVacationAccrual(emp.monthlySalary);
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        personalId: emp.personalId,
        grossPay: emp.monthlySalary,
        taxRateApproximated: Math.round((tax / emp.monthlySalary) * 100),
        taxAmount: tax,
        employerContribution: ag,
        netPay: emp.monthlySalary - tax,
        vacationAccrual: vac,
        taxTable: emp.taxTable,
      };
    });

    const totalGross = lines.reduce((s, l) => s + l.grossPay, 0);
    const totalTax = lines.reduce((s, l) => s + l.taxAmount, 0);
    const totalAg = lines.reduce((s, l) => s + l.employerContribution, 0);
    const totalNet = lines.reduce((s, l) => s + l.netPay, 0);
    const totalVac = lines.reduce((s, l) => s + l.vacationAccrual, 0);

    const newRun: PayrollRun = {
      id: `pr-${period}`,
      companyId: activeCompanyId,
      period,
      payDate,
      status: 'Klarmarkerad',
      lines,
      totalGross,
      totalTax,
      totalEmployerContribution: totalAg,
      totalNet,
      totalVacationAccrual: totalVac,
      agiExported: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setPayrollRuns(prev => [newRun, ...prev.filter(r => r.period !== period || r.companyId !== activeCompanyId)]);
    addAuditItem('Skapade lönekörning', `Genererade lönekörning för period ${period} (${companyEmployees.length} anställda)`);
    addToast({
      title: 'Lönekörning genererad',
      message: `Löneutbetalning för ${period} beräknad. Brutto: ${totalGross.toLocaleString('sv-SE')} kr.`,
      type: 'success',
    });

    return newRun;
  };

  const lockAndPayPayrollRun = (id: string) => {
    const run = payrollRuns.find(r => r.id === id);
    if (!run) return;

    // Auto-create journal voucher for payroll:
    // Debit 7010 (Löner tjm) / 7210 (Löner koll), Debit 7510 (Arbetsgivaravgift)
    // Credit 2710 (Personalens källskatt), Credit 2731 (Soc avg), Credit 1930 (Nettolön utbetalning)
    const journalResult = addJournalEntry({
      companyId: run.companyId,
      verNum: '',
      series: 'L',
      date: run.payDate,
      description: `Löneutbetalning period ${run.period} (${run.lines.length} anställda)`,
      rows: [
        { id: 'r1', account: 7010, accountName: 'Löner till tjänstemän', debit: Math.round(run.totalGross * 0.55), credit: 0 },
        { id: 'r2', account: 7210, accountName: 'Löner till kollektivanställda', debit: Math.round(run.totalGross * 0.45), credit: 0 },
        { id: 'r3', account: 7510, accountName: 'Lagstadgade sociala avgifter (31,42%)', debit: run.totalEmployerContribution, credit: 0 },
        { id: 'r4', account: 2710, accountName: 'Personalskatt', debit: 0, credit: run.totalTax },
        { id: 'r5', account: 2731, accountName: 'Avräkning lagstadgade sociala avgifter', debit: 0, credit: run.totalEmployerContribution },
        { id: 'r6', account: 1930, accountName: 'Företagskonto / Checkkonto / Bank', debit: 0, credit: run.totalNet },
      ],
      createdBy: currentUser.name,
      status: 'Bokförd',
      source: 'Lön',
    });

    setPayrollRuns(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'Utbetald', agiExported: true } : r))
    );

    addAuditItem('Lönekörning utbetald', `Lön för ${run.period} utbetald och automatiskt bokförd.`);
    addToast({
      title: 'Lön utbetald & bokförd',
      message: `Lönekörning ${run.period} bokförd under serie L. Bankfil och AGI klara.`,
      type: 'success',
    });
  };

  const updateYearEndState = (updater: Partial<YearEndState>) => {
    setYearEndState(prev => ({
      ...prev,
      ...updater,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
    }));
    addAuditItem('Bokslutssteg uppdaterat', 'Uppdaterade bokslutsstatus för aktuellt räkenskapsår.');
  };

  const signYearEnd = (signerId: string) => {
    const signer = yearEndState.signers.find(s => s.id === signerId);
    if (!signer) return;

    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const updatedSigners = yearEndState.signers.map(s => {
      if (s.id === signerId) {
        return {
          ...s,
          status: 'Signerad' as const,
          signedAt: `${timeStr} via BankID`,
          bankIdReference: `bid-${Date.now()}`,
        };
      }
      return s;
    });

    const allSigned = updatedSigners.every(s => s.status === 'Signerad');

    setYearEndState(prev => ({
      ...prev,
      signers: updatedSigners,
      status: allSigned ? 'Undertecknad' : 'Pågående',
      lastUpdated: timeStr,
    }));

    addAuditItem('BankID-signering', `${signer.name} undertecknade K2-årsredovisningen med Mobilt BankID.`);
    addToast({
      title: 'BankID-signatur mottagen',
      message: `${signer.name} har framgångsrikt signerat årsredovisningen.`,
      type: 'success',
    });
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextState = !item.connected;
          const statusText = nextState ? 'Ansluten och verifierad' : 'Frånkopplad av användare';
          return { ...item, connected: nextState, statusText, lastSync: 'Nyss' };
        }
        return item;
      })
    );
    addAuditItem('Ändrade integrationsstatus', `Växlade koppling för integration: ${id}`);
    addToast({
      title: 'Integration uppdaterad',
      message: `Status för integration har ändrats.`,
      type: 'info',
    });
  };

  const updateUserRole = (userId: string, role: User['role']) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role } : u)));
    addAuditItem('Ändrade användarbehörighet', `Tilldelade rollen ${role} till användar-ID ${userId}`);
    addToast({
      title: 'Behörighet ändrad',
      message: `Användarens roll har uppdaterats till ${role}.`,
      type: 'success',
    });
  };

  const toggleUserActive = (userId: string) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, active: !u.active } : u)));
    addToast({
      title: 'Användarstatus ändrad',
      message: `Användarens konto har uppdaterats.`,
      type: 'info',
    });
  };

  const resetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <AccountingContext.Provider
      value={{
        companies,
        activeCompanyId,
        activeCompany,
        setActiveCompanyId,
        currentUser,
        setCurrentUser,
        users,
        updateUserRole,
        toggleUserActive,
        isClientView,
        setIsClientView,
        journalEntries,
        addJournalEntry,
        deleteJournalEntry,
        bankTransactions,
        matchBankTransaction,
        createAndMatchBankTransaction,
        employees,
        updateEmployee,
        addEmployee,
        payrollRuns,
        createPayrollRun,
        lockAndPayPayrollRun,
        yearEndState,
        updateYearEndState,
        signYearEnd,
        integrations,
        toggleIntegration,
        auditLog,
        toasts,
        addToast,
        removeToast,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        resetAllData,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
