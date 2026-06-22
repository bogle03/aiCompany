import { AGENTS } from "@/lib/agents";
import type { AgentTask } from "@/lib/providers/types";

const PHASE_INSTRUCTIONS: Record<AgentTask["phase"], string> = {
  opening: "회의를 시작하고 목표, 제약, 확인할 쟁점을 짧게 정리하세요.",
  discussion: "앞선 발언을 검토한 뒤 본인 역할에서 구체적인 실행안과 위험을 제시하세요.",
  closing: "논의를 종합해 우선순위, 담당 역할, 완료 기준을 짧게 확정하세요.",
  report: `전체 논의를 바탕으로 독립적인 최종 실행 보고서를 마크다운으로 작성하세요.
반드시 목표, 실행 단계, 역할 분담, 핵심 지표, 리스크, 다음 액션을 포함하세요.`,
};

export function buildAgentPrompt(task: AgentTask) {
  const transcript = task.transcript.length
    ? task.transcript.map((item) => `${item.agent}: ${item.message}`).join("\n")
    : "아직 발언이 없습니다.";

  return {
    instructions: `당신은 AI 가상 회사의 ${task.agent}이며 역할은 ${AGENTS[task.agent].role}입니다.
모든 답변은 자연스러운 한국어로 작성하고, 불확실한 사실은 검증할 가정으로 표시하세요.
응답 성향은 ${task.setting.responseStyle}입니다.
추가 업무 지침: ${task.setting.instruction || "기본 역할에 따라 검토"}
보고서 단계가 아니면 마크다운 제목 없이 실제 회의 발언처럼 간결하게 답하세요.`,
    input: `사장님의 오더:
${task.order}

현재까지 회의 내용:
${transcript}

이번 작업:
${PHASE_INSTRUCTIONS[task.phase]}`,
  };
}
