import type { AiProvider, AiProviderRequest, AiProviderResult } from "@/lib/ai/types";

/** Provider placeholder — remplacer par OpenAI, Anthropic, moteur brevets, etc. */
export const stubAiProvider: AiProvider = {
  name: "stub",
  async run(_request: AiProviderRequest): Promise<AiProviderResult> {
    return {
      results: [
        {
          result_type: "placeholder",
          title: "Résultat exemple",
          summary: "Branchez un provider IA réel dans lib/ai/providers.ts",
          score: 0,
          rank: 1,
          payload: { stub: true },
        },
      ],
    };
  },
};
