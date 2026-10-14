import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Building2, FileText, Users, DollarSign, Calculator, Settings, ArrowRight, X } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, companies, setActiveCompanyId } = useAccounting();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.orgNr.includes(query) ||
    c.city.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const actions = [
    { label: 'Ny verifikation (Bokföring)', icon: FileText, path: '/bokforing?tab=ny', category: 'Bokföring' },
    { label: 'Bankavstämning & Open Banking', icon: Calculator, path: '/bokforing?tab=bank', category: 'Bokföring' },
    { label: 'Momsdeklaration (Skatteverket)', icon: FileText, path: '/bokforing?tab=moms', category: 'Bokföring' },
    { label: 'Kör ny löneperiod', icon: DollarSign, path: '/lon?tab=korning', category: 'Lön' },
    { label: 'Anställningsregister', icon: Users, path: '/lon?tab=anstallda', category: 'Lön' },
    { label: 'K2 Årsredovisning & Förvaltningsberättelse', icon: FileText, path: '/arsbokslut?tab=arsredovisning', category: 'Bokslut' },
    { label: 'Klientlista (65 företag)', icon: Building2, path: '/klienter', category: 'Klienter' },
    { label: 'Systemintegrationer (Skatteverket, Bolagsverket)', icon: Settings, path: '/integrationer', category: 'Inställningar' },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-[#E7E5E0] overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3 border-b border-[#E7E5E0] bg-[#FAFAF8]">
            <Search className="w-4 h-4 text-[#717680] mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Sök klienter, bokföring, lön, eller kommandon..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-sm text-[#14161A] placeholder-[#717680] focus:outline-none"
            />
            <button
              onClick={() => setIsCommandPaletteOpen(false)}
              className="p-1 text-[#717680] hover:text-[#14161A] rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-[#F0EFEA]">
            {/* Quick Actions / Navigation */}
            {actions.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#717680]">
                  Gå till sida / Åtgärd
                </div>
                {actions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(item.path);
                      setIsCommandPaletteOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FAFAF8] rounded-lg flex items-center justify-between text-xs font-medium text-[#14161A] group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4 text-[#0F766E]" />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] text-[#717680] group-hover:text-[#0F766E] flex items-center gap-1 font-mono">
                      {item.category} <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Companies */}
            {filteredCompanies.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#717680]">
                  Byt aktiv klient
                </div>
                {filteredCompanies.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setActiveCompanyId(comp.id);
                      setIsCommandPaletteOpen(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-[#FAFAF8] rounded-lg flex items-center justify-between text-xs text-[#14161A] group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-[#717680] group-hover:text-[#0F766E]" />
                      <div>
                        <span className="font-semibold block">{comp.name}</span>
                        <span className="text-[10px] text-[#717680] font-mono">{comp.orgNr} · {comp.city}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#0F766E] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Välj &rarr;
                    </span>
                  </button>
                ))}
              </div>
            )}

            {actions.length === 0 && filteredCompanies.length === 0 && (
              <div className="py-8 text-center text-xs text-[#717680]">
                Inga resultat matchade &quot;{query}&quot;. Prova ett företagsnamn, &quot;verifikation&quot; eller &quot;lön&quot;.
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-[#F5F5F3] border-t border-[#E7E5E0] text-[11px] text-[#717680] flex items-center justify-between">
            <span>Navigera med piltangenter</span>
            <span className="font-mono">Esc för att stänga</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
