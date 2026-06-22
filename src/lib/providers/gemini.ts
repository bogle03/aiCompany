import { buildAgentPrompt } from "@/lib/providers/prompt";
import { getOutputTokenLimit } from "@/lib/meeting-limits";
import { AIProviderError, type AgentTask, type AIProvider } from "@/lib/providers/types";

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
}

export class GeminiProvider implements AIProvider {
  async generate(task: AgentTask) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError(
        `${task.agent}에 Gemini가 선택되어 있지만 GEMINI_API_KEY가 설정되지 않았습니다.`,
      );
    }

    const prompt = buildAgentPrompt(task);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(task.setting.model)}:generateContent`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: prompt.instructions }] },
          contents: [{ role: "user", parts: [{ text: prompt.input }] }],
          generationConfig: {
            maxOutputTokens: getOutputTokenLimit(task.phase),
          },
        }),
      });
      const data = (await response.json()) as GeminiResponse;
      if (!response.ok) {
        if (response.status === 429) {
          throw new AIProviderError("Gemini 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.");
        }
        throw new Error(data.error?.message ?? `Gemini HTTP ${response.status}`);
      }

      const output = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim();
      if (!output) throw new Error("Gemini returned an empty response.");
      return output;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(`${task.agent}의 Gemini 응답 생성에 실패했습니다.`, {
        cause: error,
      });
    }
  }
}
