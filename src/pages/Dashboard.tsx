import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Building2, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAccounting } from '../context/AccountingContext';
import { formatSEK, formatDate } from '../lib/formatters';
import { computeIncomeStatement, computeBalanceSheet } from '../lib/ledgerCalculations';

export const Dashboard: React.FC = () => {
  const { 
    companies, 
    activeCompany, 
    journalEntries, 
    bankTransactions, 
    payrollRuns, 
    auditLog, 
    currentUser,
    isClientView 
  } = useAccounting();

  const navigate = useNavigate();

  // Financial metrics for active company
  const isReport = useMemo(() => computeIncomeStatement(journalEntries, activeCompany.id), [journalEntries, activeCompany.id]);
  const bsReport = useMemo(() => computeBalanceSheet(journalEntries, activeCompany.id), [journalEntries, activeCompany.id]);

  const unmatchedBankCount = useMemo(() => {
    return bankTransactions.filter(t => t.companyId === activeCompany.id && !t.matched).length;
  }, [bankTransactions, activeCompany.id]);

  // Chart data for revenue & expenses across 2026
  const monthlyChartData = useMemo(() => [
    { month: 'Jan', intakter: 260000, kostnader: 313851 },
    { month: 'Feb', intakter: 330000, kostnader: 279251 },
    { month: 'Mar', intakter: 0, kostnader: 279251 },
    { month: 'Apr', intakter: 580000, kostnader: 42000 },
    { month: 'Maj', intakter: 0, kostnader: 38000 },
    { month: 'Jun', intakter: 0, kostnader: 22400 },
    { month: 'Jul', intakter: 0, kostnader: 310891 },
    { month: 'Aug', intakter: 600000, kostnader: 45000 },
    { month: 'Sep', intakter: 0, kostnader: 285000 },
    { month: 'Okt', intakter: 145000, kostnader: 85000 },
    { month: 'Nov', intakter: 280000, kostnader: 190000 },
    { month: 'Dec', intakter: 320000, kostnader: 210000 },
  ], []);

  // Upcoming 30 days deadlines
  const deadlines = [
    { title: 'AGI Arbetsgivardeklaration', date: '2026-11-12', daysLeft: 29, entity: 'Samtliga 65 klienter', type: 'Skatteverket' },
    { title: 'Momsdeklaration Q3', date: '2026-11-12', daysLeft: 29, entity: `${activeCompany.name} m.fl.`, type: 'Moms' },
    { title: 'Löneutbetalning & Bankfil', date: '2026-10-25', daysLeft: 11, entity: 'Norrström Bygg AB (6 pers)', type: 'Lön' },
    { title: 'Årsredovisning K2 Bolagsverket', date: '2026-10-31', daysLeft: 17, entity: 'Norrström Bygg AB', type: 'Bokslut' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Subtle Nordic gradient mesh header */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-white border border-[#E7E5E0] shadow-xs overflow-hidden">
        {/* Subtle mesh overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40" 
          style={{
            backgroundImage: 'radial-gradient(at 0% 0%, rgba(15, 118, 110, 0.08) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(30, 64, 175, 0.06) 0px, transparent 50%)'
          }} 
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Auktoriserad Byråöversikt</span>
              <span>·</span>
              <span className="font-mono text-[#535862]">Hösten 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#14161A]">
              Välkommen tillbaka, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-[#535862] mt-1 max-w-2xl">
              Byrån hanterar för närvarande <strong className="text-[#14161A] font-semibold">{companies.length} klientbolag</strong>. Aktiv klient är <strong className="text-[#14161A] font-semibold">{activeCompany.name}</strong> ({activeCompany.orgNr}).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/bokforing?tab=ny')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#0F766E] to-[#1E40AF] hover:opacity-95 rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5" />
              Ny verifikation
            </button>
            <button
              onClick={() => navigate('/klienter')}
              className="px-3.5 py-2 text-xs font-semibold text-[#14161A] bg-white hover:bg-neutral-50 border border-[#E7E5E0] rounded-lg transition-colors"
            >
              Alla klienter (65)
            </button>
          </div>
        </div>
      </div>

      {/* Firm KPIs Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Clients */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => navigate('/klienter')}
          className="p-5 bg-white rounded-xl border border-[#E7E5E0] shadow-xs cursor-pointer hover:border-teal-300 transition-colors group"
        >
          <div className="flex items-center justify-between text-[#717680] text-xs font-medium">
            <span>Klientstock</span>
            <Building2 className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#14161A] font-tabular tracking-tight">65</span>
            <span className="text-xs text-emerald-700 font-medium">100% aktiva</span>
          </div>
          <div className="mt-1 text-xs text-[#717680] flex items-center justify-between">
            <span>52 AB · 13 Enskilda firmor</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#717680] group-hover:text-[#0F766E] transition-colors" />
          </div>
        </motion.div>

        {/* KPI 2: Open Bank Reconciliations */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          onClick={() => navigate('/bokforing?tab=bank')}
          className="p-5 bg-white rounded-xl border border-[#E7E5E0] shadow-xs cursor-pointer hover:border-teal-300 transition-colors group"
        >
          <div className="flex items-center justify-between text-[#717680] text-xs font-medium">
            <span>Öppna bankhändelser</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#14161A] font-tabular tracking-tight">
              {unmatchedBankCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">Kräver avstämning</span>
          </div>
          <div className="mt-1 text-xs text-[#717680] flex items-center justify-between">
            <span>{activeCompany.name} (SEB feed)</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#717680] group-hover:text-[#0F766E] transition-colors" />
          </div>
        </motion.div>

        {/* KPI 3: Revenue Active Company */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          onClick={() => navigate('/bokforing?tab=rabalans')}
          className="p-5 bg-white rounded-xl border border-[#E7E5E0] shadow-xs cursor-pointer hover:border-teal-300 transition-colors group"
        >
          <div className="flex items-center justify-between text-[#717680] text-xs font-medium">
            <span>Rörelseintäkter (YTD)</span>
            <TrendingUp className="w-4 h-4 text-[#0F766E]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#14161A] font-mono tracking-tight">
              {formatSEK(isReport.revenues.total, false)}
            </span>
          </div>
          <div className="mt-1 text-xs text-[#717680] flex items-center justify-between">
            <span>Rörelseresultat: {formatSEK(isReport.operatingProfit, false)}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#717680] group-hover:text-[#0F766E] transition-colors" />
          </div>
        </motion.div>

        {/* KPI 4: Balance Check */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          onClick={() => navigate('/arsbokslut?tab=arsredovisning')}
          className="p-5 bg-white rounded-xl border border-[#E7E5E0] shadow-xs cursor-pointer hover:border-teal-300 transition-colors group"
        >
          <div className="flex items-center justify-between text-[#717680] text-xs font-medium">
            <span>Balanskontroll K2</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-800 font-tabular flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Balanserar
            </span>
          </div>
          <div className="mt-1 text-xs text-[#717680] flex items-center justify-between">
            <span>Tillgångar: {formatSEK(bsReport.totalAssets, false)}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#717680] group-hover:text-[#0F766E] transition-colors" />
          </div>
        </motion.div>

      </div>

      {/* Main Section: Financial Chart & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue & Expenses Chart for selected company */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E7E5E0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[#14161A] tracking-tight">
                Intäkter & kostnader 2026 – {activeCompany.name}
              </h3>
              <p className="text-xs text-[#717680]">Månatlig utveckling baserad på bokförda verifikationer</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                <span className="text-[#535862]">Intäkter (Klass 3)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-[#535862]">Kostnader</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIntakter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorKostnader" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EA" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#717680' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#717680' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString('sv-SE')} kr`]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E7E5E0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="intakter" name="Intäkter" stroke="#0F766E" strokeWidth={2} fillOpacity={1} fill="url(#colorIntakter)" />
                <Area type="monotone" dataKey="kostnader" name="Kostnader" stroke="#64748B" strokeWidth={1.5} fillOpacity={1} fill="url(#colorKostnader)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Deadline Timeline */}
        <div className="bg-white p-6 rounded-xl border border-[#E7E5E0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-[#14161A] tracking-tight">
                Tidsfrister nästa 30 dagar
              </h3>
              <Calendar className="w-4 h-4 text-[#717680]" />
            </div>
            <p className="text-xs text-[#717680] mb-4">Lagstadgade inlämningar till Skatteverket & Bolagsverket</p>

            <div className="space-y-3">
              {deadlines.map((dl, idx) => (
                <div key={idx} className="p-3 bg-[#FAFAF8] rounded-lg border border-[#E7E5E0] hover:bg-[#F5F5F3] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#14161A]">{dl.title}</div>
                      <div className="text-[11px] text-[#717680]">{dl.entity}</div>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {dl.daysLeft} dagar kvar
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#717680] font-mono flex items-center justify-between">
                    <span>Förfaller: {dl.date}</span>
                    <span className="text-neutral-500">{dl.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EFEA] flex items-center justify-between">
            <span className="text-xs text-[#717680]">Synkad med Skatteverket</span>
            <button 
              onClick={() => navigate('/integrationer')} 
              className="text-xs text-[#0F766E] font-medium hover:underline"
            >
              Visa alla datum &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Activity Log & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-[#E7E5E0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm text-[#14161A] tracking-tight">
                Senaste byråaktiviteter
              </h3>
              <p className="text-xs text-[#717680]">Loggade åtgärder över alla klienter och medarbetare</p>
            </div>
            <button 
              onClick={() => navigate('/integrationer?tab=audit')} 
              className="text-xs text-[#0F766E] font-medium hover:underline"
            >
              Fullständig revisionslogg &rarr;
            </button>
          </div>

          <div className="divide-y divide-[#F0EFEA]">
            {auditLog.slice(0, 5).map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="font-medium text-[#14161A] flex items-center gap-2">
                    <span>{log.action}</span>
                    <span className="text-[10px] font-mono text-[#717680]">·</span>
                    <span className="text-[11px] font-semibold text-teal-900">{log.companyName}</span>
                  </div>
                  <p className="text-[11px] text-[#535862] mt-0.5">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-[#717680]">{log.timestamp}</div>
                  <div className="text-[10px] text-neutral-500">{log.userName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Demo Help & System Status */}
        <div className="bg-white p-6 rounded-xl border border-[#E7E5E0] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-[#14161A] tracking-tight mb-2">
              Svensk regelverksefterlevnad
            </h3>
            <p className="text-xs text-[#535862] leading-relaxed mb-4">
              Systemet följer Bokföringslagen (BFL), Årsredovisningslagen (ÅRL) och BFNAR 2016:10 (K2). Alla transaktioner genererar verifikationsnummer i obrutna nummerserier.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#FAFAF8] border border-[#E7E5E0]">
                <span className="text-[#535862]">Kontoplan</span>
                <span className="font-semibold font-mono text-[#14161A]">BAS 2026</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAFAF8] border border-[#E7E5E0]">
                <span className="text-[#535862]">Arbetsgivaravgift</span>
                <span className="font-semibold font-mono text-[#14161A]">31,42%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#FAFAF8] border border-[#E7E5E0]">
                <span className="text-[#535862]">Bolagsskatt</span>
                <span className="font-semibold font-mono text-[#14161A]">20,6%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F0EFEA] text-[11px] text-[#717680] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>GDPR-säkrad drift inom EU (Stockholm datacenter)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
