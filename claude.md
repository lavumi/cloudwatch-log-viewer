# CloudWatch Log Viewer

AWS CloudWatch Logs를 쉽게 조회하고 분석할 수 있는 데스크톱 애플리케이션입니다.

## 프로젝트 개요

- **목적**: AWS CloudWatch Logs를 직관적인 UI로 조회 및 필터링
- **기술 스택**:
  - Frontend: Svelte 5 + SvelteKit
  - Backend: Tauri 2 (Rust)
  - Package Manager: pnpm
  - Build Tool: Vite

## 프로젝트 구조

```
cwlogviewer/
├── src/                    # Svelte 프론트엔드 소스
│   ├── lib/               # 공유 컴포넌트 및 유틸리티
│   └── routes/            # SvelteKit 라우트
├── src-tauri/             # Tauri 백엔드 (Rust)
│   ├── src/              # Rust 소스 코드
│   ├── Cargo.toml        # Rust 의존성
│   └── tauri.conf.json   # Tauri 설정
├── static/                # 정적 파일
├── package.json           # Node.js 의존성
└── vite.config.ts        # Vite 설정
```

## 주요 기능 (계획)

### 1. AWS 인증
- [ ] AWS Credentials 설정 (Access Key, Secret Key)
- [ ] AWS Profile 지원
- [ ] 리전 선택

### 2. 로그 그룹 탐색
- [ ] 로그 그룹 목록 조회
- [ ] 로그 스트림 목록 조회
- [ ] 검색 및 필터링

### 3. 로그 조회
- [ ] 실시간 로그 스트리밍
- [ ] 시간 범위 선택
- [ ] 로그 검색 (CloudWatch Insights 쿼리)
- [ ] 로그 레벨 필터링

### 4. UI/UX
- [ ] 다크/라이트 테마
- [ ] 로그 하이라이팅
- [ ] 로그 내보내기 (JSON, CSV, TXT)
- [ ] 즐겨찾기 로그 그룹

## 개발 명령어

```bash
# 개발 서버 실행
pnpm tauri dev

# 프로덕션 빌드
pnpm tauri build

# 프론트엔드만 개발
pnpm dev

# 타입 체크
pnpm check
```

## 필요한 AWS 권한

애플리케이션이 작동하려면 다음 AWS IAM 권한이 필요합니다:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams",
        "logs:GetLogEvents",
        "logs:FilterLogEvents",
        "logs:StartQuery",
        "logs:GetQueryResults"
      ],
      "Resource": "*"
    }
  ]
}
```

## 기술적 고려사항

### Tauri Commands
- Rust 백엔드에서 AWS SDK를 사용하여 CloudWatch API 호출
- 프론트엔드에서 `invoke()` 함수로 백엔드 명령 호출

### 상태 관리
- Svelte 5의 Runes 시스템 활용
- 로컬 스토리지에 설정 저장

### 보안
- AWS Credentials를 안전하게 저장 (OS 키체인 활용)
- 민감한 정보는 Rust 백엔드에서만 처리

## 다음 단계

1. AWS SDK 의존성 추가 (Rust)
2. 기본 UI 레이아웃 구성
3. AWS 인증 화면 구현
4. 로그 그룹 목록 조회 기능 구현
5. 로그 뷰어 화면 구현

## 참고 자료

- [Tauri Documentation](https://tauri.app/v2/docs/)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [AWS SDK for Rust](https://docs.aws.amazon.com/sdk-for-rust/latest/dg/welcome.html)
- [CloudWatch Logs API](https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/Welcome.html)
