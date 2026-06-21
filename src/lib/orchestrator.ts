import {
  AGENT_NAMES,
  type AgentName,
  type AgentSettingsMap,
  type MeetingLogItem,
} from "@/lib/agents";
import { MockProvider } from "@/lib/providers/mock";
import type { OrchestratorEvent } from "@/lib/providers/types";

const mockProvider = new MockProvider();
const DISCUSSION_ORDER: AgentName[] = ["마케터 AI", "디자이너 AI", "개발자 AI", "분석가 AI"];

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function buildFinalReport(order: string, settings: AgentSettingsMap) {
  const assignments = AGENT_NAMES.map(
    (name) => `- **${name}** · ${settings[name].provider}/${settings[name].model} · ${settings[name].instruction}`,
  ).join("\n");

  return `# Mock 최종 실행 보고서

## 검토한 오더
${order}

## 실행 단계
1. 핵심 목표와 검증할 가설을 한 문장으로 확정합니다.
2. 가장 중요한 사용자 흐름만 포함한 최소 실행안을 제작합니다.
3. 초기 사용자 반응과 핵심 지표를 수집합니다.
4. 결과에 따라 유지, 개선 또는 중단을 결정합니다.

## 직원별 설정
${assignments}

## 핵심 지표
- 핵심 행동 완료율
- 첫 사용 후 재방문율
- 사용자 피드백의 반복 문제 수
- 계획 대비 개발 및 운영 비용

## 주요 리스크
- 현재 시장 수요와 일정은 검증되지 않은 가정입니다.
- 기능 범위가 빠르게 증가하면 MVP 일정이 지연될 수 있습니다.
- 실제 제공자 API 연결 전에는 답변 품질과 비용을 판단할 수 없습니다.

## 다음 액션
오더의 성공 기준과 목표 일정을 확정하고 첫 번째 검증 작업을 담당자에게 배정합니다.

> 이 보고서는 API 키 없이 실행된 Mock 오케스트레이터 결과입니다.`;
}

export async function* runMockMeeting(
  order: string,
  settings: AgentSettingsMap,
): AsyncGenerator<OrchestratorEvent> {
  const transcript: MeetingLogItem[] = [];
  yield { type: "started", mode: "mock" };

  yield { type: "speaking", agent: "PM AI" };
  await wait(550);
  const opening: MeetingLogItem = {
    agent: "PM AI",
    message: await mockProvider.generate({
      agent: "PM AI",
      order,
      setting: settings["PM AI"],
      transcript,
      phase: "opening",
    }),
    status: "회의중",
  };
  transcript.push(opening);
  yield { type: "log", log: opening };

  for (const agent of DISCUSSION_ORDER) {
    yield { type: "speaking", agent };
    await wait(650);
    const log: MeetingLogItem = {
      agent,
      message: await mockProvider.generate({
        agent,
        order,
        setting: settings[agent],
        transcript,
        phase: "discussion",
      }),
      status: "회의중",
    };
    transcript.push(log);
    yield { type: "log", log };
  }

  yield { type: "speaking", agent: "PM AI" };
  await wait(650);
  const closing: MeetingLogItem = {
    agent: "PM AI",
    message: await mockProvider.generate({
      agent: "PM AI",
      order,
      setting: settings["PM AI"],
      transcript,
      phase: "closing",
    }),
    status: "검토완료",
  };
  transcript.push(closing);
  yield { type: "log", log: closing };

  await wait(350);
  yield { type: "final", finalReport: buildFinalReport(order, settings) };
  yield { type: "done" };
}
