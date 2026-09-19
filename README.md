<div align="center">

# 💰 Khorcha AI (খরচা AI)
### **Intelligent, Bilingual Personal Finance & Budget Tracker**
*Powered by Google Gemini 3.8 & Resilient Offline Bangla NLP*

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<p align="center">
  <b>Khorcha AI</b> is an intelligent, privacy-first personal money management application crafted specifically for Bangladeshi users and Bengali speakers worldwide. It transforms natural everyday spoken sentences into categorized financial transactions in milliseconds, coupled with real-time financial health analytics and automated PDF reporting.
</p>

[Key Features](#-key-features) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [API Reference](#-api-reference)

---

</div>

## 🌟 Key Features

### 1. 🧠 Khorcha AI Smart Input (Bangla NLP + Gemini)
- **Natural Language Parsing**: Record transactions using everyday Bengali or Banglish phrases without navigating tedious multi-step forms.
- **Dual-Engine Precision**: Powered by **Google Gemini 3.8 Flash** structured outputs alongside a dedicated, deterministic **Bangla NLP engine**.
- **Context Extraction**: Automatically detects:
  - **Amount**: Bengali (`১২০`, `৪৫,০০০`) and English digits (`120`, `45000`), commas, and decimals.
  - **Transaction Type**: Distinguishes income (`বেতন`, `পেল`, `লাভ`) from expenses (`বাজার`, `ভাড়া`, `বিল`).
  - **Category**: Classifies into Food, Transport, Rent & Utilities, Shopping, Healthcare, Education, and more.
  - **Payment Channels**: Detects bKash, Nagad, Rocket, Bank/Card, and Cash.
  - **Relative Dates**: Resolves relative expressions like *গতকাল* (yesterday) and *আজকে* (today).

### 2. 🛡️ Fault-Tolerant Circuit Breaker & 100% Offline-First
- **Zero-Downtime Resilience**: Even if the cloud LLM is rate-limited, offline, or returns a quota restriction (`403 / 429`), the app **never crashes or throws errors**.
- **Automated Fallback**: Seamlessly switches to the client/server heuristic Bangla NLP parser and rule-based financial advisor, guaranteeing 100% uptime.

### 3. 🇧🇩 Localized for Bangladesh
- **Digital Wallets**: Native support for bKash (বিকাশ), Nagad (নগদ), Rocket (রকেট), Bank/Card (ব্যাংক/কার্ড), and Cash (নগদ টাকা).
- **Numeral Toggle**: Instant one-click toggle between English numbers (`1,234.50`) and Bengali numerals (`১,২৩৪.৫০`).
- **Culturally Relevant Categories**: Tailored for daily life in Bangladesh (কাঁচা বাজার, রিকশাভাড়া, বাসা ও বিদ্যুৎ বিল, টিউশন ফি, ঈদ সালামি).

### 4. 📊 Financial Analytics & Real-Time Budgeting
- **Financial Health Score**: Dynamic rating (0–100) based on the globally recognized **50/30/20 budgeting rule**.
- **Visual Budget Progress**: Real-time progress bars with warning thresholds (Safe, Approaching Limit, Over Budget).
- **Smart Category Breakdown**: Visual representation of top expense drivers with contextual, actionable saving tips.

### 5. 📄 Instant PDF Financial Statements
- **Client-Side Export**: Generate publication-ready PDF statements directly in the browser using `jspdf` and `jspdf-autotable`.
- **Custom Time Periods**: Filter statements by All-Time, This Month, Last 30 Days, or Custom Date Ranges.
- **Summary Cards & Tables**: Includes net balance overview, category spending summaries, and complete transaction tables.

### 6. 🔒 Privacy-First Architecture
- **Client-Side Storage**: All user financial records remain strictly on the user's local browser via secure `localStorage`.
- **No Cloud Data Tracking**: Personal transaction records are never stored in remote databases, ensuring complete data ownership.

---

## 💡 How Khorcha AI Smart Input Works

| User Writes (Bengali / Banglish) | Extracted Amount | Type | Category | Payment Method |
| :--- | :---: | :---: | :---: | :---: |
| `"আজকে দুপুরের খাবার ১২০ টাকা নগদ"` | **৳120** | Expense | খাবার (Food) | নগদ (Cash) |
| `"বেতন পেলাম ৪৫০০০ বিকাশ"` | **৳45,000** | Income | বেতন (Salary) | বিকাশ (bKash) |
| `"অফিসে যাওয়ার রিকশাভাড়া ৫০ টাকা"` | **৳50** | Expense | যাতায়াত (Transport) | নগদ (Cash) |
| `"বাসার বিদ্যুৎ বিল ৯২০ টাকা কার্ড"` | **৳920** | Expense | বাড়ি ভাড়া ও বিল (Bills) | ব্যাংক / কার্ড (Card) |
| `"ফার্মেসি থেকে ওষুধ নিলাম ৩৪০ টাকা"` | **৳340** | Expense | স্বাস্থ্য (Health) | নগদ (Cash) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                      │
│     UI Components • State Management • LocalStorage Cache    │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
     [Online Request]                      [Network Error]
            │                                     │
            ▼                                     ▼
┌──────────────────────────────┐        ┌─────────────────────┐
│   Full-Stack Express API     │        │ Client-Side Parser  │
│  /api/ai/parse-expense       │        │ (src/lib/banglaNlp) │
└──────────────┬───────────────┘        └──────────┬──────────┘
               │                                   │
      ┌────────┴────────┐                          │
      │ Circuit Breaker │                          │
      └────────┬────────┘                          │
               │                                   │
      ┌────────┴──────────────────┐                │
      │                           │                │
[Gemini Available]         [Quota / Error]         │
      │                           │                │
      ▼                           ▼                │
┌──────────────┐        ┌──────────────────┐       │
│ Google GenAI │        │ Local Bangla NLP │       │
│ Gemini Flash │        │ Heuristic Engine │◄──────┘
└──────────────┘        └──────────────────┘
```

---

## 💻 Tech Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)

### **Backend & API**
- **Server**: [Express.js](https://expressjs.com/) (Node.js)
- **Runtime Compiler**: [TSX](https://github.com/privatenumber/tsx) (Development) & [esbuild](https://esbuild.github.io/) (Production bundling)
- **AI SDK**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini SDK)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- *(Optional)* A Google Gemini API Key from [Google AI](https://ai.google.dev/)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/khorcha-ai.git
cd khorcha-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```

Add your optional Gemini API key:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```
*(Note: Khorcha AI runs completely offline and without an API key using the built-in Bangla NLP engine!)*

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
khorcha-ai/
├── src/
│   ├── components/            # Reusable UI & Feature Components
│   │   ├── ui/                # Base design system (Button, Badge, Modal, etc.)
│   │   ├── AiAdviceModal.tsx  # AI Financial Health Consultant Modal
│   │   ├── AiExpenseBar.tsx   # Smart Natural Language Input Bar
│   │   ├── BudgetModal.tsx    # Monthly Budget Setting Modal
│   │   ├── ExpenseList.tsx    # Filterable Transaction List
│   │   ├── PdfExportModal.tsx # PDF Financial Statement Generator
│   │   ├── StatsOverview.tsx  # Balance, Income, & Expense Metric Cards
│   │   └── TransactionModal.tsx # Manual Transaction Entry Dialog
│   ├── data/
│   │   └── initialData.ts     # Default categories, payment channels, & prompts
│   ├── lib/
│   │   ├── banglaNlpParser.ts # High-precision Bengali NLP regex parser
│   │   ├── financialAdvisor.ts# Algorithmic financial health advisor
│   │   ├── pdfGenerator.ts    # jsPDF statement compilation utility
│   │   └── utils.ts           # Currency formatting (৳) & Bengali numeral helpers
│   ├── types.ts               # Strict TypeScript interfaces & definitions
│   ├── App.tsx                # Main Application Component & Layout
│   └── main.tsx               # Client DOM entry point
├── server.ts                  # Express Backend with Gemini API & Circuit Breaker
├── package.json               # Dependencies & Build Scripts
├── vite.config.ts             # Vite + React configuration
└── README.md                  # Comprehensive Documentation
```

---

## 🔌 API Reference

### 1. Parse Expense (`POST /api/ai/parse-expense`)
Parses natural language Bengali/Banglish sentence into structured financial record.

**Request Body:**
```json
{
  "text": "আজকে দুপুরের খাবার ১২০ টাকা নগদ"
}
```

**Response (`200 OK`):**
```json
{
  "amount": 120,
  "type": "expense",
  "category": "খাবার",
  "note": "দুপুরের খাবার",
  "paymentMethod": "নগদ",
  "date": "2026-09-19",
  "source": "bangla_nlp"
}
```

---

### 2. Financial Advice (`POST /api/ai/financial-advice`)
Analyzes financial snapshot and produces actionable budgeting guidance.

**Request Body:**
```json
{
  "totalIncome": 60000,
  "totalExpense": 25000,
  "balance": 35000,
  "monthlyBudget": 30000,
  "categoryBreakdown": {
    "খাবার": 8000,
    "যাতায়াত": 3500
  }
}
```

**Response (`200 OK`):**
```json
{
  "healthScore": 95,
  "healthStatus": "অসাধারণ",
  "summary": "চমৎকার অর্থ ব্যবস্থাপনা! আপনি প্রায় 58% সঞ্চয় বজায় রাখছেন। আপনার আর্থিক শৃঙ্খলা ভবিষ্যৎ সুরক্ষার জন্য অত্যন্ত ইতিবাচক।",
  "tips": [
    "এই উদ্বৃত্ত অর্থ কোনো লাভজনক ডিপোজিট স্কিম বা সঞ্চয়পত্রে বিনিয়োগ করতে পারেন।",
    "কমপক্ষে ৩ থেকে ৬ মাসের খরচের সমান অর্থ জরুরি ফান্ডে সংরক্ষণ করুন।",
    "ধারাবাহিকতা বজায় রাখতে প্রতি মাসের শুরুতে বাজেট পর্যালোচনা করুন।"
  ],
  "source": "smart_rules"
}
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for the Bengali speaking community. If you found this project helpful, please consider giving it a ⭐ on GitHub!</sub>
</div>
