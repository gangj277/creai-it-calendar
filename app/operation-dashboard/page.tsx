'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// =============================================================================
// TYPES
// =============================================================================

type TodoStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
type TodoPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  date: string;
  eventType: string;
  color: string;
  todos: Todo[];
  createdAt: string;
  updatedAt: string;
}

interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  deadline: string | null;
  order: number;
  milestoneId: string | null;
  milestone: Milestone | null;
  parentId: string | null;
  parent: Todo | null;
  children: Todo[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// CONSTANTS & STYLES
// =============================================================================

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  recruiting: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  interview: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  ot: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500' },
  mt: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  session: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500' },
  'demo-day': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  deadline: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
  'creait-important': { bg: 'bg-gradient-to-r from-teal-50 to-cyan-50', text: 'text-teal-700', border: 'border-teal-300', dot: 'bg-teal-500' },
  default: { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200', dot: 'bg-stone-500' },
};

const PRIORITY_STYLES: Record<TodoPriority, { bg: string; text: string; label: string }> = {
  URGENT: { bg: 'bg-rose-100', text: 'text-rose-700', label: '긴급' },
  HIGH: { bg: 'bg-amber-100', text: 'text-amber-700', label: '높음' },
  MEDIUM: { bg: 'bg-sky-100', text: 'text-sky-700', label: '보통' },
  LOW: { bg: 'bg-stone-100', text: 'text-stone-500', label: '낮음' },
};

const STATUS_STYLES: Record<TodoStatus, { bg: string; text: string; label: string }> = {
  TODO: { bg: 'bg-stone-100', text: 'text-stone-600', label: '할 일' },
  IN_PROGRESS: { bg: 'bg-sky-100', text: 'text-sky-700', label: '진행 중' },
  DONE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '완료' },
  CANCELLED: { bg: 'bg-stone-200', text: 'text-stone-500', label: '취소됨' },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  recruiting: '리크루팅',
  interview: '면접',
  ot: 'OT',
  mt: 'MT',
  session: '세션',
  'demo-day': '데모데이',
  deadline: '마감',
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function isOverdue(deadlineStr: string | null): boolean {
  if (!deadlineStr) return false;
  return getDaysUntil(deadlineStr) < 0;
}

function getEventTypeStyle(eventType: string) {
  return EVENT_TYPE_COLORS[eventType] || EVENT_TYPE_COLORS.default;
}

// =============================================================================
// ICON COMPONENTS
// =============================================================================

function IconPlus({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconCheck({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconChevronDown({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function IconChevronRight({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function IconClose({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconEdit({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconTrash({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconCalendar({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function IconFlag({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  );
}

function IconLoader({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function IconSubtask({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  );
}

// =============================================================================
// API HOOKS
// =============================================================================

function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/milestones');
      if (!res.ok) throw new Error('마일스톤을 불러오는데 실패했습니다');
      const data = await res.json();
      setMilestones(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMilestone = useCallback(async (data: Partial<Milestone>) => {
    const res = await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('마일스톤 생성에 실패했습니다');
    await fetchMilestones();
  }, [fetchMilestones]);

  const updateMilestone = useCallback(async (id: string, data: Partial<Milestone>) => {
    const res = await fetch(`/api/milestones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('마일스톤 수정에 실패했습니다');
    await fetchMilestones();
  }, [fetchMilestones]);

  const deleteMilestone = useCallback(async (id: string) => {
    const res = await fetch(`/api/milestones/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('마일스톤 삭제에 실패했습니다');
    await fetchMilestones();
  }, [fetchMilestones]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return { milestones, loading, error, fetchMilestones, createMilestone, updateMilestone, deleteMilestone };
}

function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async (milestoneId?: string) => {
    try {
      setLoading(true);
      const url = milestoneId
        ? `/api/todos?milestoneId=${milestoneId}&rootOnly=true`
        : '/api/todos?rootOnly=true';
      const res = await fetch(url);
      if (!res.ok) throw new Error('작업을 불러오는데 실패했습니다');
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = useCallback(async (data: Partial<Todo>) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('작업 생성에 실패했습니다');
    const newTodo = await res.json();
    return newTodo;
  }, []);

  const updateTodo = useCallback(async (id: string, data: Partial<Todo>) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('작업 수정에 실패했습니다');
    return await res.json();
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('작업 삭제에 실패했습니다');
  }, []);

  return { todos, loading, error, fetchTodos, createTodo, updateTodo, deleteTodo, setTodos };
}

// =============================================================================
// URGENT TODOS SECTION
// =============================================================================

interface UrgentTodosSectionProps {
  milestones: Milestone[];
  onStatusChange: (id: string, status: TodoStatus) => void;
  loading: boolean;
}

function UrgentTodosSection({ milestones, onStatusChange, loading }: UrgentTodosSectionProps) {
  // Collect all incomplete todos with their milestone info
  const urgentTodos = useMemo(() => {
    const todos: Array<{ todo: Todo; milestone: Milestone; daysUntil: number }> = [];

    milestones.forEach(milestone => {
      const daysUntil = getDaysUntil(milestone.date);

      // Flatten todos including children
      const collectTodos = (todoList: Todo[]) => {
        todoList.forEach(todo => {
          if (todo.status !== 'DONE' && todo.status !== 'CANCELLED') {
            todos.push({ todo, milestone, daysUntil });
          }
          if (todo.children && todo.children.length > 0) {
            collectTodos(todo.children);
          }
        });
      };

      if (milestone.todos) {
        collectTodos(milestone.todos);
      }
    });

    // Sort by: 1) milestone date (urgent first), 2) priority
    const priorityOrder: Record<TodoPriority, number> = {
      URGENT: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    return todos
      .sort((a, b) => {
        // First by milestone date
        if (a.daysUntil !== b.daysUntil) {
          return a.daysUntil - b.daysUntil;
        }
        // Then by priority
        return priorityOrder[a.todo.priority] - priorityOrder[b.todo.priority];
      })
      .slice(0, 5);
  }, [milestones]);

  const handleToggle = (todoId: string, currentStatus: TodoStatus) => {
    const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    onStatusChange(todoId, newStatus);
  };

  if (loading) {
    return (
      <div className="mb-6 p-6 bg-white rounded-2xl border border-stone-200">
        <div className="flex items-center justify-center py-4">
          <IconLoader className="w-6 h-6 text-stone-400" />
        </div>
      </div>
    );
  }

  if (urgentTodos.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-lg">🔥</span>
        <h2 className="text-lg font-semibold text-stone-800">시급한 TODO</h2>
        <span className="text-sm text-stone-400">Top {urgentTodos.length}</span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden">
        {urgentTodos.map(({ todo, milestone, daysUntil }) => {
          const priorityStyle = PRIORITY_STYLES[todo.priority];
          const isDone = todo.status === 'DONE';
          const isUrgent = daysUntil <= 3 && daysUntil >= 0;
          const isPast = daysUntil < 0;

          return (
            <div
              key={todo.id}
              className={`group flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors ${isDone ? 'opacity-60' : ''}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(todo.id, todo.status)}
                className={`
                  w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0
                  ${isDone
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-stone-300 hover:border-teal-400'}
                `}
              >
                {isDone && <IconCheck className="w-3.5 h-3.5" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium truncate ${isDone ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                    {todo.title}
                  </span>

                  {/* Priority Badge */}
                  {todo.priority !== 'MEDIUM' && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${priorityStyle.bg} ${priorityStyle.text}`}>
                      {priorityStyle.label}
                    </span>
                  )}
                </div>

                {/* Milestone Info */}
                <div className="flex items-center gap-2 mt-1 text-xs text-stone-400">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: milestone.color }}
                  />
                  <span className="truncate">{milestone.title}</span>
                </div>
              </div>

              {/* D-Day Badge */}
              <span className={`
                px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0
                ${isPast
                  ? 'bg-stone-100 text-stone-400'
                  : isUrgent
                    ? 'bg-rose-100 text-rose-600'
                    : daysUntil <= 7
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-emerald-100 text-emerald-600'}
              `}>
                {isPast ? '지남' : daysUntil === 0 ? 'D-Day' : `D-${daysUntil}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// MILESTONE COMPONENTS
// =============================================================================

interface MilestoneCardProps {
  milestone: Milestone;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddTodo: () => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onAddSubtask: (parentId: string) => void;
}

function MilestoneCard({
  milestone,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddTodo,
  onEditTodo,
  onDeleteTodo,
  onStatusChange,
  onAddSubtask,
}: MilestoneCardProps) {
  const daysUntil = getDaysUntil(milestone.date);
  const style = getEventTypeStyle(milestone.eventType);
  const isPast = daysUntil < 0;
  const [todoExpandedIds, setTodoExpandedIds] = useState<Set<string>>(new Set());

  const toggleTodoExpand = useCallback((id: string) => {
    setTodoExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const todoCount = milestone.todos?.length || 0;
  const doneCount = milestone.todos?.filter(t => t.status === 'DONE').length || 0;
  const progressPercent = todoCount > 0 ? Math.round((doneCount / todoCount) * 100) : 0;

  return (
    <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isPast ? 'opacity-70' : ''} ${isExpanded ? 'border-stone-300 shadow-md' : 'border-stone-200 hover:border-stone-300'}`}>
      {/* Header - Clickable */}
      <div
        onClick={onToggle}
        className={`group relative p-4 cursor-pointer transition-colors ${isExpanded ? style.bg : 'bg-white hover:bg-stone-50'}`}
      >
        {/* Expand Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
            <IconChevronDown className="w-5 h-5 text-stone-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onAddTodo(); }}
            className="p-1.5 rounded-lg bg-white/90 hover:bg-teal-50 text-stone-500 hover:text-teal-600 shadow-sm"
            title="작업 추가"
          >
            <IconPlus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-stone-500 hover:text-stone-700 shadow-sm"
          >
            <IconEdit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg bg-white/90 hover:bg-rose-50 text-stone-500 hover:text-rose-600 shadow-sm"
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex items-start gap-3 pl-8">
          <div
            className="w-3 h-3 rounded-full mt-1.5 ring-2 ring-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: milestone.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-stone-800 truncate">{milestone.title}</h3>
              {/* D-Day Badge */}
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${isPast ? 'bg-stone-100 text-stone-400' : daysUntil === 0 ? 'bg-rose-100 text-rose-600' : daysUntil <= 7 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {isPast ? '지남' : daysUntil === 0 ? '오늘' : `D-${daysUntil}`}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-stone-500">{formatDate(milestone.date)}</p>
              {todoCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-400">{doneCount}/{todoCount}</span>
                </div>
              )}
            </div>
            {milestone.description && (
              <p className="text-xs text-stone-400 mt-1 line-clamp-1">{milestone.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content - Todos */}
      {isExpanded && (
        <div className="border-t border-stone-200 bg-white">
          {milestone.todos && milestone.todos.length > 0 ? (
            <div className="p-3 space-y-1">
              {milestone.todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  expandedIds={todoExpandedIds}
                  onToggleExpand={toggleTodoExpand}
                  onStatusChange={onStatusChange}
                  onEdit={onEditTodo}
                  onDelete={onDeleteTodo}
                  onAddSubtask={onAddSubtask}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-stone-400 mb-2">아직 작업이 없습니다</p>
              <button
                onClick={onAddTodo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-teal-600 hover:bg-teal-50 transition-colors"
              >
                <IconPlus className="w-4 h-4" />
                작업 추가
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface MilestonePanelProps {
  milestones: Milestone[];
  expandedMilestoneIds: Set<string>;
  onToggleMilestone: (id: string) => void;
  onCreateMilestone: () => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
  onAddTodo: (milestoneId: string) => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onAddSubtask: (parentId: string) => void;
  loading: boolean;
}

function MilestonePanel({
  milestones,
  expandedMilestoneIds,
  onToggleMilestone,
  onCreateMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onAddTodo,
  onEditTodo,
  onDeleteTodo,
  onStatusChange,
  onAddSubtask,
  loading,
}: MilestonePanelProps) {
  const upcomingMilestones = useMemo(() =>
    milestones.filter(m => getDaysUntil(m.date) >= 0),
    [milestones]
  );

  const pastMilestones = useMemo(() =>
    milestones.filter(m => getDaysUntil(m.date) < 0),
    [milestones]
  );

  const totalTodos = useMemo(() => {
    let total = 0;
    let done = 0;
    milestones.forEach(m => {
      if (m.todos) {
        total += m.todos.length;
        done += m.todos.filter(t => t.status === 'DONE').length;
      }
    });
    return { total, done };
  }, [milestones]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <IconFlag className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-stone-800">마일스톤</h2>
          </div>
          {totalTodos.total > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-stone-500">
              <span className="px-2 py-1 bg-stone-100 rounded-lg">{totalTodos.total}개 작업</span>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg">{totalTodos.done}개 완료</span>
            </div>
          )}
        </div>
        <button
          onClick={onCreateMilestone}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors font-medium"
        >
          <IconPlus className="w-4 h-4" />
          <span className="hidden sm:inline">마일스톤 추가</span>
        </button>
      </div>

      {/* Milestones List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <IconLoader className="w-8 h-8 text-stone-400" />
        </div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <IconFlag className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-700 mb-1">마일스톤이 없습니다</h3>
          <p className="text-sm text-stone-500 mb-4">첫 마일스톤을 만들어 작업을 관리해보세요</p>
          <button
            onClick={onCreateMilestone}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
          >
            <IconPlus className="w-4 h-4" />
            마일스톤 만들기
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Milestones */}
          {upcomingMilestones.length > 0 && (
            <div>
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3 px-1">
                예정된 마일스톤 ({upcomingMilestones.length})
              </p>
              <div className="space-y-3">
                {upcomingMilestones.map(milestone => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    isExpanded={expandedMilestoneIds.has(milestone.id)}
                    onToggle={() => onToggleMilestone(milestone.id)}
                    onEdit={() => onEditMilestone(milestone)}
                    onDelete={() => onDeleteMilestone(milestone.id)}
                    onAddTodo={() => onAddTodo(milestone.id)}
                    onEditTodo={onEditTodo}
                    onDeleteTodo={onDeleteTodo}
                    onStatusChange={onStatusChange}
                    onAddSubtask={onAddSubtask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Milestones */}
          {pastMilestones.length > 0 && (
            <div>
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3 px-1">
                지난 마일스톤 ({pastMilestones.length})
              </p>
              <div className="space-y-3">
                {pastMilestones.map(milestone => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    isExpanded={expandedMilestoneIds.has(milestone.id)}
                    onToggle={() => onToggleMilestone(milestone.id)}
                    onEdit={() => onEditMilestone(milestone)}
                    onDelete={() => onDeleteMilestone(milestone.id)}
                    onAddTodo={() => onAddTodo(milestone.id)}
                    onEditTodo={onEditTodo}
                    onDeleteTodo={onDeleteTodo}
                    onStatusChange={onStatusChange}
                    onAddSubtask={onAddSubtask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TODO COMPONENTS
// =============================================================================

interface TodoItemProps {
  todo: Todo;
  depth?: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (parentId: string) => void;
}

function TodoItem({
  todo,
  depth = 0,
  expandedIds,
  onToggleExpand,
  onStatusChange,
  onEdit,
  onDelete,
  onAddSubtask,
}: TodoItemProps) {
  const hasChildren = todo.children && todo.children.length > 0;
  const isExpanded = expandedIds.has(todo.id);
  const isDone = todo.status === 'DONE';
  const isCancelled = todo.status === 'CANCELLED';
  const deadlineOverdue = isOverdue(todo.deadline) && !isDone && !isCancelled;

  const priorityStyle = PRIORITY_STYLES[todo.priority];

  const handleCheckboxClick = () => {
    const newStatus = isDone ? 'TODO' : 'DONE';
    onStatusChange(todo.id, newStatus);
  };

  return (
    <div className="group">
      <div
        className={`
          flex items-start gap-3 p-3 rounded-xl transition-all duration-200
          ${depth > 0 ? 'ml-6 border-l-2 border-stone-100' : ''}
          ${isDone || isCancelled ? 'opacity-60' : ''}
          hover:bg-stone-50
        `}
        style={{ paddingLeft: depth > 0 ? `${depth * 12 + 12}px` : undefined }}
      >
        {/* Expand Button */}
        {hasChildren ? (
          <button
            onClick={() => onToggleExpand(todo.id)}
            className="mt-0.5 p-0.5 rounded text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            {isExpanded ? (
              <IconChevronDown className="w-4 h-4" />
            ) : (
              <IconChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={`
            mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
            ${isDone
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-stone-300 hover:border-stone-400'}
          `}
        >
          {isDone && <IconCheck className="w-3.5 h-3.5" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${isDone ? 'line-through text-stone-400' : 'text-stone-800'}`}>
              {todo.title}
            </span>

            {/* Priority Badge */}
            {todo.priority !== 'MEDIUM' && (
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                {priorityStyle.label}
              </span>
            )}

            {/* Status Badge (if in progress) */}
            {todo.status === 'IN_PROGRESS' && (
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-700">
                진행 중
              </span>
            )}
          </div>

          {todo.description && (
            <p className={`text-sm mt-0.5 ${isDone ? 'text-stone-300' : 'text-stone-500'}`}>
              {todo.description}
            </p>
          )}

          {/* Deadline */}
          {todo.deadline && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs ${deadlineOverdue ? 'text-rose-500' : 'text-stone-400'}`}>
              <IconCalendar className="w-3.5 h-3.5" />
              <span>{formatDate(todo.deadline)}</span>
              {deadlineOverdue && <span className="font-medium">(기한 초과)</span>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddSubtask(todo.id)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
            title="하위 작업 추가"
          >
            <IconSubtask className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(todo)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <IconEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {todo.children.map(child => (
            <TodoItem
              key={child.id}
              todo={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface TodoBoardProps {
  todos: Todo[];
  loading: boolean;
  selectedMilestoneId: string | null;
  milestones: Milestone[];
  onCreateTodo: () => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
  onAddSubtask: (parentId: string) => void;
}

function TodoBoard({
  todos,
  loading,
  selectedMilestoneId,
  milestones,
  onCreateTodo,
  onEditTodo,
  onDeleteTodo,
  onStatusChange,
  onAddSubtask,
}: TodoBoardProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'ALL'>('ALL');

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const filteredTodos = useMemo(() => {
    if (statusFilter === 'ALL') return todos;
    return todos.filter(todo => todo.status === statusFilter);
  }, [todos, statusFilter]);

  const selectedMilestone = selectedMilestoneId
    ? milestones.find(m => m.id === selectedMilestoneId)
    : null;

  const todoStats = useMemo(() => {
    const flatTodos: Todo[] = [];
    const flatten = (items: Todo[]) => {
      items.forEach(item => {
        flatTodos.push(item);
        if (item.children) flatten(item.children);
      });
    };
    flatten(todos);

    return {
      total: flatTodos.length,
      done: flatTodos.filter(t => t.status === 'DONE').length,
      inProgress: flatTodos.filter(t => t.status === 'IN_PROGRESS').length,
      todo: flatTodos.filter(t => t.status === 'TODO').length,
    };
  }, [todos]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">
            {selectedMilestone ? selectedMilestone.title : '전체 작업'}
          </h2>
          {selectedMilestone && (
            <p className="text-sm text-stone-500 mt-0.5">
              {formatDateFull(selectedMilestone.date)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
            <span className="px-2 py-1 rounded-lg bg-stone-100">{todoStats.total}개 전체</span>
            <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600">{todoStats.done}개 완료</span>
            {todoStats.inProgress > 0 && (
              <span className="px-2 py-1 rounded-lg bg-sky-50 text-sky-600">{todoStats.inProgress}개 진행 중</span>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TodoStatus | 'ALL')}
            className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="ALL">전체 상태</option>
            <option value="TODO">할 일</option>
            <option value="IN_PROGRESS">진행 중</option>
            <option value="DONE">완료</option>
            <option value="CANCELLED">취소됨</option>
          </select>

          {/* Add Button */}
          <button
            onClick={onCreateTodo}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors font-medium"
          >
            <IconPlus className="w-4 h-4" />
            <span className="hidden sm:inline">작업 추가</span>
          </button>
        </div>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-stone-200 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <IconLoader className="w-8 h-8 text-stone-400" />
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
              <IconCheck className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-lg font-medium text-stone-700 mb-1">
              {statusFilter !== 'ALL' ? '일치하는 작업이 없습니다' : '작업이 없습니다'}
            </h3>
            <p className="text-sm text-stone-500 mb-4">
              {statusFilter !== 'ALL'
                ? '필터를 변경해서 다른 작업을 확인해보세요'
                : '첫 작업을 만들어 시작해보세요'}
            </p>
            {statusFilter === 'ALL' && (
              <button
                onClick={onCreateTodo}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              >
                <IconPlus className="w-4 h-4" />
                작업 만들기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onStatusChange={onStatusChange}
                onEdit={onEditTodo}
                onDelete={onDeleteTodo}
                onAddSubtask={onAddSubtask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MODAL COMPONENTS
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalSlideIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <IconClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface MilestoneFormProps {
  milestone: Milestone | null;
  onSubmit: (data: Partial<Milestone>) => void;
  onClose: () => void;
  loading: boolean;
}

function MilestoneForm({ milestone, onSubmit, onClose, loading }: MilestoneFormProps) {
  const [title, setTitle] = useState(milestone?.title || '');
  const [description, setDescription] = useState(milestone?.description || '');
  const [date, setDate] = useState(
    milestone?.date ? new Date(milestone.date).toISOString().split('T')[0] : ''
  );
  const [eventType, setEventType] = useState(milestone?.eventType || 'session');
  const [color, setColor] = useState(milestone?.color || '#14b8a6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, date, eventType, color });
  };

  const eventTypes = [
    { value: 'recruiting', label: '리크루팅' },
    { value: 'interview', label: '면접' },
    { value: 'ot', label: 'OT' },
    { value: 'mt', label: 'MT' },
    { value: 'session', label: '세션' },
    { value: 'demo-day', label: '데모데이' },
    { value: 'deadline', label: '마감' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          placeholder="마일스톤 제목을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors resize-none"
          placeholder="선택 사항"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">유형</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white"
          >
            {eventTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">색상</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 rounded-lg border border-stone-200 cursor-pointer"
          />
          <div className="flex gap-2">
            {['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'].map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-stone-400' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <IconLoader className="w-4 h-4" />}
          {milestone ? '수정' : '생성'}
        </button>
      </div>
    </form>
  );
}

interface TodoFormProps {
  todo: Todo | null;
  parentId: string | null;
  milestones: Milestone[];
  selectedMilestoneId: string | null;
  onSubmit: (data: Partial<Todo>) => void;
  onClose: () => void;
  loading: boolean;
}

function TodoForm({ todo, parentId, milestones, selectedMilestoneId, onSubmit, onClose, loading }: TodoFormProps) {
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [status, setStatus] = useState<TodoStatus>(todo?.status || 'TODO');
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority || 'MEDIUM');
  const [deadline, setDeadline] = useState(
    todo?.deadline ? new Date(todo.deadline).toISOString().split('T')[0] : ''
  );
  const [milestoneId, setMilestoneId] = useState(
    todo?.milestoneId || selectedMilestoneId || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description: description || null,
      status,
      priority,
      deadline: deadline || null,
      milestoneId: milestoneId || null,
      parentId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {parentId && (
        <div className="px-3 py-2 bg-stone-50 rounded-lg text-sm text-stone-600 flex items-center gap-2">
          <IconSubtask className="w-4 h-4" />
          하위 작업 생성 중
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          placeholder="무엇을 해야 하나요?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors resize-none"
          placeholder="자세한 내용을 입력하세요..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">상태</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TodoStatus)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white"
          >
            {Object.entries(STATUS_STYLES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">우선순위</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoPriority)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white"
          >
            {Object.entries(PRIORITY_STYLES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">마감일</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">마일스톤</label>
          <select
            value={milestoneId}
            onChange={(e) => setMilestoneId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white"
          >
            <option value="">마일스톤 없음</option>
            {milestones.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <IconLoader className="w-4 h-4" />}
          {todo ? '수정' : '생성'}
        </button>
      </div>
    </form>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalSlideIn 0.2s ease-out' }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-2">{title}</h3>
          <p className="text-stone-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <IconLoader className="w-4 h-4" />}
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

export default function OperationDashboard() {
  // Data hooks
  const {
    milestones,
    loading: milestonesLoading,
    fetchMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone
  } = useMilestones();

  const {
    createTodo,
    updateTodo,
    deleteTodo,
  } = useTodos();

  // UI State
  const [expandedMilestoneIds, setExpandedMilestoneIds] = useState<Set<string>>(new Set());
  const [selectedMilestoneIdForTodo, setSelectedMilestoneIdForTodo] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Modal States
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [subtaskParentId, setSubtaskParentId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'milestone' | 'todo'; id: string } | null>(null);

  // Toggle milestone expansion
  const handleToggleMilestone = useCallback((id: string) => {
    setExpandedMilestoneIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Milestone handlers
  const handleCreateMilestone = () => {
    setEditingMilestone(null);
    setMilestoneModalOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setMilestoneModalOpen(true);
  };

  const handleMilestoneSubmit = async (data: Partial<Milestone>) => {
    try {
      setFormLoading(true);
      if (editingMilestone) {
        await updateMilestone(editingMilestone.id, data);
      } else {
        await createMilestone(data);
      }
      setMilestoneModalOpen(false);
      setEditingMilestone(null);
    } catch (error) {
      console.error('마일스톤 저장 실패:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteMilestoneConfirm = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'milestone') return;
    try {
      setFormLoading(true);
      await deleteMilestone(deleteConfirm.id);
      setExpandedMilestoneIds(prev => {
        const next = new Set(prev);
        next.delete(deleteConfirm.id);
        return next;
      });
      setDeleteConfirm(null);
    } catch (error) {
      console.error('마일스톤 삭제 실패:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Todo handlers
  const handleAddTodoToMilestone = (milestoneId: string) => {
    setEditingTodo(null);
    setSubtaskParentId(null);
    setSelectedMilestoneIdForTodo(milestoneId);
    setTodoModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setSubtaskParentId(null);
    setSelectedMilestoneIdForTodo(todo.milestoneId);
    setTodoModalOpen(true);
  };

  const handleAddSubtask = (parentId: string) => {
    setEditingTodo(null);
    setSubtaskParentId(parentId);
    setTodoModalOpen(true);
  };

  const handleTodoSubmit = async (data: Partial<Todo>) => {
    try {
      setFormLoading(true);
      if (editingTodo) {
        await updateTodo(editingTodo.id, data);
      } else {
        await createTodo(data);
      }
      await fetchMilestones(); // Refresh milestones to get updated todos
      setTodoModalOpen(false);
      setEditingTodo(null);
      setSubtaskParentId(null);
      setSelectedMilestoneIdForTodo(null);
    } catch (error) {
      console.error('작업 저장 실패:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleTodoStatusChange = async (id: string, status: TodoStatus) => {
    try {
      await updateTodo(id, { status });
      await fetchMilestones(); // Refresh to show updated status
    } catch (error) {
      console.error('작업 상태 변경 실패:', error);
    }
  };

  const handleDeleteTodoConfirm = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'todo') return;
    try {
      setFormLoading(true);
      await deleteTodo(deleteConfirm.id);
      await fetchMilestones(); // Refresh milestones
      setDeleteConfirm(null);
    } catch (error) {
      console.error('작업 삭제 실패:', error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <header className="relative border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-stone-800">CREAI+IT 운영</h1>
                <p className="text-sm text-stone-500">작업 관리 대시보드</p>
              </div>
            </div>
            <a
              href="/"
              className="text-sm text-stone-500 hover:text-stone-700 transition-colors flex items-center gap-1"
            >
              <IconCalendar className="w-4 h-4" />
              캘린더
            </a>
          </div>
        </div>
      </header>

      {/* Main Content - Single Column Layout */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Urgent TODOs Section */}
        <UrgentTodosSection
          milestones={milestones}
          onStatusChange={handleTodoStatusChange}
          loading={milestonesLoading}
        />

        <MilestonePanel
          milestones={milestones}
          expandedMilestoneIds={expandedMilestoneIds}
          onToggleMilestone={handleToggleMilestone}
          onCreateMilestone={handleCreateMilestone}
          onEditMilestone={handleEditMilestone}
          onDeleteMilestone={(id) => setDeleteConfirm({ type: 'milestone', id })}
          onAddTodo={handleAddTodoToMilestone}
          onEditTodo={handleEditTodo}
          onDeleteTodo={(id) => setDeleteConfirm({ type: 'todo', id })}
          onStatusChange={handleTodoStatusChange}
          onAddSubtask={handleAddSubtask}
          loading={milestonesLoading}
        />
      </main>

      {/* Modals */}
      <Modal
        isOpen={milestoneModalOpen}
        onClose={() => { setMilestoneModalOpen(false); setEditingMilestone(null); }}
        title={editingMilestone ? '마일스톤 수정' : '마일스톤 생성'}
      >
        <MilestoneForm
          milestone={editingMilestone}
          onSubmit={handleMilestoneSubmit}
          onClose={() => { setMilestoneModalOpen(false); setEditingMilestone(null); }}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={todoModalOpen}
        onClose={() => { setTodoModalOpen(false); setEditingTodo(null); setSubtaskParentId(null); setSelectedMilestoneIdForTodo(null); }}
        title={editingTodo ? '작업 수정' : subtaskParentId ? '하위 작업 추가' : '작업 추가'}
      >
        <TodoForm
          todo={editingTodo}
          parentId={subtaskParentId}
          milestones={milestones}
          selectedMilestoneId={selectedMilestoneIdForTodo}
          onSubmit={handleTodoSubmit}
          onClose={() => { setTodoModalOpen(false); setEditingTodo(null); setSubtaskParentId(null); setSelectedMilestoneIdForTodo(null); }}
          loading={formLoading}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title={deleteConfirm?.type === 'milestone' ? '마일스톤 삭제' : '작업 삭제'}
        message={
          deleteConfirm?.type === 'milestone'
            ? '이 마일스톤을 삭제하시겠습니까? 연결된 작업들은 연결이 해제됩니다.'
            : '이 작업을 삭제하시겠습니까? 모든 하위 작업도 함께 삭제됩니다.'
        }
        onConfirm={deleteConfirm?.type === 'milestone' ? handleDeleteMilestoneConfirm : handleDeleteTodoConfirm}
        onCancel={() => setDeleteConfirm(null)}
        loading={formLoading}
      />

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
