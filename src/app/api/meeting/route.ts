import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  AGENT_NAMES,
  MEETING_SYSTEM_PROMPT,
  type AgentResponseStyle,
  type AgentSettingsMap,
  type MeetingResponse,
} from "@/lib/agents";

export const runtime = "nodejs";

const responseSchema = {
  type: "object",
  properties: {
    logs: {
      type: "array",
      minItems: 5,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          agent: { type: "string", enum: AGENT_NAMES },
          message: { type: "string" },
          status: { type: "string", enum: ["회의중", "검토완료"] },
        },
        required: ["agent", "message", "status"],
        additionalProperties: false,
      },
    },
    finalReport: { type: "string" },
  },
  required: ["logs", "finalReport"],
  additionalProperties: false,
} as const;

export async function POST(request: Request) {
  let body: { order?: unknown; agentSettings?: unknown };

  try {
    body = (await request.json()) as { order?: unknown; agentSettings?: unknown };
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  try {
    const order = typeof body.order === "string" ? body.order.trim() : "";
    const allowedStyles: AgentResponseStyle[] = ["균형형", "창의형", "실행형", "비판형"];
    const rawSettings = body.agentSettings as Partial<AgentSettingsMap> | undefined;
    const settingsPrompt = AGENT_NAMES.map((name) => {
      const setting = rawSettings?.[name];
      const instruction =
        typeof setting?.instruction === "string"
          ? setting.instruction.trim().slice(0, 500)
          : "기본 역할에 충실하게 검토합니다.";
      const responseStyle = allowedStyles.includes(setting?.responseStyle as AgentResponseStyle)
        ? setting?.responseStyle
        : "균형형";
      return `- ${name} / 응답 스타일: ${responseStyle} / 추가 업무 지시: ${instruction}`;
    }).join("\n");

    if (!order) {
      return NextResponse.json(
        { error: "오더 내용을 입력해 주세요." },
        { status: 400 },
      );
    }

    if (order.length > 4000) {
      return NextResponse.json(
        { error: "오더는 4,000자 이내로 입력해 주세요." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured.");
      return NextResponse.json(
        { error: "서버에 OpenAI API 키가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      instructions: MEETING_SYSTEM_PROMPT,
      input: `사장님의 오더:\n${order}\n\n직원별 설정:\n${settingsPrompt}`,
      text: {
        format: {
          type: "json_schema",
          name: "ai_company_meeting",
          strict: true,
          schema: responseSchema,
        },
      },
    });

    if (!response.output_text) {
      throw new Error("OpenAI returned an empty response.");
    }

    let result: MeetingResponse;
    try {
      result = JSON.parse(response.output_text) as MeetingResponse;
    } catch {
      throw new Error("OpenAI returned malformed JSON.");
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", error.status, error.message);
      const status = error.status === 429 ? 429 : 502;
      const message =
        error.status === 429
          ? "요청이 많습니다. 잠시 후 다시 시도해 주세요."
          : "AI 회의 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.";
      return NextResponse.json({ error: message }, { status });
    }

    console.error("Meeting API error:", error);
    return NextResponse.json(
      { error: "회의를 처리하는 중 예상치 못한 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
