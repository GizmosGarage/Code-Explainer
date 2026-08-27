# Contributing

Thanks for helping improve Codewise.

## Before opening a pull request

1. Open an issue for large behavior or architecture changes so the direction can
   be discussed first.
2. Never commit `.env`, API keys, uploaded source files, or learner data.
3. Keep uploaded code untrusted and never execute it outside a deliberately
   designed sandbox.
4. Preserve the rule that later steps stay locked until the current step is
   mastered.
5. Add or update tests for behavior changes.

## Local checks

```powershell
pnpm install
pnpm test
pnpm build
pnpm audit --prod
```

All four commands should succeed before a pull request is opened.

## Style

- Use TypeScript for application code.
- Prefer plain language in learner-facing copy.
- Keep API keys and AI calls on the server.
- Make controls keyboard accessible and preserve reduced-motion behavior.
- Explain the reason for non-obvious security or teaching decisions in the pull
  request description.
