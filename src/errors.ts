// src/errors.ts
// Explicit failures. No silent stops.

import type { BudgetSnapshot, ExecutionId, StopReason } from "./types.js";

export class BudgetExceededError extends Error {
  public readonly name = "BudgetExceededError";
  public readonly reason: StopReason = "BUDGET_EXCEEDED";

  public readonly executionId: ExecutionId;
  public readonly budgetTokens: number;
  public readonly spentTokens: number;
  public readonly inputTokens: number;
  public readonly k: number;
  public readonly floorTokens: number;

  public readonly snapshot: BudgetSnapshot;

  constructor(args: {
    executionId: ExecutionId;
    budgetTokens: number;
    spentTokens: number;
    inputTokens: number;
    k: number;
    floorTokens: number;
    snapshot: BudgetSnapshot;
  }) {
    const { executionId, spentTokens, budgetTokens } = args;
    super(`Budget exceeded for execution ${executionId}: spent ${spentTokens} > budget ${budgetTokens}`);
    this.executionId = args.executionId;
    this.budgetTokens = args.budgetTokens;
    this.spentTokens = args.spentTokens;
    this.inputTokens = args.inputTokens;
    this.k = args.k;
    this.floorTokens = args.floorTokens;
    this.snapshot = args.snapshot;
  }
}

export class StepLimitExceededError extends Error {
  public readonly name = "StepLimitExceededError";
  public readonly reason: StopReason = "STEP_LIMIT_EXCEEDED";

  public readonly executionId: ExecutionId;
  public readonly stepsUsed: number;
  public readonly maxSteps: number;

  public readonly snapshot: BudgetSnapshot;

  constructor(args: {
    executionId: ExecutionId;
    stepsUsed: number;
    maxSteps: number;
    snapshot: BudgetSnapshot;
  }) {
    const { executionId, stepsUsed, maxSteps } = args;
    super(`Step limit exceeded for execution ${executionId}: steps ${stepsUsed} >= ${maxSteps}`);
    this.executionId = args.executionId;
    this.stepsUsed = args.stepsUsed;
    this.maxSteps = args.maxSteps;
    this.snapshot = args.snapshot;
  }
}

export function isGuardError(e: unknown): e is BudgetExceededError | StepLimitExceededError {
  return e instanceof BudgetExceededError || e instanceof StepLimitExceededError;
}
