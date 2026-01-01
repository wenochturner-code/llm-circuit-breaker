import type { Budget, BudgetLimits, BudgetReason, BudgetSnapshot } from "./types.js";
export interface BudgetState {
    stepsUsed: number;
    toolCallsUsed: number;
    tokensUsed: number;
    startTime: number;
    terminatedReason: BudgetReason | null;
    terminatedSnapshot: BudgetSnapshot | null;
    tokenAccountingReliable: boolean;
}
export interface BudgetInternals {
    limits: BudgetLimits;
    state: BudgetState;
    now: () => number;
}
export declare function getInternals(budget: Budget): BudgetInternals;
export declare function createSnapshot(internals: BudgetInternals, overshoot?: number): BudgetSnapshot;
export declare function createBudget(limits: BudgetLimits, now?: () => number): Budget;
