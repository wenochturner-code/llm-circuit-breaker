import type { Budget } from "./types.js";
export interface ResponseParams {
    max_output_tokens?: number;
    [key: string]: unknown;
}
export interface ResponseUsage {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
}
export interface Response {
    usage?: ResponseUsage;
    [key: string]: unknown;
}
export declare function guardedResponse<P extends ResponseParams, R extends Response>(budget: Budget, params: P, fn: (params: P) => Promise<R>): Promise<R>;
