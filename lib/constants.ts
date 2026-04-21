import type { Course } from '@/types';

/**
 * K-디지털 기초역량훈련 과정 마스터 데이터
 * 실제 서비스에서는 DB로 이관하여 CMS화 가능하지만,
 * 과정 정보는 자주 바뀌지 않으므로 상수로 관리 (배포 단위로 업데이트).
 */
export const COURSES: Course[] = [
  {
    id: 'copilot',
    title: 'Microsoft Copilot 프롬프트 엔지니어링',
    subtitle: 'AI로 LLM 마스터 클래스',
    regularPrice: 387200,
    userPrice: 38720,
    sessions: 20,
    difficulty: '초급',
    ncsCode: '20010702',
    ncsCategory: '인공지능서비스기획',
    duration: '30일',
    instructor: '권민수, 박채경, 김애경',
    description: 'MS Copilot의 AI 기능 활용법을 익혀 반복 작업을 줄이고 전략적인 업무 수행',
    icon: 'Sparkles',
    accent: '#3B82F6',
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    certification: {
      type: 'microsoft',
      label: 'MS 공식 수료증',
      title: 'Microsoft 공식 인증 수료증',
      subtitle: 'Microsoft 본사 직접 발급',
      description:
        '과정 수료 시 Microsoft가 직접 인증하는 공식 수료증과 AI 오픈뱃지가 발급되어, 글로벌 커리어 증빙 자료로 활용 가능합니다.',
      highlights: ['공식 수료증 발급', 'AI 오픈뱃지', '글로벌 인증'],
    },
    targets: [
      '데이터 분석 및 IT 관련 업무에 필요한 실무 스킬을 높이고 싶은 분',
      'AI 기반 문서 작성, 데이터 분석 등에 관심이 있고, AI 도구 활용을 배워보고 싶은 분',
      'MS Copilot 기능을 활용하여 문서작성 등 실무에 적용하고자 하는 분',
    ],
    objectives: [
      'Copilot의 AI기능 활용법을 익혀 반복 작업을 줄이고, 전략적인 업무가 가능하다',
      '문서작성, 데이터 분석, 프레젠테이션 제작법을 배워 업무적으로 자동화 할 수 있다',
      '일정 관리 도구를 활용하여 쉽게 일정 관리할 수 있다',
    ],
    benefits: [
      '마이크로소프트 오피스 프로그램 활용법 습득',
      'MS 공식 수료증 발급 및 AI오픈뱃지 제공',
      '수료 시 6개월간 복습 수강기간 제공',
      'AI에이전트 개발 가이드 자료 제공',
    ],
  },
  {
    id: 'kotlin',
    title: 'Kotlin 웹 마스터',
    subtitle: 'Java에서 함수형까지, 실무형 웹 마이그레이션 완전 정복',
    regularPrice: 423500,
    userPrice: 42350,
    sessions: 22,
    difficulty: '초급',
    ncsCode: '20010202',
    ncsCategory: '응용SW엔지니어링',
    duration: '30일',
    instructor: '양세열',
    description: '코틀린 기본 문법부터 함수형 프로그래밍까지, 실무형 마이그레이션 기법 습득',
    icon: 'Code',
    accent: '#8B5CF6',
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
    targets: [
      '코틀린을 활용한 프로그래밍에 입문하고자 하는 분',
      '자바 기반 백엔드 개발자 중 코틀린 전환을 고려하는 개발자',
      '앱/서버 개발 업무에 실무적으로 도움이 필요한 주니어·중니어 개발자',
    ],
    objectives: [
      '코틀린 기본 문법과 코틀린 언어의 특성에 대해 알아볼 수 있다',
      '마이그레이션 실전 기법을 습득할 수 있다',
      '함수형 프로그래밍 기본 개념과 코틀린에서의 구현 방법에 대해 알아볼 수 있다',
    ],
    benefits: [
      '코틀린 마이그레이션 실무 역량 확보를 위한 실습 수업 진행',
      '고용노동부 공식 인증 수료증 발급 가능',
      '수료 시 6개월간 복습 수강기간 제공',
    ],
  },
  {
    id: 'biohealth',
    title: '실전 바이오헬스 데이터 활용',
    subtitle: '데이터 튜토리얼부터 환자 정보 분석까지',
    regularPrice: 314600,
    userPrice: 31460,
    sessions: 18,
    difficulty: '초급',
    ncsCode: '20010703',
    ncsCategory: '인공지능모델링',
    duration: '30일',
    instructor: '정상근',
    description: '바이오헬스 데이터 이해부터 AI 활용 환자정보 분석까지, 취업 포트폴리오 완성',
    icon: 'HeartPulse',
    accent: '#10B981',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    targets: [
      '보건/의료/헬스/바이오 관련 재직중이며, 실무 역량 강화하고 싶은 분',
      '환자정보 등 바이오헬스 데이터 수집 및 분석 능력을 향상 시키고 싶은 분',
      '딥러닝 모델 구현 및 인공지능 도구 활용하고 싶은 분',
    ],
    objectives: [
      '바이오헬스 데이터 종류 및 특성을 파악하고 이해 능력을 함양할 수 있다',
      'AI 활용 학습으로 데이터 분석 실무 역량을 강화할 수 있다',
      '실전 프로젝트를 통한 전문가 수준의 취업 포트폴리오를 완성할 수 있다',
    ],
    benefits: [
      '실습 프로젝트를 통해 취업 포트폴리오 완성',
      '고용노동부 공식 인증 수료증 발급 가능',
      '수료 시 6개월간 복습 수강기간 제공',
      '산업 분야 관련 취업처 정보 제공',
    ],
  },
  {
    id: 'security',
    title: '사이버보안 위협과 보안 기술 활용',
    subtitle: '이론과 실습',
    regularPrice: 350900,
    userPrice: 35090,
    sessions: 20,
    difficulty: '초급',
    ncsCode: '20010206',
    ncsCategory: '보안엔지니어링',
    duration: '30일',
    instructor: '박재경',
    description: '실습중심으로 사이버 위협 대응 및 보안 자동화 도구 활용 역량 강화',
    icon: 'Shield',
    accent: '#EF4444',
    gradient: 'from-rose-500 via-red-600 to-orange-600',
    targets: [
      '기초 보안장비 활용 방법을 알고 사이버 보안 분야에 입문하고자 하는 분',
      '네트워크, 시스템, 개발 등 IT 직무 수행 중 보안 역량이 필요하신 분',
      '보안 교육 기획·강의 및 기술 연구 수행 시 실무 중심 보안이 필요한 교강사, 연구원',
    ],
    objectives: [
      '실습중심 수업으로 사이버 위협으로부터 대응 및 분석하여 역량을 강화할 수 있다',
      '현업에서 사용되는 보안 기술의 원리와 설정 방법을 습득할 수 있다',
      '실무 환경과 연계된 보안 자동화 도구를 활용할 수 있다',
    ],
    benefits: [
      '실제 업무에 적용 가능한 프로젝트를 통해 실무 경험',
      '온라인 실시간 LIVE 특강 제공',
      '고용노동부 공식 인증 수료증 발급 가능',
      '수료 시 6개월간 복습 수강기간 제공',
    ],
  },
  {
    id: 'robot',
    title: '지능형 로봇 개발을 위한 AI 팜봇 프로그래밍',
    subtitle: '기초과정',
    regularPrice: 435600,
    userPrice: 43560,
    sessions: 25,
    difficulty: '초급',
    ncsCode: '19030803',
    ncsCategory: '로봇소프트웨어개발',
    duration: '30일',
    instructor: '최원칠',
    description: '로봇의 감지/동작/인지 기능 설계 및 AI·빅데이터 기술 적용 실습',
    icon: 'Bot',
    accent: '#F59E0B',
    gradient: 'from-amber-500 via-orange-600 to-red-600',
    warning: '해당 과정은 실습 장비 개인 구비가 필요합니다',
    targets: [
      '이공계 전공자 등 로봇 개발 및 제어에 관심있는 분',
      '로봇에 인공지능과 빅데이터 기술을 적용하고자 하는 개발자',
      '로봇 교육 콘텐츠 개발자 또는 DIY 메이커 활동으로 실무 능력을 향상 시키고 싶은 분',
    ],
    objectives: [
      '로봇의 감지, 동작, 인지 기능을 설계하고 구현하는 능력을 습득할 수 있다',
      '로봇 시스템의 데이터를 효율적으로 관리하고, 대규모 데이터 처리와 분석을 수행할 수 있다',
      '로봇 시스템 개발 경험을 쌓고, 산업 현장에서 요구되는 기술적 역량을 강화할 수 있다',
    ],
    benefits: [
      '실제업무에 적용 가능한 프로젝트를 통해 실무 경험',
      '고용노동부 공식 인증 수료증 발급 가능',
      '수료 시 6개월간 복습 수강기간 제공',
    ],
  },
  {
    id: 'genai',
    title: '생성형 AI 작동 원리·구조 이해 기초',
    subtitle: 'AI 애플리케이션 개발자 진입 과정',
    regularPrice: 375100,
    userPrice: 37510,
    sessions: 20,
    difficulty: '초급',
    ncsCode: '20010703',
    ncsCategory: '인공지능모델링',
    duration: '30일',
    instructor: '구교정',
    description: '임베딩·벡터·Attention 등 생성형 AI 핵심 기술을 시각화로 쉽게 이해',
    icon: 'Brain',
    accent: '#0EA5E9',
    gradient: 'from-sky-500 via-cyan-600 to-blue-600',
    targets: [
      '생성형AI를 원리부터 알고싶은 직장인·대학생',
      '기획·데이터·개발 협업 등에서 기술적 이해가 필요한 실무자',
      '데이터/AI 관련 직무 전환을 준비하며 기초 수학·기술 요소를 정리하고 싶은 학습자',
    ],
    objectives: [
      '생성형 AI가 텍스트·이미지를 이해하는 구조를 설명',
      '임베딩·벡터·레이어·Attention 등 핵심 기술 요소를 직관적 예시와 시각화를 통한 이해',
      '원리 이해를 바탕으로 AI 활용 결과 해석',
    ],
    benefits: [
      '실시간 비대면 클리닉을 통한 현직 튜터의 1:1 즉각 피드백',
      '고용노동부 공식 인증 수료증 발급 가능',
      '수료 시 6개월간 복습 수강기간 제공',
    ],
  },
];

export const getCourseById = (id: string): Course | undefined =>
  COURSES.find((c) => c.id === id);

// =============================================================================
// 역할 설정
// =============================================================================
export const ROLES = {
  admin: {
    label: '어드민',
    shortLabel: 'ADMIN',
    description: '모든 기능 접근 가능',
  },
  operator: {
    label: '운영자',
    shortLabel: 'OPERATOR',
    description: '신청·수료 관리 전용',
  },
} as const;

export const STATUS_LABELS = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
} as const;
