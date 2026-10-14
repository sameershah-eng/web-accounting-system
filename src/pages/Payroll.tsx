import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Users, 
  FileText, 
  Download, 
  Printer, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Building2,
  Clock,
  ArrowRight,
  User,
  Sparkles
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { formatSEK, formatDate, maskPersonnummer, downloadFile } from '../lib/formatters';
import { generateAgiXml, calculatePreliminaryTax, calculateEmployerContribution, calculateVacationAccrual } from '../lib/swedishTax';
import { Employee, PayrollRun, PayrollLine } from '../types';

export const Payroll: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'korning';

  const { 
    activeCompany, 
    employees, 
    addEmployee, 
    updateEmployee, 
    payrollRuns, 
    createPayrollRun, 
    lockAndPayPayrollRun 
  } = useAccounting();

  const tabs = [
    { id: 'korning', label: 'Lönekörning' },
    { id: 'anstallda', label: 'Anställda' },
    { id: 'specifikation', label: 'Lönespecifikation (PDF/Print)' },
    { id: 'agi', label: 'AGI Arbetsgivardeklaration' },
  ];

  const setTab = (id: string) => {
    setSearchParams({ tab: id });
  };

  // Company employees
  const companyEmployees = useMemo(() => {
    return employees.filter(e => e.companyId === activeCompany.id);
  }, [employees, activeCompany.id]);

  // Selected payslip employee
  const [selectedPayslipEmpId, setSelectedPayslipEmpId] = useState<string>(
    companyEmployees[0]?.id || ''
  );

  // New Payroll Run Wizard state
  const [wizardPeriod, setWizardPeriod] = useState('2026-10');
  const [wizardPayDate, setWizardPayDate] = useState('2026-10-25');
  const [showRunConfirm, setShowRunConfirm] = useState(false);

  // Latest payroll run for active company
  const latestRun = useMemo(() => {
    return payrollRuns.find(r => r.companyId === activeCompany.id) || payrollRuns[0];
  }, [payrollRuns, activeCompany.id]);

  // Selected employee for payslip
  const payslipEmployee = useMemo(() => {
    return companyEmployees.find(e => e.id === selectedPayslipEmpId) || companyEmployees[0];
  }, [companyEmployees, selectedPayslipEmpId]);

  // Calculated payslip figures
  const payslipData = useMemo(() => {
    if (!payslipEmployee) return null;
    const gross = payslipEmployee.monthlySalary;
    const tax = calculatePreliminaryTax(gross, payslipEmployee.taxTable, payslipEmployee.taxColumn);
    const ag = calculateEmployerContribution(gross);
    const vac = calculateVacationAccrual(gross);
    const net = gross - tax;
    return { gross, tax, ag, vac, net };
  }, [payslipEmployee]);

  // New employee modal
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPnr, setNewEmpPnr] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState(38000);
  const [newEmpTaxTable, setNewEmpTaxTable] = useState(31);

  const handleCreateNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpPnr) return;

    addEmployee({
      companyId: activeCompany.id,
      name: newEmpName,
      personalId: newEmpPnr,
      role: newEmpRole || 'Anställd',
      email: `${newEmpName.toLowerCase().replace(/\s+/g, '.')}@${activeCompany.name.toLowerCase().replace(/[^a-z]/g, '')}.se`,
      monthlySalary: Number(newEmpSalary) || 30000,
      taxTable: Number(newEmpTaxTable) || 31,
      taxColumn: 1,
      vacationDaysTotal: 25,
      vacationDaysUsed: 0,
      vacationDebt: Math.round(Number(newEmpSalary) * 0.12 * 2),
      bankAccount: '9020 1234567',
      clearingNumber: '5234',
      employmentDate: '2026-10-01',
      active: true,
    });

    setShowAddEmpModal(false);
    setNewEmpName('');
    setNewEmpPnr('');
  };

  const handleRunPayroll = () => {
    createPayrollRun(wizardPeriod, wizardPayDate);
    setShowRunConfirm(false);
  };

  const handleExportAgiXml = () => {
    if (!latestRun) return;
    const lines = latestRun.lines.map(l => ({
      personalId: l.personalId.replace('-', ''),
      employeeName: l.employeeName,
      grossPay: l.grossPay,
      taxAmount: l.taxAmount,
      employerContribution: l.employerContribution,
    }));
    const xml = generateAgiXml(activeCompany, latestRun.period, lines);
    downloadFile(`AGI_${activeCompany.orgNr}_${latestRun.period}.xml`, xml, 'application/xml');
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>Lönemodul</span>
            <span>·</span>
            <span className="font-mono">{activeCompany.name} ({activeCompany.orgNr})</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14161A]">
            Lönehantering & AGI
          </h1>
          <p className="text-xs sm:text-sm text-[#535862] mt-0.5">
            Skatteverkets preliminärskattetabeller (29–42), lagstadgade sociala avgifter (31,42%) och semesterskuld.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('korning')}
            className="px-3.5 py-2 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 hover:opacity-95 transition-all"
          >
            <DollarSign className="w-4 h-4" />
            Ny lönekörning
          </button>
        </div>
      </div>

      {/* Sub-tabs row */}
      <div className="border-b border-[#E7E5E0] bg-white rounded-xl p-1 shadow-xs flex items-center gap-1 overflow-x-auto no-print">
        {tabs.map((t) => {
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                isActive 
                  ? 'bg-neutral-100 text-[#14161A] font-semibold' 
                  : 'text-[#717680] hover:text-[#14161A] hover:bg-neutral-50'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: LÖNEKÖRNING (PAYROLL RUNS & WIZARD) */}
      {currentTab === 'korning' && (
        <div className="space-y-6 no-print">
          
          {/* Active Period Card / Wizard Trigger */}
          <div className="bg-white p-6 rounded-xl border border-[#E7E5E0] shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E0]">
              <div>
                <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider block">
                  Kommande lönekörning
                </span>
                <h3 className="text-lg font-bold text-[#14161A] mt-0.5">
                  Löneutbetalning {wizardPeriod}
                </h3>
                <p className="text-xs text-[#717680]">
                  Gäller {companyEmployees.length} aktiva medarbetare på {activeCompany.name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs">
                  <span className="text-[#717680] block text-[11px]">Period</span>
                  <input
                    type="month"
                    value={wizardPeriod}
                    onChange={(e) => setWizardPeriod(e.target.value)}
                    className="py-1 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded text-xs font-mono font-semibold"
                  />
                </div>
                <div className="text-xs">
                  <span className="text-[#717680] block text-[11px]">Utbetalningsdag</span>
                  <input
                    type="date"
                    value={wizardPayDate}
                    onChange={(e) => setWizardPayDate(e.target.value)}
                    className="py-1 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded text-xs font-mono font-semibold"
                  />
                </div>
                <button
                  onClick={() => setShowRunConfirm(true)}
                  className="px-4 py-2 mt-4 sm:mt-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 self-end"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Beräkna & Förhandsgranska
                </button>
              </div>
            </div>

            {/* Employee Preview Summary for next run */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAFAF8] border-b border-[#E7E5E0] text-[#535862]">
                    <th className="py-2.5 px-3">Anställd</th>
                    <th className="py-2.5 px-3 font-mono">Personnummer</th>
                    <th className="py-2.5 px-3 font-mono">Skattetabell</th>
                    <th className="py-2.5 px-3 text-right font-mono">Månadslön</th>
                    <th className="py-2.5 px-3 text-right font-mono">Prel. skatt</th>
                    <th className="py-2.5 px-3 text-right font-mono">Arbetsgivaravg. (31,42%)</th>
                    <th className="py-2.5 px-3 text-right font-mono font-bold">Nettolön</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EFEA]">
                  {companyEmployees.map((emp) => {
                    const tax = calculatePreliminaryTax(emp.monthlySalary, emp.taxTable, emp.taxColumn);
                    const ag = calculateEmployerContribution(emp.monthlySalary);
                    const net = emp.monthlySalary - tax;
                    return (
                      <tr key={emp.id} className="hover:bg-[#FAFAF8]">
                        <td className="py-2.5 px-3 font-semibold text-[#14161A]">
                          {emp.name}
                          <div className="text-[11px] text-[#717680] font-normal">{emp.role}</div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#717680]">{maskPersonnummer(emp.personalId)}</td>
                        <td className="py-2.5 px-3 font-mono text-[#535862]">Tabell {emp.taxTable} (Kol 1)</td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatSEK(emp.monthlySalary)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#535862]">-{formatSEK(tax)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#535862]">{formatSEK(ag)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{formatSEK(net)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical / Approved Payroll Runs */}
          <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6">
            <h3 className="font-semibold text-sm text-[#14161A] mb-3">
              Historiska lönekörningar
            </h3>
            <div className="space-y-3">
              {payrollRuns.filter(r => r.companyId === activeCompany.id).map((run) => (
                <div key={run.id} className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#14161A]">Lön {run.period}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        run.status === 'Utbetald' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#717680] mt-1 font-mono">
                      Utbetalningsdag: {run.payDate} · {run.lines.length} anställda
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div>
                      <span className="text-[#717680] text-[10px] block">Bruttolön</span>
                      <strong>{formatSEK(run.totalGross)}</strong>
                    </div>
                    <div>
                      <span className="text-[#717680] text-[10px] block">Arbetsgivaravgift</span>
                      <strong>{formatSEK(run.totalEmployerContribution)}</strong>
                    </div>
                    <div>
                      <span className="text-[#717680] text-[10px] block">Nettolön att utbetala</span>
                      <strong className="text-emerald-800">{formatSEK(run.totalNet)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {run.status !== 'Utbetald' ? (
                      <button
                        onClick={() => lockAndPayPayrollRun(run.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white rounded text-xs font-semibold shadow-xs hover:opacity-95"
                      >
                        Godkänn & Bokför
                      </button>
                    ) : (
                      <span className="text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 font-medium">
                        Bokförd i Serie L
                      </span>
                    )}
                    <button
                      onClick={() => setTab('specifikation')}
                      className="px-3 py-1.5 bg-white border border-[#E7E5E0] hover:bg-neutral-50 text-xs font-medium text-[#14161A] rounded"
                    >
                      Lönespecar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Running Payroll */}
      <AnimatePresence>
        {showRunConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E7E5E0] p-6"
            >
              <h3 className="text-base font-bold text-[#14161A] mb-2">
                Bekräfta lönekörning {wizardPeriod}
              </h3>
              <p className="text-xs text-[#535862] leading-relaxed mb-4">
                Systemet beräknar preliminärskatt från Skatteverkets tabell för alla {companyEmployees.length} anställda, avsätter 31,42% i arbetsgivaravgift och bokför automatiskt under serie L vid utbetalning.
              </p>

              <div className="p-3 bg-neutral-50 rounded-lg border border-[#E7E5E0] text-xs space-y-1.5 font-mono mb-4">
                <div className="flex justify-between">
                  <span>Totalt bruttobelopp:</span>
                  <strong className="text-[#14161A]">{formatSEK(companyEmployees.reduce((s, e) => s + e.monthlySalary, 0))}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Beräknad källskatt:</span>
                  <strong className="text-[#14161A]">{formatSEK(companyEmployees.reduce((s, e) => s + calculatePreliminaryTax(e.monthlySalary, e.taxTable), 0))}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Arbetsgivaravgift (31,42%):</span>
                  <strong className="text-[#14161A]">{formatSEK(companyEmployees.reduce((s, e) => s + calculateEmployerContribution(e.monthlySalary), 0))}</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowRunConfirm(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#717680] hover:text-[#14161A]"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleRunPayroll}
                  className="px-4 py-2 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs hover:opacity-95"
                >
                  Generera lönekörning
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TAB 2: ANSTÄLLDA (EMPLOYEE REGISTER) */}
      {currentTab === 'anstallda' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E0] gap-4">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">Anställningsregister</h3>
              <p className="text-xs text-[#717680]">Löneuppgifter, skattetabeller och ackumulerad semesterskuld</p>
            </div>
            <button
              onClick={() => setShowAddEmpModal(true)}
              className="px-3 py-1.5 bg-white border border-[#E7E5E0] hover:bg-neutral-50 text-xs font-medium text-[#14161A] rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#0F766E]" />
              Lägg till medarbetare
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E7E5E0] text-[#535862] font-medium">
                  <th className="py-2.5 px-4">Namn & Befattning</th>
                  <th className="py-2.5 px-4 font-mono">Personnummer</th>
                  <th className="py-2.5 px-4 font-mono">Skattetabell</th>
                  <th className="py-2.5 px-4 text-right font-mono">Månadslön</th>
                  <th className="py-2.5 px-4 text-center font-mono">Semesterdagar</th>
                  <th className="py-2.5 px-4 text-right font-mono">Semesterskuld</th>
                  <th className="py-2.5 px-4 text-right">Åtgärd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {companyEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#FAFAF8]">
                    <td className="py-3 px-4 font-semibold text-[#14161A]">
                      {emp.name}
                      <div className="text-[11px] text-[#717680] font-normal">{emp.role}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#535862]">
                      {maskPersonnummer(emp.personalId)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#535862]">
                      Tabell {emp.taxTable} (Kolumn {emp.taxColumn})
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#14161A]">
                      {formatSEK(emp.monthlySalary)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#535862]">
                      {emp.vacationDaysUsed} / {emp.vacationDaysTotal} dgr
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-amber-900 font-semibold">
                      {formatSEK(emp.vacationDebt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedPayslipEmpId(emp.id);
                          setTab('specifikation');
                        }}
                        className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium"
                      >
                        Visa lönespec
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddEmpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs no-print">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E7E5E0] p-6"
            >
              <h3 className="text-base font-bold text-[#14161A] mb-4">
                Lägg till ny anställd
              </h3>

              <form onSubmit={handleCreateNewEmployee} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#535862] font-semibold mb-1">Fullständigt namn</label>
                  <input
                    type="text"
                    required
                    placeholder="T.ex. Carl Lindqvist"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[#535862] font-semibold mb-1">Personnummer (10 eller 12 siffror)</label>
                  <input
                    type="text"
                    required
                    placeholder="19920514-3829"
                    value={newEmpPnr}
                    onChange={(e) => setNewEmpPnr(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#535862] font-semibold mb-1">Yrkesroll / Titel</label>
                  <input
                    type="text"
                    placeholder="T.ex. Snickare eller Montör"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#535862] font-semibold mb-1">Månadslön (SEK)</label>
                    <input
                      type="number"
                      value={newEmpSalary}
                      onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                      className="w-full py-1.5 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[#535862] font-semibold mb-1">Skattetabell (29-42)</label>
                    <input
                      type="number"
                      value={newEmpTaxTable}
                      onChange={(e) => setNewEmpTaxTable(Number(e.target.value))}
                      className="w-full py-1.5 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E5E0] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddEmpModal(false)}
                    className="px-3 py-1.5 text-xs text-[#717680]"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white rounded text-xs font-semibold shadow-xs"
                  >
                    Spara medarbetare
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TAB 3: LÖNESPECIFIKATION (PRINTABLE PAYSLIP) */}
      {currentTab === 'specifikation' && payslipEmployee && payslipData && (
        <div className="space-y-4">
          
          {/* Controls Bar (hidden during print) */}
          <div className="bg-white p-4 rounded-xl border border-[#E7E5E0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#535862] font-semibold">Välj medarbetare:</span>
              <select
                value={selectedPayslipEmpId}
                onChange={(e) => setSelectedPayslipEmpId(e.target.value)}
                className="text-xs py-1.5 px-3 bg-[#FAFAF8] border border-[#E7E5E0] rounded-lg font-semibold"
              >
                {companyEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} – {emp.role}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
            >
              <Printer className="w-3.5 h-3.5 text-teal-400" />
              Skriv ut / Spara som PDF
            </button>
          </div>

          {/* Printable Payslip Card (Designed to look authentic and clean on A4) */}
          <div className="bg-white p-8 sm:p-12 rounded-xl border border-[#E7E5E0] shadow-sm max-w-3xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">LÖNESPECIFIKATION</h2>
                <div className="text-xs text-slate-600 font-mono mt-1">Löneperiod: 2026-10 (Utbetalas 2026-10-25)</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-bold text-slate-900">{activeCompany.name}</div>
                <div className="font-mono text-slate-500">Org.nr: {activeCompany.orgNr}</div>
                <div className="text-slate-500">{activeCompany.city}</div>
              </div>
            </div>

            {/* Employee Meta Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Namn</span>
                <span className="font-bold text-slate-900">{payslipEmployee.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Personnummer</span>
                <span className="font-mono font-semibold text-slate-900">{maskPersonnummer(payslipEmployee.personalId)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Skattetabell</span>
                <span className="font-mono font-semibold text-slate-900">Tabell {payslipEmployee.taxTable} (Kol 1)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Bankkonto</span>
                <span className="font-mono text-slate-900">{payslipEmployee.bankAccount}</span>
              </div>
            </div>

            {/* Lines Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 font-bold text-slate-700">
                  <th className="py-2">Löneart / Beskrivning</th>
                  <th className="py-2 text-right">Antal / Sats</th>
                  <th className="py-2 text-right">Belopp (SEK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-3 font-semibold text-slate-900">1101 Månadslön ({payslipEmployee.role})</td>
                  <td className="py-3 text-right font-mono text-slate-500">100%</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-900">{formatSEK(payslipData.gross)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-slate-700">8001 Preliminärskatt enligt tabell {payslipEmployee.taxTable}</td>
                  <td className="py-3 text-right font-mono text-slate-500">-{Math.round((payslipData.tax / payslipData.gross) * 100)}%</td>
                  <td className="py-3 text-right font-mono font-semibold text-slate-900">-{formatSEK(payslipData.tax)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 font-bold text-sm">
                  <td className="py-4 text-slate-900 uppercase">Nettolön att utbetala:</td>
                  <td></td>
                  <td className="py-4 text-right font-mono text-base text-slate-900">{formatSEK(payslipData.net)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Employer info footnote & Vacation box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1">Semesterdagar</span>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Kvarvarande semesterdagar:</span>
                    <strong>{payslipEmployee.vacationDaysTotal - payslipEmployee.vacationDaysUsed} dagar</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ackumulerad semesterskuld:</span>
                    <strong>{formatSEK(payslipEmployee.vacationDebt)}</strong>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1">Arbetsgivaravgift (AGI)</span>
                <div className="space-y-1 font-mono text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Underlag för soc avgift:</span>
                    <span>{formatSEK(payslipData.gross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Arbetsgivaravgift (31,42%):</span>
                    <strong>{formatSEK(payslipData.ag)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center pt-4">
              Utbetalas via bankgiro till uppgivet konto den 25:e i månaden. Framställd med Balans Byråsystem v2026.
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: AGI ARBETSGIVARDEKLARATION */}
      {currentTab === 'agi' && latestRun && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E0] gap-4">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">
                AGI Arbetsgivardeklaration på individnivå
              </h3>
              <p className="text-xs text-[#717680]">
                Skatteverkets månatliga underlag för {activeCompany.name} (Period: {latestRun.period})
              </p>
            </div>

            <button
              onClick={handleExportAgiXml}
              className="px-3.5 py-2 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] hover:opacity-95 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Ladda ner AGI XML-fil för Skatteverket
            </button>
          </div>

          {/* Aggregated Head Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Summa avgiftspliktig ersättning
              </span>
              <span className="text-xl font-bold font-mono text-[#14161A] mt-1 block">
                {formatSEK(latestRun.totalGross)}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Summa arbetsgivaravgift (31,42%)
              </span>
              <span className="text-xl font-bold font-mono text-teal-900 mt-1 block">
                {formatSEK(latestRun.totalEmployerContribution)}
              </span>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Summa avdragen preliminärskatt
              </span>
              <span className="text-xl font-bold font-mono text-[#14161A] mt-1 block">
                {formatSEK(latestRun.totalTax)}
              </span>
            </div>
          </div>

          {/* Individual Rows (Individuppgifter) */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E7E5E0] text-[#535862]">
                  <th className="py-2.5 px-3">Mottagare</th>
                  <th className="py-2.5 px-3 font-mono">Personidentifikator</th>
                  <th className="py-2.5 px-3 text-right font-mono">Bruttoersättning</th>
                  <th className="py-2.5 px-3 text-right font-mono">Avdragen skatt</th>
                  <th className="py-2.5 px-3 text-right font-mono">Arbetsgivaravgift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {latestRun.lines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-[#FAFAF8]">
                    <td className="py-2.5 px-3 font-semibold text-[#14161A]">{line.employeeName}</td>
                    <td className="py-2.5 px-3 font-mono text-[#717680]">{maskPersonnummer(line.personalId)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium text-[#14161A]">{formatSEK(line.grossPay)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#535862]">-{formatSEK(line.taxAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#535862]">{formatSEK(line.employerContribution)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
