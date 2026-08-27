import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FileCode2,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  MessageCircleQuestion,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeFile, askCoach, evaluateStep, loadDemo } from "./api";
import type {
  CoachReply,
  ExperienceLevel,
  Lesson,
  ProgressMap,
  SavedSession,
  StepProgress,
} from "./types";

const STORAGE_KEY = "codewise:last-session";
const EMPTY_PROGRESS: StepProgress = {
  mastered: false,
  attempts: 0,
  answer: "",
  feedbackHistory: [],
};

const LOADING_MESSAGES = [
  "Reading the structure…",
  "Following the value flow…",
  "Turning concepts into small lessons…",
  "Writing your first checkpoint…",
];

function Logo() {
  return (
    <div className="logo" aria-label="Codewise home">
      <span className="logo-mark" aria-hidden="true">
        <span>&lt;</span>
        <span>/</span>
        <span>&gt;</span>
      </span>
      <span>codewise</span>
    </div>
  );
}

function getSavedSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    return parsed?.lesson?.steps?.length ? parsed : null;
  } catch {
    return null;
  }
}

function saveSession(session: SavedSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function App() {
  const [session, setSession] = useState<SavedSession | null>(null);
  const [recentSession, setRecentSession] = useState<SavedSession | null>(() => getSavedSession());
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(
      () => setLoadingIndex((index) => (index + 1) % LOADING_MESSAGES.length),
      1700,
    );
    return () => window.clearInterval(timer);
  }, [loading]);

  function beginLesson(lesson: Lesson, demo: boolean) {
    const next: SavedSession = {
      lesson,
      demo,
      progress: {},
      currentStep: 0,
      savedAt: Date.now(),
    };
    saveSession(next);
    setRecentSession(next);
    setSession(next);
  }

  async function handleUpload(file: File, experience: ExperienceLevel) {
    setLoading(true);
    setLoadingIndex(0);
    setError("");
    try {
      const source = await file.text();
      const result = await analyzeFile({ filename: file.name, source, experience });
      beginLesson(result.lesson, result.demo);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The file could not be analyzed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setLoading(true);
    setLoadingIndex(0);
    setError("");
    try {
      const result = await loadDemo();
      beginLesson(result.lesson, result.demo);
    } catch (demoError) {
      setError(demoError instanceof Error ? demoError.message : "The demo could not be opened.");
    } finally {
      setLoading(false);
    }
  }

  function updateSession(next: SavedSession) {
    const stamped = { ...next, savedAt: Date.now() };
    setSession(stamped);
    setRecentSession(stamped);
    saveSession(stamped);
  }

  function startAnother() {
    setSession(null);
    setError("");
  }

  if (session) {
    return <Tutor session={session} onChange={updateSession} onStartAnother={startAnother} />;
  }

  return (
    <Home
      loading={loading}
      loadingMessage={LOADING_MESSAGES[loadingIndex]}
      error={error}
      recentSession={recentSession}
      onUpload={handleUpload}
      onDemo={handleDemo}
      onResume={() => recentSession && setSession(recentSession)}
      onDismissError={() => setError("")}
    />
  );
}

type HomeProps = {
  loading: boolean;
  loadingMessage: string;
  error: string;
  recentSession: SavedSession | null;
  onUpload: (file: File, experience: ExperienceLevel) => void;
  onDemo: () => void;
  onResume: () => void;
  onDismissError: () => void;
};

function Home({
  loading,
  loadingMessage,
  error,
  recentSession,
  onUpload,
  onDemo,
  onResume,
  onDismissError,
}: HomeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [experience, setExperience] = useState<ExperienceLevel>("new");
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  function chooseFile(next: File | undefined) {
    setFileError("");
    if (!next) return;
    const extensionOkay = /\.(py|ino)$/i.test(next.name);
    if (!extensionOkay) {
      setFileError("Choose a .py or .ino source file.");
      return;
    }
    if (next.size > 150_000) {
      setFileError("Choose a file smaller than 150 KB.");
      return;
    }
    setFile(next);
  }

  return (
    <div className="home-shell">
      <header className="site-header">
        <Logo />
        <div className="header-note">
          <ShieldCheck size={16} /> Your code is never executed
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={15} /> Your patient code tutor</div>
            <h1>Don’t just run it.<br /><em>Understand it.</em></h1>
            <p className="hero-lede">
              Upload the code ChatGPT gave you. Codewise turns it into a guided lesson,
              then waits until you can explain each idea before moving on.
            </p>
            <div className="trust-row">
              <span><Check size={16} /> Python</span>
              <span><Check size={16} /> Arduino</span>
              <span><Check size={16} /> Beginner-friendly</span>
            </div>
          </div>

          <div className="upload-card" id="upload">
            <div className="card-label">Start with your file</div>
            <button
              className={`drop-zone ${dragging ? "is-dragging" : ""} ${file ? "has-file" : ""}`}
              onClick={() => inputRef.current?.click()}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                chooseFile(event.dataTransfer.files[0]);
              }}
              type="button"
            >
              <input
                ref={inputRef}
                type="file"
                accept=".py,.ino,text/x-python,text/plain"
                hidden
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
              {file ? (
                <>
                  <span className="upload-icon file-ready"><FileCode2 size={27} /></span>
                  <strong>{file.name}</strong>
                  <span>{Math.max(1, Math.round(file.size / 1024))} KB · ready to unpack</span>
                </>
              ) : (
                <>
                  <span className="upload-icon"><UploadCloud size={27} /></span>
                  <strong>Drop your script here</strong>
                  <span>or click to choose a .py or .ino file</span>
                </>
              )}
            </button>

            {(fileError || error) && (
              <div className="error-banner" role="alert">
                <span>{fileError || error}</span>
                {error && <button onClick={onDismissError} aria-label="Dismiss error"><X size={16} /></button>}
              </div>
            )}

            <fieldset className="experience-picker">
              <legend>How familiar are you with this language?</legend>
              <div>
                {([
                  ["new", "I’m brand new"],
                  ["some", "I know a little"],
                  ["comfortable", "I’m comfortable"],
                ] as const).map(([value, label]) => (
                  <label key={value} className={experience === value ? "selected" : ""}>
                    <input
                      type="radio"
                      name="experience"
                      value={value}
                      checked={experience === value}
                      onChange={() => setExperience(value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <button
              className="primary-button wide"
              disabled={!file || loading}
              onClick={() => file && onUpload(file, experience)}
            >
              {loading ? <><LoaderCircle className="spin" size={18} /> {loadingMessage}</> : <>Build my lesson <ArrowRight size={18} /></>}
            </button>

            <button className="text-button demo-button" onClick={onDemo} disabled={loading}>
              <Play size={15} /> Or try a 2-minute Python demo
            </button>
          </div>
        </section>

        {recentSession && (
          <section className="resume-strip">
            <div className="resume-icon"><BookOpenCheck size={22} /></div>
            <div>
              <span>Continue where you left off</span>
              <strong>{recentSession.lesson.filename}</strong>
            </div>
            <button onClick={onResume}>Resume lesson <ChevronRight size={17} /></button>
          </section>
        )}

        <section className="method-section">
          <div className="section-heading">
            <span>How it works</span>
            <h2>Understanding is a loop,<br />not a lecture.</h2>
          </div>
          <div className="method-grid">
            <article>
              <span className="method-number">01</span>
              <div className="method-icon blue"><FileCode2 size={23} /></div>
              <h3>Unpack the code</h3>
              <p>We divide your exact file into small ideas and explain every line in context.</p>
            </article>
            <article>
              <span className="method-number">02</span>
              <div className="method-icon coral"><BrainCircuit size={23} /></div>
              <h3>Build a mental model</h3>
              <p>Trace what values exist, what changes, and why each piece is there.</p>
            </article>
            <article>
              <span className="method-number">03</span>
              <div className="method-icon green"><LockKeyhole size={23} /></div>
              <h3>Prove it to yourself</h3>
              <p>Teach the idea back. The next step unlocks only when your answer shows understanding.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <Logo />
        <span>Built for curious people, not just programmers.</span>
      </footer>
    </div>
  );
}

type TutorProps = {
  session: SavedSession;
  onChange: (session: SavedSession) => void;
  onStartAnother: () => void;
};

function Tutor({ session, onChange, onStartAnother }: TutorProps) {
  const { lesson, progress, currentStep, demo } = session;
  const step = lesson.steps[currentStep];
  const stepProgress = progress[step.id] || EMPTY_PROGRESS;
  const masteredCount = lesson.steps.filter((item) => progress[item.id]?.mastered).length;
  const lessonComplete = masteredCount === lesson.steps.length;
  const progressPercent = Math.round((masteredCount / lesson.steps.length) * 100);
  const [answer, setAnswer] = useState(stepProgress.answer);
  const [checking, setChecking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [question, setQuestion] = useState("");
  const [coachReply, setCoachReply] = useState<CoachReply | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setAnswer((progress[step.id] || EMPTY_PROGRESS).answer);
    setShowHint(false);
    setQuestion("");
    setCoachReply(null);
    setLocalError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, step.id, progress]);

  const unlockedIndex = useMemo(() => {
    const firstIncomplete = lesson.steps.findIndex((item) => !progress[item.id]?.mastered);
    return firstIncomplete === -1 ? lesson.steps.length - 1 : firstIncomplete;
  }, [lesson.steps, progress]);

  function setCurrentStep(index: number) {
    if (index > unlockedIndex) return;
    onChange({ ...session, currentStep: index });
  }

  async function submitAnswer() {
    if (!answer.trim() || checking) return;
    setChecking(true);
    setLocalError("");
    try {
      const evaluation = await evaluateStep({
        lessonTitle: lesson.title,
        language: lesson.language,
        step,
        answer,
        attempt: stepProgress.attempts + 1,
        priorFeedback: stepProgress.feedbackHistory,
        demo,
      });
      const nextStepProgress: StepProgress = {
        mastered: evaluation.mastered,
        attempts: stepProgress.attempts + 1,
        answer,
        feedbackHistory: [...stepProgress.feedbackHistory, evaluation.feedback],
        lastEvaluation: evaluation,
      };
      onChange({
        ...session,
        progress: { ...progress, [step.id]: nextStepProgress },
      });
    } catch (evaluationError) {
      setLocalError(
        evaluationError instanceof Error ? evaluationError.message : "Your answer could not be checked.",
      );
    } finally {
      setChecking(false);
    }
  }

  async function sendCoachQuestion() {
    if (!question.trim() || coachLoading) return;
    setCoachLoading(true);
    setLocalError("");
    try {
      setCoachReply(await askCoach({ language: lesson.language, step, question, demo }));
      setQuestion("");
    } catch (coachError) {
      setLocalError(coachError instanceof Error ? coachError.message : "The coach could not answer.");
    } finally {
      setCoachLoading(false);
    }
  }

  function nextStep() {
    if (!stepProgress.mastered) return;
    if (currentStep < lesson.steps.length - 1) {
      onChange({ ...session, currentStep: currentStep + 1 });
    }
  }

  return (
    <div className="tutor-shell">
      <header className="tutor-header">
        <Logo />
        <div className="file-pill"><FileCode2 size={15} /> {lesson.filename}</div>
        <button className="new-file-button" onClick={onStartAnother}>
          <RotateCcw size={15} /> New file
        </button>
      </header>

      <div className="tutor-layout">
        <aside className="lesson-sidebar">
          <div className="lesson-progress">
            <div className="progress-copy">
              <span>Your progress</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="progress-track"><span style={{ width: `${progressPercent}%` }} /></div>
            <p>{masteredCount} of {lesson.steps.length} ideas mastered</p>
          </div>

          <nav aria-label="Lesson steps">
            <div className="nav-label">Lesson map</div>
            {lesson.steps.map((item, index) => {
              const complete = Boolean(progress[item.id]?.mastered);
              const locked = index > unlockedIndex;
              const active = index === currentStep;
              return (
                <button
                  key={item.id}
                  className={`step-link ${active ? "active" : ""} ${complete ? "complete" : ""}`}
                  disabled={locked}
                  onClick={() => setCurrentStep(index)}
                >
                  <span className="step-status" aria-hidden="true">
                    {complete ? <Check size={15} /> : locked ? <LockKeyhole size={13} /> : <Circle size={13} />}
                  </span>
                  <span>
                    <small>Step {index + 1}</small>
                    <strong>{item.title}</strong>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-promise">
            <ShieldCheck size={18} />
            <p><strong>Private by design</strong>Your code is explained, never run.</p>
          </div>
        </aside>

        <main className="lesson-main">
          {lessonComplete && currentStep === lesson.steps.length - 1 && (
            <div className="completion-banner">
              <div><CheckCircle2 size={24} /></div>
              <span><strong>Lesson complete.</strong> You explained every core idea in this file.</span>
            </div>
          )}

          <div className="lesson-heading">
            <div>
              <span className="step-eyebrow">Step {currentStep + 1} of {lesson.steps.length}</span>
              <h1>{step.title}</h1>
              <p>{step.purpose}</p>
            </div>
            <div className="time-chip"><Clock3 size={15} /> ~{Math.max(2, Math.round(lesson.estimatedMinutes / lesson.steps.length))} min</div>
          </div>

          <div className="lesson-columns">
            <section className="code-column" aria-label="Code for this step">
              <div className="panel code-panel">
                <div className="panel-bar">
                  <span>{lesson.filename}</span>
                  <span>Lines {step.lineStart}–{step.lineEnd}</span>
                </div>
                <CodeBlock code={step.code} startLine={step.lineStart} />
              </div>

              <div className="panel trace-panel">
                <div className="panel-title"><Play size={16} /> Follow the flow</div>
                <ol>
                  {step.walkThrough.map((item, index) => (
                    <li key={item}>
                      <span>{index + 1}</span>
                      <p>{item}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <section className="explain-column" aria-label="Explanation and checkpoint">
              <div className="explanation-block">
                <div className="block-label"><BrainCircuit size={16} /> What this means</div>
                <p>{step.explanation}</p>
              </div>

              <div className="analogy-card">
                <Lightbulb size={20} />
                <div><span>Picture it this way</span><p>{step.analogy}</p></div>
              </div>

              <div className="key-ideas">
                <span>Keep these ideas</span>
                <div>{step.keyIdeas.map((idea) => <em key={idea}>{idea}</em>)}</div>
              </div>

              <div className="coach-card">
                <div className="coach-title"><MessageCircleQuestion size={18} /><span><strong>Still fuzzy?</strong> Ask about this step.</span></div>
                {coachReply && (
                  <div className="coach-reply">
                    <p>{coachReply.answer}</p>
                    <p className="coach-analogy">{coachReply.analogy}</p>
                    <strong>{coachReply.questionBack}</strong>
                  </div>
                )}
                <div className="coach-input-row">
                  <input
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && sendCoachQuestion()}
                    placeholder="Why does this line need to be here?"
                    aria-label="Ask the tutor about this step"
                  />
                  <button onClick={sendCoachQuestion} disabled={!question.trim() || coachLoading} aria-label="Send question">
                    {coachLoading ? <LoaderCircle className="spin" size={17} /> : <ArrowRight size={17} />}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <section className={`checkpoint-card ${stepProgress.mastered ? "mastered" : ""}`}>
            <div className="checkpoint-top">
              <div className="checkpoint-icon">
                {stepProgress.mastered ? <CheckCircle2 size={23} /> : <BrainCircuit size={23} />}
              </div>
              <div>
                <span>{stepProgress.mastered ? "Understanding confirmed" : "Your turn — teach it back"}</span>
                <h2>{stepProgress.lastEvaluation?.nextQuestion || step.question}</h2>
              </div>
            </div>

            {!stepProgress.mastered && (
              <>
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Explain it in your own words. Being unsure is completely okay…"
                  rows={5}
                />
                <div className="checkpoint-actions">
                  <button className="hint-button" onClick={() => setShowHint((visible) => !visible)}>
                    <Lightbulb size={15} /> {showHint ? "Hide hint" : "I need a hint"}
                  </button>
                  <button className="primary-button" disabled={!answer.trim() || checking} onClick={submitAnswer}>
                    {checking ? <><LoaderCircle className="spin" size={17} /> Checking your explanation…</> : <>Check my understanding <ArrowRight size={17} /></>}
                  </button>
                </div>
                {showHint && <div className="hint-reveal"><Lightbulb size={16} /> {step.hint}</div>}
              </>
            )}

            {stepProgress.lastEvaluation && (
              <div className={`feedback-box ${stepProgress.mastered ? "success" : "retry"}`}>
                <div className="score-badge">{stepProgress.lastEvaluation.score}</div>
                <div>
                  <strong>{stepProgress.lastEvaluation.encouragement}</strong>
                  <p>{stepProgress.lastEvaluation.feedback}</p>
                  {!stepProgress.mastered && stepProgress.lastEvaluation.missing.length > 0 && (
                    <span>Strengthen: {stepProgress.lastEvaluation.missing.join(" · ")}</span>
                  )}
                </div>
              </div>
            )}

            {localError && <div className="error-banner" role="alert">{localError}</div>}

            {stepProgress.mastered && (
              <div className="mastery-actions">
                <p><Check size={16} /> Step unlocked after {stepProgress.attempts} {stepProgress.attempts === 1 ? "attempt" : "attempts"}</p>
                {currentStep < lesson.steps.length - 1 ? (
                  <button className="primary-button" onClick={nextStep}>Continue to step {currentStep + 2} <ArrowRight size={17} /></button>
                ) : (
                  <button className="primary-button" onClick={() => setCurrentStep(0)}>Review from the beginning <ArrowLeft size={17} /></button>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function CodeBlock({ code, startLine }: { code: string; startLine: number }) {
  const lines = code.split("\n");
  return (
    <pre className="code-block">
      <code>
        {lines.map((line, index) => (
          <span className="code-line" key={`${startLine + index}-${line}`}>
            <span className="line-number">{startLine + index}</span>
            <span className="line-content">{line || " "}</span>
          </span>
        ))}
      </code>
    </pre>
  );
}

export default App;
