// src/types.ts
// Types only. No logic. Keep it boring.

export type ExecutionId = string;

export interface GuardConfig {
  /** Amplification multiplier (budget = k * inputTokens + floorTokens) */
  k: number;

  /** Minimum budget added on top of k*inputTokens */
  floorTokens: number;

  /** Max OpenAI calls allowed within one execution */
  maxSteps: number;

  /** Hard cap on per-call output tokens */
  maxOutputTokens: number;
}

export interface ExecutionInit {
  /** Optional external id; if omitted, the SDK will generate one in startExecution() */
  executionId?: ExecutionId;

  /** Initial input token count for the user request (baseline) */
  inputTokens: number;

  /** Optional overrides; merged onto DEFAULT_CONFIG */
  config?: Partial<GuardConfig>;
}

export interface BudgetSnapshot {
  executionId: ExecutionId;

  inputTokens: number;

  budgetTokens: number;

  spentTokens: number;

  remainingTokens: number;

  stepsUsed: number;

  maxSteps: number;

  maxOutputTokens: number;

  k: number;

  floorTokens: number;
}

export interface UsageDelta {
  /** Input tokens billed for this call */
  inputTokens: number;

  /** Output tokens billed for this call */
  outputTokens: number;

  /** Total tokens billed for this call */
  totalTokens: number;

  /** Optional; do not use for enforcement in v0 */
  cachedInputTokens?: number;
}

export type StopReason = "BUDGET_EXCEEDED" | "STEP_LIMIT_EXCEEDED";
