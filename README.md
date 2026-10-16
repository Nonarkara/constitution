<div align="center">

<img src="public/illustrations/hero.webp" alt="Geometric composition in the style of Mondrian and Bauhaus, with traditional Japanese asanoha and seigaiha patterns and a small manga figure reading" width="100%" />

# The Constitution, the way I actually wanted to learn it

**A free, offline-capable study site for Thailand's civil-service exams — built by someone who sat these exams, got tired of how everyone else learns them, and taught himself what actually works.**

**[Read it · 12,000 exam takers and counting](https://constitution.nonarkara.org)** ·
[เริ่มอ่าน](https://constitution.nonarkara.org)

[English (README.md)](./README.md) · [ภาษาไทย (README.th.md)](./README.th.md) · [中文 (README.zh.md)](./README.zh.md)

</div>

---

## To the person sitting this exam right now

You are going to be tired. You are going to open this on a bus, or at 1am, or
five weeks before the test and think *I should start earlier.* That thought has
cost more preparation months than any subject ever will.

So let me say the thing nobody says:

**You will get most of this wrong on your first pass. That is the design.**

This site does not start by explaining things to you. It starts by sitting you
down with eighty exam topics and asking you to answer them blind. You will
miss most of them. Each miss then hands you the *rule* — the thing that decides
the answer — and asks you the same question again. You do not move on until you
get it right.

That is not a motivational trick. It is borrowed from real research on how
memory actually forms, and it is the single decision that separates this site
from a flashcard pile.

Read [The loop](#the-loop-one-idea-five-times) below before you decide how to
use this. It is four minutes and it will save you weeks.

---

## Why this exists

I am a consultant, not a lawyer and not a developer. I have watched a lot of
people prepare for these exams, and watched myself prepare badly. What I found
is that almost everyone studies the constitution the way you study history:
read the chapter, highlight the important sentence, feel good, score badly.

Three things are wrong with that, and this site is the answer to each.

### 1. Reading is not studying

Highlighting feels like work because it is effortful. That is precisely why it
is not evidence of learning. Decades of research agree: **self-testing and
spacing** outperform rereading and highlighting by a wide margin, and
explanation, interleaving and imagery help only depending on the task and the
learner ([Dunlosky et al., 2013](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html)).
Spacing alone is well established as a genuine effect
([Cepeda et al., 2006](https://www.psychologicalscience.org/publications/journals/pspi/spacing.pdf)),
and there is a recent, more careful review of how retrieval should be
structured ([Carpenter et al., 2022](https://www.nature.com/articles/s44159-022-00089-1)).

So: every question here is a test. Answering it *is* the studying.

### 2. A wrong answer is the most valuable thing on the page

Most apps treat a miss as a penalty, colour it red, and move on. That throws
away the best information in the room. A miss tells you precisely what you do
not know — which is exactly the thing worth spending the next hour on.

Here, a miss creates a **debt**. It comes back until you answer it correctly.
Not until you memorise the sentence, and not until you tap through it twice —
until you can rule the other three options out by reasoning. That is the skill
the exam measures, and it is the only one.

### 3. Rules transfer. Sentences do not.

If you memorise *"section 213 petitions go through the Ombudsman first"*, it
helps for exactly one question. If you learn *"a request must go to the
administrative body before it can reach the court, and only when that body
declines or goes quiet for 60 days"* — that rule answers section 213, and it
answers the next question shaped like it.

Every one of the 284 Pokklong questions and all 90 full-mock questions in this
site carries an explicit **rule** alongside its explanation. A test enforces
that no two questions share a rule, because a copied rule is a rule that only
works once.

---

## The loop: one idea, five times

This is the whole product. Everything else is a place to get to it.

```svg
<svg viewBox="0 0 860 260" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="The learning loop: sit blind, miss, learn the rule, answer again, earn it">
  <style>
    .box { fill: none; stroke: #111; stroke-width: 2; }
    .fill-a { fill: #E4002B; }   /* primary red   */
    .fill-b { fill: #F5C518; }   /* primary yellow*/
    .fill-c { fill: #0057B7; }   /* primary blue  */
    .lbl { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 15px; fill: #111; }
    .lbl-w { font-family: ui-sans-serif, system-ui, sans-serif; font-size: 15px; fill: #fff; }
    .num { font-family: ui-monospace, monospace; font-size: 13px; fill: #111; }
  </style>

  <!-- step 1: blind -->
  <rect class="box fill-a" x="10" y="40" width="150" height="96"/>
  <text class="lbl-w" x="85" y="72" text-anchor="middle">Sit it blind</text>
  <text class="lbl-w" x="85" y="94" text-anchor="middle">80 topics.</text>
  <text class="lbl-w" x="85" y="114" text-anchor="middle">Nothing to read.</text>
  <text class="num" x="16" y="30">01</text>

  <!-- step 2: miss -->
  <line x1="160" y1="88" x2="205" y2="88" stroke="#111" stroke-width="2"/>
  <polygon points="205,88 195,83 195,93" fill="#111"/>
  <rect class="box" x="207" y="40" width="150" height="96"/>
  <text class="lbl" x="282" y="72" text-anchor="middle">You miss it.</text>
  <text class="lbl" x="282" y="94" text-anchor="middle">Most of them.</text>
  <text class="lbl" x="282" y="114" text-anchor="middle">That is the point.</text>
  <text class="num" x="213" y="30">02</text>

  <!-- step 3: the rule -->
  <line x1="357" y1="88" x2="402" y2="88" stroke="#111" stroke-width="2"/>
  <polygon points="402,88 392,83 392,93" fill="#111"/>
  <rect class="box fill-b" x="404" y="40" width="180" height="96"/>
  <text class="lbl" x="494" y="70" text-anchor="middle">Get the rule.</text>
  <text class="lbl" x="494" y="92" text-anchor="middle">The thing that</text>
  <text class="lbl" x="494" y="112" text-anchor="middle">decides the answer.</text>
  <text class="num" x="410" y="30">03</text>

  <!-- step 4: again -->
  <line x1="584" y1="88" x2="629" y2="88" stroke="#111" stroke-width="2"/>
  <polygon points="629,88 619,83 619,93" fill="#111"/>
  <rect class="box fill-c" x="631" y="40" width="150" height="96"/>
  <text class="lbl-w" x="706" y="72" text-anchor="middle">Answer again.</text>
  <text class="lbl-w" x="706" y="94" text-anchor="middle">Rule out the</text>
  <text class="lbl-w" x="706" y="114" text-anchor="middle">other three.</text>
  <text class="num" x="637" y="30">04</text>

  <!-- earned -->
  <rect x="700" y="170" width="150" height="52" fill="#111"/>
  <text x="775" y="202" text-anchor="middle" font-family="ui-sans-serif,system-ui,sans-serif"
        font-size="16" fill="#fff">Earned →</text>
  <path d="M 706 136 L 706 158 Q 706 170 718 170 L 700 170" fill="none" stroke="#111" stroke-width="2"/>

  <!-- loop back -->
  <path d="M 85 136 L 85 196 Q 85 208 97 208 L 620 208 Q 632 208 632 196 L 632 140"
        fill="none" stroke="#111" stroke-width="2" stroke-dasharray="6 5"/>
  <polygon points="632,136 627,146 637,146" fill="#111"/>
  <text x="358" y="228" text-anchor="middle" font-family="ui-monospace,monospace"
        font-size="13" fill="#111">wrong again → the rule stays up, and it comes right back</text>

  <text x="10" y="250" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" fill="#555">
    A question is not finished when you have seen the answer. It is finished when you can derive it.
  </text>
</svg>
```

Read that bottom line again. It is the entire argument of this project.

---

## What is in here

| | |
|---|---|
| **279 sections** | The full 2017 Constitution (B.E. 2560) including the 2021 amendments, Thai primary, English (Council of State) and a Chinese study translation |
| **837 recordings** | Every section read aloud in all three languages, generated locally and checksummed against the source text |
| **470 questions** | Written from the text for practice, with explanations and citations |
| **284 Pokklong questions** | A twelve-step ladder through Thai local-government administration |
| **90 full-mock topics** | The 80 assessed topics of the district-chief exam, with an elimination rule on each |
| **13 guide chapters** | Thirteen chapters that teach the reasoning rather than the list |
| **Works offline** | Installable, no account, no tracking. Your progress stays on your device |

---

## Pokklong: the twelve steps

Most people trying to learn *ปกครอง* (to govern) memorise section numbers. This
does the opposite. It builds the logic from the ground up, one step at a time,
where each step only needs the one before it.

```svg
<svg viewBox="0 0 860 300" xmlns="http://www.w3.org/2000/svg" role="img"
     aria-label="The twelve Pokklong steps from why a state needs administration to control and accountability">
  <style>
    .s { stroke:#111; stroke-width:2; }
    .t { font-family: ui-sans-serif,system-ui,sans-serif; font-size:12.5px; fill:#111; }
    .n { font-family: ui-monospace,monospace; font-size:12px; fill:#111; }
  </style>
  <!-- asanoha-inspired grid of twelve cells -->
  <g>
    <rect class="s" fill="#E4002B" x="10"  y="20"  width="130" height="80"/>
    <rect class="s" fill="#fff"    x="150" y="20"  width="130" height="80"/>
    <rect class="s" fill="#0057B7" x="290" y="20"  width="130" height="80"/>
    <rect class="s" fill="#F5C518" x="430" y="20"  width="130" height="80"/>
    <rect class="s" fill="#fff"    x="570" y="20"  width="130" height="80"/>
    <rect class="s" fill="#111"    x="710" y="20"  width="130" height="80"/>
    <rect class="s" fill="#fff"    x="10"  y="110" width="130" height="80"/>
    <rect class="s" fill="#F5C518" x="150" y="110" width="130" height="80"/>
    <rect class="s" fill="#fff"    x="290" y="110" width="130" height="80"/>
    <rect class="s" fill="#0057B7" x="430" y="110" width="130" height="80"/>
    <rect class="s" fill="#fff"    x="570" y="110" width="130" height="80"/>
    <rect class="s" fill="#E4002B" x="710" y="110" width="130" height="80"/>
  </g>
  <text class="n" x="16"  y="14">01</text><text class="t" x="16"  y="44">Why a state</text><text class="t" x="16"  y="62">needs</text><text class="t" x="16"  y="80">administration</text>
  <text class="n" x="156" y="14">02</text><text class="t" x="156" y="44">The three</text><text class="t" x="156" y="62">tiers</text>
  <text class="n" x="296" y="14">03</text><text class="t" x="296" y="44">The centre:</text><text class="t" x="296" y="62">who heads what</text>
  <text class="n" x="436" y="14">04</text><text class="t" x="436" y="44">Province</text><text class="t" x="436" y="62">and district</text>
  <text class="n" x="576" y="14">05</text><text class="t" x="576" y="44">Self-rule</text>
  <text class="n" x="716" y="14">06</text><text class="t" x="716" y="44">Chain of</text><text class="t" x="716" y="62">command</text>
  <text class="n" x="16"  y="104">07</text><text class="t" x="16"  y="134">Legal acts:</text><text class="t" x="16"  y="152">orders and rules</text>
  <text class="n" x="156" y="104">08</text><text class="t" x="156" y="134">Who may</text><text class="t" x="156" y="152">decide</text>
  <text class="n" x="296" y="104">09</text><text class="t" x="296" y="134">Fair</text><text class="t" x="296" y="152">procedure</text>
  <text class="n" x="436" y="104">10</text><text class="t" x="436" y="134">Appeal,</text><text class="t" x="436" y="152">revocation</text>
  <text class="n" x="576" y="104">11</text><text class="t" x="576" y="134">Enforcement</text><text class="t" x="576" y="152">and notice</text>
  <text class="n" x="716" y="104">12</text><text class="t" x="716" y="134">Control and</text><text class="t" x="716" y="152">accountability</text>

  <text x="10" y="225" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14" fill="#111">
    <tspan font-weight="600">Guess first, then the why, then the logic so far.</tspan>
  </text>
  <text x="10" y="248" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" fill="#555">
    Each step adds one idea to a running summary. By step 12 you can rebuild Thai
  </text>
  <text x="10" y="266" font-family="ui-sans-serif,system-ui,sans-serif" font-size="13" fill="#555">
    bureaucratic logic from first principles instead of recalling section numbers.
  </text>
</svg>
```

**Credit, and the "stolen, improved, credited" note.** The topic list and its
habit of asking for numbers and deadlines come from *แนวข้อสอบ พ.ร.บ.วิธีปฏิบัติ
ราชการทางปกครอง พ.ศ. 2539* by ประพันธ์ เวารัมย์. Every question here was
rewritten — **none copied verbatim** — and law texts were checked against Thai
Wikisource. We also corrected errors in that source (listed in
`source/slideshare-2539-INDEX.md`) and added two areas it omits entirely: the
structure of the state, and accountability under the Tort Liability Act 2539
and the Official Information Act 2540.

That is the whole ethic of this project: take the good structure, fix the
errors, and say where it came from.

---

## The psychology, and where I got it

I am not a psychologist and these are not my findings. What follows is what I
read, what I found convincing, and how each one became a specific decision in
the code — including the places where I deliberately did **not** follow it.

| Idea | What it says | What it changed here |
|---|---|---|
| **Testing effect** (retrieval practice) | Pulling something out of memory strengthens it more than putting it in | Every question is a test first. Explanation comes after the attempt, never before |
| **Spacing effect** (Cepeda et al. 2006) | Reviews spread over days beat massed cramming | A missed card returns at 10 minutes, then 1, 3, 7 and 14 days |
| **High utility ranking** (Dunlosky et al. 2013) | Practice testing and spacing are high-utility; rereading and highlighting are low | Highlighting and re-reading were removed from the product entirely |
| **Task-dependent effects** (Carpenter et al. 2022) | Explanation, interleaving and imagery help differently per learner and per task | These are offered, never asserted. The site never claims your outcome |
| **Retrieval before options** | Recalling before choosing beats choosing without recalling | You recall first, then see the options. Skippable — but the default |
| **Desirable difficulty** | A little struggle at the right moment buys a lot of later ease | The full mock gives you no reading first. That friction is the feature |

### What I refused to claim

- The **1/3/7/14-day** schedule is a starting heuristic, not an optimum. Nobody
  has shown it is best for you.
- The app **does not grade** your written explanations. It stores them and shows
  them back to you. A machine pretending to mark reasoning it cannot assess is a
  worse teacher than silence.
- There is **no AI coach** here. No model is grading you, tracking your
  politics, or deciding what you should believe. Everything runs in your
  browser. This is adaptive retrieval practice — not a trained system and not a
  claim about your opinions.
- **This site's own effect on your score is untested.** I have not run a
  controlled study. What I have is reasoning and a test suite.

---

## How I learned this stuff myself

Not in a classroom. I am a consultant — I work with clients on strategy and
organisations, not on law — and everything here came from being curious in the
wrong order.

I learned most of it the way I learned most things: badly first, then
correctly. I read the constitution once, highlighted heavily, and scored worse
than the person who had simply done past papers for three weeks. That gap was
embarrassing enough to be interesting. If effort felt like progress but produced
nothing, then effort was not the mechanism, and I needed to find what was.

So I went and read the actual literature. Not because I enjoy it — because the
cost of being wrong for four months is much higher than the cost of a
uncomfortable afternoon with a paper. Retrieval practice, spacing, desirable
difficulty: once I saw the effects were real and large, "just reread the notes"
stopped being a defensible way to study.

Some of it came from elsewhere. I have always learned systems rather than
facts — you cannot admire Championship Manager or play a football game for
twenty-five years without noticing that they are entirely about acquisition,
scouting and probability rather than talent. Watching a good side win a match
they should have lost teaches the same lesson as a paper: what did they know
that their opponent did not, and how did they know it in time? That is exactly
the exam question. Which organisation can do something, and who is allowed to
authorise it?

I also learned from failing at this. My first version of this site was a
flashcard pile, because flashcards are what I had always used, and it did not
work. It was replaced because the data was against it, not because it looked
wrong. I would rather delete a feature I liked than keep a feature I could not
defend.

### What I still get wrong

I am a consultant writing about law. I have read the text carefully and I have
had every chapter checked against the Thai original by people who did not work
for me. But **this is not legal advice, it is not an official syllabus, and a
typo in a legal system is a much worse thing than a typo in a menu.** Every
page carries its source and its date. Check it. If it disagrees with the
Gazette, the Gazette wins — and please tell me.

---

## How it is built

Next.js, statically exported, served from a Cloudflare Worker. No backend, no
accounts, no analytics, no tracking. It installs to the home screen and works
with the network off.

```
app/          routes — every page is static HTML
components/   the interactive surfaces
lib/          corpus access, learning model, navigation
data/         the constitution, the questions, the guide — all plain JSON
scripts/      validators, build steps, and the release gate
tests/        164 tests: corpus, questions, translations, cases, UI
```

Two design rules that are enforced, not just intended:

**Every number must be proved by the text.** A test walks all 41 cram-sheet
entries and asserts each one quotes a phrase that actually appears in the Thai
of the section it cites. If a deadline is wrong, the build stops.

**Every claim keeps its source.** Figures and news carry a source and a
retrieved date. Where sources disagree, the page says they disagree rather
than picking the convenient one.

### The release gate

Shipping is not "it compiled":

```bash
npm run release   # validate → test → build → generated-file drift → links, colour, contrast
```

- **Generated-file drift** — the build regenerates four `data/*.json` files that
  are committed so the site can import them. If they no longer match a fresh
  build, the commit shipped a stale index.
- **Link integrity** — every internal link in every built page, plus the
  sitemap and all three podcast feeds, must resolve.
- **Undefined colour tokens** — `var(--x)` that no theme defines silently falls
  back, which is how the cram sheet once sat at 2.47:1 in dark mode.
- **Contrast by WCAG class** — text 4.5:1, component boundaries 3:1,
  decorative hairlines reported but not failed. One flat bar produces false
  failures on borders and misses real text.
- **Redirect routes are declared, not guessed** — a forwarder passes every
  existence check while being useless to index, so `REDIRECT_ROUTES` in
  `lib/nav.ts` states which ones they are and the gate fails if one is
  advertised.

---

## Run it yourself

```bash
git clone https://github.com/Nonarkara/constitution.git
cd constitution
npm ci
npm run dev        # http://localhost:3000
npm run release    # the full gate
```

Requires Node 24+. No API keys, no database, no accounts.

---

## Licence and credit

The code is released under the **MIT License** — see [LICENSE](LICENSE).

The Constitution itself is a public document; the Thai text is authoritative
and the English translation is the Council of State's, with study corrections
noted on each page. The Chinese is a study translation and is marked as such.

The section recordings are synthetic, generated locally from the Thai text and
checksummed against it. They are not recordings of the Council of State Senate
audio, which is linked separately and retained under its own terms.

Ponklong's topic structure is credited to ประพันธ์ เวารัมย์'s 2539 exam
material as described above: rewritten, corrected, and attributed.

Research citations: [Dunlosky et al. 2013](https://www.psychologicalscience.org/publications/journals/pspi/learning-techniques.html) ·
[Cepeda et al. 2006](https://www.psychologicalscience.org/publications/journals/pspi/spacing.pdf) ·
[Carpenter et al. 2022](https://www.nature.com/articles/s44159-022-00089-1)

---

<div align="center">

**Good luck. Get it wrong the first time — that is the part that works.**

Built by [Dr. Non Arkaraprasertkul](https://constitution.nonarkara.org/research) and a small
number of agents that were told to check him.

</div>