const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '') + (envUrl.endsWith('/api') ? '' : '/api');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://voicestudy-ai-revhack-backend.onrender.com/api';
  }
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Health API unavailable:', err);
    return { 
      status: 'offline', 
      notice: 'Backend URL disconnected or unconfigured. Run local server or set VITE_API_URL.',
      vector_memory: { total_memories: 0, status: 'disconnected', provider: 'Qdrant' }, 
      agents: { lyzr_framework: 'offline_mode' },
      voice: { fallback_active: true } 
    };
  }
}


export async function processStudyRequest(transcript, source = 'web_speech', subjectOverride = null, topicOverride = null, history = null, uid = null) {
  let response;
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

  try {
    response = await fetch(`${API_BASE_URL}/study`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (netErr) {
    try {
      response = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      throw new Error(`Unable to connect to backend server (${netErr?.message || 'Network error'}). Please verify the backend server is running on port 8000.`);
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Backend returned invalid response format.');
  }

  if (!response.ok) {
    throw new Error(data.detail || data.message || 'Failed to process study request.');
  }
  return data;
}

export async function saveMemory(text, subject = 'General', topic = 'Study Topic', memoryType = 'voice_note', uid = 'default_omi_user') {
  const response = await fetch(`${API_BASE_URL}/memory/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, subject, topic, memory_type: memoryType, uid })
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || errData.message || 'Failed to save memory.');
  }
  return await response.json();
}

export async function searchMemories(query, limit = 5, subjectFilter = null, uidFilter = null) {
  const cleanFilter = (subjectFilter && subjectFilter !== 'All') ? subjectFilter : null;
  const payload = { query, limit, subject_filter: cleanFilter };
  if (uidFilter) payload.uid_filter = uidFilter;

  const response = await fetch(`${API_BASE_URL}/memory/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Search failed.');
  return await response.json();
}

export async function getRecentMemories(limit = 20, subjectFilter = null, uidFilter = null) {
  const filterParam = (subjectFilter && subjectFilter !== 'All') ? `&subject_filter=${encodeURIComponent(subjectFilter)}` : '';
  const uidParam = uidFilter ? `&uid_filter=${encodeURIComponent(uidFilter)}` : '';
  const response = await fetch(`${API_BASE_URL}/memory/recent?limit=${limit}${filterParam}${uidParam}`);
  if (!response.ok) throw new Error('Failed to fetch memories.');
  return await response.json();
}

export async function deleteMemory(memoryId) {
  const response = await fetch(`${API_BASE_URL}/memory/${memoryId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete memory.');
  return await response.json();
}

export async function generateQuiz(topic = 'Recent Studies', numQuestions = 5, difficulty = 'medium', uid = null, lectureNotes = null, subject = null) {
  const payload = {
    topic,
    num_questions: numQuestions,
    difficulty
  };
  if (uid) payload.uid = uid;
  if (lectureNotes) payload.lecture_notes = lectureNotes;
  if (subject && subject !== 'All') payload.subject = subject;

  const response = await fetch(`${API_BASE_URL}/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || errData.message || 'Quiz generation failed.');
  }
  return await response.json();
}

export async function simulateOmiWebhook() {
  const res = await fetch(`${API_BASE_URL}/omi/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to trigger test webhook');
  return await res.json();
}



export async function fetchOmiLogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/omi/logs`);
    if (res.ok) return await res.json();
    return { logs: [] };
  } catch (err) {
    console.warn("Failed to fetch Omi logs:", err);
    return { logs: [] };
  }
}

// -------------------------------------------------------------
// EYFI Hackathon: Exam Setup, Quiz History & Revision APIs
// -------------------------------------------------------------

export async function submitQuizAttempt(topic, difficulty, questions, userAnswers, uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      difficulty,
      questions,
      user_answers: userAnswers,
      uid
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit quiz attempt.');
  }
  return await response.json();
}

export async function fetchQuizHistory(uid = 'default_student', limit = 15) {
  try {
    const res = await fetch(`${API_BASE_URL}/quiz/history?uid=${encodeURIComponent(uid)}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch quiz history.');
    return await res.json();
  } catch (err) {
    console.warn('Quiz history fetch error:', err);
    return { total_attempts: 0, average_accuracy: 0, history: [] };
  }
}

export async function fetchExamProfile(uid = 'default_student') {
  try {
    const res = await fetch(`${API_BASE_URL}/exam/profile?uid=${encodeURIComponent(uid)}`);
    if (!res.ok) throw new Error('Failed to fetch exam profile.');
    return await res.json();
  } catch (err) {
    console.warn('Exam profile fetch error:', err);
    return { has_profile: false, profile: null };
  }
}

export async function saveExamProfile(targetSubject, examTitle, examDate, dailyStudyHours = 2.0, confidenceLevel = 3, uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/exam/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_subject: targetSubject,
      exam_title: examTitle,
      exam_date: examDate,
      daily_study_hours: dailyStudyHours,
      confidence_level: confidenceLevel,
      uid
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to save exam profile.');
  }
  return await response.json();
}

export async function fetchRevisionPlan(uid = 'default_student') {
  try {
    const res = await fetch(`${API_BASE_URL}/revision-plan?uid=${encodeURIComponent(uid)}`);
    if (!res.ok) throw new Error('Failed to fetch revision plan.');
    return await res.json();
  } catch (err) {
    console.warn('Revision plan fetch error:', err);
    return { total_tasks: 0, completed_count: 0, pending_count: 0, completion_rate: 0, today_tasks: [], upcoming_tasks: [], completed_tasks: [] };
  }
}

export async function generateRevisionPlan(subject = null, uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/revision-plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, uid })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to generate revision plan.');
  }
  return await response.json();
}

export async function toggleRevisionTask(taskId, uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/revision-plan/task/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, uid })
  });
  if (!response.ok) throw new Error('Failed to toggle task.');
  return await response.json();
}

export async function fetchExamReadiness(uid = 'default_student') {
  try {
    const res = await fetch(`${API_BASE_URL}/progress/readiness?uid=${encodeURIComponent(uid)}`);
    if (!res.ok) throw new Error('Failed to fetch readiness.');
    return await res.json();
  } catch (err) {
    console.warn('Exam readiness fetch error:', err);
    return { has_sufficient_data: false, readiness_score: 0, status_label: 'Insufficient Data' };
  }
}

export async function fetchUsageStatus(uid = 'default_student') {
  try {
    const res = await fetch(`${API_BASE_URL}/usage/status?uid=${encodeURIComponent(uid)}`);
    if (!res.ok) throw new Error('Failed to fetch usage status.');
    return await res.json();
  } catch (err) {
    console.warn('Usage status fetch error:', err);
    return { plan_tier: 'free', limits: { max_daily_study_queries: 15, max_daily_quizzes: 5, study_queries_remaining: 15, quizzes_remaining: 5 } };
  }
}

export async function registerUpgradeInterest(email, studentName = '', collegeName = '', planRequested = 'student_plus', notes = '', uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/usage/upgrade-interest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      student_name: studentName,
      college_name: collegeName,
      plan_requested: planRequested,
      notes,
      uid
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to register upgrade interest.');
  }
  return await response.json();
}

export async function uploadStudyMaterial(filename, content, subject = 'General', topic = 'Uploaded Material', uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/study/upload-material`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename,
      content,
      subject,
      topic,
      uid
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload study material.');
  }
  return await response.json();
}

export async function analyzeTranscript(transcript, analysisType = 'all', subject = 'General', uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/study/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript,
      analysis_type: analysisType,
      subject,
      uid
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to analyze transcript.');
  }
  return await response.json();
}

export async function resetDailyUsageQuota(uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/usage/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to reset daily quota.');
  }
  return await response.json();
}

export async function setPlanTier(planTier = 'student_plus', uid = 'default_student') {
  const response = await fetch(`${API_BASE_URL}/usage/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, plan_tier: planTier })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update plan tier.');
  }
  return await response.json();
}
