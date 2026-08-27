# Codewise

[![CI](https://github.com/GizmosGarage/Code-Explainer/actions/workflows/ci.yml/badge.svg)](https://github.com/GizmosGarage/Code-Explainer/actions/workflows/ci.yml)

Codewise turns a Python (`.py`) or Arduino (`.ino`) source file into an adaptive,
line-by-line lesson. It explains a small section, traces what happens, answers
questions, and keeps the next section locked until the learner can teach the idea
back in their own words.

## Run it locally

You need Node.js 20 or newer, pnpm, and an OpenAI API key.

1. Copy `.env.example` to a new file named `.env`.
2. Put your key after `OPENAI_API_KEY=` in `.env`.
3. In this folder, run:

   ```powershell
   pnpm install
   pnpm dev
   ```

4. Open [http://localhost:5173](http://localhost:5173).

The included Python demo works without an API key. Uploaded files need the key so
the tutor can analyze arbitrary code and judge answers in context.

## What the tutor does

- Accepts `.py` and `.ino` files up to 150 KB and 3,000 lines.
- Builds a complete, top-to-bottom learning map with exact line ranges.
- Separates definition time, execution time, value flow, control flow, and side
  effects where relevant.
- Uses teach-back and prediction questions rather than multiple-choice trivia.
- Requires an 80+ mastery judgment with no important missing idea before unlocking
  the next step.
- Gives targeted feedback, a hint, and a simpler follow-up when an answer is not
  ready.
- Saves the latest lesson and progress in this browser so it can be resumed.

## Privacy and safety

Codewise does not execute uploaded code. The browser reads the selected text file
and sends its contents to this local server, which sends it to the OpenAI API for
analysis. API requests use `store: false`. The API key stays on the server and is
never included in browser code. The latest lesson—including its source excerpts—is
stored in the browser's local storage; use a private browser profile or clear site
data if the code is sensitive.

## Useful commands

```powershell
pnpm test       # Run regression tests
pnpm build      # Create a production build
pnpm start      # Serve the production build and API on port 3001
```

## An honest note about “fully understood”

No program can see inside a learner's mind. Codewise looks for strong evidence of
understanding through explanation, prediction, and value tracing. Its gate is a
useful mastery check, not a mathematical guarantee. A future improvement would add
spaced review and small code-editing exercises to test whether the knowledge
transfers to a new problem.

## Contributing and security

Contributions are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md) before opening a
pull request. Please report security problems privately by following
[SECURITY.md](SECURITY.md), and never put an API key in an issue or commit.

## License

No open-source license has been selected. All rights are reserved by the repository
owner. Public visibility allows people to inspect and learn from the project, but
does not by itself grant permission to copy or redistribute it.
