// src/budget.ts
// Budget state machine. Pure and boring.

import type {
  ExecutionId,
  GuardConfig,
  ExecutionInit,
  BudgetSnapshot,
  UsageDelta,
} from "./types.js";

export const DEFAULT_CONFIG: GuardConfig = {
  k: 25,
  floorTokens: 4000,
  maxSteps: 25,
  maxOutputTokens: 2048,
};

function generateExecutionId(): ExecutionId {
  // Deterministic enough for v0; caller can override.
  return `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class ExecutionBudget {
  public readonly executionId: ExecutionId;
  public readonly config: GuardConfig;

  public readonly inputTokens: number;
  public readonly budgetTokens: number;

  private _spentTokens = 0;
  private _stepsUsed = 0;

  constructor(args: {
    executionId: ExecutionId;
    inputTokens: number;
    config: GuardConfig;
  }) {
    this.executionId = args.executionId;
    this.inputTokens = args.inputTokens;
    this.config = args.config;

    this.budgetTokens =
      this.config.k * this.inputTokens + this.config.floorTokens;
  }

  incrementStep(): void {
    this._stepsUsed += 1;
  }

  charge(delta: UsageDelta): void {
    this._spentTokens += delta.totalTokens;
  }

  isExceeded(): boolean {
    return this._spentTokens > this.budgetTokens;
  }

  remaining(): number {
    return Math.max(0, this.budgetTokens - this._spentTokens);
  }

  snapshot(): BudgetSnapshot {
    return {
      executionId: this.executionId,
      inputTokens: this.inputTokens,
      budgetTokens: this.budgetTokens,
      spentTokens: this._spentTokens,
      remainingTokens: this.remaining(),
      stepsUsed: this._stepsUsed,
      maxSteps: this.config.maxSteps,
      maxOutputTokens: this.config.maxOutputTokens,
      k: this.config.k,
      floorTokens: this.config.floorTokens,
    };
  }

  get spentTokens(): number {
    return this._spentTokens;
  }

  get stepsUsed(): number {
    return this._stepsUsed;
  }
}

export function startExecution(init: ExecutionInit): ExecutionBudget {
  const executionId = init.executionId ?? generateExecutionId();
  const config: GuardConfig = {
    ...DEFAULT_CONFIG,
    ...(init.config ?? {}),
  };

  return new ExecutionBudget({
    executionId,
    inputTokens: init.inputTokens,
    config,
  });
}
