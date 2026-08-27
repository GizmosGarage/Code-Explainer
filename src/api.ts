import type {
  CoachReply,
  Evaluation,
  ExperienceLevel,
  Lesson,
  LessonStep,
} from "./types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Something went wrong. Please try again.");
  return payload;
}

export function analyzeFile(input: {
  filename: string;
  source: string;
  experience: ExperienceLevel;
}) {
  return post<{ lesson: Lesson; demo: boolean }>("/api/analyze", input);
}

export function loadDemo() {
  return post<{ lesson: Lesson; demo: boolean }>("/api/analyze", { demo: true });
}

export function evaluateStep(input: {
  lessonTitle: string;
  language: string;
  step: LessonStep;
  answer: string;
  attempt: number;
  priorFeedback: string[];
  demo: boolean;
}) {
  return post<Evaluation>("/api/evaluate", input);
}

export function askCoach(input: {
  language: string;
  step: LessonStep;
  question: string;
  demo: boolean;
}) {
  return post<CoachReply>("/api/coach", input);
}
