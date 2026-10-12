"use client";
import { useState } from "react";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import { questionIndex as questions } from "@/lib/outline";
import { parseProgress } from "@/lib/progress";
import { defaultProgress } from "@/lib/learning";
import { parseMarks } from "@/lib/marks";
import { parseAnnotations } from "@/lib/annotations";
export function Settings() {
  const { lang, progress, save, large, setLarge, offline, marks, saveMarks, annotations, saveAnnotations } = useStudy();
  const [confirm, setConfirm] = useState(false),
    [message, setMessage] = useState("");
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ version: 2, progress, marks, annotations }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "constitution-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <span className="page-kicker mono">MAKE YOURSELF AT HOME</span>
      <h1>
        {tr(
          lang,
          "บนเครื่อง\nของคุณ",
          "Your own\nnotebook.",
          "你的设备，\n你的学习笔记。",
        )}
      </h1>
      <div className="source-card">
        <h2>{tr(lang, "ติดตั้งบน iPad", "Install on iPad", "安装到iPad")}</h2>
        <p>
          {tr(
            lang,
            "เปิดเว็บนี้ใน Safari → แตะปุ่มแชร์ → เพิ่มไปยังหน้าจอโฮม เปิดจากไอคอนเพื่อเรียนแบบเต็มจอ",
            "Open this site in Safari → Share → Add to Home Screen. Open the icon for a full-screen study session.",
            "在Safari打开此网站 → 分享 → 添加到主屏幕。点击图标即可全屏学习。",
          )}
        </p>
        <p className="micro">
          {tr(
            lang,
            "เมื่อสถานะด้านล่างพร้อมแล้ว จะอ่าน ค้น และฝึกตอบได้ออฟไลน์ เสียงที่เลือกบันทึกไว้จะฟังได้ออฟไลน์ด้วย ส่วนเสียงวุฒิสภาและการพูดค้นหาอาจต้องใช้อินเทอร์เน็ต",
            "Once the status below is ready, reading, search and practice work offline. Audio saved for offline use works too. Senate recordings and browser voice search may need internet access.",
            "下方显示准备完成后，可离线阅读、搜索和练习。保存到离线的录音也可播放。参议院录音及浏览器语音搜索可能需要网络。",
          )}
        </p>
      </div>
      <p className="notice" role="status">
        {offline === "ready"
          ? tr(
              lang,
              "พร้อมเรียนออฟไลน์แล้ว",
              "Ready for offline study",
              "已准备好离线学习",
            )
          : offline === "loading"
            ? tr(
                lang,
                "กำลังบันทึกชุดเรียนไว้บนเครื่อง…",
                "Saving the study kit on this device…",
                "正在将学习内容保存到设备…",
              )
            : tr(
                lang,
                "ยังไม่ได้บันทึกชุดเรียนออฟไลน์ ลองเปิดเว็บขณะมีอินเทอร์เน็ตอีกครั้ง",
                "Offline kit is not saved yet. Reopen while connected to try again.",
                "离线内容尚未保存，请联网重新打开网站。",
              )}
      </p>
      <div className="source-card">
        <h2>
          {tr(lang, "อ่านสบายขึ้น", "Read more comfortably", "更舒适地阅读")}
        </h2>
        <label className="setting-label">
          <input
            type="checkbox"
            checked={large}
            onChange={(e) => setLarge(e.target.checked)}
          />
          {tr(lang, "ตัวอักษรใหญ่", "Larger text", "大字模式")}
        </label>
        <p>
          {tr(
            lang,
            "พูดค้นหาได้จากช่องค้นมาตรา บน iPad ใช้ปุ่มไมโครโฟนของแป้นพิมพ์ได้ด้วย",
            "Speak into section search. On iPad, you can also use the keyboard microphone.",
            "在条文搜索中使用语音，也可使用iPad键盘麦克风。",
          )}
        </p>
      </div>
      <div className="source-card">
        <h2>
          {tr(lang, "เก็บความก้าวหน้า", "Keep your progress", "保存学习进度")}
        </h2>
        <p>
          {tr(
            lang,
            "ไม่มีบัญชี ไม่มีการส่งคะแนนไปที่เซิร์ฟเวอร์ เครื่องแต่ละเครื่องมีความก้าวหน้าของตัวเอง ส่งออกไว้ได้ เผื่อเบราว์เซอร์ลบข้อมูล",
            "No account. Scores are not sent to a server. Each device has its own progress. Export a copy in case your browser clears its data.",
            "无需账号，成绩不会发送到服务器。每台设备单独记录进度。可导出备份，避免浏览器清除数据。",
          )}
        </p>
        <div className="settings-actions">
          <button onClick={download}>
            {tr(lang, "ส่งออกความก้าวหน้าและบันทึก", "Export progress and notes", "导出进度与笔记")}
          </button>
          <label className="button">
            {tr(lang, "นำเข้าความก้าวหน้า", "Import progress", "导入进度")}
            <input
              className="sr-only"
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const d = JSON.parse(await f.text());
                  const p = parseProgress(
                    d.progress,
                    new Set(questions.map((q) => q.id)),
                  );
                  if ((d.version !== 1 && d.version !== 2) || !p) throw new Error("invalid");
                  // Version 2 also carries highlights, notes and bookmarks.
                  const m = d.version === 2 ? parseMarks(d.marks) : null;
                  const a = d.version === 2 ? parseAnnotations(d.annotations) : null;
                  save(p);
                  if (m) saveMarks(m);
                  if (a) saveAnnotations(a);
                  setMessage(
                    tr(
                      lang,
                      "นำเข้าแล้ว",
                      "Progress imported.",
                      "已导入进度。",
                    ),
                  );
                } catch {
                  setMessage(
                    tr(
                      lang,
                      "ไฟล์นี้ใช้ไม่ได้ เลือกไฟล์ส่งออกจากแอปนี้",
                      "Invalid file. Choose a progress export from this app.",
                      "文件无效，请选择此应用导出的进度文件。",
                    ),
                  );
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
        <p role="status">{message}</p>
        <button onClick={() => setConfirm(true)}>
          {tr(
            lang,
            "เริ่มใหม่บนเครื่องนี้",
            "Start again on this device",
            "清除本设备进度",
          )}
        </button>
        {confirm && (
          <div className="notice" role="alert">
            <p>
              {tr(
                lang,
                "ลบความก้าวหน้าทั้งหมดบนเครื่องนี้? ส่งออกไว้ก่อนถ้าต้องการเก็บ",
                "Clear all progress on this device? Export first if you want to keep it.",
                "确定清除本设备全部进度？如需保留，请先导出。",
              )}
            </p>
            <button
              onClick={() => {
                save(defaultProgress());
                setConfirm(false);
              }}
            >
              {tr(lang, "ลบความก้าวหน้า", "Clear progress", "确认清除")}
            </button>{" "}
            <button onClick={() => setConfirm(false)}>
              {tr(lang, "ยกเลิก", "Cancel", "取消")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
