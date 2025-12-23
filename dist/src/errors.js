// src/errors.ts
// Explicit failures. No silent stops.
export class BudgetExceededError extends Error {
    name = "BudgetExceededError";
    reason = "BUDGET_EXCEEDED";
    executionId;
    budgetTokens;
    spentTokens;
    inputTokens;
    k;
    floorTokens;
    snapshot;
    constructor(args) {
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
    name = "StepLimitExceededError";
    reason = "STEP_LIMIT_EXCEEDED";
    executionId;
    stepsUsed;
    maxSteps;
    snapshot;
    constructor(args) {
        const { executionId, stepsUsed, maxSteps } = args;
        super(`Step limit exceeded for execution ${executionId}: steps ${stepsUsed} >= ${maxSteps}`);
        this.executionId = args.executionId;
        this.stepsUsed = args.stepsUsed;
        this.maxSteps = args.maxSteps;
        this.snapshot = args.snapshot;
    }
}
export function isGuardError(e) {
    return e instanceof BudgetExceededError || e instanceof StepLimitExceededError;
}
