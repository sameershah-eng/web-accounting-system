import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Search, 
  Command, 
  Check, 
  ChevronDown, 
  Shield, 
  UserCheck, 
  Eye, 
  LogOut,
  SlidersHorizontal,
  FileCheck2,
  Bell
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const { 
    companies, 
    activeCompany, 
    setActiveCompanyId, 
    currentUser, 
    setCurrentUser, 
    users, 
    isClientView, 
    setIsClientView, 
    setIsCommandPaletteOpen 
  } = useAccounting();

  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCompanyDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(companySearch.toLowerCase()) || 
    c.orgNr.includes(companySearch) ||
    c.city.toLowerCase().includes(companySearch.toLowerCase())
  );

  const navItems = isClientView
    ? [
        { path: '/', label: 'Översikt' },
        { path: '/rapporter', label: 'Rapporter' },
        { path: '/dokument', label: 'Dokument & K2' },
        { path: '/meddelanden', label: 'Kontakt med byrån' },
      ]
    : [
        { path: '/', label: 'Översikt' },
        { path: '/klienter', label: 'Klienter' },
        { path: '/bokforing', label: 'Bokföring' },
        { path: '/lon', label: 'Lön' },
        { path: '/arsbokslut', label: 'Bokslut & K2' },
        { path: '/integrationer', label: 'Inställningar' },
      ];

  const handleRoleChange = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E7E5E0] shadow-[0_1px_2px_rgba(0,0,0,0.03)] no-print">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left: Brand wordmark & Client status */}
        <div className="flex items-center gap-3 shrink-0">
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0F766E] to-[#1E40AF] flex items-center justify-center text-white font-bold text-sm tracking-tighter shadow-sm transition-transform group-hover:scale-105">
              B
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-[#14161A] flex items-center gap-1.5 leading-none">
                BALANS
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#0F766E] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200/60">
                  Byrå
                </span>
              </div>
              <p className="text-[11px] text-[#717680] leading-tight">Auktoriserat byråsystem</p>
            </div>
          </div>
        </div>

        {/* Center: Module navigation with sliding gradient pill */}
        <nav className="hidden md:flex items-center gap-1 relative">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: linkActive }) => `
                  relative px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap rounded-md
                  ${(linkActive || isActive) ? 'text-white' : 'text-[#535862] hover:text-[#14161A] hover:bg-neutral-100/60'}
                `}
              >
                {(isActive || location.pathname === item.path) && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    className="absolute inset-0 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] rounded-md shadow-xs z-0"
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Company Switcher, Cmd+K, Role & Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Quick client portal toggle button */}
          <button
            onClick={() => setIsClientView(!isClientView)}
            title={isClientView ? 'Växla till redovisningskonsult' : 'Förhandsgranska klientvy'}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-all ${
              isClientView 
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-medium' 
                : 'bg-white text-[#535862] hover:text-[#14161A] border-[#E7E5E0] hover:bg-neutral-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isClientView ? 'Klientvy aktiv' : 'Klientvy'}</span>
          </button>

          {/* Company Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCompanyDropdownOpen(!companyDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#F5F5F3] hover:bg-[#EFEFEA] text-[#14161A] rounded-lg border border-[#E7E5E0] transition-colors max-w-[200px] sm:max-w-[260px]"
            >
              <Building2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
              <div className="text-left truncate">
                <span className="font-semibold block truncate leading-tight">{activeCompany.name}</span>
                <span className="text-[10px] text-[#717680] font-mono leading-none block">{activeCompany.orgNr}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#717680] shrink-0 ml-auto" />
            </button>

            <AnimatePresence>
              {companyDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-[#E7E5E0] p-2 z-50 overflow-hidden"
                >
                  <div className="px-2 pt-1 pb-2 border-b border-[#F0EFEA] mb-1">
                    <div className="text-[11px] font-semibold text-[#717680] uppercase tracking-wider mb-1.5">
                      Välj klient (65 aktiva bolag)
                    </div>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#717680]" />
                      <input
                        type="text"
                        placeholder="Sök bolag, org.nr eller ort..."
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        autoFocus
                        className="w-full text-xs pl-8 pr-3 py-1.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-[#F5F5F3]">
                    {filteredCompanies.slice(0, 15).map(c => {
                      const isSelected = c.id === activeCompany.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveCompanyId(c.id);
                            setCompanyDropdownOpen(false);
                            setCompanySearch('');
                          }}
                          className={`w-full text-left px-2.5 py-2 hover:bg-[#FAFAF8] rounded-md flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-teal-50/70' : ''
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="text-xs font-semibold text-[#14161A] truncate flex items-center gap-1.5">
                              {c.name}
                              <span className="text-[10px] font-mono px-1 py-0.2 bg-neutral-100 rounded text-neutral-600">
                                {c.form}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#717680] font-mono flex items-center gap-1.5">
                              <span>{c.orgNr}</span>
                              <span>·</span>
                              <span>{c.city}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#0F766E] shrink-0" />}
                        </button>
                      );
                    })}
                    {filteredCompanies.length === 0 && (
                      <div className="p-4 text-center text-xs text-[#717680]">
                        Inga klienter matchade sökningen.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Command Trigger Cmd+K */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#717680] hover:text-[#14161A] bg-[#F5F5F3] hover:bg-[#EFEFEA] border border-[#E7E5E0] rounded-md transition-colors"
            title="Snabbkommandon (Ctrl+K / Cmd+K)"
          >
            <Command className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[10px] font-mono font-medium">K</span>
          </button>

          {/* Notifications bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 text-[#535862] hover:text-[#14161A] hover:bg-neutral-100 rounded-md transition-colors relative"
              title="Aviseringar och deadlines"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white"></span>
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E7E5E0] p-3 z-50"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#F0EFEA] mb-2">
                    <span className="text-xs font-semibold text-[#14161A]">Kommande tidsfrister</span>
                    <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded">3 aktiva</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                      <div className="font-medium text-[#14161A]">Momsdeklaration Q3</div>
                      <div className="text-[11px] text-[#717680]">Förfallodatum: 12 nov 2026 (Norrström Bygg AB)</div>
                    </div>
                    <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                      <div className="font-medium text-[#14161A]">AGI Arbetsgivardeklaration</div>
                      <div className="text-[11px] text-[#717680]">Förfallodatum: 12 nov 2026 (65 klienter)</div>
                    </div>
                    <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                      <div className="font-medium text-[#14161A]">Årsredovisning K2 klar för signering</div>
                      <div className="text-[11px] text-[#717680]">Väntar på BankID-signatur från revisor</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile & Role switcher */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 bg-white hover:bg-neutral-50 border border-[#E7E5E0] rounded-lg transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-semibold text-[11px] flex items-center justify-center">
                {currentUser.avatarInitials}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <span className="font-medium block text-[#14161A]">{currentUser.name.split(' ')[0]}</span>
                <span className="text-[10px] text-[#717680]">{currentUser.role}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#717680]" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-[#E7E5E0] p-2 z-50"
                >
                  <div className="px-3 py-2 border-b border-[#F0EFEA] mb-2">
                    <div className="font-semibold text-xs text-[#14161A]">{currentUser.name}</div>
                    <div className="text-[11px] text-[#717680] truncate">{currentUser.email}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      <Shield className="w-3 h-3 text-teal-600" />
                      {currentUser.role}
                    </div>
                  </div>

                  <div className="px-2 py-1 text-[10px] font-semibold text-[#717680] uppercase tracking-wider">
                    Byt roll (Demoväxling)
                  </div>

                  {(['Admin', 'Senior Accountant', 'Accountant', 'Client'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between transition-colors ${
                        currentUser.role === r ? 'bg-teal-50 text-teal-900 font-semibold' : 'hover:bg-neutral-50 text-[#14161A]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-[#717680]" />
                        {r}
                      </span>
                      {currentUser.role === r && <Check className="w-3.5 h-3.5 text-teal-700" />}
                    </button>
                  ))}

                  <div className="mt-2 pt-2 border-t border-[#F0EFEA]">
                    <button
                      onClick={() => {
                        navigate('/integrationer');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#535862] hover:text-[#14161A] hover:bg-neutral-50 rounded-md flex items-center gap-2"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Systeminställningar & Användare
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </header>
  );
};
