---
name: exploratory-charter
description: Turns one feature plus one risk into a session-based exploratory testing charter and a blank findings template. Use when the user asks to charter an exploratory session, plan exploratory testing, write a test charter, or set up a timeboxed exploration of a feature or risk. Keeps the format only — the tester supplies the thinking, the findings, and the judgment.
---

# Exploratory Charter

Turn one **feature** + one **risk** into a focused charter and an empty findings
template. This skill keeps the *format*. The exploration, observations, and
conclusions are the tester's — do not invent findings or run the session.

## Inputs

- **Feature / area** — what to explore (one page, flow, or component).
- **Risk** — the one worry driving the session ("duplicate names slip through",
  "delete removes the wrong row").

If either is missing, ask for it. One charter = one feature + one risk.

## 1. Write the charter

Use Hendrickson's form — a single sentence:

> **Explore** \<feature/area\>
> **with** \<resources: data, tools, roles, env\>
> **to discover** \<information about the risk\>

Add a timebox (default **45 min**) and a priority. Keep it to one mission; if it
needs an "and", split it into two charters.

### Charter template

```markdown
# Charter: <short title>

Explore      <feature / area>
With         <accounts, data, tools, env — e.g. admin on DIDAXIS_URL, Faker data>
To discover  <what you'd learn about the risk>

Risk:      <the one risk this session targets>
Timebox:   45 min
Priority:  <high | medium | low>
```

## 2. Provide the findings template (leave it blank)

Hand back an empty session sheet for the tester to fill *during* the session.
Do not pre-populate it with guesses.

### Findings template

```markdown
# Session findings: <charter title>

Tester:    <name>
Date:      <yyyy-mm-dd>
Duration:  <actual, e.g. 40/45 min>

## Setup / preconditions
- <env, data, account used>

## What I tested (coverage)
- <areas / flows actually touched>

## Bugs
- [ ] <symptom> — steps, expected vs actual, evidence (screenshot / trace)

## Issues & open questions
- <ambiguities, spec gaps, "is this intended?">

## Risks still open
- <what this session did NOT cover>

## Follow-up test ideas
- <candidates for a Playwright spec or a new charter>
```

## Handoff

- A confirmed defect → **jira-bug-reporter** / **bug-reporter**.
- A repeatable check worth automating → **explore-and-generate** or **test-writer**.

The goal of an exploratory session is *information*, not a green check. Do not
weaken or automate away the human judgment.
