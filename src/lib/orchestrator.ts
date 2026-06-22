import type {
  AgentName,
  AgentSettingsMap,
  MeetingLogItem,
} from "@/lib/agents";
import { MAX_PROVIDER_CALLS } from "@/lib/meeting-limits";
import { GeminiProvider } from "@/lib/providers/gemini";
import { MockProvider } from "@/lib/providers/mock";
import { OpenAIProvider } from "@/lib/providers/openai";
import { AIProviderError, type AIProvider, type OrchestratorEvent } from "@/lib/providers/types";

const providers = {
  openai: new OpenAIProvider(),
  gemini: new GeminiProvider(),
};
const mockProvider = new MockProvider();
const DISCUSSION_ORDER: AgentName[] = ["마케터 AI", "디자이너 AI", "개발자 AI", "분석가 AI"];

function getProvider(settings: AgentSettingsMap, agent: AgentName): AIProvider {
  if (process.env.AI_MEETING_MODE === "mock") return mockProvider;
  return providers[settings[agent].provider];
}

async function generateLog(
  agent: AgentName,
  phase: "opening" | "discussion" | "closing",
  generate: (agent: AgentName, phase: "opening" | "discussion" | "closing" | "report") => Promise<string>,
): Promise<MeetingLogItem> {
  const message = await generate(agent, phase);

  return {
    agent,
    message,
    status: phase === "closing" ? "검토완료" : "회의중",
  };
}

export async function* runMeeting(
  order: string,
  settings: AgentSettingsMap,
): AsyncGenerator<OrchestratorEvent> {
  const transcript: MeetingLogItem[] = [];
  let providerCalls = 0;
  const generate = async (
    agent: AgentName,
    phase: "opening" | "discussion" | "closing" | "report",
  ) => {
    if (providerCalls >= MAX_PROVIDER_CALLS) {
      throw new AIProviderError(
        `비용 보호를 위해 회의당 AI 호출은 최대 ${MAX_PROVIDER_CALLS}회로 제한됩니다.`,
      );
    }
    providerCalls += 1;
    return getProvider(settings, agent).generate({
      agent,
      order,
      setting: settings[agent],
      transcript,
      phase,
    });
  };
  const mode = process.env.AI_MEETING_MODE === "mock" ? "mock" : "live";
  yield { type: "started", mode };

  yield { type: "speaking", agent: "PM AI" };
  const opening = await generateLog("PM AI", "opening", generate);
  transcript.push(opening);
  yield { type: "log", log: opening };

  for (const agent of DISCUSSION_ORDER) {
    yield { type: "speaking", agent };
    const log = await generateLog(agent, "discussion", generate);
    transcript.push(log);
    yield { type: "log", log };
  }

  yield { type: "speaking", agent: "PM AI" };
  const closing = await generateLog("PM AI", "closing", generate);
  transcript.push(closing);
  yield { type: "log", log: closing };

  const finalReport = await generate("PM AI", "report");
  yield { type: "final", finalReport };
  yield { type: "done" };
}
