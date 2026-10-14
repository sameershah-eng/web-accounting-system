import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Users, 
  History, 
  Lock, 
  Server, 
  ExternalLink,
  Power,
  UserPlus,
  Shield,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { UserRole } from '../types';

export const Integrations: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'integrationer';

  const { 
    integrations, 
    toggleIntegration, 
    users, 
    updateUserRole, 
    toggleUserActive, 
    auditLog, 
    currentUser,
    resetAllData 
  } = useAccounting();

  const [auditFilter, setAuditFilter] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Accountant');

  const filteredAudit = auditLog.filter(log =>
    log.action.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.details.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.companyName.toLowerCase().includes(auditFilter.toLowerCase()) ||
    log.userName.toLowerCase().includes(auditFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#0F766E] uppercase tracking-wider mb-1">
            System & Säkerhet
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14161A]">
            Inställningar & Myndighetskopplingar
          </h1>
          <p className="text-xs sm:text-sm text-[#535862] mt-0.5">
            Hantera API-kopplingar, användarbehörigheter och fullständig revisionslogg (Audit Log).
          </p>
        </div>

        <button
          onClick={resetAllData}
          className="px-3 py-1.5 bg-white border border-[#E7E5E0] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-medium text-[#717680] rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          title="Återställer testdatabasen till ursprungligt demonstrationsskick"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Återställ demodata
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E7E5E0] bg-white rounded-xl p-1 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setSearchParams({ tab: 'integrationer' })}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            currentTab === 'integrationer' ? 'bg-neutral-100 text-[#14161A] font-semibold' : 'text-[#717680] hover:text-[#14161A]'
          }`}
        >
          API & Myndigheter
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'anvandare' })}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            currentTab === 'anvandare' ? 'bg-neutral-100 text-[#14161A] font-semibold' : 'text-[#717680] hover:text-[#14161A]'
          }`}
        >
          Användare & Roller ({users.length})
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'audit' })}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
            currentTab === 'audit' ? 'bg-neutral-100 text-[#14161A] font-semibold' : 'text-[#717680] hover:text-[#14161A]'
          }`}
        >
          Revisionslogg (Audit Log)
        </button>
      </div>

      {/* TAB 1: INTEGRATIONER */}
      {currentTab === 'integrationer' && (
        <div className="space-y-6">
          
          {/* EU Hosting & Security Compliance Banner */}
          <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-start gap-3.5">
            <Server className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-semibold text-teal-950">EU-lagring & Dataskyddsförordningen (GDPR)</h4>
              <p className="text-teal-900/80 mt-0.5 leading-relaxed">
                All finansiell bokföringsdata, personnummer och lönefiler lagras i krypterade databaser (AES-256) inom Europeiska unionen (Stockholm/Frankfurt). Uppfyller Bokföringslagens (BFL 7 kap) krav på arkivering och oföränderlighet i minst 7 år.
              </p>
            </div>
          </div>

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((item) => (
              <div 
                key={item.id} 
                className="bg-white p-6 rounded-xl border border-[#E7E5E0] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#14161A]">{item.name}</h3>
                      <p className="text-xs text-[#535862] mt-0.5">{item.subtitle}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border flex items-center gap-1 shrink-0 ${
                      item.connected 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}>
                      {item.connected ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-neutral-500" />}
                      {item.connected ? 'Ansluten' : 'Frånkopplad'}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-[#FAFAF8] rounded-lg border border-[#E7E5E0] space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#717680]">
                      <span>Protokoll:</span>
                      <span className="text-[#14161A]">{item.apiType}</span>
                    </div>
                    <div className="flex justify-between text-[#717680]">
                      <span>Senaste synkning:</span>
                      <span className="text-[#14161A]">{item.lastSync}</span>
                    </div>
                    <div className="pt-1 text-[11px] text-[#535862]">
                      Status: {item.statusText}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#F0EFEA] flex items-center justify-between">
                  <span className="text-[11px] text-[#717680]">
                    {item.connected ? 'OAuth2 Token giltig' : 'Kräver ny inloggning'}
                  </span>
                  <button
                    onClick={() => toggleIntegration(item.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                      item.connected
                        ? 'bg-neutral-100 hover:bg-rose-50 hover:text-rose-700 text-neutral-700 border border-neutral-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    {item.connected ? 'Koppla från' : 'Anslut tjänst'}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: ANVÄNDARE & BEHÖRIGHETER (RBAC) */}
      {currentTab === 'anvandare' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E0] gap-4">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">
                Användare & Behörigheter (Rollstyrd åtkomst)
              </h3>
              <p className="text-xs text-[#717680]">
                Admin, Senior Accountant, Accountant samt begränsad Klientportal.
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Bjud in medarbetare
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E7E5E0] text-[#535862] font-medium">
                  <th className="py-2.5 px-4">Användare</th>
                  <th className="py-2.5 px-4">E-post</th>
                  <th className="py-2.5 px-4">Roll</th>
                  <th className="py-2.5 px-4">Senaste inloggning</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Åtgärd</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAFAF8]">
                    <td className="py-3 px-4 font-semibold text-[#14161A]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                          {u.avatarInitials}
                        </div>
                        <div>
                          <div>{u.name}</div>
                          {u.id === currentUser.id && (
                            <span className="text-[10px] text-teal-700 font-semibold">(Nuvarande användare)</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[#535862]">
                      {u.email}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className="text-xs py-1 px-2 bg-white border border-[#E7E5E0] rounded font-semibold text-[#14161A] focus:outline-none"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Senior Accountant">Senior Accountant</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Client">Client (Klientportal)</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-[#717680] font-mono">
                      {u.lastLogin}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.active ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {u.active ? 'Aktiv' : 'Inaktiverad'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleUserActive(u.id)}
                        className="px-2.5 py-1 text-xs border border-[#E7E5E0] hover:bg-neutral-100 rounded text-[#14161A] font-medium"
                      >
                        {u.active ? 'Inaktivera' : 'Aktivera'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REVISIONSLOGG (AUDIT LOG) */}
      {currentTab === 'audit' && (
        <div className="bg-white rounded-xl border border-[#E7E5E0] shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E5E0] gap-4">
            <div>
              <h3 className="font-semibold text-base text-[#14161A]">
                Revisionslogg (Audit Trail)
              </h3>
              <p className="text-xs text-[#717680]">
                Oavvislig tidsstämplad historik över alla registreringar, ändringar och undertecknanden.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Filtrera händelser eller bolag..."
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="w-full text-xs py-1.5 px-3 bg-[#FAFAF8] border border-[#E7E5E0] rounded-lg"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-[#FAFAF8] border-b border-[#E7E5E0] text-[#535862]">
                  <th className="py-2.5 px-3 w-36">Tidsstämpel</th>
                  <th className="py-2.5 px-3 w-40">Användare</th>
                  <th className="py-2.5 px-3 w-48">Händelse</th>
                  <th className="py-2.5 px-3">Detaljerad beskrivning</th>
                  <th className="py-2.5 px-3 w-44">Berört bolag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EFEA]">
                {filteredAudit.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAFAF8]">
                    <td className="py-2.5 px-3 text-[#717680]">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#14161A] font-sans">
                      {log.userName}
                      <span className="text-[10px] text-[#717680] block font-mono">({log.userRole})</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-teal-900 font-sans">{log.action}</td>
                    <td className="py-2.5 px-3 text-[#14161A] font-sans">{log.details}</td>
                    <td className="py-2.5 px-3 text-[#535862] font-sans">{log.companyName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E7E5E0] p-6"
            >
              <h3 className="text-base font-bold text-[#14161A] mb-3">
                Bjud in ny användare till byråsystemet
              </h3>
              <p className="text-xs text-[#535862] mb-4">
                En inbjudningslänk med e-postinloggning skickas till den angivna adressen.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#535862] font-semibold mb-1">Namn</label>
                  <input
                    type="text"
                    placeholder="För- och efternamn"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[#535862] font-semibold mb-1">E-postadress</label>
                  <input
                    type="email"
                    placeholder="namn@balansredovisning.se"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full py-1.5 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#535862] font-semibold mb-1">Systemroll</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full py-1.5 px-2.5 bg-[#FAFAF8] border border-[#E7E5E0] rounded-md"
                  >
                    <option value="Accountant">Accountant (Redovisningskonsult)</option>
                    <option value="Senior Accountant">Senior Accountant</option>
                    <option value="Admin">Admin (Byråledare)</option>
                    <option value="Client">Client (Klientanvändare)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E7E5E0] flex justify-end gap-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-xs text-[#717680]"
                >
                  Avbryt
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteName('');
                    setInviteEmail('');
                  }}
                  className="px-4 py-1.5 bg-gradient-to-r from-[#0F766E] to-[#1E40AF] text-white rounded text-xs font-semibold shadow-xs"
                >
                  Skicka inbjudan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
