import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Navbar } from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer } from './components/ToastContainer';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Bookkeeping } from './pages/Bookkeeping';
import { Payroll } from './pages/Payroll';
import { YearEnd } from './pages/YearEnd';
import { Integrations } from './pages/Integrations';
import { ClientPortal } from './pages/ClientPortal';

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const MainContent: React.FC = () => {
  const { isClientView } = useAccounting();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#14161A] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        <PageWrapper>
          <Routes>
            <Route path="/" element={isClientView ? <ClientPortal /> : <Dashboard />} />
            <Route path="/klienter" element={<Clients />} />
            <Route path="/bokforing" element={<Bookkeeping />} />
            <Route path="/lon" element={<Payroll />} />
            <Route path="/arsbokslut" element={<YearEnd />} />
            <Route path="/integrationer" element={<Integrations />} />
            
            {/* Client Portal routes */}
            <Route path="/rapporter" element={<ClientPortal />} />
            <Route path="/dokument" element={<ClientPortal />} />
            <Route path="/meddelanden" element={<ClientPortal />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageWrapper>
      </main>

      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AccountingProvider>
        <MainContent />
      </AccountingProvider>
    </BrowserRouter>
  );
}
