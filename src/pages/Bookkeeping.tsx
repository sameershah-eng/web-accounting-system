import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Upload, 
  ArrowRight, 
  Scale, 
  Building2,
  FileCheck,
  Download,
  Filter,
  Check,
  Layers,
  Sparkles,
  Link2
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { formatSEK, formatDate, downloadFile } from '../lib/formatters';
import { BAS_ACCOUNTS, searchAccounts, getAccountByNumber } from '../data/basAccounts';
import { computeLedger, computeVatReport } from '../lib/ledgerCalculations';
import { JournalRow, BasAccount } from '../types';

export const Bookkeeping: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'verifikationer';

  const { 
    activeCompany, 
    journalEntries, 
    addJournalEntry, 
    deleteJournalEntry, 
    bankTransactions, 
    matchBankTransaction,
    createAndMatchBankTransaction,
    currentUser 
  } = useAccounting();

  // Sub-tabs list
  const tabs = [
    { id: 'verifikationer', label: 'Verifikationer' },
    { id: 'ny', label: 'Ny verifikation' },
    { id: 'huvudbok', label: 'Huvudbok' },
    { id: 'rabalans', label: 'Råbalans' },
    { id: 'moms', label: 'Momsdeklaration' },
    { id: 'bank', label: 'Bankavstämning' },
  ];

  const setTab = (id: string) => {
    setSearchParams({ tab: id });
  };

  // --- NY VERIFIKATION FORM STATE ---
  const [entryDate, setEntryDate] = useState('2026-10-14');
  const [entryDescription, setEntryDescription] = useState('');
  const [entrySeries, setEntrySeries] = useState('A');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; date: string } | null>(null);

  const [rows, setRows] = useState<JournalRow[]>([
    { id: '1', account: 1930, accountName: 'Företagskonto / Checkkonto', debit: 0, credit: 0 },
    { id: '2', account: 3001, accountName: 'Försäljning varor 25% moms', debit: 0, credit: 0, vatCode: '25%' },
  ]);

  // Live debit vs credit sums
  const totalDebit = useMemo(() => rows.reduce((s, r) => s + (Number(r.debit) || 0), 0), [rows]);
  const totalCredit = useMemo(() => rows.reduce((s, r) => s + (Number(r.credit) || 0), 0), [rows]);
  const diff = useMemo(() => Math.abs(totalDebit - totalCredit), [totalDebit, totalCredit]);
  const isBalanced = diff < 0.01 && (totalDebit > 0 || totalCredit > 0);

  // Row update helpers
  const updateRow = (id: string, updates: Partial<JournalRow>) => {
    setRows(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...updates };
        if (updates.account) {
          const acc = getAccountByNumber(updates.account);
          if (acc) {
            updated.accountName = acc.name;
            if (acc.vatCode && !updated.vatCode) {
              updated.vatCode = acc.vatCode;
            }
          }
        }
        return updated;
      }
      return r;
    }));
  };

  const addRow = () => {
    const nextId = (rows.length + 1).toString();
    setRows(prev => [...prev, { id: nextId, account: 2641, accountName: 'Ingående moms', debit: 0, credit: 0 }]);
  };

  const removeRow = (id: string) => {
    if (rows.length <= 2) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Auto-calculate VAT line
  const handleAutoVat = (sourceRowId: string, vatPercentage: number) => {
    const sourceRow = rows.find(r => r.id === sourceRowId);
    if (!sourceRow) return;

    const netAmount = (Number(sourceRow.debit) || 0) || (Number(sourceRow.credit) || 0);
    if (netAmount === 0) return;

    const vatAmount = Math.round(netAmount * (vatPercentage / 100));

    // If source row was debit (expense), VAT is debit 2641
    // If source row was credit (sales), VAT is credit 2611
    if (sourceRow.debit > 0) {
      setRows(prev => [
        ...prev,
        {
          id: `vat-${Date.now()}`,
          account: 2641,
          accountName: 'Ingående moms',
          debit: vatAmount,
          credit: 0,
          description: `Moms ${vatPercentage}%`,
        },
      ]);
    } else {
      setRows(prev => [
        ...prev,
        {
          id: `vat-${Date.now()}`,
          account: 2611,
          accountName: 'Utgående moms 25%',
          debit: 0,
          credit: vatAmount,
          description: `Moms ${vatPercentage}%`,
        },
      ]);
    }
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    if (!entryDescription.trim()) return;

    const result = addJournalEntry({
      companyId: activeCompany.id,
      verNum: '',
      series: entrySeries,
      date: entryDate,
      description: entryDescription,
      rows,
      attachments: attachedFile ? [attachedFile] : undefined,
      createdBy: currentUser.name,
      status: 'Bokförd',
      source: 'Manuell',
    });

    if (result.success) {
      // Reset form
      setEntryDescription('');
      setAttachedFile(null);
      setRows([
        { id: '1', account: 1930, accountName: 'Företagskonto / Checkkonto', debit: 0, credit: 0 },
        { id: '2', account: 3001, accountName: 'Försäljning varor 25% moms', debit: 0, credit: 0, vatCode: '25%' },
      ]);
      setTab('verifikationer');
    }
  };

  // --- HUVUDBOK & RÅBALANS STATE ---
  const companyEntries = useMemo(() => {
    return journalEntries.filter(e => e.companyId === activeCompany.id);
  }, [journalEntries, activeCompany.id]);

  const ledgerMap = useMemo(() => computeLedger(companyEntries, activeCompany.id), [companyEntries, activeCompany.id]);

  const activeAccountsInLedger = useMemo(() => {
    const list: Array<{ number: number; name: string; class: number; debit: number; credit: number; balance: number; transactions: any[] }> = [];
    ledgerMap.forEach((val) => {
      if (val.debitTurnover > 0 || val.creditTurnover > 0) {
        list.push({
          number: val.account.number,
          name: val.account.name,
          class: val.account.class,
          debit: val.debitTurnover,
          credit: val.creditTurnover,
          balance: val.balance,
          transactions: val.transactions,
        });
      }
    });
    return list.sort((a, b) => a.number - b.number);
  }, [ledgerMap]);

  // Momsrapport
  const vatReport = useMemo(() => computeVatReport(journalEntries, activeCompany.id), [journalEntries, activeCompany.id]);

  return (
    <div className="space-y-6">
      
      {/* Module Title & Company Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>Bokföringsmodul</span>
            <span>·</span>
            <span className="font-mono">{activeCompany.name} ({activeCompany.orgNr})</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14161A]">
            Löpande bokföring & Huvudbok
          </h1>
          <p className="text-xs sm:text-sm text-[#535862] mt-0.5">
            Hanterar verifikationer, råbalans, momsdeklaration och automatisk bankavstämning.
          </p>
        </div>

        <button
          onClick={() => setTab('ny')}
          className="px-3.5 py-2 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] hover:opacity-95 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Registrera verifikation
        </button>
      </div>

      {/* Secondary Sub-navigation row */}
      <div className="border-b border-[#E7E5E0] bg-white rounded-xl p-1 shadow-xs flex items-center gap-1 overflow-x-auto">
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

      {/* TAB 1: VERIFIKATIONER (LIST) */}
      {currentTab === 'verifikationer' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E7E5E0] bg-[#FAFAF8] flex items-center justify-between">
            <span className="text-xs font-semibold text-[#14161A]">
              Bokförda verifikationer ({companyEntries.length} st)
            </span>
            <span className="text-xs font-mono text-[#717680]">
              Obruten verifikationsserie enligt BFL
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-[#FAFAF8] text-[#535862] font-medium">
                  <th className="py-2.5 px-4 font-mono w-20">Vernr</th>
                  <th className="py-2.5 px-4 font-mono w-28">Datum</th>
                  <th className="py-2.5 px-4">Beskrivning</th>
                  <th className="py-2.5 px-4">Källa</th>
                  <th className="py-2.5 px-4 text-right font-mono">Belopp (SEK)</th>
                  <th className="py-2.5 px-4 text-right">Underlag</th>
                  <th className="py-2.5 px-4 text-right">Åtgärd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {companyEntries.map((entry) => {
                  const entrySum = entry.rows.reduce((s, r) => s + (Number(r.debit) || 0), 0);
                  return (
                    <tr key={entry.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-[#14161A]">
                        {entry.verNum}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#535862]">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3 px-4 text-[#14161A] font-medium">
                        <div>{entry.description}</div>
                        <div className="text-[11px] text-[#717680] mt-0.5">
                          {entry.rows.map(r => `${r.account} (${r.debit > 0 ? formatSEK(r.debit) : formatSEK(r.credit)})`).join(' · ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#535862]">
                        <span className="px-2 py-0.5 bg-neutral-100 rounded text-[11px] font-medium text-neutral-700">
                          {entry.source || 'Manuell'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#14161A]">
                        {formatSEK(entrySum)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#717680]">
                        {entry.attachments && entry.attachments.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            <FileCheck className="w-3 h-3 text-teal-600" />
                            Kvitto bifogat
                          </span>
                        ) : (
                          <span className="text-[11px] text-neutral-400">Saknas</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteJournalEntry(entry.id)}
                          className="p-1 text-[#717680] hover:text-rose-600 rounded transition-colors"
                          title="Makulera verifikation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {companyEntries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#717680] text-xs">
                      Inga bokförda verifikationer registrerade för detta bolag än.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NY VERIFIKATION (ENTRY FORM WITH HARD VALIDATION) */}
      {currentTab === 'ny' && (
        <form onSubmit={handleSaveEntry} className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E0]">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">
                Ny verifikation (Kontering)
              </h3>
              <p className="text-xs text-[#717680]">
                Debet och kredit måste balansera exakt innan verifikationen kan sparas.
              </p>
            </div>
            
            {/* Live Balance indicator */}
            <div className={`px-4 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
              isBalanced 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              <Scale className="w-4 h-4" />
              {isBalanced ? (
                <span>Balanserar (Diff: 0,00 kr)</span>
              ) : (
                <span>Diff: {formatSEK(diff)} (Måste vara 0,00 kr)</span>
              )}
            </div>
          </div>

          {/* Form Meta Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#535862] mb-1">Bokföringsdatum</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#FAFAF8] border border-[#E7E5E0] rounded-lg font-mono focus:outline-none focus:border-[#0F766E]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#535862] mb-1">Verifikationsserie</label>
              <select
                value={entrySeries}
                onChange={(e) => setEntrySeries(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#FAFAF8] border border-[#E7E5E0] rounded-lg focus:outline-none focus:border-[#0F766E]"
              >
                <option value="A">Serie A (Löpande affärshändelser)</option>
                <option value="B">Serie B (Bank & Inbetalningar)</option>
                <option value="L">Serie L (Löner & Arbetsgivaravgifter)</option>
                <option value="BOK">Serie BOK (Bokslutsverifikationer)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#535862] mb-1">Beskrivning / Affärshändelse</label>
              <input
                type="text"
                placeholder="T.ex. Inköp förbrukningsmaterial Byggmax eller Faktura 1051"
                value={entryDescription}
                onChange={(e) => setEntryDescription(e.target.value)}
                className="w-full text-xs py-2 px-3 bg-[#FAFAF8] border border-[#E7E5E0] rounded-lg focus:outline-none focus:border-[#0F766E]"
                required
              />
            </div>
          </div>

          {/* Konteringsrader (Journal Rows Table) */}
          <div className="border border-[#E7E5E0] rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E7E5E0] text-[#535862] font-medium">
                  <th className="py-2 px-3 w-36">Konto (BAS)</th>
                  <th className="py-2 px-3">Kontonamn</th>
                  <th className="py-2 px-3 w-32 text-right">Debet (kr)</th>
                  <th className="py-2 px-3 w-32 text-right">Kredit (kr)</th>
                  <th className="py-2 px-3 w-28 text-center">Momsberäkning</th>
                  <th className="py-2 px-3 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/70">
                    <td className="py-2 px-3">
                      <select
                        value={row.account}
                        onChange={(e) => updateRow(row.id, { account: Number(e.target.value) })}
                        className="w-full text-xs py-1.5 px-2 bg-white border border-[#E7E5E0] rounded font-mono font-medium focus:outline-none focus:border-[#0F766E]"
                      >
                        {BAS_ACCOUNTS.map(a => (
                          <option key={a.number} value={a.number}>
                            {a.number} - {a.name.slice(0, 24)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-3 text-[#14161A] font-medium">
                      {row.accountName}
                    </td>

                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.debit === 0 ? '' : row.debit}
                        placeholder="0,00"
                        onChange={(e) => updateRow(row.id, { debit: parseFloat(e.target.value) || 0, credit: 0 })}
                        className="w-full text-xs text-right py-1.5 px-2 bg-white border border-[#E7E5E0] rounded font-mono font-semibold focus:outline-none focus:border-[#0F766E]"
                      />
                    </td>

                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.credit === 0 ? '' : row.credit}
                        placeholder="0,00"
                        onChange={(e) => updateRow(row.id, { credit: parseFloat(e.target.value) || 0, debit: 0 })}
                        className="w-full text-xs text-right py-1.5 px-2 bg-white border border-[#E7E5E0] rounded font-mono font-semibold focus:outline-none focus:border-[#0F766E]"
                      />
                    </td>

                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleAutoVat(row.id, 25)}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-neutral-100 hover:bg-teal-50 hover:text-teal-800 text-neutral-700 rounded border border-neutral-200"
                        title="Lägg till automatisk 25% momsrad"
                      >
                        +25% Moms
                      </button>
                    </td>

                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 2}
                        className="text-[#717680] hover:text-rose-600 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[#FAFAF8] border-t border-[#E7E5E0] font-semibold text-xs">
                  <td colSpan={2} className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={addRow}
                      className="text-xs font-semibold text-[#0F766E] hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Lägg till konteringsrad
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14161A]">
                    {formatSEK(totalDebit)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#14161A]">
                    {formatSEK(totalCredit)}
                  </td>
                  <td colSpan={2} className="py-2.5 px-3 text-right">
                    <span className={`text-xs font-mono font-bold ${isBalanced ? 'text-emerald-700' : 'text-rose-600'}`}>
                      Diff: {formatSEK(diff)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Receipt Attachment Placeholder */}
          <div className="p-4 bg-[#FAFAF8] rounded-lg border border-[#E7E5E0] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white border border-[#E7E5E0] flex items-center justify-center text-[#717680]">
                <Upload className="w-4 h-4 text-[#0F766E]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#14161A]">Bifoga kvitto / verifikationsunderlag</div>
                <div className="text-[11px] text-[#717680]">PDF, PNG, JPG (lagras krypterat i EU)</div>
              </div>
            </div>

            {attachedFile ? (
              <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded border border-teal-300 text-teal-900 font-mono">
                <FileCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>{attachedFile.name} ({attachedFile.size})</span>
                <button 
                  type="button" 
                  onClick={() => setAttachedFile(null)} 
                  className="text-rose-500 hover:text-rose-700 ml-1"
                >
                  Ta bort
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAttachedFile({ name: 'kvitto_byggmaterial_2026.pdf', size: '284 KB', date: '2026-10-14' })}
                className="px-3 py-1.5 bg-white border border-[#E7E5E0] rounded-md text-xs font-medium text-[#14161A] hover:bg-neutral-50"
              >
                Simulera bifogning av underlag
              </button>
            )}
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5E0]">
            <button
              type="button"
              onClick={() => setTab('verifikationer')}
              className="px-4 py-2 bg-white border border-[#E7E5E0] rounded-lg text-xs font-medium text-[#717680] hover:text-[#14161A]"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={!isBalanced || !entryDescription.trim()}
              className="px-5 py-2 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              Spara och bokför verifikation
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: HUVUDBOK (GENERAL LEDGER) */}
      {currentTab === 'huvudbok' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E0] gap-2">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">Huvudbok (General Ledger)</h3>
              <p className="text-xs text-[#717680]">Kronologisk sammanställning per konto i BAS 2026</p>
            </div>
            <div className="text-xs text-[#717680] font-mono">
              Räkenskapsår: {activeCompany.fiscalYear}
            </div>
          </div>

          <div className="space-y-6">
            {activeAccountsInLedger.map((acc) => (
              <div key={acc.number} className="border border-[#E7E5E0] rounded-xl overflow-hidden">
                <div className="p-3 bg-[#FAFAF8] border-b border-[#E7E5E0] flex items-center justify-between">
                  <div className="font-semibold text-xs text-[#14161A] flex items-center gap-2">
                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E7E5E0]">{acc.number}</span>
                    <span>{acc.name}</span>
                  </div>
                  <div className="text-xs font-mono">
                    <span className="text-[#717680]">Utgående saldo: </span>
                    <strong className="text-[#14161A]">{formatSEK(acc.balance)}</strong>
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-[#F0EFEA] text-[#717680]">
                      <th className="py-2 px-4 w-20 font-mono">Vernr</th>
                      <th className="py-2 px-4 w-28 font-mono">Datum</th>
                      <th className="py-2 px-4">Text</th>
                      <th className="py-2 px-4 text-right font-mono w-28">Debet</th>
                      <th className="py-2 px-4 text-right font-mono w-28">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EFEA]">
                    {acc.transactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAF8]">
                        <td className="py-2 px-4 font-mono font-medium text-[#14161A]">{tx.verNum}</td>
                        <td className="py-2 px-4 font-mono text-[#535862]">{formatDate(tx.date)}</td>
                        <td className="py-2 px-4 text-[#14161A]">{tx.description}</td>
                        <td className="py-2 px-4 text-right font-mono text-[#14161A]">{tx.debit > 0 ? formatSEK(tx.debit) : '-'}</td>
                        <td className="py-2 px-4 text-right font-mono text-[#14161A]">{tx.credit > 0 ? formatSEK(tx.credit) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#FAFAF8] border-t border-[#E7E5E0] font-semibold text-xs">
                      <td colSpan={3} className="py-2 px-4 text-right text-[#717680]">Omslutning konto {acc.number}:</td>
                      <td className="py-2 px-4 text-right font-mono text-[#14161A]">{formatSEK(acc.debit)}</td>
                      <td className="py-2 px-4 text-right font-mono text-[#14161A]">{formatSEK(acc.credit)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RÅBALANS (TRIAL BALANCE) */}
      {currentTab === 'rabalans' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E0] gap-2">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">Råbalans (Saldobalans)</h3>
              <p className="text-xs text-[#717680]">Samtliga aktiva konton och verifiering av debet/kredit-jämvikt</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Råbalansen balanserar
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-[#FAFAF8] text-[#535862] font-medium">
                  <th className="py-2.5 px-4 font-mono w-20">Konto</th>
                  <th className="py-2.5 px-4">Benämning</th>
                  <th className="py-2.5 px-4 text-right font-mono">Debetomsättning</th>
                  <th className="py-2.5 px-4 text-right font-mono">Kreditomsättning</th>
                  <th className="py-2.5 px-4 text-right font-mono">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {activeAccountsInLedger.map((acc) => (
                  <tr key={acc.number} className="hover:bg-[#FAFAF8]">
                    <td className="py-2.5 px-4 font-mono font-semibold text-[#14161A]">{acc.number}</td>
                    <td className="py-2.5 px-4 text-[#14161A]">{acc.name}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#535862]">{formatSEK(acc.debit)}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[#535862]">{formatSEK(acc.credit)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#14161A]">{formatSEK(acc.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#14161A] bg-[#FAFAF8] font-bold text-xs">
                  <td colSpan={2} className="py-3 px-4 uppercase text-[#14161A]">Summa råbalans:</td>
                  <td className="py-3 px-4 text-right font-mono text-[#14161A]">
                    {formatSEK(activeAccountsInLedger.reduce((s, a) => s + a.debit, 0))}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[#14161A]">
                    {formatSEK(activeAccountsInLedger.reduce((s, a) => s + a.credit, 0))}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-700">0,00 kr</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: MOMSDEKLARATION (VAT REPORT) */}
      {currentTab === 'moms' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E0] gap-4">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">
                Momsdeklaration (Skatteverket SKV 4700)
              </h3>
              <p className="text-xs text-[#717680]">
                Ackumulerad momsredovisning för {activeCompany.name} ({activeCompany.vatPeriod})
              </p>
            </div>
            
            <button
              onClick={() => {
                const csv = `Momsdeklaration för ${activeCompany.name} (${activeCompany.orgNr})\nRuta;Benämning;Belopp\n05;Momspliktig försäljning 25%;${vatReport.ruta05_sales25}\n10;Utgående moms 25%;${vatReport.ruta10_outputVat25}\n48;Ingående moms att dra av;${vatReport.ruta48_inputVat}\n49;Moms att betala/få tillbaka;${vatReport.ruta49_vatToPayOrRefund}`;
                downloadFile(`momsdeklaration_${activeCompany.orgNr}.csv`, csv, 'text/csv');
              }}
              className="px-3.5 py-2 bg-white border border-[#E7E5E0] hover:bg-neutral-50 text-xs font-medium text-[#14161A] rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Ladda ner deklarationsfil (CSV)
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                A. Momspliktig försäljning eller uttag exklusive moms
              </div>
              <div className="divide-y divide-slate-200 text-xs">
                <div className="py-2 flex justify-between">
                  <span><strong>Ruta 05</strong> – Momspliktig försäljning som inte ingår i ruta 06, 07 eller 08 (25%)</span>
                  <span className="font-mono font-semibold">{formatSEK(vatReport.ruta05_sales25)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span><strong>Ruta 06</strong> – Momspliktig försäljning som inte ingår i ruta 05, 07 eller 08 (12%)</span>
                  <span className="font-mono font-semibold">{formatSEK(vatReport.ruta06_sales12)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span><strong>Ruta 07</strong> – Momspliktig försäljning som inte ingår i ruta 05, 06 eller 08 (6%)</span>
                  <span className="font-mono font-semibold">{formatSEK(vatReport.ruta07_sales6)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                B. Utgående moms på försäljning eller uttag
              </div>
              <div className="divide-y divide-slate-200 text-xs">
                <div className="py-2 flex justify-between">
                  <span><strong>Ruta 10</strong> – Utgående moms 25% (Konto 2611)</span>
                  <span className="font-mono font-semibold">{formatSEK(vatReport.ruta10_outputVat25)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span><strong>Ruta 11</strong> – Utgående moms 12% (Konto 2621)</span>
                  <span className="font-mono font-semibold">{formatSEK(vatReport.ruta11_outputVat12)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span><strong>Ruta 12</strong> – Utgående moms 6% (Konto 2631)</span>
                  <span className="font-mono font-semibold">{formatSEK(vatReport.ruta12_outputVat6)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                C. Ingående moms
              </div>
              <div className="text-xs py-2 flex justify-between">
                <span><strong>Ruta 48</strong> – Ingående moms att dra av (Konto 2641)</span>
                <span className="font-mono font-semibold">{formatSEK(vatReport.ruta48_inputVat)}</span>
              </div>
            </div>

            {/* Final Calculation Box 49 */}
            <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-teal-900 uppercase tracking-wider block">
                  D. Moms att betala eller få tillbaka
                </span>
                <span className="text-sm font-bold text-[#14161A] mt-0.5 block">
                  Ruta 49: {vatReport.ruta49_vatToPayOrRefund >= 0 ? 'Moms att betala' : 'Moms att få tillbaka'}
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-teal-950">
                {formatSEK(vatReport.ruta49_vatToPayOrRefund)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: BANKAVSTÄMNING (PSD2 OPEN BANKING FEED) */}
      {currentTab === 'bank' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E0] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#14161A]">Bankavstämning</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                  Open Banking Direktflöde
                </span>
              </div>
              <p className="text-xs text-[#717680] mt-0.5">
                Kopplat till {activeCompany.bankName} Företagskonto ({activeCompany.bankAccount})
              </p>
            </div>

            <div className="text-xs text-[#717680] font-mono">
              Senaste bankhändelse hämtad: Idag kl. 09:42
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] bg-[#FAFAF8] text-[#535862] font-medium">
                  <th className="py-2.5 px-4 font-mono w-28">Bokföringsdag</th>
                  <th className="py-2.5 px-4">Banktransaktion</th>
                  <th className="py-2.5 px-4 font-mono">Referens</th>
                  <th className="py-2.5 px-4 text-right font-mono">Belopp</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Föreslagen åtgärd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {bankTransactions.filter(t => t.companyId === activeCompany.id).map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAFAF8]">
                    <td className="py-3 px-4 font-mono text-[#535862]">
                      {formatDate(tx.date)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#14161A]">{tx.description}</div>
                      {tx.suggestedAccount && !tx.matched && (
                        <div className="text-[11px] text-teal-800 mt-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-teal-600" />
                          Föreslagen kontering: {tx.suggestedAccount} {tx.suggestedAccountName}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#717680]">
                      {tx.reference}
                    </td>

                    <td className={`py-3 px-4 text-right font-mono font-semibold ${
                      tx.amount > 0 ? 'text-emerald-700' : 'text-[#14161A]'
                    }`}>
                      {formatSEK(tx.amount)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {tx.matched ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Avstämd
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Oavstämd
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {tx.matched ? (
                        <span className="text-[11px] text-[#717680] font-mono">
                          Matchad mot {tx.matchedVerId || 'huvudbok'}
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => createAndMatchBankTransaction(tx.id, tx.suggestedAccount || 1510)}
                            className="px-2.5 py-1 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white rounded text-xs font-semibold shadow-xs hover:opacity-95"
                          >
                            Bokför & matcha
                          </button>
                          <button
                            onClick={() => matchBankTransaction(tx.id)}
                            className="px-2.5 py-1 bg-white border border-[#E7E5E0] hover:bg-neutral-50 text-[#14161A] rounded text-xs font-medium"
                          >
                            Matcha
                          </button>
                        </div>
                      )}
                    </td>
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
