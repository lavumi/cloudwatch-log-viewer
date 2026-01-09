// 날짜 필터 프리셋
export const DATE_PRESETS = [
  { value: '15m', label: 'Last 15 minutes', minutes: 15 },
  { value: '30m', label: 'Last 30 minutes', minutes: 30 },
  { value: '1h', label: 'Last 1 hour', minutes: 60 },
  { value: '3h', label: 'Last 3 hours', minutes: 180 },
  { value: '6h', label: 'Last 6 hours', minutes: 360 },
  { value: '12h', label: 'Last 12 hours', minutes: 720 },
  { value: '1d', label: 'Last 1 day', minutes: 1440 },
  { value: '3d', label: 'Last 3 days', minutes: 4320 },
  { value: '7d', label: 'Last 7 days', minutes: 10080 },
  { value: 'custom', label: 'Custom range', minutes: null },
];

// TRID 파싱 함수
// 형식: YYYYMMDDHHMMSSMMMUUUUUU (예: 20251125091033515637)
// 또는 YYYYMMDDHHMMSSMMMUUUUUU:SUFFIX (예: 20251127055818922907:Nw6SpN)
// TRID는 UTC로 간주
// 앞 5분 ~ 이후 1시간 범위로 설정
export function parseTrid(trid) {
  if (!trid || typeof trid !== 'string') {
    return null;
  }

  // 콜론(:)이 있으면 앞부분만 추출
  const tridPart = trid.includes(':') ? trid.split(':')[0] : trid;

  // 숫자만 추출
  const cleaned = tridPart.replace(/\D/g, '');

  // TRID는 최소 14자리 (YYYYMMDDHHmmss) 필요
  if (cleaned.length < 14) {
    return null;
  }

  try {
    const year = parseInt(cleaned.substring(0, 4));
    const month = parseInt(cleaned.substring(4, 6));
    const day = parseInt(cleaned.substring(6, 8));
    const hour = parseInt(cleaned.substring(8, 10));
    const minute = parseInt(cleaned.substring(10, 12));
    const second = parseInt(cleaned.substring(12, 14));

    // 유효한 날짜인지 확인
    if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    if (hour > 23 || minute > 59 || second > 59) {
      return null;
    }

    // TRID를 UTC로 해석
    // ISO 문자열로 만들고 UTC 오프셋 적용
    const utcDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}Z`;
    const tridDate = new Date(utcDateString);

    // 앞 5분
    const startDate = new Date(tridDate.getTime() - 5 * 60 * 1000);
    // 이후 1시간
    const endDate = new Date(tridDate.getTime() + 60 * 60 * 1000);

    console.log('TRID parsed:', {
      tridString: trid,
      utcDateString,
      tridDate: tridDate.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return {
      tridDate,
      startDate,
      endDate,
      isValid: true,
    };
  } catch (e) {
    console.error('Failed to parse trid:', e);
    return null;
  }
}

// datetime-local 포맷으로 변환
export function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 필터 상태 관리
class Filters {
  searchQuery = $state('');
  tridQuery = $state(''); // TRID 검색용 별도 필드
  datePreset = $state('1h'); // 기본값: 최근 1시간
  startDate = $state('');
  endDate = $state('');
  caseSensitive = $state(false);
  useRegex = $state(false);

  constructor() {
    // 로컬 스토리지에서 필터 불러오기
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cwlogviewer-filters');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.searchQuery = parsed.searchQuery || '';
          this.tridQuery = parsed.tridQuery || '';
          this.datePreset = parsed.datePreset || '1h';
          this.startDate = parsed.startDate || '';
          this.endDate = parsed.endDate || '';
          this.caseSensitive = parsed.caseSensitive || false;
          this.useRegex = parsed.useRegex || false;
        } catch (e) {
          console.error('Failed to parse filters:', e);
        }
      }
    }
  }

  setSearchQuery(value) {
    this.searchQuery = value;
    this.save();
  }

  setDatePreset(value) {
    this.datePreset = value;

    // 프리셋이 custom이 아니면 startDate, endDate 초기화
    if (value !== 'custom') {
      this.startDate = '';
      this.endDate = '';
    }

    this.save();
  }

  setStartDate(value) {
    this.startDate = value;
    // custom으로 자동 변경
    if (this.datePreset !== 'custom') {
      this.datePreset = 'custom';
    }
    this.save();
  }

  setEndDate(value) {
    this.endDate = value;
    // custom으로 자동 변경
    if (this.datePreset !== 'custom') {
      this.datePreset = 'custom';
    }
    this.save();
  }

  toggleCaseSensitive() {
    this.caseSensitive = !this.caseSensitive;
    this.save();
  }

  toggleUseRegex() {
    this.useRegex = !this.useRegex;
    this.save();
  }

  // TRID를 파싱하여 날짜 범위 설정
  setFromTrid(tridValue) {
    const parsed = parseTrid(tridValue);
    if (!parsed) {
      return false;
    }

    // TRID 검색어에 trid 설정 (Detail 검색과 분리)
    this.tridQuery = tridValue.trim();

    // 날짜 범위 설정 (앞 5분 ~ 이후 1시간)
    this.datePreset = 'custom';
    this.startDate = formatDateTimeLocal(parsed.startDate);
    this.endDate = formatDateTimeLocal(parsed.endDate);

    this.save();
    return true;
  }

  save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cwlogviewer-filters', JSON.stringify({
        searchQuery: this.searchQuery,
        tridQuery: this.tridQuery,
        datePreset: this.datePreset,
        startDate: this.startDate,
        endDate: this.endDate,
        caseSensitive: this.caseSensitive,
        useRegex: this.useRegex,
      }));
    }
  }

  // 현재 날짜 범위를 계산 (밀리초)
  get dateRange() {
    if (this.datePreset === 'custom') {
      if (!this.startDate || !this.endDate) {
        return null;
      }
      return {
        start: new Date(this.startDate).getTime(),
        end: new Date(this.endDate).getTime(),
      };
    }

    const preset = DATE_PRESETS.find(p => p.value === this.datePreset);
    if (!preset || preset.minutes === null) {
      return null;
    }

    const now = Date.now();
    const start = now - (preset.minutes * 60 * 1000);

    return {
      start,
      end: now,
    };
  }

  // AWS CloudWatch 쿼리용 필터 문자열 생성
  // TRID 검색과 Detail 검색 중 하나를 사용
  get cloudWatchPattern() {
    // TRID 검색이 있으면 우선 사용
    if (this.tridQuery) {
      // TRID는 일반 텍스트로 검색 (이스케이프 처리)
      return this.tridQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Detail 검색 쿼리 사용
    if (!this.searchQuery) {
      return null;
    }

    if (this.useRegex) {
      return this.searchQuery;
    }

    // 일반 텍스트 검색 - 이스케이프 처리
    const escaped = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return escaped;
  }

  reset() {
    this.searchQuery = '';
    this.tridQuery = '';
    this.datePreset = '1h';
    this.startDate = '';
    this.endDate = '';
    this.caseSensitive = false;
    this.useRegex = false;
    this.save();
  }

  get isActive() {
    return this.searchQuery !== '' ||
           this.tridQuery !== '' ||
           this.datePreset !== '1h' ||
           this.startDate !== '' ||
           this.endDate !== '';
  }
}

export const filters = new Filters();

