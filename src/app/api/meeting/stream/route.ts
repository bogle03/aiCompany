import { NextResponse } from "next/server";
import {
  AGENT_NAMES,
  DEFAULT_AGENT_SETTINGS,
  PROVIDER_MODELS,
  type AgentProvider,
  type AgentResponseStyle,
  type AgentSettingsMap,
} from "@/lib/agents";
import { MAX_AGENT_INSTRUCTION_CHARS, MAX_ORDER_CHARS } from "@/lib/meeting-limits";
import { runMeeting } from "@/lib/orchestrator";
import { AIProviderError } from "@/lib/providers/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESPONSE_STYLES: AgentResponseStyle[] = ["균형형", "창의형", "실행형", "비판형"];

function normalizeSettings(value: unknown): AgentSettingsMap {
  const raw = value && typeof value === "object" ? (value as Partial<AgentSettingsMap>) : {};

  return Object.fromEntries(
    AGENT_NAMES.map((name) => {
      const fallback = DEFAULT_AGENT_SETTINGS[name];
      const candidate = raw[name];
      const provider: AgentProvider = candidate?.provider === "gemini" ? "gemini" : "openai";
      const allowedModels = PROVIDER_MODELS[provider].map((model) => model.id);

      return [
        name,
        {
          instruction:
            typeof candidate?.instruction === "string"
              ? candidate.instruction.trim().slice(0, MAX_AGENT_INSTRUCTION_CHARS)
              : fallback.instruction,
          responseStyle: RESPONSE_STYLES.includes(candidate?.responseStyle as AgentResponseStyle)
            ? candidate?.responseStyle
            : fallback.responseStyle,
          provider,
          model: allowedModels.includes(candidate?.model ?? "")
            ? candidate?.model
            : PROVIDER_MODELS[provider][0].id,
        },
      ];
    }),
  ) as AgentSettingsMap;
}

export async function POST(request: Request) {
  let body: { order?: unknown; agentSettings?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const order = typeof body.order === "string" ? body.order.trim() : "";
  if (!order) {
    return NextResponse.json({ error: "오더 내용을 입력해 주세요." }, { status: 400 });
  }
  if (order.length > MAX_ORDER_CHARS) {
    return NextResponse.json(
      { error: `오더는 ${MAX_ORDER_CHARS.toLocaleString()}자 이내로 입력해 주세요.` },
      { status: 400 },
    );
  }

  const settings = normalizeSettings(body.agentSettings);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runMeeting(order, settings)) {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        }
      } catch (error) {
        console.error("Meeting stream error:", error);
        const message =
          error instanceof AIProviderError
            ? error.publicMessage
            : "AI 회의 중 오류가 발생했습니다.";
        controller.enqueue(
          encoder.encode(`${JSON.stringify({ type: "error", message })}\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
