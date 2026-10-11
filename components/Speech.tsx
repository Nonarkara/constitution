"use client";
import { useEffect, useRef, useState } from "react";
import { tr, type Lang } from "@/lib/i18n";
export function Speech({ text, lang }: { text: string; lang: Lang }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]),
    [supported, setSupported] = useState(false),
    [playing, setPlaying] = useState(false),
    [rate, setRate] = useState(0.9),
    [message, setMessage] = useState("");
  const session = useRef(0);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    setSupported(true);
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      session.current++;
      window.speechSynthesis.cancel();
      window.speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);
  useEffect(() => {
    session.current++;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
    setMessage("");
  }, [text, lang]);
  const voice = voices.find((v) =>
    v.lang.toLowerCase().startsWith(lang === "zh" ? "zh" : lang),
  );
  const stop = () => {
    session.current++;
    window.speechSynthesis.cancel();
    setPlaying(false);
  };
  const play = () => {
    if (!voice) {
      setMessage(
        tr(
          lang,
          "ไม่มีเสียงภาษานี้บนอุปกรณ์ ลองใช้เสียงอ่านของวุฒิสภาด้านล่าง",
          "No voice for this language is installed. Try the Senate audio below for Thai.",
          "此设备未安装该语言语音。泰文可使用下方参议院录音。",
        ),
      );
      return;
    }
    stop();
    const id = ++session.current;
    const chunks = text.match(
      /[\s\S]{1,180}(?:\s|[。.!?]|$)|[\s\S]{1,180}/g,
    ) ?? [text];
    let i = 0;
    setPlaying(true);
    setMessage("");
    const speak = () => {
      if (id !== session.current) return;
      if (i >= chunks.length) {
        setPlaying(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[i++]);
      utterance.current = u;
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = rate;
      u.onend = speak;
      u.onerror = (e) => {
        if (id !== session.current) return;
        setPlaying(false);
        if (e.error !== "canceled" && e.error !== "interrupted")
          setMessage(
            tr(
              lang,
              "เล่นเสียงไม่ได้ ลองอีกครั้งหรือใช้ไฟล์เสียงต้นฉบับ",
              "Playback failed. Try again or use the original audio.",
              "朗读失败，请重试或使用原始录音。",
            ),
          );
      };
      window.speechSynthesis.speak(u);
    };
    speak();
  };
  return (
    <div className="speech">
      <div className="speech-controls">
        <button
          disabled={!supported || !voice}
          className={playing ? "primary" : ""}
          onClick={playing ? stop : play}
        >
          {playing
            ? tr(lang, "■ หยุดฟัง", "■ Stop", "■ 停止")
            : tr(
                lang,
                "▷ ฟังข้อความนี้",
                "▷ Listen to this text",
                "▷ 朗读此文本",
              )}
        </button>
        <label className="micro">
          {tr(lang, "ความเร็ว", "Speed", "速度")}{" "}
          <select
            value={rate}
            disabled={playing}
            onChange={(e) => setRate(Number(e.target.value))}
          >
            <option value={0.75}>0.75×</option>
            <option value={0.9}>0.9×</option>
            <option value={1}>1×</option>
            <option value={1.15}>1.15×</option>
          </select>
        </label>
      </div>
      <p className="micro" role="status">
        {message ||
          (!supported
            ? tr(
                lang,
                "เบราว์เซอร์นี้ไม่มีระบบอ่านออกเสียง",
                "This browser has no speech synthesis.",
                "此浏览器不支持语音朗读。",
              )
            : !voice
              ? tr(
                  lang,
                  "อุปกรณ์นี้ยังไม่มีเสียงภาษาที่เลือก",
                  "No installed voice for the selected language.",
                  "此设备未安装所选语言的语音。",
                )
              : tr(
                  lang,
                  "เสียงจากอุปกรณ์ • ต้องเปิดหน้าจอนี้ไว้",
                  "Device voice · Keep this screen open",
                  "设备语音 · 请保持此页面打开",
                ))}
      </p>
    </div>
  );
}
