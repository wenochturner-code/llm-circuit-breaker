// examples/runaway-loop.ts
// Proves the invariant is real: it stops a runaway loop.
import OpenAI from "openai";
import { guardedResponse, startExecution, BudgetExceededError, StepLimitExceededError, } from "../src/index.js";
function requireEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env var: ${name}`);
    return v;
}
async function main() {
    const apiKey = requireEnv("OPENAI_API_KEY");
    const client = new OpenAI({ apiKey });
    const inputTokens = 200; // v0 placeholder baseline
    // Small numbers so it stops fast (proof harness).
    const exec = startExecution({
        inputTokens,
        config: {
            maxSteps: 5,
            maxOutputTokens: 512,
            k: 5,
            floorTokens: 500,
        },
    });
    let prompt = "Write one short paragraph about circuit breakers.";
    try {
        for (let i = 0; i < 100; i++) {
            const resp = await guardedResponse(client, exec, {
                model: "gpt-4.1-mini",
                input: prompt,
                max_output_tokens: 9999, // intentionally too high; should be clamped to 512
            });
            const snap = exec.snapshot();
            console.log(`i=${i} spent=${snap.spentTokens}/${snap.budgetTokens} steps=${snap.stepsUsed}/${snap.maxSteps}`);
            // Force growth: ask it to continue.
            const outText = resp?.output_text ??
                resp?.output?.[0]?.content?.[0]?.text ??
                "";
            prompt = `Continue. Add one more paragraph.\n\nSo far:\n${outText}`;
        }
    }
    catch (e) {
        if (e instanceof BudgetExceededError) {
            console.log("\nSTOPPED: BUDGET_EXCEEDED");
            console.log(e.snapshot);
            return;
        }
        if (e instanceof StepLimitExceededError) {
            console.log("\nSTOPPED: STEP_LIMIT_EXCEEDED");
            console.log(e.snapshot);
            return;
        }
        throw e;
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
