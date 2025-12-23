// examples/basic-chat.ts
// Minimal happy path. Proves normal usage works.

import OpenAI from "openai";
import { guardedResponse, startExecution } from "../src/index.js";


function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function main() {
  const apiKey = requireEnv("OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });

  const userMessage = "Say hello in one sentence. Keep it short.";

  // v0: keep it boring. You can replace this with real token counting later.
  // Just make sure it's > 0.
  const inputTokens = 200;

  const exec = startExecution({ inputTokens });

  const resp = await guardedResponse(client as any, exec, {
    model: "gpt-4.1-mini",
    input: userMessage,
    max_output_tokens: 256,
  });

  const text =
    resp?.output_text ??
    resp?.output?.[0]?.content?.[0]?.text ??
    JSON.stringify(resp, null, 2);

  console.log("OUTPUT:");
  console.log(text);

  const snap = exec.snapshot();
  console.log("\nSNAPSHOT:");
  console.log({
    executionId: snap.executionId,
    inputTokens: snap.inputTokens,
    spentTokens: snap.spentTokens,
    budgetTokens: snap.budgetTokens,
    stepsUsed: snap.stepsUsed,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
