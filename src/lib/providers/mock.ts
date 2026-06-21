import type { AgentTask, AIProvider } from "@/lib/providers/types";

function summarizeOrder(order: string) {
  return order.length > 54 ? `${order.slice(0, 54)}…` : order;
}

export class MockProvider implements AIProvider {
  async generate(task: AgentTask) {
    const subject = summarizeOrder(task.order);
    const focus = task.setting.instruction.trim() || "기본 역할에 따라 검토";

    if (task.phase === "opening") {
      return `오더를 확인했습니다: “${subject}” 목표, 대상, 일정, 산출물로 나눠 검토하겠습니다. 각 담당자는 자신의 관점에서 실행안과 위험 요소를 제시해 주세요.`;
    }

    if (task.phase === "closing") {
      return `모든 의견을 종합했습니다. 우선순위는 핵심 가설 검증, 최소 실행안 제작, 측정 지표 확인 순서로 정리하겠습니다. 담당자와 완료 기준을 명확히 한 뒤 실행에 착수하면 됩니다.`;
    }

    const previous = task.transcript.at(-1)?.agent;
    const context = previous ? `${previous}의 의견을 바탕으로 ` : "";
    const messages: Record<AgentTask["agent"], string> = {
      "PM AI": "업무 범위와 우선순위를 정리하겠습니다.",
      "마케터 AI": `${context}핵심 타깃의 문제와 차별화 메시지를 먼저 검증하겠습니다. 초기 채널은 한두 개에 집중하고, 반응률과 전환율로 다음 투자를 판단하는 전략이 적합합니다.`,
      "디자이너 AI": `${context}첫 화면에서 가치가 즉시 이해되도록 정보 구조를 단순화하겠습니다. 일관된 컬러·타이포 규칙과 핵심 사용자 흐름을 먼저 정의하고 상세 비주얼은 검증 이후 확장하겠습니다.`,
      "개발자 AI": `${context}MVP는 필수 사용자 흐름만 구현하고 외부 연동과 자동화는 단계적으로 추가하겠습니다. 기술 위험이 큰 항목은 짧은 프로토타입으로 먼저 검증하고 배포·로그·오류 처리까지 완료 기준에 포함하겠습니다.`,
      "분석가 AI": `${context}현재 결론에는 검증되지 않은 수요와 일정 가정이 포함되어 있습니다. 성공 지표의 기준값, 표본 수, 중단 조건을 미리 정하고 비용·보안·운영 리스크를 별도로 추적해야 합니다.`,
    };

    return `${messages[task.agent]} 설정된 업무 기준은 “${focus}”, 응답 성향은 ${task.setting.responseStyle}입니다.`;
  }
}
