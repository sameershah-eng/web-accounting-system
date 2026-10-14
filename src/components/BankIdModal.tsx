import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Shield, Smartphone, RefreshCw, X } from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { YearEndSigner } from '../types';

interface BankIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  signer: YearEndSigner | null;
  onSuccess: () => void;
}

export const BankIdModal: React.FC<BankIdModalProps> = ({ isOpen, onClose, signer, onSuccess }) => {
  const { signYearEnd, activeCompany } = useAccounting();
  const [step, setStep] = useState<'prompt' | 'qr' | 'signing' | 'success'>('qr');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('qr');
      setProgress(0);
    }
  }, [isOpen]);

  const handleSimulateSign = () => {
    setStep('signing');
    setProgress(30);

    setTimeout(() => {
      setProgress(75);
    }, 900);

    setTimeout(() => {
      setProgress(100);
      setStep('success');
      if (signer) {
        signYearEnd(signer.id);
      }
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    }, 1800);
  };

  if (!isOpen || !signer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E7E5E0] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-teal-300 font-bold text-xs">
                ID
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight">Mobilt BankID</h3>
                <p className="text-[11px] text-slate-300">Svensk e-legitimation</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="mb-4 text-center">
              <p className="text-xs text-[#717680]">Undertecknande av handling:</p>
              <h4 className="text-sm font-semibold text-[#14161A]">
                Årsredovisning K2 – {activeCompany.name}
              </h4>
              <p className="text-xs text-[#717680] mt-1 font-mono">
                Undertecknare: {signer.name} ({signer.personnummer})
              </p>
            </div>

            {step === 'qr' && (
              <div className="flex flex-col items-center">
                {/* Simulated dynamic QR code with security animated scan line */}
                <div className="relative p-3 bg-white border-2 border-slate-900 rounded-xl shadow-xs mb-4">
                  <div className="w-44 h-44 bg-slate-950 p-2 rounded-lg flex flex-col justify-between relative overflow-hidden">
                    {/* Simulated pixelated QR pattern */}
                    <div className="grid grid-cols-6 gap-1.5 w-full h-full opacity-90">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-xs transition-colors duration-500 ${
                            (i * 7 + 3) % 4 === 0 || i % 5 === 0 || i < 3 || i === 5 || i === 30
                              ? 'bg-white'
                              : 'bg-slate-900'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Scanning animation bar */}
                    <motion.div
                      animate={{ y: [0, 160, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-blue-500 shadow-[0_0_10px_rgba(20,184,166,0.8)]"
                    />
                  </div>
                </div>

                <p className="text-xs text-center text-[#535862] mb-5 max-w-xs">
                  Öppna BankID-appen på din mobila enhet och läs av QR-koden ovan.
                </p>

                <div className="w-full space-y-2">
                  <button
                    onClick={handleSimulateSign}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                  >
                    <Smartphone className="w-4 h-4 text-teal-400" />
                    Signera på denna enhet (Demo BankID)
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 px-4 bg-transparent hover:bg-neutral-100 text-xs text-[#717680] font-medium rounded-lg transition-colors"
                  >
                    Avbryt signering
                  </button>
                </div>
              </div>
            )}

            {step === 'signing' && (
              <div className="py-8 flex flex-col items-center text-center">
                <RefreshCw className="w-10 h-10 text-teal-600 animate-spin mb-4" />
                <h4 className="text-sm font-semibold text-[#14161A] mb-1">
                  Väntar på BankID-app...
                </h4>
                <p className="text-xs text-[#717680] max-w-xs mb-4">
                  Verifierar säkerhetskod och kryptografiskt certifikat mot BankID-tjänsten.
                </p>
                <div className="w-48 bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-600 to-blue-600"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-[#14161A] mb-1">
                  Signering fullföljd!
                </h4>
                <p className="text-xs text-[#717680]">
                  Årsredovisningen har signerats med godkänd svensk avancerad elektronisk underskrift.
                </p>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 bg-[#FAFAF8] border-t border-[#E7E5E0] flex items-center justify-center gap-1.5 text-[11px] text-[#717680]">
            <Shield className="w-3.5 h-3.5 text-teal-700" />
            <span>Kvalificerad e-signatur enligt EU-förordning eIDAS</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
