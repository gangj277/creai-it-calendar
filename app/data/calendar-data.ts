export type EventType =
  | 'holiday'        // 공휴일
  | 'academic'       // 학사일정
  | 'exam'           // 시험
  | 'vacation'       // 방학
  | 'deadline'       // 마감
  | 'creait'         // CREAI+IT 일정
  | 'creait-important' // CREAI+IT 중요 일정
  | 'session';       // CREAI+IT 세션

export interface CalendarEvent {
  date: string;      // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD (기간 이벤트용)
  title: string;
  type: EventType;
  description?: string;
}

// 세션 일정 생성 함수
// Phase 1: 정규 세션 (3/9 ~ 6/8)
// - 중간고사: 4/21-27 → 4/14부터 휴회
// - 기말고사: 6/16-22 → 6/9부터 휴회
// Phase 2: Final Sprint (7/6 ~ 7/30)
// - 8/1 데모데이 전까지 월/목 세션
function generateSessionEvents(): CalendarEvent[] {
  const sessions: CalendarEvent[] = [];
  let sessionCount = 1;

  // ===== Phase 1: 정규 세션 =====
  const phase1Start = new Date('2026-03-09');
  const midtermBreakStart = new Date('2026-04-14');
  const midtermBreakEnd = new Date('2026-04-27');
  const finalBreakStart = new Date('2026-06-09');

  let current = new Date(phase1Start);

  while (current < finalBreakStart) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];

    // 중간고사 휴회 기간 제외
    if (current >= midtermBreakStart && current <= midtermBreakEnd) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    if (dayOfWeek === 1) {
      sessions.push({
        date: dateStr,
        title: `세션 #${sessionCount}`,
        type: 'session',
        description: '월 19:00-22:00',
      });
      sessionCount++;
    } else if (dayOfWeek === 4) {
      sessions.push({
        date: dateStr,
        title: `세션 #${sessionCount}`,
        type: 'session',
        description: '목 20:00-22:00',
      });
      sessionCount++;
    }

    current.setDate(current.getDate() + 1);
  }

  // ===== Phase 2: Final Sprint 세션 =====
  const sprintStart = new Date('2026-07-06');
  const demoDay = new Date('2026-08-01');

  current = new Date(sprintStart);
  let sprintSessionCount = 1;

  while (current < demoDay) {
    const dayOfWeek = current.getDay();
    const dateStr = current.toISOString().split('T')[0];

    if (dayOfWeek === 1) {
      sessions.push({
        date: dateStr,
        title: `Sprint #${sprintSessionCount}`,
        type: 'session',
        description: '월 19:00-22:00 | Final Sprint',
      });
      sprintSessionCount++;
    } else if (dayOfWeek === 4) {
      sessions.push({
        date: dateStr,
        title: `Sprint #${sprintSessionCount}`,
        type: 'session',
        description: '목 20:00-22:00 | Final Sprint',
      });
      sprintSessionCount++;
    }

    current.setDate(current.getDate() + 1);
  }

  return sessions;
}

const sessionEvents = generateSessionEvents();

export const events2026: CalendarEvent[] = [
  // 세션 일정
  ...sessionEvents,

  // ========== 2월 ==========
  // CREAI+IT 일정
  { date: '2026-02-14', endDate: '2026-03-05', title: '5기 리크루팅', type: 'creait', description: '지원서 접수 기간' },

  // 공휴일
  { date: '2026-02-14', endDate: '2026-02-18', title: '설날 연휴', type: 'holiday', description: '토~수, 5일 연휴' },
  { date: '2026-02-28', title: '3.1절 연휴 시작', type: 'holiday' },

  // 학사일정
  { date: '2026-02-09', endDate: '2026-02-13', title: '수강신청', type: 'academic' },
  { date: '2026-02-23', endDate: '2026-02-27', title: '등록기간', type: 'academic' },
  { date: '2026-02-24', title: '신입생 수강신청', type: 'academic' },
  { date: '2026-02-26', title: '복학생 수강신청', type: 'academic' },

  // ========== 3월 ==========
  // CREAI+IT 일정
  { date: '2026-03-06', endDate: '2026-03-08', title: '5기 면접', type: 'creait-important', description: '면접 및 합불 결정' },
  { date: '2026-03-09', title: 'OT', type: 'creait-important', description: '오리엔테이션 + 기초 세션' },
  { date: '2026-03-14', endDate: '2026-03-15', title: 'MT', type: 'creait-important', description: '1박 2일 팀 빌딩' },
  { date: '2026-03-23', endDate: '2026-04-09', title: '산학협력 프로젝트', type: 'creait', description: '스타트업 Agent Pipeline 개발' },

  // 공휴일
  { date: '2026-03-01', title: '3.1절', type: 'holiday' },
  { date: '2026-03-02', title: '대체공휴일', type: 'holiday' },

  // 학사일정
  { date: '2026-03-03', title: '개강', type: 'academic', description: '2026-1학기 시작' },
  { date: '2026-03-05', endDate: '2026-03-09', title: '수강신청 확인/변경', type: 'academic' },
  { date: '2026-03-12', endDate: '2026-03-16', title: '추가등록', type: 'academic' },

  // ========== 4월 ==========
  // CREAI+IT 일정
  { date: '2026-04-13', title: '산학협력 발표', type: 'creait-important', description: '프로젝트 발표 및 회고' },

  { date: '2026-04-08', title: '학기 1/3선', type: 'deadline' },
  { date: '2026-04-14', endDate: '2026-04-16', title: '수강철회 기간', type: 'deadline' },
  { date: '2026-04-21', endDate: '2026-04-27', title: '중간시험', type: 'exam', description: '중간고사 기간' },

  // ========== 5월 ==========
  // CREAI+IT 연사 초청
  { date: '2026-05-04', title: '연사 초청 #1', type: 'creait-important', description: 'AI 전문가 (기술 기초)' },
  { date: '2026-05-18', title: '연사 초청 #2', type: 'creait-important', description: '스타트업 창업자 (기술→사업화)' },

  // 공휴일
  { date: '2026-05-05', title: '어린이날', type: 'holiday' },
  { date: '2026-05-23', title: '부처님오신날', type: 'holiday' },
  { date: '2026-05-24', title: '부처님오신날 (일)', type: 'holiday' },
  { date: '2026-05-25', title: '대체공휴일', type: 'holiday' },

  // 학사일정
  { date: '2026-05-15', title: '학기 2/3선', type: 'deadline' },

  // ========== 6월 ==========
  // CREAI+IT 연사 초청
  { date: '2026-06-01', title: '연사 초청 #3', type: 'creait-important', description: 'VC (투자 관점)' },

  // 공휴일
  { date: '2026-06-03', title: '지방선거', type: 'holiday', description: '임시공휴일' },
  { date: '2026-06-06', title: '현충일', type: 'holiday', description: '토요일, 대체공휴일 없음' },

  // 학사일정
  { date: '2026-06-16', endDate: '2026-06-22', title: '기말시험', type: 'exam', description: '기말고사 기간' },
  { date: '2026-06-23', title: '여름방학 시작', type: 'vacation' },
  { date: '2026-06-29', title: '성적제출 마감', type: 'deadline' },

  // ========== 7월 ==========
  // CREAI+IT Final Sprint
  { date: '2026-07-06', endDate: '2026-08-01', title: 'Final Sprint', type: 'creait', description: '최종 프로젝트 스프린트 기간' },

  // CREAI+IT 연사 초청 (Final Sprint)
  { date: '2026-07-09', title: '연사 초청 #4', type: 'creait-important', description: 'AI 전문가 (심화 기술)' },
  { date: '2026-07-20', title: '연사 초청 #5', type: 'creait-important', description: '스타트업 창업자 (실전 인사이트)' },
  { date: '2026-07-27', title: '연사 초청 #6', type: 'creait-important', description: 'VC (피칭 관점)' },

  { date: '2026-07-15', title: '초복', type: 'holiday' },
  { date: '2026-07-25', title: '중복', type: 'holiday' },

  // ========== 8월 ==========
  // CREAI+IT 데모데이
  { date: '2026-08-01', title: '5기 데모데이', type: 'creait-important', description: '최종 발표 및 시연' },

  { date: '2026-08-03', title: '2학기 휴학 접수 시작', type: 'academic' },
  { date: '2026-08-10', endDate: '2026-08-14', title: '2학기 수강신청', type: 'academic' },
  { date: '2026-08-14', title: '말복', type: 'holiday' },
  { date: '2026-08-15', title: '광복절', type: 'holiday' },
  { date: '2026-08-17', title: '대체공휴일', type: 'holiday' },
  { date: '2026-08-21', endDate: '2026-08-27', title: '2학기 등록', type: 'academic' },
  { date: '2026-08-28', title: '학위수여식', type: 'academic' },
];

export const MONTHS_2026 = [
  { month: 2, year: 2026, name: '2월', nameEn: 'February' },
  { month: 3, year: 2026, name: '3월', nameEn: 'March' },
  { month: 4, year: 2026, name: '4월', nameEn: 'April' },
  { month: 5, year: 2026, name: '5월', nameEn: 'May' },
  { month: 6, year: 2026, name: '6월', nameEn: 'June' },
  { month: 7, year: 2026, name: '7월', nameEn: 'July' },
  { month: 8, year: 2026, name: '8월', nameEn: 'August' },
];

export function getEventsForDate(date: string): CalendarEvent[] {
  return events2026.filter(event => {
    if (event.endDate) {
      return date >= event.date && date <= event.endDate;
    }
    return event.date === date;
  });
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}
