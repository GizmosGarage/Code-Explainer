import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import cors from "cors";
import express from "express";
import {
  analyzeSource,
  coachStep,
  createDemoLesson,
  evaluateAnswer,
  evaluateDemo,
  type ExperienceLevel,
  type LessonStep,
} from "./tutor.ts";

if (existsSync(".env") && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(".env");
}

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json({ limit: "500kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/analyze", async (request, response) => {
  try {
    if (request.body?.demo === true) {
      response.json({ lesson: createDemoLesson(), demo: true });
      return;
    }

    const filename = String(request.body?.filename || "");
    const source = String(request.body?.source || "");
    const experience = ["new", "some", "comfortable"].includes(request.body?.experience)
      ? (request.body.experience as ExperienceLevel)
      : "new";
    const lesson = await analyzeSource({ filename, source, experience });
    response.json({ lesson, demo: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The file could not be analyzed.";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 400;
    response.status(status).json({ error: message });
  }
});

app.post("/api/evaluate", async (request, response) => {
  try {
    const step = request.body?.step as LessonStep;
    const answer = String(request.body?.answer || "");
    if (!step?.code || !step?.question) throw new Error("The lesson step is missing.");

    if (request.body?.demo === true) {
      response.json(evaluateDemo(step, answer));
      return;
    }

    const result = await evaluateAnswer({
      lessonTitle: String(request.body?.lessonTitle || "Code lesson"),
      language: String(request.body?.language || "source code"),
      step,
      answer,
      attempt: Number(request.body?.attempt || 1),
      priorFeedback: Array.isArray(request.body?.priorFeedback)
        ? request.body.priorFeedback.map(String)
        : [],
    });
    response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "That answer could not be evaluated.";
    response.status(message.includes("OPENAI_API_KEY") ? 503 : 400).json({ error: message });
  }
});

app.post("/api/coach", async (request, response) => {
  try {
    const step = request.body?.step as LessonStep;
    const question = String(request.body?.question || "").trim();
    if (!step?.code || !question) throw new Error("Ask a question about the current step.");

    if (request.body?.demo === true && !process.env.OPENAI_API_KEY) {
      response.json({
        answer: `${step.explanation} The important move is to follow the values one line at a time instead of trying to read the whole program at once.`,
        analogy: step.analogy,
        questionBack: step.question,
      });
      return;
    }

    response.json(
      await coachStep({
        language: String(request.body?.language || "source code"),
        step,
        question,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "The coach could not answer.";
    response.status(message.includes("OPENAI_API_KEY") ? 503 : 400).json({ error: message });
  }
});

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(currentDir, "../dist");
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((_request, response) => response.sendFile(path.join(distDir, "index.html")));
}

app.listen(port, () => {
  console.log(`Codewise API ready at http://localhost:${port}`);
});
