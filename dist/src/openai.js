// src/openai.ts
// The only OpenAI integration point. One function. One path.
// v0: no streaming.
import { clampMaxOutputTokens, enforcePostSpendBudget, enforceStepLimit } from "./guard.js";
function extractUsageDelta(resp) {
    // OpenAI SDK shapes can vary; keep extraction defensive and boring.
    const usage = resp?.usage ?? {};
    const promptTokens = usage.prompt_tokens ??
        usage.input_tokens ??
        0;
    const completionTokens = usage.completion_tokens ??
        usage.output_tokens ??
        0;
    // If provider returns total_tokens, trust it; else compute.
    const totalTokens = usage.total_tokens ?? (promptTokens + completionTokens);
    const cachedInputTokens = usage.prompt_tokens_details?.cached_tokens ??
        usage.input_tokens_details?.cached_tokens;
    return {
        inputTokens: promptTokens,
        outputTokens: completionTokens,
        totalTokens,
        cachedInputTokens,
    };
}
export async function guardedResponse(openaiClient, budget, params) {
    enforceStepLimit(budget);
    budget.incrementStep();
    const clampedParams = clampMaxOutputTokens(budget, params);
    const resp = await openaiClient.responses.create(clampedParams);
    const delta = extractUsageDelta(resp);
    budget.charge(delta);
    enforcePostSpendBudget(budget);
    return resp;
}
