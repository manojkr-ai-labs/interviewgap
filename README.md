# InterviewGap

Paste one resume and one job description. Get an evidence-linked fit score, a 7-day plan to close the gaps, and a scored mock interview.

Built for the [HackerEarth VibeCode Arena: AI Innovation Arena](https://vibecodearena.ai/ai-innovation-arena) (19 Sep–5 Oct 2026) by **Manoj Kumar Sah**.

**Demo for hiring review:** [manojkr-ai-labs.github.io/interviewgap](https://manojkr-ai-labs.github.io/interviewgap/)

Open that link, click **Load sample**, then **Analyse**. No login. The arena Preview tab is blank because the contest sandbox is offline. This page is the same app, hosted so a reviewer can use it.

Arena record: score **49.0**, prompt eval **97.96**. Project: [vibecodearena.ai/duel/d3e938f5-4afd-4b4b-8879-99de3b9eb5ed](https://vibecodearena.ai/duel/d3e938f5-4afd-4b4b-8879-99de3b9eb5ed).

## What it does

One job. One candidate. No course marketplace and no multi-career dashboard.

| Step | What the user gets |
| --- | --- |
| Paste | Resume and job description. Analyze stays off until both are substantial. |
| Fit score | 0–100 with Strong / Stretch / Weak, plus skills, experience, domain, and keyword subscores. |
| Gap matrix | Must-have vs nice-to-have, marked Have / Partial / Missing, each row tied to a resume quote or “not on this resume.” |
| 7-day plan | Seven dated tasks (60–90 min) with a 20-minute backup. No invented course links. |
| Mock interview | 10 questions (4 technical, 3 behavioral, 2 project, 1 why-this-role), scored 1–5, with a spoken model answer. Total out of 50. |
| Review and export | Weakest answers highlighted. Markdown export named from the role. |
| History | Open, duplicate, and delete past matches. Saved in the browser. |

The product reads only what is pasted. It does not apply to jobs or contact employers.

## Why this shape

Generic career tools dump courses. Someone applying this week needs the gap between **this** resume and **this** job description, then a plan they can finish before the interview.

The sample match is specific on purpose: Kavya Iyer (RVCE 2025, React/Node, an 8-week Bengaluru edtech internship, HostelFix and Markit) against a Northbeam Payments Software Engineer I role. Payments and on-call are Missing because they are not on the resume. The scorer is not allowed to invent jobs, companies, or years.

## What is in this repo

The running UI was built and refined inside the arena (listed models only, 50 turns on one build). The app in [app/](app/) is that frontend. It scores in the browser. It does not call the arena server.

| Path | Contents |
| --- | --- |
| [app/](app/) | The working app. Static site, no login, no server. |
| [prompts/first-prompt.txt](prompts/first-prompt.txt) | The build prompt: eight screens, constraints, sample outcome. |
| [prompts/sample-data.txt](prompts/sample-data.txt) | The only facts Analyze is allowed to use for the demo match. |
| [turns/50-turn-checklist.md](turns/50-turn-checklist.md) | The 50-turn refinement log: empty states, mobile, mock quality, accessibility. |
| [resume/after-submit.md](resume/after-submit.md) | Resume lines, profile blurb, and a 30-second interview script. |
| [hackthon-certificate-vibecodearena-manoj-kumar-sah.pdf](hackthon-certificate-vibecodearena-manoj-kumar-sah.pdf) | Participation certificate. |

## Certificate

Participation certificate (downloaded after the arena closed): [hackthon-certificate-vibecodearena-manoj-kumar-sah.pdf](hackthon-certificate-vibecodearena-manoj-kumar-sah.pdf).

## Resume line

InterviewGap — VibeCode Arena, HackerEarth (Oct 2026). Single-page tool that scores one resume against one job description, lists evidence-linked skill gaps, and generates a 7-day prep plan plus a 10-question mock interview. [Live demo](https://manojkr-ai-labs.github.io/interviewgap/).

## Stack and constraints

- Single-page app, dark zinc UI, amber accent, Indian English, IST dates
- Desktop left nav, phone bottom tabs
- Browser `localStorage` for history, plan checkboxes, and mock scores
- In-arena models only. No login wall.

Next, if this were continued outside the arena: real PDF resume parsing and company-specific question packs. Those are not in the live build.
