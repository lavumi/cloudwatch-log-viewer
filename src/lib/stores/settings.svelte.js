// AWS 리전 목록
export const AWS_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-east-2', label: 'US East (Ohio)' },
  { value: 'us-west-1', label: 'US West (N. California)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
  { value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)' },
  { value: 'ap-northeast-3', label: 'Asia Pacific (Osaka)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
  { value: 'ca-central-1', label: 'Canada (Central)' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
  { value: 'eu-west-2', label: 'Europe (London)' },
  { value: 'eu-west-3', label: 'Europe (Paris)' },
  { value: 'eu-north-1', label: 'Europe (Stockholm)' },
  { value: 'sa-east-1', label: 'South America (São Paulo)' },
];

// 설정 상태 관리
class Settings {
  region = $state('ap-northeast-2'); // 기본값: Seoul
  logGroup = $state('');

  constructor() {
    // 로컬 스토리지에서 설정 불러오기
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cwlogviewer-settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.region = parsed.region || 'ap-northeast-2';
          this.logGroup = parsed.logGroup || '';
        } catch (e) {
          console.error('Failed to parse settings:', e);
        }
      }
    }
  }

  setRegion(value) {
    this.region = value;
    this.save();
  }

  setLogGroup(value) {
    this.logGroup = value;
    this.save();
  }

  save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cwlogviewer-settings', JSON.stringify({
        region: this.region,
        logGroup: this.logGroup,
      }));
    }
  }

  get isConfigured() {
    return this.region && this.logGroup;
  }
}

export const settings = new Settings();
