# IOUM - I Owe You and Me 🤝💰

A modern, intuitive, and privacy-respecting personal debt and loan tracker. Built with **React 19**, **TypeScript**, and **Tailwind CSS**.

IOUM runs **100% locally on your device** with zero server authentication, zero analytics, and zero external tracking.

---

## ✨ Features

- **Lend & Borrow Tracking**: Track who borrowed from you (They owe you) and who you borrowed from (You owe them).
- **Contact & Person Profiles**: Organize debts by person, customize avatar colors, phone numbers, emails, and notes.
- **Smart Settlements**: Settle full balances or record partial repayment installments with celebration confetti 🎉.
- **Due Date Alerts**: Visual badges and countdowns for upcoming or overdue debt settlements.
- **Portfolio Summary**: Live dashboard cards for Net Balance, Total You Are Owed, and Total You Owe.
- **Instant Search & Multi-Filters**: Filter by Lent/Borrowed, Active/Settled, Person, and sort by date or amount.
- **Multi-Currency Support**: Choose from USD ($), EUR (€), GBP (£), INR (₹), CAD (CA$), AUD (A$), JPY (¥), SGD (S$), and AED.
- **Dark & Light Mode**: Auto-detects system preferences with a manual toggle.
- **100% Offline & Private**: Zero registration, zero cloud storage; runs entirely client-side using `localStorage`.
- **Data Portability**: 1-click JSON backup export and import, with schema validation.
- **Cross-Platform Download/Install**:
  - **Android**: Install directly from Chrome/Edge as an offline standalone PWA app.
  - **Windows**: Install as a native desktop window with Start Menu and Taskbar pinning.
  - **macOS**: Install via Safari ("Add to Dock") or Chrome ("Install IOUM") as a standalone Mac application.
  - **Native Packaging**: Preconfigured recipes for Capacitor (Android APK) and Electron (Windows `.exe`, macOS `.dmg`).

---

## 🏛 Architecture & Design Patterns (SOLID & DRY)

IOUM follows clean architecture and software engineering best practices:

### SOLID Principles
1. **Single Responsibility Principle (SRP)**:
   - `BalanceCalculationService`: Pure calculation functions for portfolio summaries and individual net balances.
   - `TransactionService`: Business logic for transaction state transitions (`PENDING` → `PARTIALLY_PAID` → `SETTLED`).
   - `PersonService`: Person validation and entity creation.
   - `BackupService`: JSON schema validation, serialization, and demo generation.
   - `LocalStorageRepository`: Persistence exclusively.
2. **Open/Closed Principle (OCP)**:
   - Data access relies on the `IStorageRepository<T>` contract. Any storage engine (e.g., IndexedDB, SQLite, or Encrypted Vault) can be added without modifying domain logic or UI components.
3. **Liskov Substitution Principle (LSP)**:
   - Storage implementations strictly satisfy `IStorageRepository<T>` and can be swapped transparently.
4. **Interface Segregation Principle (ISP)**:
   - Focused domain types and DTO interfaces (`CreatePersonDTO`, `CreateTransactionDTO`, `CreateSettlementDTO`, `FilterState`).
5. **Dependency Inversion Principle (DIP)**:
   - High-level hooks and context depend on storage abstractions (`IStorageRepository`), not direct browser globals.

### DRY (Don't Repeat Yourself)
- Centralized formatting utilities (`formatCurrency`, `formatDate`, `getDueDateStatus`).
- Reusable atomic components (`Button`, `Modal`, `Avatar`, `Badge`, `ToastContainer`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd IOUM

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Running Tests
```bash
# Run unit tests via Vitest
npm run test
```

### Building for Production
```bash
# Build optimized web assets
npm run build

# Preview production build locally
npm run preview
```

---

## 📱 Cross-Platform Installation

### 1. Progressive Web App (PWA)
IOUM is a Progressive Web App. Open it in any modern browser:
- **Android**: Tap browser menu `(⋮)` → **"Install app"** or **"Add to Home screen"**.
- **Windows (10/11)**: Click the **"Install"** icon in the Microsoft Edge / Chrome address bar.
- **macOS**: In Safari, choose **File → "Add to Dock"**, or in Chrome click **"Install IOUM"**.

### 2. Standalone Native Binaries
- **Android APK** (via Capacitor):
  ```bash
  npm run cap:android
  ```
- **Desktop (Windows / macOS)** (via Electron):
  ```bash
  npm run electron:start
  ```

---

## 📄 License
MIT License.
