"use client";
import { useEffect, useRef, useState } from "react";
import { tr, type Lang } from "@/lib/i18n";
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((e: {
        resultIndex: number;
        results: {
          length: number;
          [i: number]: {
            isFinal: boolean;
            [i: number]: { transcript: string };
          };
        };
      }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};
export function VoiceSearch({
  lang,
  onText,
}: {
  lang: Lang;
  onText: (t: string) => void;
}) {
  const [available, setAvailable] = useState(false),
    [listening, setListening] = useState(false),
    [msg, setMsg] = useState("");
  const recognition = useRef<Recognition | null>(null),
    session = useRef(0);
  const currentLanguage = useRef(lang);
  currentLanguage.current = lang;
  useEffect(() => {
    const w = window as SpeechWindow;
    setAvailable(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => {
      session.current++;
      recognition.current?.abort();
    };
  }, []);
  useEffect(() => {
    session.current++;
    recognition.current?.abort();
    recognition.current = null;
    setListening(false);
    setMsg("");
  }, [lang]);
  const start = () => {
    if (listening) {
      session.current++;
      recognition.current?.abort();
      setListening(false);
      return;
    }
    const w = window as SpeechWindow;
    const R = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!R) return;
    const r = new R();
    const id = ++session.current;
    recognition.current = r;
    r.lang = { th: "th-TH", en: "en-US", zh: "zh-CN" }[lang];
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e) => {
      if (id !== session.current || currentLanguage.current !== lang) return;
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++)
        if (e.results[i].isFinal) t += e.results[i][0].transcript;
      if (t) onText(t.trim());
    };
    r.onerror = (e) => {
      if (id !== session.current || currentLanguage.current !== lang) return;
      setMsg(
        e.error === "not-allowed"
          ? tr(
              lang,
              "ยังไม่ได้อนุญาตไมโครโฟน ใช้การพิมพ์หรือปุ่มพูดบนแป้นพิมพ์ได้",
              "Microphone permission was not granted. Type or use keyboard dictation.",
              "未获得麦克风权限。可打字或使用键盘听写。",
            )
          : tr(
              lang,
              "ฟังไม่สำเร็จ ลองใหม่หรือใช้แป้นพิมพ์",
              "Could not hear a phrase. Try again or use the keyboard.",
              "未能识别，请重试或使用键盘。",
            ),
      );
      setListening(false);
    };
    r.onend = () => {
      if (id === session.current && currentLanguage.current === lang)
        setListening(false);
    };
    try {
      r.start();
      setListening(true);
      setMsg("");
    } catch {
      setListening(false);
      setMsg(
        tr(
          lang,
          "เริ่มไมโครโฟนไม่ได้",
          "Could not start the microphone.",
          "无法启动麦克风。",
        ),
      );
    }
  };
  return (
    <>
      <button
        type="button"
        disabled={!available}
        aria-pressed={listening}
        onClick={start}
      >
        {listening
          ? tr(lang, "■ หยุด", "■ Stop", "■ 停止")
          : tr(lang, "◉ พูดค้นหา", "◉ Speak", "◉ 语音搜索")}
      </button>
      <p className="micro voice-note" role="status">
        {msg ||
          (listening
            ? tr(lang, "กำลังฟัง…", "Listening…", "正在听…")
            : available
              ? tr(
                  lang,
                  "พูดคำค้นหรือเลขมาตรา • เสียงใช้บริการของเบราว์เซอร์",
                  "Say a keyword or section number · Uses the browser’s speech service",
                  "说关键词或条文编号 · 使用浏览器语音服务",
                )
              : tr(
                  lang,
                  "บน iPad ใช้ปุ่มไมโครโฟนบนแป้นพิมพ์เพื่อพูดคำค้นได้",
                  "On iPad, use the keyboard microphone to dictate a search.",
                  "iPad可使用键盘麦克风输入搜索词。",
                ))}
      </p>
    </>
  );
}
