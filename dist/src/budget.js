// src/budget.ts
// Budget state machine. Pure and boring.
export const DEFAULT_CONFIG = {
    k: 25,
    floorTokens: 4000,
    maxSteps: 25,
    maxOutputTokens: 2048,
};
function generateExecutionId() {
    // Deterministic enough for v0; caller can override.
    return `exec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
export class ExecutionBudget {
    executionId;
    config;
    inputTokens;
    budgetTokens;
    _spentTokens = 0;
    _stepsUsed = 0;
    constructor(args) {
        this.executionId = args.executionId;
        this.inputTokens = args.inputTokens;
        this.config = args.config;
        this.budgetTokens =
            this.config.k * this.inputTokens + this.config.floorTokens;
    }
    incrementStep() {
        this._stepsUsed += 1;
    }
    charge(delta) {
        this._spentTokens += delta.totalTokens;
    }
    isExceeded() {
        return this._spentTokens > this.budgetTokens;
    }
    remaining() {
        return Math.max(0, this.budgetTokens - this._spentTokens);
    }
    snapshot() {
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
    get spentTokens() {
        return this._spentTokens;
    }
    get stepsUsed() {
        return this._stepsUsed;
    }
}
export function startExecution(init) {
    const executionId = init.executionId ?? generateExecutionId();
    const config = {
        ...DEFAULT_CONFIG,
        ...(init.config ?? {}),
    };
    return new ExecutionBudget({
        executionId,
        inputTokens: init.inputTokens,
        config,
    });
}
