"use client";
import { useEffect, useMemo, useState } from "react";
import seed from "@/data/news.json";
import outline from "@/data/outline.json";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import { StudyArt } from "./StudyArt";
import { PageAction } from "./PageAction";
import { palaceFor } from "@/lib/palace";
import { citeFor, newsHomes } from "@/lib/news-palace";
import {
  filterHeadlines,
  parseNewsSnapshot,
  topicCounts,
  type NewsSnapshot,
} from "@/lib/news";
export function NewsDesk() {
  const { lang, online } = useStudy();
  const [snapshot, setSnapshot] = useState<NewsSnapshot>(seed as NewsSnapshot),
    [status, setStatus] = useState<"snapshot" | "loading" | "live" | "error">(
      "snapshot",
    );
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
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
  // THE COUNTS ARE THE LIST'S OWN COUNTS.
  //
  // The number beside a topic used to be the count of distinct headlines in
  // the edition's last seven days, while the filter below ran over the
  // whole snapshot. One screen, one list, two numbers: tapping "รัฐสภา"
  // left the map saying 34 while the list head said 58, and neither number
  // could be checked against the other. The count is now the count of the
  // rows the reader will see, narrowed by the same search word, so the map
  // and the list head are the same number at every moment.
  //
  // The counts are of the edition being read, not of the wall clock: an
  // edition that ages does not empty itself, and the shape of the page is
  // the shape of the edition.
  const all = useMemo(
    () =>
      [...snapshot.headlines].sort((a, b) =>
        (b.publishedAt || "").localeCompare(a.publishedAt || ""),
      ),
    [snapshot.headlines],
  );
  const counts = useMemo(() => topicCounts(all, query), [all, query]);
  // The rows the reader sees. The list head counts exactly these, and the
  // map's number for the chosen topic counts exactly these too.
  const shown = filterHeadlines(all, topic, query);
  // The busiest topic is set in ink. Every topic carrying the most
  // headlines wears the heavier weight, so a tie is a tie in ink as well.
  const max = counts[0]?.count ?? 0;
  // The one story this desk exists for: the newest headline of the edition,
  // or the newest one that survives the reader's own filter.
  const newest = shown[0];
  const filtering = topic !== "all" || query.trim() !== "";
  return (
    <div className="news-desk">
      {/* Keep the publisher headline and opening action together. The small
          illustration cues the page; the study guide follows the story. */}
      <div className="bulletin-heading">
        <div className="intro-copy intro-copy--map">
          {/* The drawing is written before the text on purpose: on a narrow
              band it floats at the title's top right, and a float can only be
              placed where it is written. The drawing is decorative
              (aria-hidden), so the reading order is unchanged. */}
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
          {/* One thing to do. Two hundred headlines used to sit here with
              equal weight, so nothing led. The newest story opens the door;
              the rest of the headlines stay a quiet list under it.

              It stands in the band with the title, in the title's column, so
              the band is filled with what the page is for and the drawing
              beside it can be as tall as the whole band. */}
          {newest ? (
            <PageAction
              subject={<span lang="th">{newest.title}</span>}
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
          {/* These are keyword-based study suggestions, not classifications
              of each publisher’s article. Counts use the same rows/search as
              the headline list; nearby room links lead to pictures and recall. */}
          <nav className="news-map" aria-labelledby="news-map-title">
            <div className="news-map-head">
              <h2 id="news-map-title">
                {tr(
                  lang,
                  "หัวข้อข่าวกับจุดเริ่มอ่านในบ้านความจำ",
                  "Suggested study rooms for these news topics",
                  "这些新闻主题的建议学习房间",
                )}
              </h2>
              <p className="micro">
                {tr(
                  lang,
                  "คำสำคัญช่วยแนะนำจุดเริ่มอ่าน ไม่ใช่ข้อวินิจฉัยกฎหมาย · แตะหัวข้อเพื่อกรองข่าว",
                  "Keyword study suggestions, not legal classifications. Tap a topic to filter.",
                  "关键词仅提示学习起点，并非法律定性。点按主题筛选标题。",
                )}
              </p>
            </div>
            <ul className="news-map-list">
              {counts.map((t) => {
                const home = newsHomes[t.id];
                const room = home ? palaceFor(home.chapter) : null;
                // The busiest topic is set in ink. The weight is inline
                // because the stylesheet is not this file's to change; a
                // rule in the .news-map block may take it over.
                const lead = t.count === max;
                return (
                  <li key={t.id} className="news-map-row">
                    <button
                      type="button"
                      aria-pressed={topic === t.id}
                      onClick={() => setTopic(topic === t.id ? "all" : t.id)}
                    >
                      <span
                        className="news-map-topic"
                        style={lead ? { fontWeight: 700 } : undefined}
                      >
                        {t[lang]}
                      </span>
                      <span
                        className="news-map-count mono"
                        style={lead ? { color: "var(--ink)" } : undefined}
                      >
                        {t.count}
                      </span>
                    </button>
                    {home ? (
                      <span className="news-map-cue">
                        <span className="news-map-subject">
                          {home.short[lang]}
                        </span>
                        <span className="news-map-sections mono">
                          {citeFor(home, outline.chapters)}
                        </span>
                      </span>
                    ) : null}
                    {room ? (
                      <a className="news-map-room" href={`/memory#room-${room.chapter}`}>
                        {tr(lang, `ห้อง ${room.chapter}`, `Room ${room.chapter}`, `第 ${room.chapter} 间`)}
                        <span aria-hidden="true">→</span>
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {topic !== "all" ? (
              <button
                type="button"
                className="text-button news-map-clear"
                onClick={() => setTopic("all")}
              >
                {tr(lang, "ดูทุกเรื่อง", "Show all topics", "显示全部主题")}
              </button>
            ) : null}
          </nav>
        </div>
      </div>
      <div className="news-status" role="status">
        <span className="news-status-state">
          {status === "loading"
            ? tr(
                lang,
                "กำลังโหลดข่าว…",
                "Loading headlines…",
                "正在加载新闻标题…",
              )
            : status === "live"
              ? tr(
                  lang,
                  "แสดงข่าวที่รับได้",
                  "Headlines loaded",
                  "新闻标题已加载",
                )
              : tr(
                  lang,
                  "แสดงฉบับข่าวที่เก็บไว้",
                  "Showing saved headlines",
                  "正在显示已保存的新闻标题",
                )}
          <span className="news-status-time micro">
            {" · "}
            {tr(lang, "เก็บสำเร็จล่าสุด", "Last harvest", "最近成功采集")}
            {" "}
            {snapshot.sources.some((s) => s.lastSuccess)
              ? date(
                  snapshot.sources
                    .map((s) => s.lastSuccess || "")
                    .sort()
                    .at(-1) || null,
                )
              : tr(lang, "ยังไม่มี", "none yet", "尚无")}
          </span>
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
            "ยังรับข่าวล่าสุดไม่ได้ ลองอ่านฉบับที่เก็บไว้ก่อน และตรวจวันเวลาข่าวด้านล่าง",
            "Latest headlines are unavailable. You can still read the saved edition; check the dates below.",
            "暂时无法获取最新标题，仍可阅读已保存版本。请留意下方日期。",
          )}
        </p>
      )}

      {/* THE LIST HEAD. What is listed, and the one way to narrow it.
          The search box used to stand in a bar of its own, 992px wide with a
          320px field in it, and the count of the headlines below it stood
          alone on a line of its own — two pieces of information about the
          same list, saying the same thing in two places. They are one row
          now: the count on the left, the field that filters the list on the
          right.

          The topic filter used to exist twice as well: a <select> in this
          bar and a cloud of chips three screens below it, at the bottom of a
          long list of headlines. Both set the same state, so a reader could
          not tell which one was live, and the chips broke wherever the width
          ran out — at nine widths between 436 and 722 they left one chip
          alone on the last row with 380px of nothing beside it. There is now
          ONE topic control: the map in the band above. One topic per row
          cannot break — a row has nothing to run out of.

          The count is the count of the rows below it: the same filter, the
          same edition. With a topic chosen it is the number the map shows
          beside that topic, so the two figures on one screen are one
          figure. */}
      <div className="news-list-head">
        <p className="news-list-count" aria-live="polite">
          <span className="mono">{shown.length}</span>{" "}
          {tr(lang, "หัวข่าว", "headlines", "条标题")}
        </p>
        <label className="news-search">
          <span className="news-search-label">
            {tr(lang, "ค้น", "Search", "搜索")}
          </span>
          <input
            type="search"
            value={query}
            placeholder={tr(
              lang,
              "พิมพ์คำในหัวข่าว เช่น รัฐธรรมนูญ",
              "Type a word in a headline, e.g. constitution",
              "输入标题中的词语，例如 宪法",
            )}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
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
            "ไม่มีข่าวตรงตัวกรอง ลองทุกเรื่องหรือคำอื่น",
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
            "หัวข้อที่พบเรียงตามจำนวนข่าว หัวข้อที่มีจำนวนข่าวสูงสุดเข้มกว่าหัวข้ออื่น ตัวเลขข้างชื่อคือจำนวนหัวข่าวที่จะเห็นเมื่อแตะหัวข้อนั้น ไม่ใช่ความนิยม ความเห็นประชาชน หรือจำนวนเหตุการณ์ ข่าวหนึ่งเรื่องอาจแตะได้หลายหัวข้อ ตัวเลขจึงไม่รวมกันเป็นยอดข่าวทั้งหมด",
            "Topics are listed in order of how many headlines they carry, and those with the most headlines are set in ink. The number beside each name is the number of headlines you will see when you tap that topic — not popularity, public opinion or event counts. One story can touch more than one topic, so the numbers do not add up to the whole list.",
            "主题按所含标题数量排列，数量最多的主题以深色显示。名称旁的数字是点按该主题时会看到的标题数，不代表热度、民意或事件数量。一条报道可能触及多个主题，因此各数字之和不等于列表总数。",
          )}
        </p>
        <p className="micro">
          {tr(
            lang,
            "หัวข้อจัดจากคำสำคัญกว้าง ๆ ลิงก์มาตราและห้องเป็นจุดเริ่มอ่านที่แนะนำ ไม่ใช่ข้อวินิจฉัยทางกฎหมายของแต่ละข่าว ข่าวหนึ่งอาจเกี่ยวกับหมวดหรือกฎหมายอื่นด้วย เปิดห้องเพื่อดูภาพ ตัวช่วยจำ และคำถาม",
            "Topics come from broad keyword matches. The section and room links are suggested study starting points, not a legal classification of each article. A story may involve other chapters or laws. Open a room for its picture, mnemonic and question.",
            "主题按宽泛关键词匹配。条文和房间链接是建议的学习起点，并非对每篇报道的法律定性。一则报道也可能涉及其他章节或法律。打开房间可查看插图、记忆提示和问题。",
          )}
        </p>
        <p className="micro">
          {tr(
            lang,
            "บ้านความจำมีสิบหกห้องตามหมวด 1–16 ส่วนบทเฉพาะกาล (มาตรา 262–279) แยกต่างหาก และยังไม่มีห้องในบ้านความจำ",
            "The memory house has sixteen rooms, one for each numbered chapter. The separate Transitory Provisions (sections 262–279) have no room yet.",
            "记忆屋的十六间房对应宪法的十六个编号章节。另列的过渡条款（第262–279条）尚无房间。",
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
          {date(snapshot.generatedAt)} ·{" "}
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
