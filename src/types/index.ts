export type CompanyForm = 'AB' | 'EF';
export type CompanyStatus = 'Aktiv' | 'Vilande' | 'Under avveckling';
export type VatPeriod = 'Månadsvis' | 'Kvartalsvis' | 'Årsvis';
export type AccountingStandard = 'K2' | 'K3' | 'K1';

export interface Company {
  id: string;
  name: string;
  orgNr: string;
  form: CompanyForm;
  city: string;
  fiscalYear: string;
  fiscalYearEnd: string; // e.g. "12-31" or "06-30"
  status: CompanyStatus;
  contactPerson: string;
  email: string;
  phone: string;
  vatPeriod: VatPeriod;
  accountingStandard: AccountingStandard;
  bankAccount: string;
  bankName: 'SEB' | 'Swedbank' | 'Handelsbanken' | 'Nordea';
  industry: string;
  assignedAccountant: string;
  employeeCount: number;
}

export type AccountType = 
  | 'Tillgångar' 
  | 'Skulder och eget kapital' 
  | 'Rörelsens intäkter' 
  | 'Kostnader för sålda varor' 
  | 'Övriga externa kostnader' 
  | 'Personalkostnader' 
  | 'Avskrivningar' 
  | 'Finansiella poster' 
  | 'Skatter och bokslutsdispositioner';

export interface BasAccount {
  number: number;
  name: string;
  type: AccountType;
  class: number; // 1 to 8
  vatCode?: '25%' | '12%' | '6%' | '0%' | 'ingen';
  defaultVatAccount?: number;
}

export interface JournalRow {
  id: string;
  account: number;
  accountName: string;
  debit: number;
  credit: number;
  vatCode?: string;
  description?: string;
}

export interface JournalEntry {
  id: string;
  companyId: string;
  verNum: string; // e.g. "A12"
  series: string; // 'A' | 'B' | 'L'
  date: string;
  description: string;
  rows: JournalRow[];
  attachments?: { name: string; size: string; date: string }[];
  createdBy: string;
  createdAt: string;
  status: 'Bokförd' | 'Preliminär';
  source?: 'Manuell' | 'Bankimport' | 'Lön' | 'Bokslut';
}

export interface BankTransaction {
  id: string;
  companyId: string;
  date: string;
  amount: number; // positive = credit/deposit, negative = debit/payment
  description: string;
  bank: 'SEB' | 'Swedbank' | 'Handelsbanken' | 'Nordea';
  reference: string;
  matched: boolean;
  matchedVerId?: string;
  suggestedAccount?: number;
  suggestedAccountName?: string;
  confidence?: 'Hög' | 'Medel' | 'Låg';
}

export interface Employee {
  id: string;
  companyId: string;
  name: string;
  personalId: string; // e.g. "19870314-****"
  role: string;
  email: string;
  monthlySalary: number;
  hourlyRate?: number;
  taxTable: number; // 29 - 42
  taxColumn: number; // 1 or 2
  vacationDaysTotal: number;
  vacationDaysUsed: number;
  vacationDebt: number; // Semesterskuld i kr
  bankAccount: string;
  clearingNumber: string;
  employmentDate: string;
  active: boolean;
}

export interface PayrollLine {
  employeeId: string;
  employeeName: string;
  role: string;
  personalId: string;
  grossPay: number;
  taxRateApproximated: number;
  taxAmount: number;
  employerContribution: number; // 31.42%
  netPay: number;
  vacationAccrual: number; // 12% semesterskuldstillväxt
  taxTable: number;
}

export interface PayrollRun {
  id: string;
  companyId: string;
  period: string; // e.g. "2026-09"
  payDate: string;
  status: 'Utkast' | 'Klarmarkerad' | 'Utbetald' | 'Bokförd';
  lines: PayrollLine[];
  totalGross: number;
  totalTax: number;
  totalEmployerContribution: number;
  totalNet: number;
  totalVacationAccrual: number;
  agiExported: boolean;
  journalEntryId?: string;
  createdAt: string;
}

export interface YearEndSigner {
  id: string;
  name: string;
  role: string;
  personnummer: string;
  status: 'Väntar' | 'Signerad' | 'Avvisad';
  signedAt?: string;
  bankIdReference?: string;
}

export interface YearEndState {
  companyId: string;
  fiscalYear: string;
  status: 'Ej påbörjad' | 'Pågående' | 'Granskad' | 'Undertecknad' | 'Inlämnad';
  currentStep: number;
  reconciliationDone: boolean;
  depreciationDone: boolean;
  accrualsDone: boolean;
  taxCalculationDone: boolean;
  closingEntryDone: boolean;
  annualReportApproved: boolean;
  signers: YearEndSigner[];
  taxExpense: number;
  netProfit: number;
  lastUpdated: string;
}

export type UserRole = 'Admin' | 'Senior Accountant' | 'Accountant' | 'Client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  assignedCompanies?: string[]; // for Client role
  active: boolean;
  lastLogin: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  companyName: string;
  companyId: string;
}

export interface IntegrationStatus {
  id: 'skatteverket' | 'bolagsverket' | 'forsakringskassan' | 'openbanking';
  name: string;
  subtitle: string;
  connected: boolean;
  lastSync: string;
  statusText: string;
  apiType: string;
}
