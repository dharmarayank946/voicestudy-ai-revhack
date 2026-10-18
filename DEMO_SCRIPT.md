# VoiceStudy AI — EYFI Hackathon Video Demo Script (Under 5 Minutes)

> **Project Name:** VoiceStudy AI  
> **Tagline:** Speak. Remember. Revise.  
> **Target Event:** EYFI Hackathon 2026  
> **Primary Brand Palette:** Deep Navy (`#10152B`) + Electric Violet (`#7357FF`) with Soft Lavender Surfaces  
> **Live Demo Target Duration:** 4 minutes 30 seconds (Max 5 minutes)

---

## ⏱ Timeline & Scene Breakdown

### 🎬 Scene 1: Hook, Problem & Two-Color Brand Experience (0:00 – 0:45)
* **Visual on Screen:**
  - Open VoiceStudy AI Home Dashboard with eye-friendly light/dark theme toggle.
  - Highlight the sleek brand palette: Deep Navy headers (`#10152B`), Electric Violet glowing accents (`#7357FF`), soft lavender card surfaces, and animated Voice Orb.
  - Point to the **Exam Countdown Card**: *"Operating Systems End-Sem — 18 Days Left (45 Hours Planned)"*.
* **Speaker Script:**
  > *"Every semester, engineering and STEM students face the exact same anxiety: hundreds of hours of lectures attended, notebooks filled with fragmented notes, and panic during exam week. Cramming and passive re-reading simply do not work for technical subjects.
  > 
  > Welcome to **VoiceStudy AI** — tagline: **Speak. Remember. Revise.**
  > 
  > VoiceStudy AI transforms passive voice notes into active recall mastery. Built with a signature Deep Navy and Electric Violet design system, it couples real-time voice capture with persistent Qdrant vector memory, Lyzr agent orchestration, and our persistent SQLite Study Vault."*

---

### 🎬 Scene 2: Live Voice Capture & Grounded Vector Memory Ingestion (0:45 – 1:40)
* **Visual on Screen:**
  - Navigate to **Study Workspace** (`activeTab === 'study'`).
  - Demonstrate voice input via browser microphone (show language toggle: English `en-US` and Kannada `kn-IN`).
  - Speak or trigger note input:  
    `"Remember that in DBMS, Two-Phase Locking ensures conflict serializability, but Strict 2PL is required to eliminate cascading aborts."`
  - Show the live **Status Badge**: `Mode: Connected Qdrant Vector Memory` + `Agent: Study Assistant`.
  - Also demonstrate **"Upload Course Material"** text input ($\le 2$ MB parser that breaks long syllabus chapters into grounded vector chunks).
* **Speaker Script:**
  > *"Let's record a lecture insight. Notice our dual-language toggle supporting both English and regional Kannada speech recognition.
  > 
  > When I speak, the note is transmitted to our FastAPI backend. The Memory Service generates a 1536-dimensional vector embedding and saves it permanently into Qdrant vector storage with strict student UID isolation.
  > 
  > Students can also upload their course syllabi or professor lecture transcripts directly through our safe 2-megabyte file chunker, instantly building a personal vector knowledge base."*

---

### 🎬 Scene 3: Grounded Q&A & Active Recall Practice Quiz (1:40 – 2:35)
* **Visual on Screen:**
  - In Study Workspace, ask: *"Why is Strict 2PL preferred over basic 2PL?"*
  - Show the grounded response card citing the exact stored note, avoiding generic AI hallucinations.
  - Click **"Practice Quiz"** button (`activeTab === 'quiz'`).
  - Generate a 5-question multiple-choice quiz on *"DBMS Concurrency Control"*.
  - Answer 3 correctly and 1 incorrectly. Submit attempt.
  - Highlight the **Backend Evaluation**: verified score (75%), isolated weak topic (`Deadlock Detection`), and auto-recommended follow-up study link.
* **Speaker Script:**
  > *"Now when the student asks a revision question, our Orchestrator queries Qdrant for semantic similarity, retrieves the student's exact lecture notes, and passes them to the Lyzr Assistant Agent. The response is strictly grounded in what the student studied.
  > 
  > Next, active recall: the student generates an instant 5-question practice quiz. When submitted, our backend evaluates the answers, stores the verified attempt in our persistent Study Vault, and automatically flags weak topics — in this case, Deadlock Detection — recommending immediate reinforcement."*

---

### 🎬 Scene 4: Exam Countdown & Personalized Revision Timetable (2:35 – 3:20)
* **Visual on Screen:**
  - Navigate back to **Home Dashboard**.
  - Show the **Exam Countdown Card**: target exam date, daily study target (2.5 hrs/day), and confidence rating (3/5).
  - Open the **Personalized Revision Timetable** widget:
    - Tabs: `Today (3)`, `Upcoming (5)`, `Completed (2)`
    - Check off a scheduled task: *"Review Strict 2PL Protocol vs Basic 2PL"*.
    - Show live task completion rate updating immediately.
  - Click **"Study Analytics"** (`activeTab === 'progress'`):
    - Show the **Exam Readiness Score** (e.g. 78% — On Track).
    - Point out the transparent mathematical formula badge:  
      `(Quiz Accuracy × 40%) + (Syllabus Coverage × 30%) + (Task Completion × 30%)`.
* **Speaker Script:**
  > *"Exam preparation is all about consistency. VoiceStudy AI automatically builds a personalized daily revision schedule based on days remaining until finals.
  > 
  > As the student checks off tasks, their Exam Readiness Score recalculates transparently: 40% weighted quiz accuracy, 30% syllabus coverage from stored memories, and 30% task completion. If fewer than 2 quizzes have been taken, it honestly states 'Insufficient Data' rather than faking a high score."*

---

### 🎬 Scene 5: Business Model, Revenue Potential & Unit Economics (3:20 – 4:05)
* **Visual on Screen:**
  - Navigate to **Pricing & Plans** (`activeTab === 'pricing'`).
  - Show side-by-side comparison:
    - **Free Plan ($0/mo):** 15 study questions/day, 5 quizzes/day, basic memory storage.
    - **Student Plus (₹199/month ≈ $2.38):** 100 study questions/day, 25 quizzes/day, unlimited vector memory, personalized timetable generation.
  - Show the **Live Quota Tracker** card displaying real daily usage.
  - Click **"Get Student Plus"** to open the Upgrade Waitlist Modal. Enter student email, college name (`RV College of Engineering`), and click submit.
  - Highlight the honest notice: *"Payment gateway integration coming soon — waitlist lead registered in Study Vault."*
* **Speaker Script:**
  > *"Now let's talk about earning potential and business viability.
  > 
  > VoiceStudy AI operates on a freemium model designed for student accessibility. The Free tier provides 15 questions and 5 quizzes daily — enforced on the backend to control compute costs.
  > 
  > For ₹199 per month — less than the cost of a single coffee or textbook photocopy — students upgrade to Student Plus for 100 daily queries, unlimited vector memory, and automated timetable generation.
  > 
  > Our unit economics are exceptional: an active student uses approximately 200,000 LLM tokens per month, costing under 3 cents, plus 5 cents in vector storage — an 8-cent total cost against a ₹199 ($2.38) subscription, yielding greater than 96% gross margins.
  > 
  > Distribution relies on our campus ambassador program across engineering colleges in Bengaluru and peer study groups. Rather than faking a payment gateway, our upgrade modal captures real waitlist leads directly into our database."*

---

### 🎬 Scene 6: Architecture, Failure Handling & Conclusion (4:05 – 4:30)
* **Visual on Screen:**
  - Open the **Live Status Inspector** / Settings tab.
  - Highlight the honest indicators: Qdrant vector status, Lyzr Agent status with offline fallback engine, and Render Workflows deployment badge.
* **Speaker Script:**
  > *"Under the hood, VoiceStudy AI is built for reliability. If the Lyzr API experiences network latency exceeding 3 seconds, our defensive architecture falls back to an offline curated knowledge engine in under 10 milliseconds.
  > 
  > Deployed seamlessly on Render with version-controlled blueprints, VoiceStudy AI is production-ready, revenue-grounded, and built to help students truly Speak, Remember, and Revise. Thank you!"*

---

## 📋 Hackathon Evaluation Rubric Mapping

| Judging Criteria | Weight | Where Addressed in Demo |
| :--- | :---: | :--- |
| **Earning Potential & Plan** | **40%** | Scene 5: ₹199/month Student Plus pricing, >96% gross margins, 15 vs 100 daily quota limits, student waitlist lead capture, campus distribution plan. |
| **Product Functionality & UI/UX** | **20%** | Scene 1, 2, 4: Deep Navy & Electric Violet aesthetic, live exam countdown, interactive timetable, Kannada speech, mobile drawer. |
| **Innovation & Impact** | **10%** | Scene 2 & 3: Eliminating hallucinations via Qdrant 1536-dim vector memory grounding and automated active recall quiz generation. |
| **Presentation, Failure Cases & Limitations** | **30%** | Scene 3 & 6: Backend-verified scores, transparent readiness formula, 3.0s Lyzr timeout fallback, honest waitlist disclosure. |
