export type ExperienceLevel = "new" | "some" | "comfortable";

export type LessonStep = {
  id: string;
  title: string;
  lineStart: number;
  lineEnd: number;
  code: string;
  purpose: string;
  explanation: string;
  analogy: string;
  walkThrough: string[];
  keyIdeas: string[];
  question: string;
  expectedIdeas: string[];
  hint: string;
};

export type Lesson = {
  id: string;
  filename: string;
  language: "python" | "arduino";
  title: string;
  summary: string;
  mentalModel: string;
  prerequisites: string[];
  estimatedMinutes: number;
  steps: LessonStep[];
};

export type Evaluation = {
  mastered: boolean;
  score: number;
  feedback: string;
  understood: string[];
  missing: string[];
  nextQuestion: string;
  encouragement: string;
};

export type StepProgress = {
  mastered: boolean;
  attempts: number;
  answer: string;
  feedbackHistory: string[];
  lastEvaluation?: Evaluation;
};

export type ProgressMap = Record<string, StepProgress>;

export type SavedSession = {
  lesson: Lesson;
  demo: boolean;
  progress: ProgressMap;
  currentStep: number;
  savedAt: number;
};

export type CoachReply = {
  answer: string;
  analogy: string;
  questionBack: string;
};
