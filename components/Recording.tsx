"use client";
import { useEffect, useRef, useState } from "react";
import { tr, type Lang } from "@/lib/i18n";
import { playback } from "@/lib/playback";
import { workerMessage } from "@/lib/offline";
export function Recording({ section, lang }: { section: number; lang: Lang }) {
  const audio = useRef<HTMLAudioElement>(null),
    owner = useRef(Symbol("recording"));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
      "idle",
    ),
    [failed, setFailed] = useState(false);
  const url = `/audio/${lang}/${String(section).padStart(3, "0")}.mp3`;
  const resource = useRef(url), request = useRef(0);
  resource.current = url;
  useEffect(() => {
    request.current += 1;
    setStatus("idle");
    setFailed(false);
    return () => {
      request.current += 1;
      playback().stop(owner.current);
    };
  }, [section, lang]);
  const saveOffline = async () => {
    const id = ++request.current;
    const current = () => id === request.current && resource.current === url;
    setStatus("saving");
    try {
      if (!("serviceWorker" in navigator)) throw Error("unsupported");
      const worker =
        navigator.serviceWorker.controller ??
        (await navigator.serviceWorker.getRegistration())?.active;
      if (!worker) throw Error("not ready");
      const result = await workerMessage<{ ok: boolean }>(
        worker,
        { type: "SAVE_AUDIO", url },
        120000,
      );
      if (current()) setStatus(result.ok ? "saved" : "error");
    } catch {
      if (current()) setStatus("error");
    }
  };
  return (
    <div className="recorded-audio">
      <span className="micro">
        {tr(lang, "เสียงอ่านมาตรานี้", "Recorded section reading", "本条录音")}
      </span>
      <audio
        ref={audio}
        src={url}
        controls
        preload="none"
        aria-label={tr(
          lang,
          `ฟังมาตรา ${section}`,
          `Listen to section ${section}`,
          `收听第${section}条`,
        )}
        onPlay={() =>
          playback().take(owner.current, () => audio.current?.pause())
        }
        onEnded={() => playback().release(owner.current)}
        onPause={() => playback().release(owner.current)}
        onError={() => setFailed(true)}
      />
      <div className="audio-actions">
        <a
          className="button"
          href={url}
          download={`constitution-${section}-${lang}.mp3`}
        >
          {tr(lang, "ดาวน์โหลด MP3", "Download MP3", "下载MP3")}
        </a>
        <button
          disabled={status === "saving" || status === "saved"}
          onClick={saveOffline}
        >
          {status === "saving"
            ? tr(lang, "กำลังบันทึก…", "Saving…", "正在保存…")
            : status === "saved"
              ? tr(lang, "บันทึกแล้ว ✓", "Saved ✓", "已保存 ✓")
              : tr(
                  lang,
                  "บันทึกไว้ฟังออฟไลน์",
                  "Save for offline",
                  "保存以便离线收听",
                )}
        </button>
      </div>
      <p className="micro" role="status">
        {failed
          ? tr(
              lang,
              "ไฟล์เสียงเปิดไม่ได้ ลองเชื่อมต่ออินเทอร์เน็ต หรือใช้เสียงจากอุปกรณ์ด้านล่าง",
              "Recording unavailable. Reconnect or use the device voice below.",
              "录音无法打开，请联网重试或使用下方设备语音。",
            )
          : status === "error"
            ? tr(
                lang,
                "ยังบันทึกไม่ได้ เปิดชุดเรียนให้พร้อมออฟไลน์ แล้วลองอีกครั้ง",
                "Could not save. Wait for the offline kit to be ready, then retry.",
                "保存失败，请等待离线内容准备完成后重试。",
              )
            : status === "saved"
              ? tr(
                  lang,
                  "ฟังและเลื่อนตำแหน่งได้เมื่อออฟไลน์",
                  "Available offline, including seeking.",
                  "已可离线播放和拖动进度。",
                )
              : tr(
                  lang,
                  "เสียงสังเคราะห์ที่เตรียมไว้ ไม่ต้องมีเสียงภาษานี้ในอุปกรณ์",
                  "Prepared synthetic recording; no installed device voice required.",
                  "预先生成的合成录音，无需设备安装该语言语音。",
                )}
      </p>
    </div>
  );
}
