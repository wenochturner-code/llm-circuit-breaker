export class BudgetError extends Error {
    reason;
    executionId;
    snapshot;
    constructor(reason, snapshot, executionId) {
        super(`Budget exceeded: ${reason}`);
        this.name = "BudgetError";
        this.reason = reason;
        this.snapshot = snapshot;
        this.executionId = executionId;
    }
}
export function isBudgetError(e) {
    return e instanceof BudgetError;
}
