import type { AgentName, AgentSetting, MeetingLogItem } from "@/lib/agents";

export interface AgentTask {
  agent: AgentName;
  order: string;
  setting: AgentSetting;
  transcript: MeetingLogItem[];
  phase: "opening" | "discussion" | "closing" | "report";
}

export interface AIProvider {
  generate(task: AgentTask): Promise<string>;
}

export class AIProviderError extends Error {
  constructor(
    public readonly publicMessage: string,
    options?: ErrorOptions,
  ) {
    super(publicMessage, options);
    this.name = "AIProviderError";
  }
}

export type OrchestratorEvent =
  | { type: "started"; mode: "live" | "mock" }
  | { type: "speaking"; agent: AgentName }
  | { type: "log"; log: MeetingLogItem }
  | { type: "final"; finalReport: string }
  | { type: "done" };
