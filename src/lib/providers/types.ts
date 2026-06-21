import type { AgentName, AgentSetting, MeetingLogItem } from "@/lib/agents";

export interface AgentTask {
  agent: AgentName;
  order: string;
  setting: AgentSetting;
  transcript: MeetingLogItem[];
  phase: "opening" | "discussion" | "closing";
}

export interface AIProvider {
  generate(task: AgentTask): Promise<string>;
}

export type OrchestratorEvent =
  | { type: "started"; mode: "mock" }
  | { type: "speaking"; agent: AgentName }
  | { type: "log"; log: MeetingLogItem }
  | { type: "final"; finalReport: string }
  | { type: "done" };
