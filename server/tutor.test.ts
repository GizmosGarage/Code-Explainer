import { describe, expect, it } from "vitest";
import {
  createDemoLesson,
  evaluateDemo,
  validateSource,
} from "./tutor.ts";

describe("source validation", () => {
  it("accepts Python and Arduino files", () => {
    expect(() => validateSource("hello.py", "print('hi')")).not.toThrow();
    expect(() => validateSource("blink.ino", "void setup() {}\nvoid loop() {}"))
      .not.toThrow();
  });

  it("rejects unsupported and empty files", () => {
    expect(() => validateSource("notes.txt", "hello")).toThrow(/Python/);
    expect(() => validateSource("empty.py", "   ")).toThrow(/empty/);
  });
});

describe("demo lesson", () => {
  it("covers the source in consecutive steps", () => {
    const lesson = createDemoLesson();
    expect(lesson.steps).toHaveLength(4);
    expect(lesson.steps[0].lineStart).toBe(1);
    expect(lesson.steps.at(-1)?.lineEnd).toBe(8);
    lesson.steps.slice(1).forEach((step, index) => {
      expect(step.lineStart).toBe(lesson.steps[index].lineEnd + 1);
    });
  });

  it("keeps vague answers locked and unlocks a complete teach-back", () => {
    const step = createDemoLesson().steps[0];
    expect(evaluateDemo(step, "It does code.").mastered).toBe(false);
    expect(
      evaluateDemo(
        step,
        "This is a function definition with parameters. The body is not executed yet; it runs when called.",
      ).mastered,
    ).toBe(true);
  });
});
