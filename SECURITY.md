# Security policy

## Supported version

The latest version on the `main` branch is the supported version while this
project is in early development.

## Reporting a vulnerability

Do not open a public issue for a vulnerability, exposed credential, or private
learner data. Use the repository's **Security** tab to submit a private
vulnerability report instead.

Include the affected route or file, expected impact, reproduction steps, and any
suggested mitigation. Do not include real API keys, private source code, or learner
data in the report.

## Important security boundaries

- Uploaded code is text to explain; it must not be executed.
- `OPENAI_API_KEY` belongs only in the local `.env` file and server environment.
- `.env`, dependencies, build output, and TypeScript build metadata are ignored by
  Git.
- The latest lesson is stored in browser local storage and can contain source
  excerpts. Sensitive users should clear site data after use.
