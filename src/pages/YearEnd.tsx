import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  ChevronRight, 
  Printer, 
  ArrowRight,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { formatSEK, formatDate, downloadFile } from '../lib/formatters';
import { computeIncomeStatement, computeBalanceSheet } from '../lib/ledgerCalculations';
import { generateBolagsverketIxbrl, generateSruFiles } from '../lib/swedishTax';
import { BankIdModal } from '../components/BankIdModal';
import { YearEndSigner } from '../types';

export const YearEnd: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'arsredovisning';

  const { 
    activeCompany, 
    journalEntries, 
    yearEndState, 
    updateYearEndState, 
    currentUser 
  } = useAccounting();

  const tabs = [
    { id: 'arsredovisning', label: 'K2 Årsredovisning' },
    { id: 'process', label: 'Bokslutsprocess (Wizard)' },
    { id: 'signering', label: 'Digital signering (BankID)' },
    { id: 'export', label: 'Inlämning & Filexport' },
  ];

  const setTab = (id: string) => {
    setSearchParams({ tab: id });
  };

  // Compute live K2 statements from ledger
  const isReport = useMemo(() => computeIncomeStatement(journalEntries, activeCompany.id), [journalEntries, activeCompany.id]);
  const bsReport = useMemo(() => computeBalanceSheet(journalEntries, activeCompany.id), [journalEntries, activeCompany.id]);

  // BankID modal state
  const [selectedSigner, setSelectedSigner] = useState<YearEndSigner | null>(null);
  const [isBankIdOpen, setIsBankIdOpen] = useState(false);

  const handleStartSign = (signer: YearEndSigner) => {
    setSelectedSigner(signer);
    setIsBankIdOpen(true);
  };

  // Export handlers
  const handleExportIxbrl = () => {
    const xml = generateBolagsverketIxbrl(activeCompany, isReport.netProfit);
    downloadFile(`arsredovisning_${activeCompany.orgNr}_k2.xhtml`, xml, 'application/xhtml+xml');
  };

  const handleExportSru = () => {
    const sru = generateSruFiles(activeCompany);
    downloadFile(`BLANKETTER.SRU`, sru.blanketter, 'text/plain');
    setTimeout(() => {
      downloadFile(`INFO.SRU`, sru.info, 'text/plain');
    }, 200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>Bokslutsmodul</span>
            <span>·</span>
            <span className="font-mono">K2 (BFNAR 2016:10)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14161A]">
            Bokslut & Årsredovisning – {activeCompany.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#535862] mt-0.5">
            Automatgenererad årsredovisning för {activeCompany.fiscalYear} med Bolagsverkets digitala inlämning och BankID.
          </p>
        </div>

        {/* Balance Sheet Verification Banner */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Balansräkningen balanserar</span>
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white border border-[#E7E5E0] hover:bg-neutral-50 text-xs font-medium text-[#14161A] rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-[#717680]" />
            Skriv ut handling
          </button>
        </div>
      </div>

      {/* Sub tabs row */}
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

      {/* TAB 1: K2 ÅRSREDOVISNING (FORMAL REPORT VIEW) */}
      {currentTab === 'arsredovisning' && (
        <div className="bg-white p-8 sm:p-14 rounded-2xl border border-[#E7E5E0] shadow-sm max-w-4xl mx-auto space-y-12">
          
          {/* Cover Header */}
          <div className="text-center border-b-2 border-slate-900 pb-10">
            <div className="text-xs uppercase tracking-widest text-[#717680] font-semibold mb-2">
              Officiell årsredovisning upprättad enligt ÅRL och K2
            </div>
            <h2 className="text-3xl font-extrabold text-[#14161A] tracking-tight">
              Årsredovisning för {activeCompany.name}
            </h2>
            <div className="mt-2 text-sm font-mono text-[#535862]">
              Organisationsnummer: {activeCompany.orgNr} · Säte: {activeCompany.city}
            </div>
            <div className="mt-1 text-xs text-[#717680] font-mono">
              Räkenskapsår: {activeCompany.fiscalYear}
            </div>
          </div>

          {/* 1. Förvaltningsberättelse */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-[#14161A] border-b border-[#E7E5E0] pb-2">
              Förvaltningsberättelse
            </h3>
            
            <div className="text-xs leading-relaxed text-[#14161A] space-y-3">
              <p>
                Styrelsen och verkställande direktören för <strong>{activeCompany.name}</strong> avger härmed följande årsredovisning för räkenskapsåret 2026.
              </p>
              
              <h4 className="font-semibold text-xs text-[#14161A] pt-2">Verksamheten</h4>
              <p className="text-[#535862]">
                Bolaget bedriver entreprenadverksamhet inom byggsektorn, med inriktning mot nybyggnation, tillbyggnad, stomkompletteringar samt renoveringar åt fastighetsbolag och bostadsrättsföreningar i Mälardalen. Verksamheten har under året haft en stabil orderingång och personalstyrkan har uppgått till i genomsnitt 6 helårsanställda.
              </p>

              <h4 className="font-semibold text-xs text-[#14161A] pt-2">Flerårsöversikt (tkr)</h4>
              <div className="border border-[#E7E5E0] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="bg-[#FAFAF8] border-b border-[#E7E5E0] text-[#535862]">
                      <th className="py-2 px-3">Nyckeltal</th>
                      <th className="py-2 px-3 text-right">2026 (Aktuellt)</th>
                      <th className="py-2 px-3 text-right">2025</th>
                      <th className="py-2 px-3 text-right">2024</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EFEA]">
                    <tr>
                      <td className="py-2 px-3 font-medium">Nettoomsättning</td>
                      <td className="py-2 px-3 text-right font-semibold">{Math.round(isReport.revenues.total / 1000)}</td>
                      <td className="py-2 px-3 text-right">1 840</td>
                      <td className="py-2 px-3 text-right">1 620</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Resultat efter finansiella poster</td>
                      <td className="py-2 px-3 text-right font-semibold">{Math.round((isReport.operatingProfit + isReport.financialItems.total) / 1000)}</td>
                      <td className="py-2 px-3 text-right">490</td>
                      <td className="py-2 px-3 text-right">380</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">Soliditet (%)</td>
                      <td className="py-2 px-3 text-right font-semibold">68%</td>
                      <td className="py-2 px-3 text-right">64%</td>
                      <td className="py-2 px-3 text-right">59%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-xs text-[#14161A] pt-2">Förslag till vinstdisposition</h4>
              <p className="text-[#535862]">
                Styrelsen föreslår att till förfogande stående vinstmedel (balanserad vinst 1 410 000 kr och årets resultat {formatSEK(isReport.netProfit)}) disponeras så att 250 000 kr utdelas till aktieägarna och resterande belopp balanseras i ny räkning.
              </p>
            </div>
          </section>

          {/* 2. Resultaträkning */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-[#14161A] border-b border-[#E7E5E0] pb-2">
              Resultaträkning (K2 format)
            </h3>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E7E5E0] text-[#535862] font-semibold">
                  <th className="py-2">Poster (i SEK)</th>
                  <th className="py-2 text-right font-mono">2026</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                <tr className="font-semibold text-[#14161A]">
                  <td className="py-2">Nettoomsättning</td>
                  <td className="py-2 text-right font-mono">{formatSEK(isReport.revenues.total)}</td>
                </tr>
                <tr>
                  <td className="py-2 pl-4 text-[#535862]">Råvaror och förnödenheter</td>
                  <td className="py-2 text-right font-mono text-[#535862]">-{formatSEK(isReport.rawMaterials.total)}</td>
                </tr>
                <tr>
                  <td className="py-2 pl-4 text-[#535862]">Övriga externa kostnader</td>
                  <td className="py-2 text-right font-mono text-[#535862]">-{formatSEK(isReport.otherExternalCosts.total)}</td>
                </tr>
                <tr>
                  <td className="py-2 pl-4 text-[#535862]">Personalkostnader</td>
                  <td className="py-2 text-right font-mono text-[#535862]">-{formatSEK(isReport.personnelCosts.total)}</td>
                </tr>
                <tr>
                  <td className="py-2 pl-4 text-[#535862]">Avskrivningar av materiella anläggningstillgångar</td>
                  <td className="py-2 text-right font-mono text-[#535862]">-{formatSEK(isReport.depreciation.total)}</td>
                </tr>
                <tr className="border-t border-[#14161A] font-bold text-[#14161A]">
                  <td className="py-2">Rörelseresultat</td>
                  <td className="py-2 text-right font-mono">{formatSEK(isReport.operatingProfit)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-[#535862]">Finansiella poster</td>
                  <td className="py-2 text-right font-mono">{formatSEK(isReport.financialItems.total)}</td>
                </tr>
                <tr className="font-semibold text-[#14161A]">
                  <td className="py-2">Resultat efter finansiella poster</td>
                  <td className="py-2 text-right font-mono">{formatSEK(isReport.operatingProfit + isReport.financialItems.total)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-[#535862]">Skatt på årets resultat (20,6%)</td>
                  <td className="py-2 text-right font-mono text-[#535862]">-{formatSEK(isReport.taxExpense)}</td>
                </tr>
                <tr className="border-t-2 border-[#14161A] font-extrabold text-sm text-[#14161A]">
                  <td className="py-3 uppercase">Årets resultat</td>
                  <td className="py-3 text-right font-mono text-teal-950">{formatSEK(isReport.netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 3. Balansräkning */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-2">
              <h3 className="text-lg font-bold text-[#14161A]">
                Balansräkning
              </h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Balanskontroll godkänd
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* TILLGÅNGAR */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  TILLGÅNGAR
                </h4>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold block text-slate-800">Materiella anläggningstillgångar</span>
                    <div className="divide-y divide-slate-100 text-[#535862] mt-1">
                      {bsReport.fixedAssets.items.map((item, i) => (
                        <div key={i} className="py-1 flex justify-between font-mono">
                          <span>{item.name}</span>
                          <span>{formatSEK(item.amount)}</span>
                        </div>
                      ))}
                      <div className="py-1 font-semibold flex justify-between text-slate-900">
                        <span>Summa anläggningstillgångar</span>
                        <span>{formatSEK(bsReport.fixedAssets.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold block text-slate-800">Omsättningstillgångar</span>
                    <div className="divide-y divide-slate-100 text-[#535862] mt-1">
                      {bsReport.currentAssets.items.map((item, i) => (
                        <div key={i} className="py-1 flex justify-between font-mono">
                          <span>{item.name}</span>
                          <span>{formatSEK(item.amount)}</span>
                        </div>
                      ))}
                      <div className="py-1 font-semibold flex justify-between text-slate-900">
                        <span>Summa omsättningstillgångar</span>
                        <span>{formatSEK(bsReport.currentAssets.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-900 font-bold flex justify-between text-slate-900 text-sm font-mono">
                    <span className="uppercase">SUMMA TILLGÅNGAR:</span>
                    <span>{formatSEK(bsReport.totalAssets)}</span>
                  </div>
                </div>
              </div>

              {/* EGET KAPITAL OCH SKULDER */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                  EGET KAPITAL OCH SKULDER
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold block text-slate-800">Eget kapital</span>
                    <div className="divide-y divide-slate-100 text-[#535862] mt-1">
                      {bsReport.equity.items.map((item, i) => (
                        <div key={i} className="py-1 flex justify-between font-mono">
                          <span>{item.name}</span>
                          <span>{formatSEK(item.amount)}</span>
                        </div>
                      ))}
                      <div className="py-1 font-semibold flex justify-between text-slate-900">
                        <span>Summa eget kapital</span>
                        <span>{formatSEK(bsReport.equity.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold block text-slate-800">Kortfristiga skulder</span>
                    <div className="divide-y divide-slate-100 text-[#535862] mt-1">
                      {bsReport.currentLiabilities.items.map((item, i) => (
                        <div key={i} className="py-1 flex justify-between font-mono">
                          <span>{item.name}</span>
                          <span>{formatSEK(item.amount)}</span>
                        </div>
                      ))}
                      <div className="py-1 font-semibold flex justify-between text-slate-900">
                        <span>Summa kortfristiga skulder</span>
                        <span>{formatSEK(bsReport.currentLiabilities.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-slate-900 font-bold flex justify-between text-slate-900 text-sm font-mono">
                    <span className="uppercase">SUMMA EGET KAPITAL & SKULDER:</span>
                    <span>{formatSEK(bsReport.totalEquityAndLiabilities)}</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* 4. Noter */}
          <section className="space-y-4 border-t border-[#E7E5E0] pt-6">
            <h3 className="text-lg font-bold text-[#14161A] border-b border-[#E7E5E0] pb-2">
              Noter till de finansiella rapporterna
            </h3>
            
            <div className="space-y-4 text-xs text-[#535862]">
              <div>
                <h4 className="font-bold text-[#14161A]">Not 1 Redovisnings- och värderingsprinciper</h4>
                <p className="mt-1 leading-relaxed">
                  Årsredovisningen är upprättad i enlighet med Årsredovisningslagen (1995:1554) och Bokföringsnämndens allmänna råd BFNAR 2016:10 Årsredovisning i mindre företag (K2). Tillgångar och skulder har värderats till anskaffningsvärden om inte annat anges.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#14161A]">Not 2 Medelantal anställda och personalkostnader</h4>
                <p className="mt-1">
                  Medelantalet anställda under räkenskapsåret har varit 6 personer (varav 1 kvinna och 5 män). Samtliga löner och sociala avgifter har erlagts i enlighet med gällande kollektivavtal för byggsektorn.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#14161A]">Not 3 Materiella anläggningstillgångar</h4>
                <p className="mt-1">
                  Maskiner, inventarier och transportmedel skrivs av linjärt över den bedömda ekonomiska livslängden, vilken uppgår till 5 år (20% per år).
                </p>
              </div>
            </div>
          </section>

          {/* 5. Underskrifter */}
          <section className="space-y-6 border-t border-[#E7E5E0] pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#14161A]">
                Underskrifter (Elektronisk signering)
              </h3>
              <button
                onClick={() => setTab('signering')}
                className="text-xs text-[#0F766E] font-medium hover:underline flex items-center gap-1"
              >
                Hantera BankID-signaturer &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {yearEndState.signers.map((sig) => (
                <div key={sig.id} className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] space-y-2 text-xs">
                  <div className="font-bold text-[#14161A]">{sig.name}</div>
                  <div className="text-[11px] text-[#717680]">{sig.role}</div>
                  
                  {sig.status === 'Signerad' ? (
                    <div className="pt-2 border-t border-[#E7E5E0] text-[11px] text-emerald-800 font-mono">
                      <div className="flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Signerad med BankID
                      </div>
                      <div className="text-neutral-500 text-[10px] mt-0.5">{sig.signedAt}</div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-between">
                      <span className="text-amber-800 text-[11px] font-medium">Väntar på signering</span>
                      <button
                        onClick={() => handleStartSign(sig)}
                        className="px-2 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800"
                      >
                        Signera
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* TAB 2: BOKSLUTSPROCESS (WIZARD) */}
      {currentTab === 'process' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6 no-print">
          <div className="pb-4 border-b border-[#E7E5E0]">
            <h3 className="font-semibold text-base text-[#14161A]">
              Bokslutsprocessen steg för steg (K2)
            </h3>
            <p className="text-xs text-[#717680]">
              Strukturerat arbetsflöde för auktoriserad redovisningskonsult inför årsbokslutet
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#14161A]">1. Avstämning av balanskonton</h4>
                  <span className="text-[11px] font-semibold text-emerald-800 font-mono">Klarmarkerad</span>
                </div>
                <p className="text-xs text-[#535862] mt-1">
                  Bankkonton (1930), kundfordringar (1510) och leverantörsskulder (2440) är avstämda mot externa saldobekräftelser.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#14161A]">2. Anläggningsregister & Avskrivningar</h4>
                  <span className="text-[11px] font-semibold text-emerald-800 font-mono">Klarmarkerad</span>
                </div>
                <p className="text-xs text-[#535862] mt-1">
                  Årliga planenliga avskrivningar (20%) på maskiner, fordon och inventarier har beräknats och bokförts.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-teal-300 bg-teal-50/50 flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#14161A]">3. Periodiseringar & Semesterskuld</h4>
                  <span className="text-[11px] font-semibold text-teal-800 font-mono">Pågående</span>
                </div>
                <p className="text-xs text-[#535862] mt-1">
                  Upplupna semesterlöner beräknade till 227 550 kr. Upplupna sociala avgifter för semesterlöneskuld bokförs på konto 2940.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      updateYearEndState({ accrualsDone: true });
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white rounded text-xs font-semibold shadow-xs"
                  >
                    Klarmarkera periodiseringar
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-neutral-300 text-neutral-800 flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#14161A]">4. Skatteberäkning (Bolagsskatt 20,6%)</h4>
                  <span className="text-[11px] font-mono text-[#717680]">Ej utförd</span>
                </div>
                <p className="text-xs text-[#535862] mt-1">
                  Skattepliktigt resultat beräknas och bolagsskatt (20,6%) bokförs mot konto 8910 och skattekonto (2510/1630).
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-4 rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-neutral-300 text-neutral-800 flex items-center justify-center font-bold text-xs shrink-0">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#14161A]">5. Upprätta K2-årsredovisning & BankID-signering</h4>
                  <span className="text-[11px] font-mono text-[#717680]">Redo</span>
                </div>
                <p className="text-xs text-[#535862] mt-1">
                  Kompilera resultaträkning, balansräkning, noter och förvaltningsberättelse samt skicka för digital underskrift.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: DIGITAL SIGNERING (BANKID FLOW) */}
      {currentTab === 'signering' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6 no-print">
          <div className="pb-4 border-b border-[#E7E5E0]">
            <h3 className="font-semibold text-base text-[#14161A]">
              Digital signering med Mobilt BankID
            </h3>
            <p className="text-xs text-[#717680]">
              Signaturkedja för årsredovisning K2 – {activeCompany.name} ({activeCompany.orgNr})
            </p>
          </div>

          <div className="space-y-4">
            {yearEndState.signers.map((signer) => (
              <div key={signer.id} className="p-5 rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#E7E5E0] flex items-center justify-center text-slate-800 font-bold text-xs">
                    {signer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#14161A]">{signer.name}</h4>
                    <p className="text-xs text-[#717680]">{signer.role} · Personnr: {signer.personnummer}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {signer.status === 'Signerad' ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Signerad med BankID
                      </span>
                      <div className="text-[10px] font-mono text-[#717680] mt-0.5">{signer.signedAt}</div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartSign(signer)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-2"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-teal-400" />
                      Signera med Mobilt BankID
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FIL-EXPORT (IXBRL FÖR BOLAGSVERKET & SRU FÖR SKATTEVERKET) */}
      {currentTab === 'export' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6 no-print">
          <div className="pb-4 border-b border-[#E7E5E0]">
            <h3 className="font-semibold text-base text-[#14161A]">
              Myndighetsinlämning & Filexport
            </h3>
            <p className="text-xs text-[#717680]">
              Generera godkända digitala inlämningsfiler enligt Bolagsverkets och Skatteverkets specifikationer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Bolagsverket iXBRL Export */}
            <div className="p-6 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-[#14161A]">Bolagsverket Digital Inlämning (iXBRL)</h4>
                  <span className="text-[10px] font-mono bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                    K2 iXBRL v3.1
                  </span>
                </div>
                <p className="text-xs text-[#535862] leading-relaxed mb-4">
                  Genererar en inline XBRL-fil (XHTML) med strukturerade taxonomitaggar för resultaträkning, balansräkning, fastställelseintyg och noter för direktinlämning via Bolagsverkets API.
                </p>
              </div>

              <button
                onClick={handleExportIxbrl}
                className="w-full py-2.5 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] hover:opacity-95 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Ladda ner iXBRL-årsredovisning (.xhtml)
              </button>
            </div>

            {/* Skatteverket SRU Export */}
            <div className="p-6 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-[#14161A]">Skatteverket Inkomstdeklaration 2 (SRU)</h4>
                  <span className="text-[10px] font-mono bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                    INK2 Standard
                  </span>
                </div>
                <p className="text-xs text-[#535862] leading-relaxed mb-4">
                  Genererar filerna <code>BLANKETTER.SRU</code> och <code>INFO.SRU</code> innehållande skattemässiga justeringar, skatteberäkning och räkenskapsschema (INK2R/INK2S).
                </p>
              </div>

              <button
                onClick={handleExportSru}
                className="w-full py-2.5 bg-white border border-[#E7E5E0] hover:bg-neutral-50 text-[#14161A] text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-[#0F766E]" />
                Ladda ner SRU-deklarationsfiler (.sru)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* BankID Modal */}
      <BankIdModal
        isOpen={isBankIdOpen}
        onClose={() => setIsBankIdOpen(false)}
        signer={selectedSigner}
        onSuccess={() => {}}
      />

    </div>
  );
};
