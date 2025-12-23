// test/helpers.ts
// Deterministic helpers. No network.

import { startExecution } from "../src/budget";
import type { ExecutionBudget } from "../src/budget";
import type { UsageDelta } from "../src/types";

export function makeBudget(overrides?: {
  inputTokens?: number;
  config?: Partial<Parameters<typeof startExecution>[0]["config"]>;
}): ExecutionBudget {
  const inputTokens = overrides?.inputTokens ?? 1000;

  return startExecution({
    executionId: "exec_test",
    inputTokens,
    config: {
      k: 25,
      floorTokens: 4000,
      maxSteps: 25,
      maxOutputTokens: 2048,
      ...(overrides?.config ?? {}),
    },
  });
}

export function fakeUsage(
  totalTokens: number,
  inputTokens?: number,
  outputTokens?: number
): UsageDelta {
  const inTok = inputTokens ?? 0;
  const outTok = outputTokens ?? Math.max(0, totalTokens - inTok);

  return {
    inputTokens: inTok,
    outputTokens: outTok,
    totalTokens,
  };
}

export function mockOpenAIResponse(usage: {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_tokens_details?: { cached_tokens?: number };
}): any {
  return {
    usage,
    output_text: "ok",
  };
}

/**
 * Returns a fake client whose responses.create pops usage objects from a list.
 * Also records the last params passed to responses.create for assertions.
 */
export function mockOpenAIClient(sequenceOfUsages: Array<ReturnType<typeof mockOpenAIResponse>["usage"]>) {
  const calls: any[] = [];
  const queue = [...sequenceOfUsages];

  const client = {
    calls,
    responses: {
      create: async (params: any) => {
        calls.push(params);
        const next = queue.shift();
        if (!next) throw new Error("Mock OpenAI client: no more queued responses");
        return mockOpenAIResponse(next);
      },
    },
  };

  return client;
}
