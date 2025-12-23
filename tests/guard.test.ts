// test/guard.test.ts
// Guard logic enforces the three walls.

import { describe, expect, test } from "vitest";
import { makeBudget, fakeUsage } from "./helpers";
import { enforcePostSpendBudget, enforceStepLimit, clampMaxOutputTokens } from "../src/guard";
import { BudgetExceededError, StepLimitExceededError } from "../src/errors";

describe("guard", () => {
  test("step limit throws", () => {
    const b = makeBudget({ config: { maxSteps: 2 } });

    // stepsUsed = 0, allow
    enforceStepLimit(b);
    b.incrementStep(); // stepsUsed = 1

    // allow
    enforceStepLimit(b);
    b.incrementStep(); // stepsUsed = 2

    // now at limit => throw
    expect(() => enforceStepLimit(b)).toThrow(StepLimitExceededError);
  });

  test("clamp max_output_tokens", () => {
    const b = makeBudget({ config: { maxOutputTokens: 2048 } });

    const req: { max_output_tokens?: number } = { max_output_tokens: 4096 };
    const out = clampMaxOutputTokens(b, req);

    expect(out.max_output_tokens).toBe(2048);
  });

  test("does not clamp if already lower", () => {
    const b = makeBudget({ config: { maxOutputTokens: 2048 } });

    const req: { max_output_tokens?: number } = { max_output_tokens: 512 };
    const out = clampMaxOutputTokens(b, req);

    expect(out.max_output_tokens).toBe(512);
  });

  test("post-spend budget enforcement throws", () => {
    const b = makeBudget({ inputTokens: 1, config: { k: 0, floorTokens: 1000 } }); // budget=1000

    b.charge(fakeUsage(1001));

    expect(() => enforcePostSpendBudget(b)).toThrow(BudgetExceededError);
  });
});
