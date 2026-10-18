# VoiceStudy AI — EYFI Hackathon Edition

> **Tagline:** Speak. Remember. Revise.  
> **Event:** EYFI Hackathon 2026  
> **Track:** Meeting & Lecture Intelligence  
> **Primary Brand Colors:** Deep Navy (#10152B) & Electric Violet (#7357FF)  
> **Repository:** [https://github.com/dharmarayank946/voicestudy-ai-revhack](https://github.com/dharmarayank946/voicestudy-ai-revhack)  
> **Live Vercel Web App:** [https://voicestudy-ai-revhack.vercel.app](https://voicestudy-ai-revhack.vercel.app)  
> **Live GitHub Pages Backup:** [https://dharmarayank946.github.io/voicestudy-ai-revhack/](https://dharmarayank946.github.io/voicestudy-ai-revhack/)  
> **Backend API (Render):** [https://voicestudy-ai-revhack-backend.onrender.com](https://voicestudy-ai-revhack-backend.onrender.com)

---

## 🏆 EYFI Hackathon Judging Alignment

VoiceStudy AI is structured specifically for the EYFI Hackathon evaluation criteria:

| Judging Dimension | Weight | Key VoiceStudy AI Implementation |
| :--- | :---: | :--- |
| **1. Earning Potential & Plan** | **40%** | Transparent **₹199/month Student Plus** SaaS subscription; free tier with daily query/quiz limits; direct student community acquisition; low-cost unit economics (.002/query). |
| **2. Product Functionality & UI/UX** | **20%** | Full 16-section education SaaS platform in Deep Navy (#10152B) and Electric Violet (#7357FF); interactive voice tutor; exam countdown timetable; active recall quiz engine; lecture analyzer. |
| **3. Innovation & Impact** | **10%** | Eliminates AI hallucination through 1536-dim Qdrant vector retrieval; multimodal loop (Voice -> Memory -> Agent Reasoning -> Timetable -> Spoken Feedback); bilingual speech recognition (English + Kannada). |
| **4. Understanding, Presentation & Limitations** | **30%** | Honest live status badges (Live vs Offline Fallback); transparent payment waitlist (no fabricated payment success); defensive timeout guards (<3s); detailed failure case catalog. |

---

## 💰 1. Revenue Model & Business Plan (40% Weight)

### 1.1 Target Customer & Problem
- **Target Audience:** College engineering, STEM, and medical students (15M+ in India) preparing for semester finals and competitive technical exams (GATE, GRE, USMLE, coding placements).
- **The Core Problem:** Students attend hours of technical lectures, accumulate scattered notes across notebooks, PDFs, and chat apps, and default to passive re-reading before finals — which results in poor retention and exam anxiety.
- **Why Students Pay:** Passive study fails. Active recall, instant quiz feedback, and prioritized spaced revision schedules directly increase grades and placement scores.

### 1.2 Subscription Plans & Value Proposition

| Feature / Quota | **FREE TIER** (₹0/month) | **STUDENT PLUS** (₹199/month ≈ .38/mo) |
| :--- | :---: | :---: |
| **Daily AI Study Queries** | 25 queries / day | **150 queries / day** |
| **Daily Practice Quizzes** | 5 quizzes / day | **Unlimited practice quizzes** |
| **Vector Memory Retention** | 30 days active memory | **Permanent vector retention** |
| **Lecture Transcript Analyzer** | 3 analyses / week | **Unlimited lecture digests & action items** |
| **Spaced Repetition Timetable** | 1 target exam profile | **Unlimited multi-course schedules** |
| **Regional Speech Recognition** | English (en-US) | **English + Kannada (kn-IN)** |
| **Study Material Upload** | Standard (up to 2MB) | **Priority syllabus ingestion & deep chunking** |
| **Export Notes** | Text export | **Text + JSON + Markdown export** |

### 1.3 Unit Economics & Margin Safety
- **Lyzr / LLM API Cost:** ~₹0.15 (.0018) per query. Average active student: ~12 queries/day = ₹54/month.
- **Qdrant Vector Storage:** Local disk / cloud free tier = ~₹12/month per active user.
- **Server Infrastructure (Render):** ₹0 (Free tier) scaling to ₹580/month for 5,000 active students = ~₹0.12/user.
- **Total Direct Cost per Student:** ~₹66/month.
- **Gross Profit Margin:** **~67%** at ₹199/month subscription price.

### 1.4 Student Acquisition & Go-To-Market
1. **Campus Ambassador Program:** Free Student Plus access to college study group leads and IEEE/ACM student chapters.
2. **WhatsApp / Telegram Study Bot Integration:** Viral quiz generation from uploaded lecture notes shared directly into study groups.
3. **Transparent Lead Capture:** The live application records student pre-orders and upgrade interest directly in the SQLite Study Vault without faking credit card transactions.

---

## 🧭 2. Full 16-Section Navigation Architecture

The navigation is divided into 12 core platform workspaces and 4 secondary/account views:

`
VoiceStudy AI
├── OVERVIEW
│   ├── Home                 (Platform hero, live engine connectivity badges, quick voice tease)
│   └── Dashboard            (Exam countdown banner, daily revision checklist, readiness KPI)
├── STUDY & PRACTICE
│   ├── AI Study Assistant   (Contextual tutor with vector memory injection & Lyzr fallback)
│   ├── My Materials         (6 STEM & Medical subjects + local study notes upload modal <= 2MB)
│   ├── Smart Notes          (Formatted study note cards, subject tag filter, export, deletion)
│   ├── Quiz & Practice      (Timed interactive MCQ mode, instant feedback, scoring to Study Vault)
│   ├── Flashcards           (3D flipping cards with Hard / Good / Easy spaced mastery rating)
│   └── Revision Planner     (Target exam setup, spaced repetition timetable, task checklists)
├── KNOWLEDGE & INTELLIGENCE
│   ├── AI Memory            (Qdrant vector inspector, collection stats, vector search, deletion)
│   ├── Voice Study          (Hands-free voice room, VoiceOrb animation, en-US / kn-IN speech)
│   ├── Progress & Analytics (Exam readiness percentage, daily streaks, quiz score history)
│   └── AI Analyzer          (Lecture transcript digest, action items table, key concept chips)
└── ACCOUNT & PREFERENCES
    ├── Pricing / Upgrade    (₹199/mo Student Plus benefits, live quota bar, waitlist lead modal)
    ├── Settings             (Theme toggle, Kannada speech toggle, speech engine, health monitor)
    ├── Help / Limitations   (Voice commands cheat sheet, Omi guide, architecture & fallback FAQ)
    └── Profile              (Student identity, target exam, daily goal, subscription tier)
`

---

## 🛡️ 3. Preserved AI Integrations & API Contracts

All original integrations have been preserved with 100% backward compatibility:

1. **Lyzr Agent Studio V3 Chat API (gent-prod.studio.lyzr.ai/v3/inference/chat/):**
   - Coordinates ManagerAgent, Orchestrator, AssistantAgent, SummarizerAgent, and ActionItemExtractorAgent.
   - Built-in defensive 3.0s timeout fails over gracefully to our offline knowledge engine in **< 10ms**.
2. **Qdrant Vector Database (qdrant-client):**
   - 1536-dimensional embeddings with SHA-256 hash engine fallback for offline operation.
   - Strict multi-tenant isolation via uid_filter — verified zero data leakage between students.
   - Real point deletion via DELETE /api/memory/{id}.
3. **Omi Wearable Webhook Receivers (/omi/conversation, /omi/realtime):**
   - High-throughput endpoint with <50ms response time and non-blocking background worker for memory persistence.
4. **SQLite Study Vault (study_vault.db):**
   - Permanent relational storage for exam profiles, revision tasks, quiz attempts, usage quotas, and upgrade leads.

---

## 🔬 4. Failure Cases, Edge Conditions & Defensive Engineering (30% Weight)

| Edge Condition | Failure Mode | Defensive Mitigation in VoiceStudy AI |
| :--- | :--- | :--- |
| **Lyzr API Latency Spike** | Network delay >3.0 seconds hangs the UI | LYZR_TIMEOUT=3.0 with httpx.TimeoutException handler that fails over to offline knowledge engine in **< 10ms**. |
| **API Rate Limits (HTTP 429)** | Lyzr or OpenAI rate limit errors | Automatic 1.0s exponential backoff retry followed by graceful fallback. |
| **Free Plan Quota Exceeded** | Unbounded compute cost | Backend middleware enforces 25 queries & 5 quizzes daily with polite upgrade notice. |
| **Noisy Background Speech** | Browser microphone audio corrupted | Fast toggle between speech input and manual lecture notes text upload. |
| **Missing API Keys** | Setup failure on clean developer machine | Deterministic SHA-256 vector engine (1536 dim) allows full vector search testing without OpenAI API keys. |
| **Ephemeral Disk on Free Host** | Restarts wipe local ./qdrant_data | Startup self-seeding populates core engineering lecture notes automatically. |
| **Payment Gateway Pending** | Deceptive checkout forms | Transparently labeled as Pre-Order / Waitlist Lead Capture; leads saved to Study Vault without faking transactions. |

---

## 🚀 5. Quickstart & Local Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### Step 1: Clone Repository
`ash
git clone https://github.com/dharmarayank946/voicestudy-ai-revhack.git
cd voicestudy-ai-revhack
`

### Step 2: Configure Environment
`ash
cp .env.example .env
# Optional: Set LYZR_API_KEY and OPENAI_API_KEY in .env.
# The application works 100% offline with built-in vector engines if keys are omitted.
`

### Step 3: Run Backend
`ash
# Windows
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt
.\backend\venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# Linux / macOS
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
`

### Step 4: Run Frontend
`ash
cd frontend
npm install
npm run dev
`
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 6. Automated Test Suite

Run the complete test suite:
`ash
# Core endpoints & EYFI features (14 tests)
.\backend\venv\Scripts\python -m unittest tests/test_dashboard_settings.py tests/test_eyfi_core_features.py tests/test_subject_library.py

# Multi-tenant vector isolation & accuracy (5 tests)
.\backend\venv\Scripts\python -m unittest tests/test_backend_accuracy_filtering.py

# Omi wearable intake & Qdrant deletion (4 tests)
.\backend\venv\Scripts\python -m unittest tests/test_omi_integration.py

# Frontend production build
cd frontend && npm run build
`

---

## ☁️ 7. Deployment Instructions

### Vercel (Frontend SPA)
The repository includes a root ercel.json and rontend/vercel.json:
1. In Vercel, click **Add New... -> Project**.
2. Select dharmarayank946/voicestudy-ai-revhack.
3. Vercel automatically detects the build command: 
pm --prefix frontend run build and output: rontend/dist.
4. Deploy!

### Render (Backend API)
The repository includes 
ender.yaml:
1. Connect the repository in Render Dashboard.
2. Select **Blueprint** deployment.
3. Render automatically sets up Python runtime, runs pip install -r backend/requirements.txt, and boots uvicorn backend.main:app.

---

## 🎬 8. 5-Minute Live Demo Script & Checklist

See [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the exact 4m 30s scene-by-scene script:
1. **Scene 1 (0:00 - 0:45):** Problem, Brand Experience & Exam Countdown.
2. **Scene 2 (0:45 - 1:40):** Hands-free Voice Ingestion, Kannada language toggle, & Qdrant vector memory storage.
3. **Scene 3 (1:40 - 2:35):** Grounded Q&A (no hallucinations) & Active Recall Practice Quiz.
4. **Scene 4 (2:35 - 3:30):** Lecture Analyzer (Action Items Table & Key Concepts) & Spaced Repetition Timetable.
5. **Scene 5 (3:30 - 4:30):** ₹199/month Student Plus Pricing, Transparent Quotas, & Waitlist Lead Capture.
