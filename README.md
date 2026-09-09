# CPS 412 Mastery

Study app for CPS 412 (Social Issues, Ethics and Professionalism). Three passes: filter what you know, drill what you don't, then run a full simulation. Progress saves locally and syncs across devices.

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000. Needs HTTP (ES modules don't work from `file://`). No dependencies, no build step.

## How it works

- Pass 1 (Filter) — answer each question, then rate it: Know It / Unsure / No Idea.
- Pass 2 (Deep Dive) — only your Unsure + No Idea questions, with reference explanations.
- Pass 3 (Simulation) — everything shuffled, no hints.

Shortcuts: `1-9` answer, `1/2/3` rate, `Enter` next, `H` reference, `Esc` close.
