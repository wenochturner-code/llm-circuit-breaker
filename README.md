\# llm-circuit-breaker



Hard limits for LLM execution.



This SDK enforces a single invariant:



\*\*One user request cannot amplify unboundedly.\*\*



If an LLM retries, loops, branches, or runs away, execution stops deterministically before cost explodes.



No heuristics.

No dashboards.

No surprises.



---



\## Why this exists



LLMs fail nonlinearly.



Agent loops.

Retries with tools.

Recursive prompts.

Streaming bugs.



These failures create surprise bills.



This SDK makes that impossible.



---



\## The invariant



For each execution:



total\_tokens ≤ k \* input\_tokens + floor\_tokens  

steps ≤ maxSteps  

output\_tokens\_per\_call ≤ maxOutputTokens  



If any limit is crossed → execution stops with an explicit error.



No silent overruns.

No undefined behavior.



---



\## Install



npm install llm-circuit-breaker



---



\## Usage



Normal case.



```ts

import OpenAI from "openai";

import { startExecution, guardedResponse } from "llm-circuit-breaker";



const client = new OpenAI({ apiKey: process.env.OPENAI\_API\_KEY! });



const exec = startExecution({

&nbsp; inputTokens: 200

});



const resp = await guardedResponse(client, exec, {

&nbsp; model: "gpt-4.1-mini",

&nbsp; input: "Say hello in one sentence."

});



console.log(resp.output\_text);



Override Defaults:

Limits can be tightened or loosened explicitly.



const exec = startExecution({

&nbsp; inputTokens: 200,

&nbsp; config: {

&nbsp;   maxSteps: 5,

&nbsp;   k: 5,

&nbsp;   floorTokens: 500,

&nbsp;   maxOutputTokens: 512

&nbsp; }

});



Failure modes (by design)



When limits are crossed, execution stops with a typed error:

StepLimitExceededError

BudgetExceededError



Example:



i=4 spent=921/1500 steps=5/5

STOPPED: STEP\_LIMIT\_EXCEEDED



This is correct behavior.



What this does NOT do



No UI.

No dashboards.

No pricing forecasts.

No provider abstraction.

No “agent framework”.



It enforces one invariant.

It enforces it reliably.



When to use this



Use it if:



you ship LLM agents

runaway cost is unacceptable

you want hard guarantees, not heuristics



Do not use it if:



exploration must be unbounded

cost does not matter

failure is acceptable



Status



v0.



Production-usable.

Opinionated.

Minimal.



The invariant is stable.

Everything else can evolve.



