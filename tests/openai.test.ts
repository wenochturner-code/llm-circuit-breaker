// test/openai.test.ts
// Wrapper behavior: step increment, charging usage, and stopping.

import { describe, expect, test } from "vitest";
import { makeBudget, mockOpenAIClient } from "./helpers";
import { guardedResponse } from "../src/openai";
import { BudgetExceededError, StepLimitExceededError } from "../src/errors";

describe("guardedResponse", () => {
  test("happy path: calls OpenAI + charges usage", async () => {
    const b = makeBudget({ config: { maxSteps: 5 } });

    const client = mockOpenAIClient([
      { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
    ]);

    const resp = await guardedResponse(client as any, b, {
      model: "gpt-4.1-mini",
      input: "hi",
      max_output_tokens: 256,
    });

    expect(resp.output_text).toBe("ok");
    expect(b.stepsUsed).toBe(1);
    expect(b.spentTokens).toBe(300);
  });

  test("stops after budget exceeded", async () => {
    const b = makeBudget({ inputTokens: 1, config: { k: 0, floorTokens: 500 } }); // budget=500

    const client = mockOpenAIClient([
      { prompt_tokens: 100, completion_tokens: 500, total_tokens: 600 },
    ]);

    await expect(
      guardedResponse(client as any, b, {
        model: "gpt-4.1-mini",
        input: "hi",
        max_output_tokens: 256,
      })
    ).rejects.toBeInstanceOf(BudgetExceededError);

    // It still charged; then it threw.
    expect(b.spentTokens).toBe(600);
    expect(b.stepsUsed).toBe(1);
  });

  test("stops when step limit reached", async () => {
    const b = makeBudget({ config: { maxSteps: 1 } });

    const client = mockOpenAIClient([
      { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
      { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 },
    ]);

    await guardedResponse(client as any, b, {
      model: "gpt-4.1-mini",
      input: "hi",
      max_output_tokens: 256,
    });

    await expect(
      guardedResponse(client as any, b, {
        model: "gpt-4.1-mini",
        input: "hi again",
        max_output_tokens: 256,
      })
    ).rejects.toBeInstanceOf(StepLimitExceededError);

    expect(b.stepsUsed).toBe(1);
  });

  test("enforces per-call output cap (clamps params)", async () => {
    const b = makeBudget({ config: { maxOutputTokens: 512 } });

    const client = mockOpenAIClient([
      { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    ]);

    await guardedResponse(client as any, b, {
      model: "gpt-4.1-mini",
      input: "hi",
      max_output_tokens: 9999,
    });

    // verify the wrapper clamped the param passed into the client
    expect(client.calls.length).toBe(1);
    expect(client.calls[0].max_output_tokens).toBe(512);
  });
});
