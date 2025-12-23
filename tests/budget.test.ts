// test/budget.test.ts
// Budget math and accounting are deterministic.

import { describe, expect, test } from "vitest";
import { makeBudget, fakeUsage } from "./helpers";

describe("ExecutionBudget", () => {
  test("budget formula: budgetTokens = k * inputTokens + floorTokens", () => {
    const b = makeBudget({ inputTokens: 1000, config: { k: 25, floorTokens: 4000 } });
    expect(b.budgetTokens).toBe(25000 + 4000);
  });

  test("charge updates spentTokens", () => {
    const b = makeBudget();
    expect(b.spentTokens).toBe(0);
    b.charge(fakeUsage(500));
    expect(b.spentTokens).toBe(500);
  });

  test("exceeded logic", () => {
    const b = makeBudget({ inputTokens: 1, config: { k: 0, floorTokens: 1000 } }); // budget=1000
    b.charge(fakeUsage(1001));
    expect(b.isExceeded()).toBe(true);
  });

  test("remaining tokens = budget - spent (floored at 0)", () => {
    const b = makeBudget({ inputTokens: 1, config: { k: 0, floorTokens: 1000 } }); // budget=1000
    b.charge(fakeUsage(400));
    expect(b.remaining()).toBe(600);
    b.charge(fakeUsage(700)); // spent=1100
    expect(b.remaining()).toBe(0);
  });

  test("snapshot correctness", () => {
    const b = makeBudget({ inputTokens: 1000, config: { k: 25, floorTokens: 4000, maxSteps: 2, maxOutputTokens: 123 } });
    b.incrementStep();
    b.charge(fakeUsage(300));

    const snap = b.snapshot();
    expect(snap.executionId).toBe("exec_test");
    expect(snap.inputTokens).toBe(1000);
    expect(snap.budgetTokens).toBe(25000 + 4000);
    expect(snap.spentTokens).toBe(300);
    expect(snap.remainingTokens).toBe(snap.budgetTokens - 300);
    expect(snap.stepsUsed).toBe(1);
    expect(snap.maxSteps).toBe(2);
    expect(snap.maxOutputTokens).toBe(123);
    expect(snap.k).toBe(25);
    expect(snap.floorTokens).toBe(4000);
  });
});
