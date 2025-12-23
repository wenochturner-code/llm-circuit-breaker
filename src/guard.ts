// src/guard.ts
// Three walls. No IO. No OpenAI code.

import { BudgetExceededError, StepLimitExceededError } from "./errors.js";
import type { ExecutionBudget } from "./budget.js";

export function enforceStepLimit(b: ExecutionBudget): void {
  if (b.stepsUsed >= b.config.maxSteps) {
    throw new StepLimitExceededError({
      executionId: b.executionId,
      stepsUsed: b.stepsUsed,
      maxSteps: b.config.maxSteps,
      snapshot: b.snapshot(),
    });
  }
}

export function clampMaxOutputTokens<T extends { max_output_tokens?: number }>(
  b: ExecutionBudget,
  req: T
): T {
  const requested = req.max_output_tokens ?? b.config.maxOutputTokens;
  const clamped = Math.min(requested, b.config.maxOutputTokens);

  // Mutate the request object (boring, explicit).
  req.max_output_tokens = clamped;
  return req;
}

export function enforcePostSpendBudget(b: ExecutionBudget): void {
  if (b.isExceeded()) {
    throw new BudgetExceededError({
      executionId: b.executionId,
      budgetTokens: b.budgetTokens,
      spentTokens: b.spentTokens,
      inputTokens: b.inputTokens,
      k: b.config.k,
      floorTokens: b.config.floorTokens,
      snapshot: b.snapshot(),
    });
  }
}
