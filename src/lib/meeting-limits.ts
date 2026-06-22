export const MAX_ORDER_CHARS = 4_000;
export const MAX_AGENT_INSTRUCTION_CHARS = 500;
export const MAX_PROVIDER_CALLS = 7;
export const MAX_SPEECH_OUTPUT_TOKENS = 500;
export const MAX_REPORT_OUTPUT_TOKENS = 1_200;

export function getOutputTokenLimit(phase: "opening" | "discussion" | "closing" | "report") {
  return phase === "report" ? MAX_REPORT_OUTPUT_TOKENS : MAX_SPEECH_OUTPUT_TOKENS;
}
