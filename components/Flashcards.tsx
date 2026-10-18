"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStudy } from "./Provider";
import questions from "@/data/questions.json";
import { sections, chapters, readingText } from "@/lib/corpus";
import { tr, sectionLabel, type Lang } from "@/lib/i18n";
import { analyzeUserLearning } from "@/lib/adaptive";

type FlashcardItem = {
  id: string;
  chapter: number;
  sections: number[];
  front: { th: string; en: string; zh: string };
  backLaw: { th: string; en: string; zh: string };
  formula?: { th: string; en: string; zh: string };
  mnemonic?: { th: string; en: string; zh: string };
  isCustomNote?: boolean;
};

export function Flashcards() {
  const { lang, progress, annotations, examTarget } = useStudy();
  const searchParams = useSearchParams();

  // If URL has ?sec=26, jump or filter to that section
  const querySec = Number(searchParams.get("sec"));

  const [deckType, setDeckType] = useState<"all" | "annotated" | "weak">(() => {
    if (querySec && annotations[querySec]) return "annotated";
    return "all";
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<string>>(new Set());
  const [needReviewCards, setNeedReviewCards] = useState<Set<string>>(new Set());

  // Run adaptive analysis to find user weakness & personalized recommendations
  const profile = useMemo(() => {
    return analyzeUserLearning(questions, progress, annotations, examTarget);
  }, [progress, annotations, examTarget]);

  // Construct card deck based on deckType
  const fullDeck: FlashcardItem[] = useMemo(() => {
    if (deckType === "annotated") {
      const annotatedSecNums = Object.keys(annotations)
        .map(Number)
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 279);

      if (annotatedSecNums.length === 0) return [];

      return annotatedSecNums.map((secNum) => {
        const sec = sections.find((s) => s.number === secNum)!;
        const note = annotations[secNum]?.note ?? "";
        return {
          id: `ann-${secNum}`,
          chapter: sec.chapter,
          sections: [secNum],
          front: {
            th: `บันทึกช่วยจำมาตรา ${secNum}: สาระสำคัญและข้อสังเกต`,
            en: `Annotated Section ${secNum}: Key Concept & Notes`,
            zh: `第${secNum}条学习笔记：核心概念与重点`,
          },
          backLaw: {
            th: sec.th,
            en: readingText(secNum, "en"),
            zh: readingText(secNum, "zh"),
          },
          mnemonic: {
            th: note || "ยังไม่ได้พิมพ์บันทึกย่อ (แตะเปิดสมุดคู่หน้าเพื่อเพิ่มโน้ต)",
            en: note || "No personal notes yet (open the notebook spread to add notes)",
            zh: note || "暂无个人笔记（可打开双页开本添加笔记）",
          },
          isCustomNote: true,
        };
      });
    }

    if (deckType === "weak") {
      const weakChs = new Set(profile.weakestChapters);
      const filteredQ = questions.filter((q) => weakChs.has(q.chapter));
      return filteredQ.map((q) => {
        const primarySec = q.sections[0];
        const secObj = sections.find((s) => s.number === primarySec);
        return {
          id: q.id,
          chapter: q.chapter,
          sections: q.sections,
          front: q.prompt,
          backLaw: {
            th: secObj?.th ?? "",
            en: secObj ? readingText(secObj.number, "en") : "",
            zh: secObj ? readingText(secObj.number, "zh") : "",
          },
          formula: q.explanation,
        };
      });
    }

    // Default: All high-yield questions
    return questions.map((q) => {
      const primarySec = q.sections[0];
      const secObj = sections.find((s) => s.number === primarySec);
      return {
        id: q.id,
        chapter: q.chapter,
        sections: q.sections,
        front: q.prompt,
        backLaw: {
          th: secObj?.th ?? "",
          en: secObj ? readingText(secObj.number, "en") : "",
          zh: secObj ? readingText(secObj.number, "zh") : "",
        },
        formula: q.explanation,
      };
    });
  }, [deckType, annotations, profile.weakestChapters]);

  // "Practise s.N" links here with ?sec=N: show that section's cards, with a way back to all.
  const [focus, setFocus] = useState(() => (Number.isInteger(querySec) && querySec >= 1 && querySec <= 279 ? querySec : 0));
  const focused = focus ? fullDeck.filter((card) => card.sections.includes(focus)) : [];
  const deck = focused.length ? focused : fullDeck;

  const currentCard = deck[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(deck.length - 1);
    }
  };

  const markMastered = () => {
    if (!currentCard) return;
    setMasteredCards((prev) => new Set(prev).add(currentCard.id));
    setNeedReviewCards((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const markNeedReview = () => {
    if (!currentCard) return;
    setNeedReviewCards((prev) => new Set(prev).add(currentCard.id));
    setMasteredCards((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const cardChapter = chapters.find((c) => c.number === currentCard?.chapter);

  return (
    <div className="flashcards-page">

      <header className="intro">
        <div className="intro-copy">
          <h1>
            {tr(
              lang,
              "นึกก่อน\nแล้วค่อยพลิก",
              "Recall first,\nthen flip.",
              "先回想，\n再翻面。",
            )}
          </h1>
          <p>
            {tr(
              lang,
              "ลองนึกหลักของมาตราให้ได้ก่อนพลิกดูคำตอบ สำรับหนึ่งมาจากหมวดที่คุณยังพลาด อีกสำรับมาจากโน้ตที่คุณจดเอง",
              "Try to recall the rule before you turn the card. One deck comes from chapters you still miss; another from the notes you wrote.",
              "翻面前先试着回想条文要点。一组来自你仍常出错的章节，另一组来自你自己写的笔记。",
            )}
          </p>
        </div>
      </header>

      {/* Adaptive Recommendation Pill */}
      <section className="adaptive-profile-card">
        <div className="adaptive-head">
          <span className="mono font-bold">
            {tr(lang, "ระบบแนะนำเฉพาะคุณ", "For you", "为你推荐")}
          </span>
        </div>
        <p className="adaptive-text">{profile.recommendation[lang]}</p>
      </section>

      {focused.length > 0 && (
        <p className="notice" role="status">
          {tr(lang, `การ์ดของมาตรา ${focus} · ${focused.length} ใบ`, `Cards for section ${focus} · ${focused.length}`, `第${focus}条的卡片 · ${focused.length}张`)}{" "}
          <button className="text-button" onClick={() => { setFocus(0); setCurrentIndex(0); setIsFlipped(false); }}>
            {tr(lang, "ดูการ์ดทั้งหมด", "Show all cards", "显示全部卡片")}
          </button>
        </p>
      )}

      {/* Deck Selector Tabs */}
      <nav
        className="flow-tabs flashcard-deck-tabs"
        aria-label={tr(lang, "เลือกสำรับ", "Choose a deck", "选择卡组")}
      >
        <button
          aria-pressed={deckType === "all"}
          onClick={() => {
            setDeckType("all");
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
        >
          <span className="mono">{questions.length}</span>
          {tr(lang, "ข้อฝึกทั้งหมด", "All practice questions", "全部练习题")}
        </button>

        <button
          aria-pressed={deckType === "annotated"}
          onClick={() => {
            setDeckType("annotated");
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
        >
          <span className="mono">{profile.annotatedSectionsCount}</span>
          {tr(lang, "บันทึกและไฮไลต์ของฉัน", "My Annotated Deck", "我的笔记与高亮卡")}
        </button>

        <button
          aria-pressed={deckType === "weak"}
          onClick={() => {
            setDeckType("weak");
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
        >
          <span className="mono">{profile.weakestChapters.length}</span>
          {tr(lang, "หมวดที่ต้องเสริมจุดอ่อน", "Weak Chapters Deck", "攻克薄弱章节卡")}
        </button>
      </nav>

      {/* The Flashcard Arena */}
      {deck.length === 0 ? (
        <div className="empty-deck-notice">
          <h3>
            {tr(
              lang,
              "ยังไม่มีการ์ดในสำรับนี้",
              "No cards in this deck yet",
              "当前卡包暂无卡片",
            )}
          </h3>
          <p className="micro">
            {deckType === "annotated"
              ? tr(
                  lang,
                  "เปิดหน้า 'สมุดคู่หน้า 279 มาตรา' เพื่อเริ่มไฮไลต์หรือจดบันทึกย่อ แล้วการ์ดของคุณจะปรากฏที่นี่ทันที",
                  "Open the Double-Page Notebook to highlight or annotate sections. Your cards will appear here immediately.",
                  "打开“双页开本宪法全书”开始高亮或记录边注，您的定制闪卡将即刻出现在此处。",
                )
              : tr(
                  lang,
                  "ยังไม่มีหมวดที่พลาดซ้ำ ลองสำรับทั้งหมดแทน",
                  "No chapter you keep missing. Try the full deck instead.",
                  "没有反复出错的章节。试试全部卡组。",
                )}
          </p>
          <Link href="/notebook/" className="primary inline-block">
            {tr(lang, "ไปเปิดสมุดคู่หน้าเพื่อจดโน้ต", "Open Notebook Spread", "前往双页开本")} →
          </Link>
        </div>
      ) : (
        <section className="flashcard-arena">
          <div className="flashcard-meta-bar micro">
            <span className="mono">
              {tr(
                lang,
                `ใบที่ ${currentIndex + 1} / ${deck.length}`,
                `Card ${currentIndex + 1} / ${deck.length}`,
                `第 ${currentIndex + 1} / ${deck.length} 张`,
              )}
            </span>
            <span>
              {masteredCards.size} {tr(lang, "จำได้แล้ว", "Mastered", "已掌握")} ·{" "}
              {needReviewCards.size} {tr(lang, "ต้องทวนซ้ำ", "Needs Review", "需复习")}
            </span>
          </div>

          <progress
            value={currentIndex + 1}
            max={deck.length}
            className="flashcard-progress"
            aria-label={tr(lang, "ความคืบหน้าการ์ด", "Card progress", "闪卡进度")}
          />

          {/* THE FLIPPABLE CARD */}
          <div
            className={`flashcard-3d ${isFlipped ? "flipped" : ""}`}
            onClick={() => setIsFlipped((prev) => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsFlipped((prev) => !prev);
              }
            }}
            aria-label={tr(
              lang,
              "การ์ดความจำ กดเว้นวรรคหรือ Enter เพื่อพลิก",
              "Flashcard. Press space or enter to flip.",
              "记忆闪卡。按空格或回车翻转。",
            )}
          >
            <div className="flashcard-inner">
              {/* CARD FRONT */}
              <div className="flashcard-face card-front" aria-hidden={isFlipped}>
                <div className="card-top-row">
                  <span className="mono card-ch-tag">
                    {cardChapter?.number === 17
                      ? "TRANSITORY"
                      : `CH ${cardChapter?.number}`}
                  </span>
                  <div className="card-sec-tags">
                    {currentCard.sections.map((n) => (
                      <span className="mono sec-pill" key={n}>
                        {sectionLabel(lang, n)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="card-body-prompt">
                  <h2>{currentCard.front[lang]}</h2>
                </div>

                <div className="card-tap-hint micro mono">
                  ↻ {tr(lang, "แตะเพื่อดูเฉลยและตัวบท", "Tap to flip & reveal law", "点击翻转查看条文与解析")}
                </div>
              </div>

              {/* CARD BACK */}
              {/* backface-visibility only hides pixels, not the accessibility
                  tree, so without this a screen reader reads the answer before
                  the card is ever flipped — which is the one thing this page
                  exists to prevent ("นึกก่อน แล้วค่อยพลิก"). */}
              <div className="flashcard-face card-back" aria-hidden={!isFlipped}>
                <div className="card-top-row">
                  <span className="mono card-ch-tag font-bold">
                    REVEALED · {cardChapter?.title[lang]}
                  </span>
                  <span className="mono micro">
                    {currentCard.sections.map((n) => sectionLabel(lang, n)).join(" · ")}
                  </span>
                </div>

                <div className="card-back-scroll">
                  {/* Verbatim Law */}
                  <div className="back-law-excerpt">
                    <span className="mono micro text-accent">
                      {tr(lang, "ตัวบท", "The text", "原文")}
                    </span>
                    <p lang="th" className="law-text-compact">
                      {currentCard.backLaw.th}
                    </p>
                  </div>

                  {/* Formula / Explanation */}
                  {currentCard.formula && (
                    <div className="back-formula-box micro">
                      <span className="mono font-bold">
                        {tr(lang, "เหตุผล", "Why", "为什么")}
                      </span>
                      <p>{currentCard.formula[lang]}</p>
                    </div>
                  )}

                  {/* User Personal Margin Note */}
                  {currentCard.sections.some((s) => annotations[s]?.note) && (
                    <div className="user-note-callout micro">
                      <span className="mono font-bold text-accent">
                        {tr(lang, "บันทึกช่วยจำของคุณ", "Your note", "你的笔记")}
                      </span>
                      <p>
                        {currentCard.sections
                          .map((s) => annotations[s]?.note)
                          .filter(Boolean)
                          .join("\n")}
                      </p>
                    </div>
                  )}

                  {/* Direct Link to Open in Notebook Spread */}
                  <div className="card-links-row micro">
                    <Link
                      href={`/notebook/?jump=${currentCard.sections[0]}`}
                      className="link-underlined"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {tr(lang, "เปิดในสมุดคู่หน้า →", "Open in Notebook Spread →", "在双页开本中阅读 →")}
                    </Link>
                  </div>
                </div>

                <div className="card-tap-hint micro mono">
                  ↻ {tr(lang, "แตะเพื่อกลับหน้าคำถาม", "Tap to flip back", "点击翻回正面")}
                </div>
              </div>
            </div>
          </div>

          {/* User Self-Rating Controls */}
          <div className="flashcard-rating-actions">
            <button className="rating-btn btn-wrong" onClick={markNeedReview}>
              {tr(lang, "ยังจำไม่ได้", "Need review", "还需强化")}
            </button>
            <button
              className="rating-btn btn-flip"
              onClick={() => setIsFlipped((prev) => !prev)}
            >
              ↻ {isFlipped ? tr(lang, "คำถาม", "Prompt", "正面") : tr(lang, "เฉลย", "Answer", "背面")}
            </button>
            <button className="rating-btn btn-right primary" onClick={markMastered}>
              {tr(lang, "จำได้แม่นยำ", "Mastered", "已掌握")}
            </button>
          </div>

          {/* Stepper Arrows */}
          <div className="flashcard-step-nav">
            <button onClick={handlePrev} className="micro">
              ← {tr(lang, "ใบก่อนหน้า", "Previous", "上一张")}
            </button>
            <button onClick={handleNext} className="micro">
              {tr(lang, "อีกใบ", "Another card", "再看一张")} →
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
