# VoiceStudy AI — System Architecture & Implementation

> **Tagline:** Speak. Remember. Revise.  
> **Event:** EYFI Hackathon 2026  
> **Track:** Meeting & Lecture Intelligence  
> **Integrated Stack:** Lyzr Agent Framework × Qdrant Vector Memory × Omi Voice Adapter × Render Workflows × SQLite Study Vault

---

## 1. Complete System Architecture

```mermaid
flowchart TB
    subgraph ClientLayer ["1. Client & Presentation Layer (React 19 + Vite)"]
        BrowserMic["Browser Voice Input (English / Kannada kn-IN)"]
        OmiDevice["Omi Wearable / Hardware"]
        OmiSim["Omi Webhook Simulator (UI)"]
        CourseUpload["Course Material Uploader (<= 2MB Text Chunks)"]
        
        Dashboard["Home Dashboard & Live Countdown Card"]
        Workspace["Study Workspace & Voice Orb"]
        QuizUI["Active Recall Practice Quiz"]
        Timetable["Personalized Revision Timetable Widget"]
        Analytics["Study Analytics & Readiness Score (Transparent Formula)"]
        PricingUI["Pricing & Plans (Free vs Student Plus ₹199/mo)"]
    end

    subgraph BackendAPI ["2. FastAPI Backend Engine (Python 3.11 / Render)"]
        OmiEndpoints["Omi Webhook Receiver:\nPOST /omi/conversation\nPOST /omi/realtime"]
        StudyEndpoint["Study & Chat API:\nPOST /api/study\nPOST /api/study/upload-material"]
        QuizEndpoint["Quiz Evaluation API:\nPOST /api/quiz\nPOST /api/quiz/submit\nGET /api/quiz/history"]
        ExamEndpoint["Exam & Revision API:\nPOST /api/exam/setup\nGET /api/exam/profile\nPOST /api/revision-plan/generate\nGET /api/revision-plan"]
        UsageEndpoint["Quota & Monetization API:\nGET /api/usage/status\nPOST /api/usage/upgrade-interest\nGET /api/progress/readiness"]
        HealthEndpoint["System Observability:\nGET /api/health"]
        
        AsyncWorkers["Non-blocking Background Worker (<50ms webhook response)"]
        QuotaLimiter["Usage Guard (15 vs 100 queries/day; 5 vs 25 quizzes/day)"]
    end

    subgraph PersistenceLayer ["3. Dual Persistence Layer"]
        subgraph VectorStore ["3A. Qdrant Vector Database"]
            Embedder["Embedding Engine:\nOpenAI text-embedding-3-small (1536-dim)\n+ Deterministic SHA-256 Vector Engine"]
            QdrantDisk[("Qdrant Persistent Vector Store:\nCollection: study_memories\n- UID Tenant Isolation\n- Subject Category Filtering\n- Cosine Distance Metric")]
        end

        subgraph RelationalVault ["3B. Persistent Study Vault (SQLite)"]
            SQLiteStore[("Study Vault Database (study_vault.db):\n- exam_profiles (target exam, date, hours)\n- quiz_attempts (scores, weak topics, answers)\n- revision_tasks (today, upcoming, completed)\n- usage_records (daily queries, quizzes, costs)\n- upgrade_interest (student waitlist leads)")]
        end
    end

    subgraph AgentLayer ["4. Lyzr Agent Studio V3 Framework"]
        LyzrAPI["Lyzr Studio V3 Chat API Engine\n(https://agent-prod.studio.lyzr.ai/v3/inference/chat/)\nTimeout: 3.0s with Automatic Failover"]
        OrchestratorAgent["Orchestrator Agent (Intent & Subject Classification)"]
        AssistantAgent["Study Assistant Agent (Grounded Tutor Q&A)"]
        QuizAgent["Quiz Agent (Active Recall MCQ Generation)"]
        OfflineEngine["Curated Offline Knowledge & Reasoning Engine"]
    end

    %% Ingestion Connections
    BrowserMic --> Workspace
    OmiDevice -->|"POST /omi/conversation"| OmiEndpoints
    OmiSim -->|"POST /omi/conversation"| OmiEndpoints
    CourseUpload -->|"POST /api/study/upload-material"| StudyEndpoint

    %% Backend Connections
    Workspace -->|"REST API"| StudyEndpoint
    QuizUI -->|"REST API"| QuizEndpoint
    Dashboard -->|"REST API"| ExamEndpoint
    Timetable -->|"REST API"| ExamEndpoint
    Analytics -->|"REST API"| UsageEndpoint
    PricingUI -->|"REST API"| UsageEndpoint

    %% Persistence Connections
    StudyEndpoint --> QuotaLimiter
    QuotaLimiter --> SQLiteStore
    OmiEndpoints --> AsyncWorkers
    AsyncWorkers --> Embedder
    Embedder -->|"1536-dim Vectors"| QdrantDisk
    StudyEndpoint --> Embedder
    QuizEndpoint --> SQLiteStore
    ExamEndpoint --> SQLiteStore

    %% Agent Flow
    StudyEndpoint --> OrchestratorAgent
    OrchestratorAgent -->|"Vector Similarity Search (Filtered by UID)"| QdrantDisk
    QdrantDisk -->|"Grounded Lecture Context"| AssistantAgent
    AssistantAgent --> LyzrAPI
    LyzrAPI -.->|"On Latency >3s"| OfflineEngine
    LyzrAPI --> AssistantAgent
    QuizEndpoint --> QuizAgent
    QuizAgent --> LyzrAPI
```

---

## 2. End-to-End Workflow Execution Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Learner
    participant UI as React Frontend
    participant API as FastAPI Backend
    participant Qdrant as Qdrant Vector Store
    participant Vault as SQLite Study Vault
    participant Lyzr as Lyzr Agent Studio

    Note over Student,API: Step 1: Voice Note / Material Ingestion
    Student->>UI: Speaks study note in English or Kannada (or uploads lecture text)
    UI->>API: POST /omi/conversation (or /api/study/upload-material)
    API-->>UI: HTTP 200 (<50ms acknowledgement)
    API->>Qdrant: Store 1536-dimensional vector (UID, Subject, Topic, Text)

    Note over Student,Lyzr: Step 2: Grounded Study Assistant Q&A
    Student->>UI: Asks revision question ("Explain Strict 2PL Protocol")
    UI->>API: POST /api/study
    API->>Vault: Check daily usage quota (Free: 15 / Plus: 100)
    API->>Qdrant: Query vector similarity filtered by Student UID
    Qdrant-->>API: Return top matching lecture notes
    API->>Lyzr: Dispatch question + grounded context (Timeout 3.0s)
    alt Lyzr Responds in <= 3.0s
        Lyzr-->>API: Return synthesized explanation citing notes
    else Lyzr Timeout or Offline
        API->>API: Failover to Curated Offline Knowledge Engine (<10ms)
    end
    API-->>UI: Deliver grounded answer with citation badges

    Note over Student,Vault: Step 3: Active Recall Quiz & Persistence
    Student->>UI: Takes 5-question practice quiz
    UI->>API: POST /api/quiz/submit (user answers payload)
    API->>API: Evaluate answers, compute percentage, isolate weak topics
    API->>Vault: INSERT INTO quiz_attempts (score, total, weak_topics)
    API-->>UI: Return verified grade, weak topics, and recommended next task

    Note over Student,Vault: Step 4: Exam Readiness Calculation
    UI->>API: GET /api/progress/readiness
    API->>Vault: Retrieve quiz history and revision task completion
    API->>API: Compute readiness: (Quiz Acc * 0.4) + (Syllabus Cov * 0.3) + (Task Comp * 0.3)
    API-->>UI: Return honest Readiness Score (or "Insufficient Data" if <2 attempts)
```

---

## 3. Storage Architecture Comparison

| Storage Engine | Purpose | Data Managed | Isolation Model |
| :--- | :--- | :--- | :--- |
| **Qdrant Vector Database** | Unstructured Semantic Memory | 1536-dimensional vector points, lecture summaries, topic tags, source transcripts | Multi-tenant isolation enforced via `uid` payload filter on all searches |
| **SQLite Study Vault** | Relational Structured Records | Exam target dates, study hours, verified quiz scores, weak topic lists, revision tasks, daily quotas, waitlist leads | Primary key relationships scoped by student `uid` |

---

## 4. Resilience & Defensive Fallback Design

1. **Lyzr API Latency Guard:**
   - Real-world cloud LLM inference APIs can experience periodic spikes.
   - VoiceStudy AI sets an aggressive `LYZR_TIMEOUT=3.0` seconds via `httpx.Client`.
   - If the API times out, the system fails over to a curated offline educational knowledge engine in **< 10 milliseconds**, guaranteeing the student's study flow is never blocked.
2. **Deterministic Vector Fallback:**
   - If `OPENAI_API_KEY` is absent or encounters a quota error, VoiceStudy AI uses an internal SHA-256 deterministic 1536-dimensional embedding algorithm.
   - This ensures vector similarity tests and local development function without mandatory API credentials.
3. **Usage Limit Protection:**
   - Backend quota middleware prevents abuse and controls API costs for the Free Tier (15 study queries, 5 quizzes daily).
