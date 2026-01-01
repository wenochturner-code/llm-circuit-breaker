import { BudgetError } from "./errors.js";
const budgetInternals = new WeakMap();
export function getInternals(budget) {
    const internals = budgetInternals.get(budget);
    if (!internals)
        throw new Error("Invalid budget");
    return internals;
}
export function createSnapshot(internals, overshoot) {
    const { limits, state, now } = internals;
    return {
        stepsUsed: state.stepsUsed,
        maxSteps: limits.maxSteps,
        toolCallsUsed: state.toolCallsUsed,
        maxToolCalls: limits.maxToolCalls,
        tokensUsed: state.tokensUsed,
        maxTokens: limits.maxTokens,
        overshoot,
        elapsedMs: now() - state.startTime,
        timeoutMs: limits.timeoutMs,
        tokenAccountingReliable: state.tokenAccountingReliable,
    };
}
export function createBudget(limits, now = Date.now) {
    const state = {
        stepsUsed: 0,
        toolCallsUsed: 0,
        tokensUsed: 0,
        startTime: now(),
        terminatedReason: null,
        terminatedSnapshot: null,
        tokenAccountingReliable: true,
    };
    const budget = {
        recordToolCall() {
            const internals = getInternals(this);
            const { limits, state, now } = internals;
            const elapsed = now() - state.startTime;
            // Precedence order: TIMEOUT > TOOL_LIMIT > TOKEN_LIMIT
            // 1. Check timeout
            if (elapsed >= limits.timeoutMs) {
                throw new BudgetError("TIMEOUT", createSnapshot(internals), limits.executionId);
            }
            // 2. Check tool limit
            if (state.toolCallsUsed + 1 > limits.maxToolCalls) {
                throw new BudgetError("TOOL_LIMIT", createSnapshot(internals), limits.executionId);
            }
            // 3. Check terminatedReason (TOKEN_LIMIT from between-calls)
            if (state.terminatedReason) {
                throw new BudgetError(state.terminatedReason, state.terminatedSnapshot, limits.executionId);
            }
            // All checks passed, increment counter
            state.toolCallsUsed++;
        },
    };
    budgetInternals.set(budget, { limits, state, now });
    return budget;
}
