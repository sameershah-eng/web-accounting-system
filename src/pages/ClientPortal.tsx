import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  FileText, 
  Download, 
  Upload, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  FileCheck2, 
  DollarSign, 
  Calendar,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { formatSEK, formatDate } from '../lib/formatters';
import { computeIncomeStatement, computeBalanceSheet } from '../lib/ledgerCalculations';

export const ClientPortal: React.FC = () => {
  const { activeCompany, journalEntries, yearEndState, setIsClientView } = useAccounting();

  const isReport = computeIncomeStatement(journalEntries, activeCompany.id);
  const bsReport = computeBalanceSheet(journalEntries, activeCompany.id);

  const [activeTab, setActiveTab] = useState<'rapporter' | 'dokument' | 'kontakt'>('rapporter');
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'Sara Wallin (Auktoriserad redovisningskonsult)',
      text: 'Hej Johan! Vi har nu sammanställt K2-årsredovisningen för 2026. Du kan granska och signera den under fliken Dokument via BankID.',
      time: 'Igår, 14:15',
      isFirm: true,
    },
    {
      id: 'm2',
      sender: 'Johan Norrström',
      text: 'Toppen, jag signerade via BankID nyss! Har ni fått in leverantörsfakturan från Beijer också?',
      time: 'Igår, 16:30',
      isFirm: false,
    },
    {
      id: 'm3',
      sender: 'Sara Wallin (Auktoriserad redovisningskonsult)',
      text: 'Japp, den är konterad på konto 4010 och momsen är avdragen. Allt ser fint ut!',
      time: 'Idag, 08:50',
      isFirm: true,
    },
  ]);
  const [newMsg, setNewMsg] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: 'Johan Norrström',
        text: newMsg,
        time: 'Just nu',
        isFirm: false,
      },
    ]);
    setNewMsg('');
  };

  return (
    <div className="space-y-6">
      
      {/* Client Portal Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E7E5E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>Klientportal</span>
            <span>·</span>
            <span>{activeCompany.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14161A]">
            Välkommen, Johan Norrström
          </h1>
          <p className="text-xs sm:text-sm text-[#535862] mt-0.5">
            Här följer du ditt företags ekonomiska ställning och kommunicerar direkt med din redovisningsbyrå Balans Byrå.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsClientView(false)}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-xs font-semibold text-[#14161A] rounded-lg border border-[#E7E5E0] transition-colors"
          >
            Avsluta klientvy (Gå till byråvy)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E7E5E0] bg-white rounded-xl p-1 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('rapporter')}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'rapporter' ? 'bg-neutral-100 text-[#14161A] font-semibold' : 'text-[#717680] hover:text-[#14161A]'
          }`}
        >
          Ekonomisk översikt
        </button>
        <button
          onClick={() => setActiveTab('dokument')}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'dokument' ? 'bg-neutral-100 text-[#14161A] font-semibold' : 'text-[#717680] hover:text-[#14161A]'
          }`}
        >
          Dokument & Årsredovisning
        </button>
        <button
          onClick={() => setActiveTab('kontakt')}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'kontakt' ? 'bg-neutral-100 text-[#14161A] font-semibold' : 'text-[#717680] hover:text-[#14161A]'
          }`}
        >
          Kontakt med byrån
        </button>
      </div>

      {/* TAB 1: RAPPORTER / EKONOMISK ÖVERSIKT */}
      {activeTab === 'rapporter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-xl border border-[#E7E5E0] shadow-xs">
              <span className="text-xs text-[#717680] font-medium block">Omsättning (2026)</span>
              <span className="text-2xl font-bold font-mono text-[#14161A] mt-2 block">
                {formatSEK(isReport.revenues.total, false)}
              </span>
              <span className="text-[11px] text-[#717680] mt-1 block font-mono">Ackumulerat innevarande år</span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E7E5E0] shadow-xs">
              <span className="text-xs text-[#717680] font-medium block">Rörelseresultat</span>
              <span className="text-2xl font-bold font-mono text-[#14161A] mt-2 block">
                {formatSEK(isReport.operatingProfit, false)}
              </span>
              <span className="text-[11px] text-emerald-700 mt-1 block font-mono">Resultat före skatt</span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E7E5E0] shadow-xs">
              <span className="text-xs text-[#717680] font-medium block">Kassa & Banktillgodohavande</span>
              <span className="text-2xl font-bold font-mono text-teal-900 mt-2 block">
                {formatSEK(bsReport.currentAssets.total, false)}
              </span>
              <span className="text-[11px] text-[#717680] mt-1 block font-mono">SEB Företagskonto</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E7E5E0] shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-[#14161A]">Förenklad Resultaträkning</h3>
            <div className="divide-y divide-[#F0EFEA] text-xs font-mono">
              <div className="py-2.5 flex justify-between font-sans">
                <span className="font-semibold">Rörelsens intäkter</span>
                <span className="font-mono font-bold">{formatSEK(isReport.revenues.total)}</span>
              </div>
              <div className="py-2.5 flex justify-between text-[#535862]">
                <span>Varukostnader & Material</span>
                <span>-{formatSEK(isReport.rawMaterials.total)}</span>
              </div>
              <div className="py-2.5 flex justify-between text-[#535862]">
                <span>Övriga externa omkostnader (hyra, drift, verktyg)</span>
                <span>-{formatSEK(isReport.otherExternalCosts.total)}</span>
              </div>
              <div className="py-2.5 flex justify-between text-[#535862]">
                <span>Personalkostnader och sociala avgifter</span>
                <span>-{formatSEK(isReport.personnelCosts.total)}</span>
              </div>
              <div className="py-2.5 flex justify-between text-[#535862]">
                <span>Avskrivningar</span>
                <span>-{formatSEK(isReport.depreciation.total)}</span>
              </div>
              <div className="py-3 flex justify-between font-bold text-sm text-[#14161A]">
                <span>Beräknat nettoresultat:</span>
                <span className="text-teal-900">{formatSEK(isReport.netProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DOKUMENT */}
      {activeTab === 'dokument' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E0]">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">Dokumentarkiv</h3>
              <p className="text-xs text-[#717680]">Undertecknade handlingar och bokslutsrapporter</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0F766E]" />
                <div>
                  <div className="font-bold text-xs text-[#14161A]">K2 Årsredovisning 2026 (Undertecknad)</div>
                  <div className="text-[11px] text-[#717680] font-mono">Signerad via Mobilt BankID av Johan Norrström</div>
                </div>
              </div>
              <button 
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-white border border-[#E7E5E0] hover:bg-neutral-50 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                Ladda ner PDF
              </button>
            </div>

            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-5 h-5 text-teal-700" />
                <div>
                  <div className="font-bold text-xs text-[#14161A]">Momsdeklaration Q3 2026</div>
                  <div className="text-[11px] text-[#717680] font-mono">Inlämnad till Skatteverket</div>
                </div>
              </div>
              <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Inskickad
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KONTAKT MED BYRÅN */}
      {activeTab === 'kontakt' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chat Window */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 flex flex-col h-[480px]">
            <h3 className="font-semibold text-sm text-[#14161A] pb-3 border-b border-[#E7E5E0]">
              Meddelanden med Balans Redovisning
            </h3>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.isFirm ? 'items-start' : 'items-end'}`}>
                  <div className="text-[10px] text-[#717680] mb-0.5">{m.sender} · {m.time}</div>
                  <div className={`p-3 rounded-xl max-w-md text-xs leading-relaxed ${
                    m.isFirm ? 'bg-neutral-100 text-[#14161A]' : 'bg-[#0F766E] text-white'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-3 border-t border-[#E7E5E0] flex items-center gap-2">
              <input
                type="text"
                placeholder="Skriv ett meddelande till din redovisningskonsult..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                className="flex-1 text-xs py-2 px-3 bg-[#FAFAF8] border border-[#E7E5E0] rounded-lg focus:outline-none focus:border-[#0F766E]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Skicka
              </button>
            </form>
          </div>

          {/* Assigned Accountant Card */}
          <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider block mb-1">
                Din kontaktperson
              </span>
              <h3 className="text-base font-bold text-[#14161A]">Sara Wallin</h3>
              <p className="text-xs text-[#717680]">Auktoriserad Redovisningskonsult (FAR)</p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex items-center gap-2.5 text-[#535862]">
                  <Mail className="w-4 h-4 text-[#717680]" />
                  <a href="mailto:sara@balansredovisning.se" className="text-[#0F766E] hover:underline font-mono">
                    sara@balansredovisning.se
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-[#535862]">
                  <Phone className="w-4 h-4 text-[#717680]" />
                  <span className="font-mono">08-555 429 88</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E7E5E0] text-[11px] text-[#717680]">
              Balans Redovisning AB · Strandvägen 12, Stockholm
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
