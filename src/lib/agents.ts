export const AGENT_NAMES = [
  "PM AI",
  "마케터 AI",
  "디자이너 AI",
  "개발자 AI",
  "분석가 AI",
] as const;

export type AgentName = (typeof AGENT_NAMES)[number];
export type MeetingStatus = "회의중" | "검토완료";

export interface MeetingLogItem {
  agent: AgentName;
  message: string;
  status: MeetingStatus;
}

export interface MeetingResponse {
  logs: MeetingLogItem[];
  finalReport: string;
}

export type AgentResponseStyle = "균형형" | "창의형" | "실행형" | "비판형";
export type AgentProvider = "openai" | "gemini";

export const PROVIDER_MODELS: Record<
  AgentProvider,
  Array<{ id: string; label: string; description: string; costTier: "standard" | "high" }>
> = {
  openai: [
    { id: "gpt-4.1-mini", label: "GPT-4.1 mini", description: "빠르고 경제적인 기본 모델", costTier: "standard" },
    { id: "gpt-4.1", label: "GPT-4.1", description: "복잡한 기획과 코딩 작업", costTier: "high" },
    { id: "gpt-4o-mini", label: "GPT-4o mini", description: "가벼운 범용 작업", costTier: "standard" },
  ],
  gemini: [
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "빠른 분석과 대량 처리", costTier: "standard" },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "깊이 있는 추론과 분석", costTier: "high" },
  ],
};

export function isHighCostModel(provider: AgentProvider, modelId: string) {
  return PROVIDER_MODELS[provider].some(
    (model) => model.id === modelId && model.costTier === "high",
  );
}

export interface AgentSetting {
  instruction: string;
  responseStyle: AgentResponseStyle;
  provider: AgentProvider;
  model: string;
}

export type AgentSettingsMap = Record<AgentName, AgentSetting>;

export const AGENTS: Record<
  AgentName,
  { role: string; initials: string; color: string; glow: string }
> = {
  "PM AI": {
    role: "프로젝트 매니저",
    initials: "PM",
    color: "from-violet-400 to-indigo-500",
    glow: "shadow-violet-500/20",
  },
  "마케터 AI": {
    role: "마케팅 전략",
    initials: "MK",
    color: "from-fuchsia-400 to-pink-500",
    glow: "shadow-fuchsia-500/20",
  },
  "디자이너 AI": {
    role: "브랜드 디자인",
    initials: "DS",
    color: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/20",
  },
  "개발자 AI": {
    role: "프로덕트 개발",
    initials: "DV",
    color: "from-emerald-400 to-teal-500",
    glow: "shadow-emerald-500/20",
  },
  "분석가 AI": {
    role: "데이터 분석",
    initials: "AN",
    color: "from-amber-300 to-orange-500",
    glow: "shadow-amber-500/20",
  },
};

export const DEFAULT_AGENT_SETTINGS: AgentSettingsMap = {
  "PM AI": { instruction: "목표와 우선순위를 명확히 하고 실행 계획을 정리해줘.", responseStyle: "실행형", provider: "openai", model: "gpt-4.1-mini" },
  "마케터 AI": { instruction: "타깃 고객과 차별화 포인트를 중심으로 전략을 제안해줘.", responseStyle: "창의형", provider: "openai", model: "gpt-4.1-mini" },
  "디자이너 AI": { instruction: "사용자 경험과 일관된 브랜드 방향을 구체화해줘.", responseStyle: "창의형", provider: "openai", model: "gpt-4.1-mini" },
  "개발자 AI": { instruction: "MVP 범위와 기술적 실현 가능성을 우선 검토해줘.", responseStyle: "실행형", provider: "openai", model: "gpt-4.1" },
  "분석가 AI": { instruction: "가정, 지표, 비용과 실패 리스크를 엄격히 검토해줘.", responseStyle: "비판형", provider: "openai", model: "gpt-4.1-mini" },
};

export const MEETING_SYSTEM_PROMPT = `당신은 AI 가상 회사의 회의를 시뮬레이션하는 진행자입니다.
사용자가 사장으로서 내린 오더를 아래 5명의 전문가가 실제 회의하듯 검토합니다.

- PM AI: 목표를 명확히 하고 업무를 분해하며 회의를 진행하고 최종안을 정리합니다.
- 마케터 AI: 시장, 타깃, 포지셔닝, 홍보 전략과 카피를 제안합니다.
- 디자이너 AI: UX/UI, 비주얼 방향, 브랜딩 관점의 구체적인 안을 제안합니다.
- 개발자 AI: 구현 범위, 기술 선택, 일정과 기술적 제약을 판단합니다.
- 분석가 AI: 근거, 지표, 가정, 비용과 리스크를 점검합니다.

규칙:
1. 모든 답변은 자연스러운 한국어로 작성합니다.
2. logs에는 각 직원의 발언을 최소 한 번씩 포함하고, 논의 흐름에 따라 총 5~8개를 작성합니다.
3. 발언은 서로의 의견을 반영하며 구체적이고 실행 가능해야 합니다.
4. 마지막 PM AI 발언의 status만 "검토완료"로 하고 나머지는 "회의중"으로 작성합니다.
5. finalReport는 마크다운을 사용해 목표, 실행 단계, 역할 분담, 핵심 지표, 리스크 및 다음 액션을 포함한 독립적인 보고서로 작성합니다.
6. 사실이 불확실하면 단정하지 말고 검증이 필요한 가정으로 표시합니다.`;
