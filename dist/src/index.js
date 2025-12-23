// src/index.ts
// Public API. Tiny. Obvious.
export { DEFAULT_CONFIG, ExecutionBudget, startExecution } from "./budget.js";
export { guardedResponse } from "./openai.js";
export { BudgetExceededError, StepLimitExceededError, isGuardError } from "./errors.js";
