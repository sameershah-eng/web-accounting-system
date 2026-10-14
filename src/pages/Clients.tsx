import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Search, 
  Filter, 
  ChevronRight, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Mail, 
  Calendar,
  X,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Company, CompanyForm } from '../types';

export const Clients: React.FC = () => {
  const { companies, activeCompanyId, setActiveCompanyId } = useAccounting();
  const [search, setSearch] = useState('');
  const [formFilter, setFormFilter] = useState<'ALL' | CompanyForm>('ALL');
  const [fiscalEndFilter, setFiscalEndFilter] = useState<string>('ALL');
  const [selectedClient, setSelectedClient] = useState<Company | null>(null);
  const navigate = useNavigate();

  const filtered = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.orgNr.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.assignedAccountant.toLowerCase().includes(search.toLowerCase());

    const matchesForm = formFilter === 'ALL' || c.form === formFilter;
    const matchesFiscal = fiscalEndFilter === 'ALL' || c.fiscalYearEnd === fiscalEndFilter;

    return matchesSearch && matchesForm && matchesFiscal;
  });

  const abCount = companies.filter(c => c.form === 'AB').length;
  const efCount = companies.filter(c => c.form === 'EF').length;

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1">
            Klientregister · Byråövergripande
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14161A]">
            Klienter ({companies.length} anslutna företag)
          </h1>
          <p className="text-xs sm:text-sm text-[#535862] mt-0.5">
            Översikt över alla uppdragsgivare, bolagsformer, momsperioder och handläggare.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-[#717680] bg-white px-3 py-2 rounded-lg border border-[#E7E5E0] font-mono">
            <strong>{abCount}</strong> AB · <strong>{efCount}</strong> Enskilda firmor
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5E0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#717680]" />
          <input
            type="text"
            placeholder="Sök klient, org.nr, ort eller handläggare..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-[#FAFAF8] border border-[#E7E5E0] rounded-lg focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 rounded-lg border border-[#E7E5E0]">
            <button
              onClick={() => setFormFilter('ALL')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                formFilter === 'ALL' ? 'bg-white shadow-xs text-[#14161A]' : 'text-[#717680] hover:text-[#14161A]'
              }`}
            >
              Alla former ({companies.length})
            </button>
            <button
              onClick={() => setFormFilter('AB')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                formFilter === 'AB' ? 'bg-white shadow-xs text-[#14161A]' : 'text-[#717680] hover:text-[#14161A]'
              }`}
            >
              Aktiebolag ({abCount})
            </button>
            <button
              onClick={() => setFormFilter('EF')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                formFilter === 'EF' ? 'bg-white shadow-xs text-[#14161A]' : 'text-[#717680] hover:text-[#14161A]'
              }`}
            >
              Enskild firma ({efCount})
            </button>
          </div>

          <select
            value={fiscalEndFilter}
            onChange={(e) => setFiscalEndFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-[#FAFAF8] border border-[#E7E5E0] rounded-lg text-[#14161A] focus:outline-none"
          >
            <option value="ALL">Alla bokslutsdatum</option>
            <option value="12-31">Bokslut 31 dec</option>
            <option value="06-30">Bokslut 30 jun</option>
            <option value="08-31">Bokslut 31 aug</option>
            <option value="04-30">Bokslut 30 apr</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E7E5E0] bg-[#FAFAF8] text-[#535862] font-medium">
                <th className="py-3 px-4">Företagsnamn</th>
                <th className="py-3 px-4 font-mono">Organisationsnummer</th>
                <th className="py-3 px-4">Ort</th>
                <th className="py-3 px-4">Bransch</th>
                <th className="py-3 px-4">Räkenskapsår</th>
                <th className="py-3 px-4">Momsperiod</th>
                <th className="py-3 px-4">Handläggare</th>
                <th className="py-3 px-4 text-right">Åtgärd</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EFEA]">
              {filtered.map(company => {
                const isActive = company.id === activeCompanyId;
                return (
                  <tr 
                    key={company.id}
                    onClick={() => setSelectedClient(company)}
                    className={`hover:bg-[#FAFAF8] cursor-pointer transition-colors ${
                      isActive ? 'bg-teal-50/50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center text-[10px] font-bold text-neutral-700 shrink-0">
                          {company.form}
                        </div>
                        <div>
                          <div className="font-semibold text-[#14161A] flex items-center gap-1.5">
                            {company.name}
                            {isActive && (
                              <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                                Aktiv
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#717680]">{company.contactPerson}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#535862]">
                      {company.orgNr}
                    </td>

                    <td className="py-3 px-4 text-[#535862]">
                      {company.city}
                    </td>

                    <td className="py-3 px-4 text-[#535862] max-w-[140px] truncate">
                      {company.industry}
                    </td>

                    <td className="py-3 px-4 font-mono text-[#535862]">
                      {company.fiscalYearEnd === '12-31' ? 'Kalenderår (12-31)' : `Brutet (${company.fiscalYearEnd})`}
                    </td>

                    <td className="py-3 px-4 text-[#535862]">
                      <span className="px-2 py-0.5 rounded bg-neutral-100 text-[11px] font-medium text-neutral-700">
                        {company.vatPeriod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#535862]">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#0F766E]" />
                        {company.assignedAccountant}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCompanyId(company.id);
                        }}
                        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                          isActive
                            ? 'bg-teal-100 text-teal-900 border border-teal-200'
                            : 'bg-white hover:bg-neutral-100 text-[#14161A] border border-[#E7E5E0]'
                        }`}
                      >
                        {isActive ? 'Vald' : 'Välj bolag'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#717680] text-xs">
                    Inga klienter matchade dina filterkriterier.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail Drawer / Modal */}
      <AnimatePresence>
        {selectedClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-lg h-full bg-white shadow-2xl border-l border-[#E7E5E0] flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#E7E5E0] bg-[#FAFAF8] relative">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="absolute top-5 right-5 p-1.5 rounded-lg text-[#717680] hover:text-[#14161A] hover:bg-neutral-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1">
                  <span>Klientdetaljer</span>
                  <span>·</span>
                  <span className="font-mono">{selectedClient.form}</span>
                </div>
                <h2 className="text-xl font-bold text-[#14161A] pr-8">
                  {selectedClient.name}
                </h2>
                <p className="text-xs font-mono text-[#717680] mt-0.5">
                  Org.nr: {selectedClient.orgNr}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveCompanyId(selectedClient.id);
                      setSelectedClient(null);
                      navigate('/bokforing');
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    Öppna bokföring <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setActiveCompanyId(selectedClient.id);
                      setSelectedClient(null);
                      navigate('/arsbokslut?tab=arsredovisning');
                    }}
                    className="px-3 py-1.5 bg-white border border-[#E7E5E0] text-xs font-medium text-[#14161A] rounded-lg hover:bg-neutral-50"
                  >
                    K2 Årsredovisning
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="p-6 space-y-6 flex-1">
                
                {/* Core Registry Info */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#717680] mb-3">
                    Basuppgifter & Registrering
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862]">Bolagsform</span>
                      <span className="font-semibold text-[#14161A]">{selectedClient.form === 'AB' ? 'Aktiebolag (AB)' : 'Enskild näringsverksamhet (EF)'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862]">Räkenskapsår</span>
                      <span className="font-mono text-[#14161A]">{selectedClient.fiscalYear}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862]">Redovisningsstandard</span>
                      <span className="font-semibold text-[#14161A]">{selectedClient.accountingStandard} (BFNAR 2016:10)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862]">Momsredovisning</span>
                      <span className="font-semibold text-[#14161A]">{selectedClient.vatPeriod}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862]">Bransch</span>
                      <span className="text-[#14161A]">{selectedClient.industry}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862]">Säte / Kommun</span>
                      <span className="text-[#14161A]">{selectedClient.city}</span>
                    </div>
                  </div>
                </div>

                {/* Bank & Financial Integration */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#717680] mb-3">
                    Bankförbindelse & Open Banking
                  </h4>
                  <div className="p-3 bg-[#FAFAF8] rounded-lg border border-[#E7E5E0] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[#535862]">
                        <CreditCard className="w-3.5 h-3.5 text-[#0F766E]" />
                        Huvudbank
                      </span>
                      <span className="font-semibold text-[#14161A]">{selectedClient.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#535862]">Bankgironummer</span>
                      <span className="text-[#14161A]">5234-9812</span>
                    </div>
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-[#535862]">Företagskonto</span>
                      <span className="text-[#14161A]">{selectedClient.bankAccount}</span>
                    </div>
                    <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-between text-[11px] text-emerald-800">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        PSD2 Automatflöde aktivt
                      </span>
                      <span className="font-mono text-[#717680]">Synkad idag</span>
                    </div>
                  </div>
                </div>

                {/* Contact & Assignment */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#717680] mb-3">
                    Kontakt & Byråansvarig
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862]">Kontaktperson</span>
                      <span className="font-semibold text-[#14161A]">{selectedClient.contactPerson}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862] flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#717680]" /> E-post
                      </span>
                      <a href={`mailto:${selectedClient.email}`} className="text-[#0F766E] hover:underline font-mono">
                        {selectedClient.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#717680]" /> Telefon
                      </span>
                      <span className="font-mono text-[#14161A]">{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-[#F0EFEA]">
                      <span className="text-[#535862]">Auktoriserad handläggare</span>
                      <span className="font-semibold text-teal-900">{selectedClient.assignedAccountant}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-[#FAFAF8] border-t border-[#E7E5E0] flex items-center justify-between">
                <span className="text-xs text-[#717680]">Klient ID: {selectedClient.id}</span>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="px-3 py-1.5 bg-white border border-[#E7E5E0] text-xs font-medium text-[#14161A] rounded-lg hover:bg-neutral-50"
                >
                  Stäng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
