import React, { useState } from 'react';
import type { Person, Transaction, TransactionType } from './types';
import { ToastContainer } from './components/common/ToastContainer';
import { SummaryCards } from './components/dashboard/SummaryCards';
import { Footer } from './components/layout/Footer';
import { Navbar } from './components/layout/Navbar';
import { DownloadAppModal } from './components/modals/DownloadAppModal';
import { PersonDetailModal } from './components/modals/PersonDetailModal';
import { PersonModal } from './components/modals/PersonModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { SettleModal } from './components/modals/SettleModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { PersonList } from './components/persons/PersonList';
import { TransactionList } from './components/transactions/TransactionList';
import { IOUMProvider, useIOUM } from './context/IOUMContext';

const MainApp: React.FC = () => {
  const { persons } = useIOUM();

  // Modal visibility states
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Person modals
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [personToEdit, setPersonToEdit] = useState<Person | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  // Transaction modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [transactionInitialType, setTransactionInitialType] = useState<TransactionType>('LENT');
  const [transactionInitialPersonId, setTransactionInitialPersonId] = useState<string | undefined>();

  // Settlement modal
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleTransactionId, setSettleTransactionId] = useState<string | null>(null);

  // Handlers for Transactions
  const handleOpenNewTransaction = (type: TransactionType = 'LENT', personId?: string) => {
    setTransactionToEdit(null);
    setTransactionInitialType(type);
    setTransactionInitialPersonId(personId);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setTransactionToEdit(tx);
    setIsTransactionModalOpen(true);
  };

  const handleOpenSettle = (txId: string) => {
    setSettleTransactionId(txId);
    setIsSettleModalOpen(true);
  };

  // Handlers for Persons
  const handleOpenNewPerson = () => {
    setPersonToEdit(null);
    setIsPersonModalOpen(true);
  };

  const handleEditPerson = (personId: string) => {
    const person = persons.find((p) => p.id === personId);
    if (person) {
      setPersonToEdit(person);
      setIsPersonModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenNewTransaction={handleOpenNewTransaction}
        onOpenNewPerson={handleOpenNewPerson}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* Dashboard Overview Cards */}
        <section aria-label="Portfolio Summary">
          <SummaryCards
            onOpenNewTransaction={handleOpenNewTransaction}
            onOpenNewPerson={handleOpenNewPerson}
          />
        </section>

        {/* People Section */}
        <section aria-label="People and Balances">
          <PersonList
            onOpenNewPerson={handleOpenNewPerson}
            onSelectPerson={(id) => setSelectedPersonId(id)}
          />
        </section>

        {/* Transactions Feed Section */}
        <section aria-label="Transactions History">
          <TransactionList
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            onSettleTransaction={handleOpenSettle}
            onSelectPerson={(id) => setSelectedPersonId(id)}
          />
        </section>
      </main>

      {/* Modern Footer */}
      <Footer
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Dialogs and Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        transactionToEdit={transactionToEdit}
        initialType={transactionInitialType}
        initialPersonId={transactionInitialPersonId}
        onOpenNewPerson={handleOpenNewPerson}
      />

      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        personToEdit={personToEdit}
      />

      <PersonDetailModal
        isOpen={!!selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
        personId={selectedPersonId}
        onEditPerson={(id) => {
          setSelectedPersonId(null);
          handleEditPerson(id);
        }}
        onNewTransactionWithPerson={(personId, type) => {
          setSelectedPersonId(null);
          handleOpenNewTransaction(type, personId);
        }}
        onSettleTransaction={(txId) => {
          handleOpenSettle(txId);
        }}
      />

      <SettleModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        transactionId={settleTransactionId}
      />

      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <IOUMProvider>
      <MainApp />
    </IOUMProvider>
  );
}

export default App;
