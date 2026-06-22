import OpenAI from "openai";
import { getOutputTokenLimit } from "@/lib/meeting-limits";
import { buildAgentPrompt } from "@/lib/providers/prompt";
import { AIProviderError, type AgentTask, type AIProvider } from "@/lib/providers/types";

export class OpenAIProvider implements AIProvider {
  async generate(task: AgentTask) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new AIProviderError(
        `${task.agent}에 OpenAI가 선택되어 있지만 OPENAI_API_KEY가 설정되지 않았습니다.`,
      );
    }

    const prompt = buildAgentPrompt(task);

    try {
      const response = await new OpenAI({ apiKey }).responses.create({
        model: task.setting.model,
        instructions: prompt.instructions,
        input: prompt.input,
        max_output_tokens: getOutputTokenLimit(task.phase),
      });
      const output = response.output_text.trim();
      if (!output) throw new Error("OpenAI returned an empty response.");
      return output;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      if (error instanceof OpenAI.APIError && error.status === 429) {
        throw new AIProviderError("OpenAI 요청 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.", {
          cause: error,
        });
      }
      throw new AIProviderError(`${task.agent}의 OpenAI 응답 생성에 실패했습니다.`, {
        cause: error,
      });
    }
  }
}
