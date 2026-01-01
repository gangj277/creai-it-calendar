'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  MONTHS_2026,
  getEventsForDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  type CalendarEvent,
  type EventType,
} from '../data/calendar-data';

// Refined color palette - softer, more cohesive
const EVENT_STYLES: Record<EventType, { bg: string; text: string; dot: string; border: string }> = {
  holiday: {
    bg: 'bg-rose-50/80',
    text: 'text-rose-700',
    dot: 'bg-rose-400',
    border: 'border-rose-200'
  },
  academic: {
    bg: 'bg-sky-50/80',
    text: 'text-sky-700',
    dot: 'bg-sky-400',
    border: 'border-sky-200'
  },
  exam: {
    bg: 'bg-violet-50/80',
    text: 'text-violet-700',
    dot: 'bg-violet-400',
    border: 'border-violet-200'
  },
  vacation: {
    bg: 'bg-emerald-50/80',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
    border: 'border-emerald-200'
  },
  deadline: {
    bg: 'bg-amber-50/80',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    border: 'border-amber-200'
  },
  creait: {
    bg: 'bg-teal-50/90',
    text: 'text-teal-700',
    dot: 'bg-teal-500',
    border: 'border-teal-200'
  },
  'creait-important': {
    bg: 'bg-gradient-to-r from-teal-50 to-cyan-50',
    text: 'text-teal-800',
    dot: 'bg-gradient-to-r from-teal-500 to-cyan-500',
    border: 'border-teal-300'
  },
  session: {
    bg: 'bg-indigo-50/80',
    text: 'text-indigo-700',
    dot: 'bg-indigo-400',
    border: 'border-indigo-200'
  },
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_NAMES_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface MonthData {
  year: number;
  month: number;
  name: string;
  nameEn: string;
}

interface DayCell {
  day: number | null;
  dateStr: string;
  events: CalendarEvent[];
  dayOfWeek: number;
  isWeekend: boolean;
  hasHoliday: boolean;
  hasCreait: boolean;
  hasCreaitImportant: boolean;
}

function useDaysInMonth(year: number, month: number): DayCell[] {
  return useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells: DayCell[] = [];

    // Empty cells for alignment
    for (let i = 0; i < firstDay; i++) {
      cells.push({
        day: null,
        dateStr: '',
        events: [],
        dayOfWeek: i,
        isWeekend: false,
        hasHoliday: false,
        hasCreait: false,
        hasCreaitImportant: false,
      });
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const events = getEventsForDate(dateStr);
      const dayOfWeek = (firstDay + d - 1) % 7;

      cells.push({
        day: d,
        dateStr,
        events,
        dayOfWeek,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        hasHoliday: events.some(e => e.type === 'holiday'),
        hasCreait: events.some(e => e.type === 'creait'),
        hasCreaitImportant: events.some(e => e.type === 'creait-important'),
      });
    }

    return cells;
  }, [year, month]);
}

// Navigation Arrow Components
function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

interface EventModalProps {
  date: string;
  events: CalendarEvent[];
  onClose: () => void;
}

function EventModal({ date, events, onClose }: EventModalProps) {
  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const dayOfWeek = DAY_NAMES[dateObj.getDay()];

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100"
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'modalSlideIn 0.3s ease-out',
        }}
      >
        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-stone-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all duration-200"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-extralight text-stone-800 tracking-tight">{day}</span>
            <div className="flex flex-col">
              <span className="text-lg font-medium text-stone-600">{month}월</span>
              <span className="text-sm text-stone-400">{dayOfWeek}요일</span>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
          {events.map((event, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl ${EVENT_STYLES[event.type].bg} border ${EVENT_STYLES[event.type].border} transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${EVENT_STYLES[event.type].dot} ring-2 ring-white`} />
                <span className={`font-medium ${EVENT_STYLES[event.type].text}`}>{event.title}</span>
              </div>
              {event.description && (
                <p className="text-sm text-stone-500 mt-2 ml-5">{event.description}</p>
              )}
              {event.endDate && (
                <p className="text-xs text-stone-400 mt-1 ml-5">
                  ~ {new Date(event.endDate).getMonth() + 1}월 {new Date(event.endDate).getDate()}일까지
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DayCellComponentProps {
  cell: DayCell;
  onDateClick: (date: string, events: CalendarEvent[]) => void;
}

function DayCellComponent({ cell, onDateClick }: DayCellComponentProps) {
  const { day, dateStr, events, dayOfWeek, hasHoliday, hasCreait, hasCreaitImportant } = cell;

  if (day === null) {
    return <div className="aspect-square" />;
  }

  const hasEvents = events.length > 0;
  const textColorClass = hasHoliday || dayOfWeek === 0
    ? 'text-rose-500'
    : dayOfWeek === 6
      ? 'text-sky-500'
      : hasCreaitImportant
        ? 'text-teal-700'
        : hasCreait
          ? 'text-teal-600'
          : 'text-stone-700';

  // Background class based on event type priority
  const getBgClass = () => {
    if (hasCreaitImportant) return 'bg-gradient-to-br from-teal-100/80 to-cyan-100/80 ring-1 ring-teal-300/50';
    if (hasCreait) return 'bg-teal-50/70';
    if (hasHoliday) return 'bg-rose-50/50';
    return '';
  };

  return (
    <div
      onClick={() => hasEvents && onDateClick(dateStr, events)}
      className={`
        aspect-square p-1 sm:p-2 relative group
        transition-all duration-200 ease-out
        ${hasEvents ? 'cursor-pointer' : 'cursor-default'}
        ${getBgClass()}
        hover:bg-stone-50 rounded-xl
      `}
    >
      {/* Day Number */}
      <div className={`
        text-sm sm:text-base font-medium ${textColorClass}
        transition-transform duration-200
        ${hasEvents ? 'group-hover:scale-110' : ''}
      `}>
        {day}
      </div>

      {/* Event Indicators */}
      {hasEvents && (
        <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 sm:gap-1">
          {events.slice(0, 3).map((event, idx) => (
            <div
              key={idx}
              className={`
                w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full
                ${EVENT_STYLES[event.type].dot}
                transition-transform duration-200 group-hover:scale-125
              `}
            />
          ))}
          {events.length > 3 && (
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-stone-300" />
          )}
        </div>
      )}
    </div>
  );
}

interface MonthCalendarProps {
  monthData: MonthData;
  onDateClick: (date: string, events: CalendarEvent[]) => void;
}

function MonthCalendar({ monthData, onDateClick }: MonthCalendarProps) {
  const { year, month, name, nameEn } = monthData;
  const days = useDaysInMonth(year, month);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Month Title */}
      <div className="text-center mb-8">
        <h2 className="text-6xl sm:text-7xl font-extralight text-stone-800 tracking-tight">
          {name}
        </h2>
        <p className="text-sm tracking-[0.3em] text-stone-400 mt-2 uppercase">
          {nameEn} {year}
        </p>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-4">
        {DAY_NAMES.map((day, idx) => (
          <div
            key={day}
            className={`
              text-center text-xs sm:text-sm font-medium py-2
              ${idx === 0 ? 'text-rose-400' : idx === 6 ? 'text-sky-400' : 'text-stone-400'}
            `}
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{DAY_NAMES_EN[idx]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, idx) => (
          <DayCellComponent
            key={cell.day ?? `empty-${idx}`}
            cell={cell}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
}

function Legend() {
  const legendItems: { type: EventType; label: string; isCreait?: boolean }[] = [
    { type: 'creait', label: 'CREAI+IT', isCreait: true },
    { type: 'session', label: '세션', isCreait: true },
    { type: 'holiday', label: '공휴일' },
    { type: 'academic', label: '학사일정' },
    { type: 'exam', label: '시험' },
    { type: 'vacation', label: '방학' },
    { type: 'deadline', label: '마감' },
  ];

  const getHighlightStyle = (type: EventType, isCreait?: boolean) => {
    if (type === 'session') {
      return 'px-3 py-1 bg-indigo-50 rounded-full border border-indigo-200';
    }
    if (isCreait) {
      return 'px-3 py-1 bg-teal-50 rounded-full border border-teal-200';
    }
    return '';
  };

  const getTextStyle = (type: EventType, isCreait?: boolean) => {
    if (type === 'session') return 'font-medium text-indigo-700';
    if (isCreait) return 'font-medium text-teal-700';
    return 'text-stone-500';
  };

  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
      {legendItems.map(({ type, label, isCreait }) => (
        <div key={type} className={`flex items-center gap-2 ${getHighlightStyle(type, isCreait)}`}>
          <div className={`w-2 h-2 rounded-full ${EVENT_STYLES[type].dot}`} />
          <span className={`text-sm ${getTextStyle(type, isCreait)}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Calendar() {
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const currentMonth = MONTHS_2026[currentMonthIndex];
  const canGoPrev = currentMonthIndex > 0;
  const canGoNext = currentMonthIndex < MONTHS_2026.length - 1;

  const handlePrevMonth = useCallback(() => {
    if (canGoPrev && !isAnimating) {
      setSlideDirection('right');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentMonthIndex(prev => prev - 1);
        setIsAnimating(false);
        setSlideDirection(null);
      }, 200);
    }
  }, [canGoPrev, isAnimating]);

  const handleNextMonth = useCallback(() => {
    if (canGoNext && !isAnimating) {
      setSlideDirection('left');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentMonthIndex(prev => prev + 1);
        setIsAnimating(false);
        setSlideDirection(null);
      }, 200);
    }
  }, [canGoNext, isAnimating]);

  const handleDateClick = useCallback((date: string, events: CalendarEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedDate(null);
    setSelectedEvents([]);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevMonth();
    if (e.key === 'ArrowRight') handleNextMonth();
  }, [handlePrevMonth, handleNextMonth]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Subtle Background Pattern */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-2xl sm:text-3xl font-light text-stone-800 tracking-wide mb-2">
            CREAI+IT 5기
          </h1>
          <p className="text-sm text-stone-400 tracking-widest uppercase">
            Academic Calendar 2026
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8 sm:mb-12 px-2">
          <button
            onClick={handlePrevMonth}
            disabled={!canGoPrev || isAnimating}
            className={`
              p-3 sm:p-4 rounded-full transition-all duration-300
              ${canGoPrev
                ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:scale-95'
                : 'text-stone-200 cursor-not-allowed'}
            `}
            aria-label="이전 달"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Month Indicator Dots */}
          <div className="flex gap-1.5 sm:gap-2">
            {MONTHS_2026.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isAnimating && idx !== currentMonthIndex) {
                    setSlideDirection(idx > currentMonthIndex ? 'left' : 'right');
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentMonthIndex(idx);
                      setIsAnimating(false);
                      setSlideDirection(null);
                    }, 200);
                  }
                }}
                className={`
                  w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300
                  ${idx === currentMonthIndex
                    ? 'bg-stone-800 scale-125'
                    : 'bg-stone-300 hover:bg-stone-400'}
                `}
                aria-label={MONTHS_2026[idx].name}
              />
            ))}
          </div>

          <button
            onClick={handleNextMonth}
            disabled={!canGoNext || isAnimating}
            className={`
              p-3 sm:p-4 rounded-full transition-all duration-300
              ${canGoNext
                ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:scale-95'
                : 'text-stone-200 cursor-not-allowed'}
            `}
            aria-label="다음 달"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </nav>

        {/* Calendar View */}
        <div
          className={`
            transition-all duration-200 ease-out
            ${isAnimating
              ? slideDirection === 'left'
                ? 'opacity-0 -translate-x-8'
                : 'opacity-0 translate-x-8'
              : 'opacity-100 translate-x-0'}
          `}
        >
          <MonthCalendar
            monthData={currentMonth}
            onDateClick={handleDateClick}
          />
        </div>

        {/* Legend */}
        <div className="mt-12 sm:mt-16">
          <Legend />
        </div>

        {/* Footer Hint */}
        <p className="text-center text-xs text-stone-300 mt-8 sm:mt-12">
          날짜를 클릭하여 일정을 확인하세요
        </p>
      </div>

      {/* Event Modal */}
      {selectedDate && (
        <EventModal
          date={selectedDate}
          events={selectedEvents}
          onClose={handleCloseModal}
        />
      )}

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
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
