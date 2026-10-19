/**
 * VoiceStudy AI — Centralized API Client Service
 * Connects React frontend components to the FastAPI backend endpoints,
 * Lyzr Multi-Agent Reasoning, Qdrant Vector DB, SQLite Study Vault, and Omi Webhook system.
 */

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '') + (envUrl.endsWith('/api') ? '' : '/api');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://voicestudy-ai-revhack-backend.onrender.com/api';
  }
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Returns candidate API URLs for resilient fallback on deployed platforms (e.g. Render cold start or custom domain routing).
 */
const getCandidateUrls = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const candidates = [`${API_BASE_URL}${cleanEndpoint}`];

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Secondary fallback candidate for live Render deployments
    const secondaryBackend = `https://voicestudy-ai-backend.onrender.com/api${cleanEndpoint}`;
    if (!candidates.includes(secondaryBackend)) {
      candidates.push(secondaryBackend);
    }
    // Also allow relative /api proxy
    candidates.push(`/api${cleanEndpoint}`);
  } else {
    // Local development fallback
    candidates.push(`http://127.0.0.1:8000/api${cleanEndpoint}`);
    candidates.push(`/api${cleanEndpoint}`);
  }
  return Array.from(new Set(candidates));
};

/**
 * Centralized HTTP request runner with timeout protection, candidate fallbacks,
 * status code validation, and student-friendly error extraction.
 */
async function apiRequest(endpoint, options = {}, timeoutMs = 30000) {
  const candidateUrls = getCandidateUrls(endpoint);
  let lastError = null;

  for (let i = 0; i < candidateUrls.length; i++) {
    const url = candidateUrls[i];
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      // If this candidate returned 404 on an unrouted Render domain and we have another candidate, try next
      if (response.status === 404 && i < candidateUrls.length - 1 && url.includes('onrender.com')) {
        continue;
      }

      let data;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        const errorMsg = data.detail || data.message || `Request failed with status ${response.status}`;
        const err = new Error(errorMsg);
        err.status = response.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;
      if (err.name === 'AbortError') {
        lastError = new Error(`Request to ${endpoint} timed out after ${timeoutMs / 1000}s. The Render backend may be waking up from sleep.`);
      }
      // If we have remaining fallback candidates, continue loop
      if (i < candidateUrls.length - 1) {
        continue;
      }
    }
  }

  throw lastError || new Error(`Unable to connect to VoiceStudy backend (${endpoint}).`);
}

// =========================================================================
// 1. HEALTH STATUS
// =========================================================================

export async function fetchHealth() {
  try {
    return await apiRequest('/health', { method: 'GET' }, 8000);
  } catch (err) {
    console.warn('Health API check notice:', err.message);
    return {
      status: 'offline',
      notice: 'Backend URL disconnected or cold-starting. Ensure local backend is running or set VITE_API_BASE_URL.',
      vector_memory: { total_memories: 0, status: 'disconnected', provider: 'Qdrant' },
      agents: { lyzr_framework: 'offline_mode' },
      voice: { fallback_active: true }
    };
  }
}

// =========================================================================
// 2. AI STUDY TUTOR & MULTI-AGENT ORCHESTRATION
// =========================================================================

export async function processStudyRequest(
  transcript,
  source = 'web_speech',
  subjectOverride = null,
  topicOverride = null,
  history = null,
  uid = null
) {
  const payload = {
    transcript,
    source,
    subject_override: subjectOverride,
    topic_override: topicOverride,
    device_id: source === 'omi' ? 'omi_wearable_01' : 'browser_mic'
  };
  if (history && Array.isArray(history) && history.length > 0) {
    payload.history = history;
  }
  if (uid) {
    payload.uid = uid;
  }

  return await apiRequest('/study', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, 35000);
}

// =========================================================================
// 3. SMART NOTES & QDRANT VECTOR MEMORY
// =========================================================================

export async function saveMemory(
  text,
  subject = 'General',
  topic = 'Study Topic',
  memoryType = 'voice_note',
  uid = 'default_student'
) {
  return await apiRequest('/memory/save', {
    method: 'POST',
    body: JSON.stringify({
      text,
      subject: subject || 'General',
      topic: topic || 'Study Topic',
      memory_type: memoryType || 'voice_note',
      uid: uid || 'default_student'
    })
  });
}

export async function searchMemories(
  query,
  limit = 5,
  subjectFilter = null,
  uidFilter = null
) {
  const cleanFilter = (subjectFilter && subjectFilter !== 'All') ? subjectFilter : null;
  const payload = { query, limit, subject_filter: cleanFilter };
  if (uidFilter) payload.uid_filter = uidFilter;

  return await apiRequest('/memory/search', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function getRecentMemories(
  limit = 20,
  subjectFilter = null,
  uidFilter = null
) {
  const filterParam = (subjectFilter && subjectFilter !== 'All') ? `&subject_filter=${encodeURIComponent(subjectFilter)}` : '';
  const uidParam = uidFilter ? `&uid_filter=${encodeURIComponent(uidFilter)}` : '';
  return await apiRequest(`/memory/recent?limit=${limit}${filterParam}${uidParam}`, {
    method: 'GET'
  });
}

export async function deleteMemory(memoryId) {
  return await apiRequest(`/memory/${encodeURIComponent(memoryId)}`, {
    method: 'DELETE'
  });
}

// =========================================================================
// 4. ACTIVE RECALL PRACTICE QUIZ
// =========================================================================

export async function generateQuiz(
  topic = 'Recent Studies',
  numQuestions = 5,
  difficulty = 'medium',
  uid = 'default_student',
  lectureNotes = null,
  subject = null
) {
  const payload = {
    topic: topic || 'Recent Studies',
    num_questions: numQuestions,
    difficulty: difficulty || 'medium',
    uid: uid || 'default_student'
  };
  if (lectureNotes) payload.lecture_notes = lectureNotes;
  if (subject && subject !== 'All') payload.subject = subject;

  return await apiRequest('/quiz', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, 35000);
}

export async function submitQuizAttempt(
  topic,
  difficulty,
  questions,
  userAnswers,
  uid = 'default_student'
) {
  return await apiRequest('/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({
      topic,
      difficulty,
      questions,
      user_answers: userAnswers,
      uid: uid || 'default_student'
    })
  });
}

export async function fetchQuizHistory(uid = 'default_student', limit = 15) {
  try {
    return await apiRequest(`/quiz/history?uid=${encodeURIComponent(uid)}&limit=${limit}`, {
      method: 'GET'
    });
  } catch (err) {
    console.warn('Quiz history fetch error:', err.message);
    return { total_attempts: 0, average_accuracy: 0, history: [] };
  }
}

// =========================================================================
// 5. EXAM COUNTDOWN TARGET & REVISION TIMETABLE
// =========================================================================

export async function fetchExamProfile(uid = 'default_student') {
  try {
    return await apiRequest(`/exam/profile?uid=${encodeURIComponent(uid)}`, {
      method: 'GET'
    });
  } catch (err) {
    console.warn('Exam profile fetch error:', err.message);
    return { has_profile: false, profile: null };
  }
}

export async function saveExamProfile(
  targetSubject,
  examTitle,
  examDate,
  dailyStudyHours = 2.0,
  confidenceLevel = 3,
  uid = 'default_student'
) {
  return await apiRequest('/exam/setup', {
    method: 'POST',
    body: JSON.stringify({
      target_subject: targetSubject,
      exam_title: examTitle,
      exam_date: examDate,
      daily_study_hours: dailyStudyHours,
      confidence_level: confidenceLevel,
      uid: uid || 'default_student'
    })
  });
}

export async function fetchRevisionPlan(uid = 'default_student') {
  try {
    return await apiRequest(`/revision-plan?uid=${encodeURIComponent(uid)}`, {
      method: 'GET'
    });
  } catch (err) {
    console.warn('Revision plan fetch error:', err.message);
    return {
      total_tasks: 0,
      completed_count: 0,
      pending_count: 0,
      completion_rate: 0,
      today_tasks: [],
      upcoming_tasks: [],
      completed_tasks: []
    };
  }
}

export async function generateRevisionPlan(subject = null, uid = 'default_student') {
  return await apiRequest('/revision-plan/generate', {
    method: 'POST',
    body: JSON.stringify({ subject, uid: uid || 'default_student' })
  });
}

export async function toggleRevisionTask(taskId, uid = 'default_student') {
  return await apiRequest('/revision-plan/task/toggle', {
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, uid: uid || 'default_student' })
  });
}

export async function fetchExamReadiness(uid = 'default_student') {
  try {
    return await apiRequest(`/progress/readiness?uid=${encodeURIComponent(uid)}`, {
      method: 'GET'
    });
  } catch (err) {
    console.warn('Exam readiness fetch error:', err.message);
    return { has_sufficient_data: false, readiness_score: 0, status_label: 'Insufficient Data' };
  }
}

// =========================================================================
// 6. STUDY MATERIALS UPLOAD & TRANSCRIPT ANALYZER
// =========================================================================

export async function uploadStudyMaterial(
  filename,
  content,
  subject = 'General',
  topic = 'Uploaded Material',
  uid = 'default_student'
) {
  return await apiRequest('/study/upload-material', {
    method: 'POST',
    body: JSON.stringify({
      filename,
      content,
      subject,
      topic,
      uid: uid || 'default_student'
    })
  }, 25000);
}

export async function analyzeTranscript(
  transcript,
  analysisType = 'all',
  subject = 'General',
  uid = 'default_student'
) {
  return await apiRequest('/study/analyze', {
    method: 'POST',
    body: JSON.stringify({
      transcript,
      analysis_type: analysisType,
      subject,
      uid: uid || 'default_student'
    })
  }, 35000);
}

// =========================================================================
// 7. SUBSCRIPTION USAGE & STUDENT WAITLIST
// =========================================================================

export async function fetchUsageStatus(uid = 'default_student') {
  try {
    return await apiRequest(`/usage/status?uid=${encodeURIComponent(uid)}`, {
      method: 'GET'
    });
  } catch (err) {
    console.warn('Usage status fetch error:', err.message);
    return {
      plan_tier: 'free',
      limits: {
        max_daily_study_queries: 15,
        max_daily_quizzes: 5,
        study_queries_remaining: 15,
        quizzes_remaining: 5
      }
    };
  }
}

export async function registerUpgradeInterest(
  email,
  studentName = '',
  collegeName = '',
  planRequested = 'student_plus',
  notes = '',
  uid = 'default_student'
) {
  return await apiRequest('/usage/upgrade-interest', {
    method: 'POST',
    body: JSON.stringify({
      email,
      student_name: studentName,
      college_name: collegeName,
      plan_requested: planRequested,
      notes,
      uid: uid || 'default_student'
    })
  });
}

export async function resetDailyUsageQuota(uid = 'default_student') {
  return await apiRequest('/usage/reset', {
    method: 'POST',
    body: JSON.stringify({ uid: uid || 'default_student' })
  });
}

export async function setPlanTier(planTier = 'student_plus', uid = 'default_student') {
  return await apiRequest('/usage/plan', {
    method: 'POST',
    body: JSON.stringify({ uid: uid || 'default_student', plan_tier: planTier })
  });
}

// =========================================================================
// 8. OMI WEARABLE WEBHOOK SIMULATOR & LOGS
// =========================================================================

export async function simulateOmiWebhook(uid = 'test_omi_user_99') {
  return await apiRequest(`/omi/test?uid=${encodeURIComponent(uid)}`, {
    method: 'POST'
  });
}

export async function fetchOmiLogs(limit = 20) {
  try {
    return await apiRequest(`/omi/logs?limit=${limit}`, {
      method: 'GET'
    });
  } catch (err) {
    console.warn('Failed to fetch Omi logs:', err.message);
    return { logs: [] };
  }
}
