import type { BudgetReason, BudgetSnapshot } from "./types.js";
export declare class BudgetError extends Error {
    readonly reason: BudgetReason;
    readonly executionId?: string;
    readonly snapshot: BudgetSnapshot;
    constructor(reason: BudgetReason, snapshot: BudgetSnapshot, executionId?: string);
}
export declare function isBudgetError(e: unknown): e is BudgetError;
