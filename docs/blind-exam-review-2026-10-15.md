# Blind exam release review — 15 October 2026

Scope: review MiniMax's 8839d25, repair the learner's full `/along/` journey, preserve all 90 questions and their translations, then ship and exercise the deployed flow.

## Confirmed failures

- Wrong retry disabled the fieldset indefinitely. The jsdom helper dispatched events directly to disabled inputs, so the original green test did not represent a usable interface. Independent review reproduced failure by replacing synthetic events with native `input.click()`.
- Explanations and correct answers remained visible during a purported closed-book retry.
- Refresh/navigation discarded the entire 90-question sitting.
- Review omitted the available source and date (81 sourced questions, including all 29 current-affairs questions).
- Focus followed the first outstanding miss, rather than each displayed question.
- Brief and practice link called authored practice a real examination; summary attributed correct retries to reasoning without measuring reasoning.

## Changes

- Review → hide explanation → retry. Wrong retries return to the rule with a usable retry button; correct retries hold on an acknowledgement until the learner continues.
- Shuffle choices while retaining canonical answer indices. Recaps name answers rather than positional letters.
- Versioned browser checkpoint stores submitted answers, review queue, retry counts and the earned acknowledgement. Validate against bank content and reconstruct the first pass before restoring. Storage failure is visible; no chapter mastery is awarded.
- Restore source/date links after submission; focus each displayed prompt, review, acknowledgement and result.
- Plain TH/EN/ZH copy: 90 authored questions, 80 topics, untimed, first-attempt score, immediate retry distinguished from lasting recall.

## Verification

- `npm run verify`: 132 tests pass; corpus/content validators and TypeScript pass.
- UI tests use native clicks and assert controls are enabled. They exercise all 90 blind questions with no rule/explanation in the DOM, reload mid-sitting, wrong retry without shrinking the queue, hidden-feedback retry, earned acknowledgement after remount, queue drain, perfect sitting and storage failure.
- Checkpoint tests cover malformed/stale content, duplicate IDs, invalid choices, fabricated completion, earned state and first-score preservation.
- Production build and live browser evidence recorded below after release.
