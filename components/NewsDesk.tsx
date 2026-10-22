"use client";
import { useEffect, useMemo, useState } from "react";
import seed from "@/data/news.json";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
import { PageAction } from "./PageAction";
import {
  headlineTrends,
  parseNewsSnapshot,
  type NewsSnapshot,
} from "@/lib/news";
export function NewsDesk() {
  const { lang, online } = useStudy();
  const [snapshot, setSnapshot] = useState<NewsSnapshot>(seed as NewsSnapshot),
    [status, setStatus] = useState<"snapshot" | "loading" | "live" | "error">(
      "snapshot",
    );
  const [query, setQuery] = useState(""),
    [topic, setTopic] = useState("all");
  const date = (value: string | null) =>
    value
      ? new Intl.DateTimeFormat(
          { th: "th-TH", en: "en-GB", zh: "zh-CN" }[lang],
          { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" },
        ).format(new Date(value))
      : tr(
          lang,
          "แหล่งข่าวไม่ระบุวัน",
          "Publisher date unavailable",
          "来源未注明日期",
        );
  async function refresh(signal?: AbortSignal) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    setStatus("loading");
    try {
      const r = await fetch("/api/news", {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!r.ok) throw Error("Unavailable");
      const value = parseNewsSnapshot(await r.json());
      if (!value) throw Error("Invalid snapshot");
      setSnapshot(value);
      setStatus("live");
    } catch {
      if (!signal?.aborted) setStatus("error");
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, []);
  // The trends are the trends OF THE EDITION being read, not of the wall
  // clock.
  //
  // A snapshot that ages out of a seven-day window would otherwise empty
  // this section by itself: the page's shape would change with the date,
  // the section would vanish a week after the build, and a receipt taken of
  // the page would be true only on the day it was taken. The edition
  // carries its own date, and the week is the week of that edition.
  const trends = headlineTrends(snapshot.headlines, new Date(snapshot.generatedAt)),
    max = trends[0]?.count || 1;
  const all = useMemo(
    () =>
      [...snapshot.headlines].sort((a, b) =>
        (b.publishedAt || "").localeCompare(a.publishedAt || ""),
      ),
    [snapshot.headlines],
  );
  const shown = all.filter(
    (h) =>
      (topic === "all" || h.topics.includes(topic)) &&
      h.title.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim()),
  );
  // The one story this desk exists for: the newest headline of the edition,
  // or the newest one that survives the reader's own filter.
  const newest = shown[0] ?? all[0];
  const filtering = topic !== "all" || query.trim() !== "";
  return (
    <div className="news-desk">
      <div className="bulletin-heading">
        <div className="intro-copy">
          <StudyArt scene="news" />
          <div className="intro-text">
            <h1>
              {tr(
                lang,
                "ข่าวสั้นหนึ่งแก้ว",
                "A small cup of headlines",
                "一小杯新闻标题",
              )}
            </h1>
            <p>
              {tr(
                lang,
                "อ่านหัวข่าว เปิดเรื่องเต็มกับสำนักข่าว",
                "Read a headline. Open the publisher for the story.",
                "读标题，去原媒体看全文。",
              )}
            </p>
          </div>
        </div>
      </div>
      {/* One thing to do. Two hundred headlines used to sit here with equal
          weight, so nothing led. The newest story opens the door; the rest of
          the headlines stay a quiet list under it. */}
      {newest ? (
        <PageAction
          href={newest.url}
          external
          label={tr(lang, "เปิดข่าวใหม่ที่สุด", "Open the newest story", "打开最新报道")}
          reason={
            filtering
              ? tr(
                  lang,
                  `ข่าวใหม่ที่สุดที่ตรงกับตัวกรองของคุณ จาก ${newest.source} (${date(newest.publishedAt)}) — เปิดที่สำนักข่าว`,
                  `The newest story matching your filter, from ${newest.source} (${date(newest.publishedAt)}) — read it at the publisher.`,
                  `符合筛选条件的最新报道，来自${newest.source}（${date(newest.publishedAt)}）——去原媒体阅读。`,
                )
              : tr(
                  lang,
                  `ข่าวใหม่ที่สุดจาก ${newest.source} (${date(newest.publishedAt)}) — เปิดที่สำนักข่าว`,
                  `The newest story from ${newest.source} (${date(newest.publishedAt)}) — read it at the publisher.`,
                  `${newest.source}的最新报道（${date(newest.publishedAt)}）——去原媒体阅读。`,
                )
          }
          kicker={tr(lang, "เริ่มที่นี่", "Start here", "从这里开始")}
        />
      ) : null}
      <div className="news-status" role="status">
        <span>
          {status === "loading"
            ? tr(
                lang,
                "กำลังอ่านฐานข่าว…",
                "Reading the headline database…",
                "正在读取标题数据库…",
              )
            : status === "live"
              ? tr(
                  lang,
                  "อ่านจากฐานข่าวแล้ว",
                  "Loaded from the headline database",
                  "已从标题数据库读取",
                )
              : tr(
                  lang,
                  "แสดงภาพข่าวที่เก็บไว้กับรุ่นนี้",
                  "Showing this edition’s saved news snapshot",
                  "显示本版保存的新闻快照",
                )}
        </span>
        <button
          disabled={!online || status === "loading"}
          onClick={() => void refresh()}
        >
          {tr(lang, "อ่านข้อมูลล่าสุด", "Read latest data", "读取最新数据")}
        </button>
      </div>
      {status === "error" && (
        <p className="notice" role="alert">
          {tr(
            lang,
            "อ่านฐานข่าวไม่ได้ ยังดูภาพข่าวที่บันทึกไว้ได้ วันเวลาแสดงด้านล่าง",
            "The database could not be reached. The saved snapshot remains available with its dates below.",
            "无法连接数据库，仍可查看保存的快照及下方日期。",
          )}
        </p>
      )}
      <p className="micro">
        {tr(
          lang,
          "เก็บสำเร็จล่าสุด",
          "Last successful harvest",
          "最近成功采集",
        )}
        :{" "}
        {snapshot.sources.some((s) => s.lastSuccess)
          ? date(
              snapshot.sources
                .map((s) => s.lastSuccess || "")
                .sort()
                .at(-1) || null,
            )
          : tr(lang, "ยังไม่มี", "None yet", "尚无")}
      </p>

      {/* The filter group. The topic filter used to exist twice: a <select>
          in this bar and a cloud of chips three screens below it, at the
          bottom of a long list of headlines. Both set the same state, so a
          reader could not tell which one was live, and the chips broke
          wherever the width ran out — at nine widths between 436 and 722
          they left one chip alone on the last row with 380px of nothing
          beside it. There is now ONE topic control: a comparison index,
          one topic per row, with this edition's headline count on the
          right. One topic per row cannot break — a row has nothing to run
          out of. The count is the evidence, the order is the ranking. */}
      <div className="news-filters">
        <label>
          {tr(lang, "ค้นในหัวข่าว", "Search headlines", "搜索标题")}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <section className="news-topics" aria-labelledby="topic-title">
        <div className="news-topics-head">
          <h2 id="topic-title">
            {tr(
              lang,
              "เรื่องที่พบใน 7 วันของฉบับนี้",
              "Topics in this edition's seven days",
              "本版七天内的主题",
            )}
          </h2>
          {topic !== "all" ? (
            <button
              type="button"
              className="text-button"
              onClick={() => setTopic("all")}
            >
              {tr(lang, "ดูทุกเรื่อง", "Show all topics", "显示全部主题")}
            </button>
          ) : null}
        </div>
        {trends.length ? (
          <ul className="topic-index">
            {trends.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  aria-pressed={topic === t.id}
                  className={t.count === max ? "lead" : undefined}
                  onClick={() => setTopic(topic === t.id ? "all" : t.id)}
                >
                  <span className="topic-name">{t[lang]}</span>
                  <span className="topic-count mono">{t.count}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="micro">
            {tr(
              lang,
              "ยังไม่มีหัวข่าวที่มีวันเผยแพร่ในช่วงนี้",
              "No dated headlines in this window yet.",
              "此时间范围尚无注明日期的标题。",
            )}
          </p>
        )}
      </section>
      <p className="micro" aria-live="polite">
        {shown.length} {tr(lang, "หัวข่าว", "headlines", "条标题")}
      </p>
      <ol className="headline-list">
        {shown.map((h) => (
          <li key={h.url}>
            <a href={h.url} target="_blank" rel="noopener noreferrer" lang="th">
              {h.title} <span aria-hidden="true">↗</span>
              <span className="sr-only">
                {tr(
                  lang,
                  "เปิดสำนักข่าวในแท็บใหม่",
                  "Open publisher in a new tab",
                  "在新标签打开来源",
                )}
              </span>
            </a>
            <p className="micro">
              {h.source} ·{" "}
              <time dateTime={h.publishedAt || undefined}>
                {date(h.publishedAt)}
              </time>
            </p>
          </li>
        ))}
      </ol>
      {!shown.length && (
        <p className="notice">
          {tr(
            lang,
            "ไม่มีหัวข่าวตรงตัวกรอง ลองทุกเรื่องหรือคำอื่น",
            "No headlines match. Try all topics or another word.",
            "没有匹配标题，可尝试全部主题或其他词。",
          )}
        </p>
      )}
      <details className="feed-provenance">
        <summary>
          {tr(
            lang,
            "แหล่งข่าวและเวลาที่เก็บ",
            "Sources and harvest times",
            "来源与采集时间",
          )}
        </summary>{" "}
        <p className="micro">
          {tr(
            lang,
            "ข่าวเก็บไว้สูงสุด 90 วัน แสดง 200 หัวข่าวล่าสุดที่เข้าเงื่อนไข ไม่ใช่ข่าวทั้งหมดของไทย หัวข่าวคงภาษาต้นฉบับ ไม่แปลหรือสรุปเนื้อหา",
            "Up to 90 days retained; at most 200 matching headlines shown. This is a limited publisher sample, not all Thai news. Headlines retain the publisher’s language; article text is not copied.",
            "保留最多90天，显示最多200条匹配标题。这是有限来源样本，并非全部泰国新闻。标题保留原语言，不复制正文。",
          )}
        </p>
        <p className="micro">
          {tr(
            lang,
            "หัวข้อที่พบเรียงตามจำนวนข่าว เรื่องที่มีข่าวมากที่สุดเข้มกว่าเรื่องอื่น ตัวเลขข้างชื่อคือจำนวนข่าวที่ไม่ซ้ำใน 7 วันของฉบับนี้ ไม่ใช่ความนิยม ความเห็นประชาชน หรือจำนวนเหตุการณ์",
            "Topics are listed in order of how many headlines they carry, and the busiest are set in ink. The number beside each name is the count of distinct headlines in this edition's seven days, not popularity, public opinion or event counts.",
            "主题按所含标题数量排列，数量最多的以深色显示。名称旁的数字是本版七天内的不同标题数量，不代表热度、民意或事件数量。",
          )}
        </p>
        <p>
          {tr(
            lang,
            "เก็บจาก RSS ที่สำนักข่าวเปิดเผย ทุก 6 ชั่วโมง ข่าวเป็นของสำนักข่าว ไม่ใช่การรับรองโดยผู้สร้างชุดเรียน",
            "Publisher RSS feeds are harvested every 6 hours. Headlines are the publishers’ work, not endorsements by this notebook.",
            "每6小时采集媒体公开RSS。标题属于原媒体，本笔记并不为其内容背书。",
          )}
        </p>
        <ul>
          {snapshot.sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.name} ↗
              </a>
              <p className="micro">
                {s.status === "ok"
                  ? tr(lang, "เก็บสำเร็จ", "Harvest succeeded", "采集成功")
                  : tr(
                      lang,
                      "แหล่งข่าวอ่านไม่ได้",
                      "Source unavailable",
                      "来源暂不可用",
                    )}{" "}
                · {tr(lang, "สำเร็จล่าสุด", "Last success", "最近成功")}{" "}
                {s.lastSuccess
                  ? date(s.lastSuccess)
                  : tr(lang, "ยังไม่มี", "None yet", "尚无")}{" "}
                · {s.count}{" "}
                {tr(
                  lang,
                  "หัวข่าวตรงคำในการเก็บครั้งนี้",
                  "matches in this harvest",
                  "本次匹配标题",
                )}
              </p>
            </li>
          ))}
        </ul>
        <p className="micro">
          {tr(lang, "ภาพข้อมูลรุ่นนี้", "Edition snapshot", "本版快照")}:{" "}
          {date(seed.generatedAt)} ·{" "}
          {tr(
            lang,
            "เวลาแสดงเป็นกรุงเทพฯ",
            "Times shown in Bangkok time",
            "时间为曼谷时间",
          )}
        </p>
      </details>
    </div>
  );
}
