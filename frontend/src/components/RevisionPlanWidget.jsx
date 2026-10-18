import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Zap, 
  ListTodo
} from 'lucide-react';
import { fetchRevisionPlan, toggleRevisionTask } from '../services/api';

export default function RevisionPlanWidget({ onSelectTopic, setActiveTab, reloadTrigger }) {
  const [planData, setPlanData] = useState(null);
  const [activeTabFilter, setActiveTabFilter] = useState('today'); // 'today', 'upcoming', 'completed'

  const loadPlan = async () => {
    try {
      const data = await fetchRevisionPlan('default_student');
      setPlanData(data);
    } catch (err) {
      console.warn('Failed to fetch revision plan:', err);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [reloadTrigger]);

  const handleToggle = async (taskId) => {
    try {
      await toggleRevisionTask(taskId, 'default_student');
      loadPlan();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleQuickRevise = (topic, subject) => {
    if (onSelectTopic) {
      onSelectTopic(topic, subject);
    }
    if (setActiveTab) {
      setActiveTab('study');
    }
  };

  const todayTasks = planData?.today_tasks || [];
  const upcomingTasks = planData?.upcoming_tasks || [];
  const completedTasks = planData?.completed_tasks || [];
  const completionRate = planData?.completion_rate || 0;

  return (
    <div className="glass-card" style={{ border: '1px solid var(--border-violet)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ListTodo size={20} color="var(--brand-violet)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Personalized Revision Timetable
          </h3>
        </div>

        {/* Progress Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Progress:</span>
          <div style={{ width: '120px', height: '8px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--brand-violet)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--brand-violet)' }}>
            {completionRate}%
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTabFilter('today')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTabFilter === 'today' ? 'var(--brand-violet)' : 'transparent',
            color: activeTabFilter === 'today' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          Today's Tasks ({todayTasks.length})
        </button>
        <button
          onClick={() => setActiveTabFilter('upcoming')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTabFilter === 'upcoming' ? 'var(--brand-violet)' : 'transparent',
            color: activeTabFilter === 'upcoming' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          Upcoming ({upcomingTasks.length})
        </button>
        <button
          onClick={() => setActiveTabFilter('completed')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            border: 'none',
            background: activeTabFilter === 'completed' ? 'var(--brand-violet)' : 'transparent',
            color: activeTabFilter === 'completed' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.82rem',
            cursor: 'pointer'
          }}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {activeTabFilter === 'today' && (
          todayTasks.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                {completedTasks.length > 0 ? "🎉 You've finished all today's revision tasks! Check upcoming sessions." : "No tasks scheduled for today. Configure an exam target above to generate a timetable."}
              </p>
            </div>
          ) : (
            todayTasks.map((t) => (
              <div 
                key={t.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleToggle(t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    <Circle size={18} />
                  </button>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                      {t.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.subject} • ~{t.estimated_minutes} mins • <span style={{ textTransform: 'capitalize' }}>{t.task_type.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => handleQuickRevise(t.topic, t.subject)}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.3rem' }}
                >
                  <Zap size={13} color="var(--brand-violet)" /> Quick Revise
                </button>
              </div>
            ))
          )
        )}

        {activeTabFilter === 'upcoming' && (
          upcomingTasks.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No upcoming tasks scheduled.</p>
            </div>
          ) : (
            upcomingTasks.map((t) => (
              <div 
                key={t.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    {t.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Due: {t.due_date} • {t.subject} • ~{t.estimated_minutes} mins
                  </span>
                </div>
                <button
                  className="btn-secondary"
                  onClick={() => handleQuickRevise(t.topic, t.subject)}
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                >
                  Start Early
                </button>
              </div>
            ))
          )
        )}

        {activeTabFilter === 'completed' && (
          completedTasks.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>No completed tasks yet. Check off items as you finish revising!</p>
            </div>
          ) : (
            completedTasks.map((t) => (
              <div 
                key={t.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  background: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleToggle(t.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-emerald)' }}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', textDecoration: 'line-through' }}>
                    {t.title}
                  </span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>Completed</span>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
