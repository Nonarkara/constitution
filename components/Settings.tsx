"use client";
import { persistImport, ImportStorageError, RECOVERY_KEY } from "@/lib/import-storage";
import { drillIds } from "@/lib/drills";
import Link from "next/link";
import { useState } from "react";
import { useStudy } from "./Provider";
import { tr } from "@/lib/i18n";
import { questionIndex as questions } from "@/lib/outline";
import { createBackup, parseBackup } from "@/lib/backup";
import { eraseLearnerData } from "@/lib/local-data";
import { loadPokklongProgress } from "@/lib/pokklong";
import { REFLECTION_KEY } from "@/lib/amendment";
import { THEMES, THEME_NAME, type ThemeChoice } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";
import { StudyArt } from "./StudyArt";
export function Settings() {
  const {
    applyBackup,
    lang,
    progress,
    save,
    large,
    setLarge,
    offline,
    marks,
    saveMarks,
    annotations,
    saveAnnotations,
    read,
    saveRead,
  } = useStudy();
  const theme = useTheme();
  const [confirm, setConfirm] = useState(false),
    [message, setMessage] = useState("");
  const download = () => {
    try {
      const backup = createBackup(
        progress,
        marks,
        annotations,
        localStorage.getItem(REFLECTION_KEY),
        read,
        { pokklong: loadPokklongProgress(), blind: localStorage.getItem("constitution-blind-v1") },
      );
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(backup, null, 2)], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "constitution-progress.json";
      a.click();
      URL.revokeObjectURL(url);
      setMessage(
        tr(
          lang,
          "ส่งออกแล้ว รวมบันทึกแก้รัฐธรรมนูญ",
          "Exported, including the amendment reflection.",
          "已导出，包含修宪思考笔记。",
        ),
      );
    } catch {
      setMessage(
        tr(
          lang,
          "ส่งออกไม่สำเร็จ อ่านบันทึกในเครื่องไม่ได้ ข้อมูลเดิมยังอยู่",
          "Export failed: saved notes could not be read. Existing data is preserved.",
          "导出失败：无法读取设备笔记，原数据仍保留。",
        ),
      );
    }
  };
  return (
    <>
      <div className="intro-copy">
        <StudyArt scene="settings" />
        <div className="intro-text">
          <h1>
            {tr(
              lang,
              "บนเครื่อง\nของคุณ",
              "Your own\nnotebook.",
              "你的设备，\n你的学习笔记。",
            )}
          </h1>
        </div>
      </div>
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
            "ตัวอักษรทั้งเล่มใหญ่ขึ้นบนเครื่องนี้",
            "Text across the notebook gets larger on this device.",
            "这台设备上，整本笔记的字都会变大。",
          )}
        </p>
        <fieldset className="theme-choices">
          <legend>{tr(lang, "สีหน้าจอ", "Screen colours", "屏幕配色")}</legend>
          {(["auto", ...THEMES] as ThemeChoice[]).map((t) => (
            <label className="setting-label" key={t}>
              <input
                type="radio"
                name="theme"
                checked={theme.choice === t}
                onChange={() => theme.choose(t)}
              />
              {THEME_NAME[t][lang]}
            </label>
          ))}
        </fieldset>
        <p>
          {tr(
            lang,
            "กลางคืนใช้โหมดกลางคืนหรือถนอมสายตา แสงจะไม่แยงตา ตามอุปกรณ์จะเปลี่ยนเองตามการตั้งค่าของเครื่อง",
            "At night, Dark or Mild is easier on the eyes. Match device follows this device's own setting.",
            "夜里用深色或柔和模式更护眼。“跟随设备”会按本机设置自动切换。",
          )}
        </p>
      </div>
      <div className="source-card">
        <h2>{tr(lang, "ค้นด้วยเสียง", "Search by voice", "语音搜索")}</h2>
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
        <p><Link href="/polls/">{tr(lang,"ส่งออกคำตอบโพลจากหน้าโพลแยกต่างหาก","Export private poll answers separately on the polls page","私人问卷答案须在问卷页单独导出")} →</Link></p>
        <div className="settings-actions">
          <button onClick={() => {let raw: string | null; try { raw=localStorage.getItem(RECOVERY_KEY); } catch { setMessage(tr(lang,"เบราว์เซอร์อ่านข้อมูลไม่ได้","The browser could not read recovery data.","浏览器无法读取恢复数据。")); return; }if(!raw){setMessage(tr(lang,"ยังไม่มีสำเนากู้คืน","No recovery copy yet.","暂无恢复副本。"));return;}const url=URL.createObjectURL(new Blob([raw],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="constitution-import-recovery.json";a.click();URL.revokeObjectURL(url);setMessage(tr(lang,"ส่งออกข้อมูลก่อนนำเข้าแล้ว เก็บไว้เพื่อกู้คืน","Previous-state recovery data exported. Keep it for recovery.","已导出导入前的恢复数据，请留存。"));}}>{tr(lang,"ส่งออกสำเนาก่อนนำเข้า","Export pre-import recovery copy","导出导入前恢复副本")}</button>
          <button onClick={download}>
            {tr(
              lang,
              "ส่งออกความก้าวหน้าและบันทึก",
              "Export progress and notes",
              "导出进度与笔记",
            )}
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
                  const imported = parseBackup(
                    d,
                    new Set([...questions.map((q) => q.id), ...drillIds()]),
                  );
                  if (!imported) throw new Error("invalid");
                  persistImport(localStorage, imported);
                  applyBackup(imported);
                  setMessage(
                    tr(
                      lang,
                      "นำเข้าแล้ว",
                      "Progress imported.",
                      "已导入进度。",
                    ),
                  );
                } catch (error) {
                  const storageFailure =
                    error instanceof ImportStorageError ||
                    error instanceof DOMException &&
                    ["QuotaExceededError", "SecurityError"].includes(
                      error.name,
                    );
                  setMessage(
                    error instanceof ImportStorageError && !error.recovered
                      ? tr(lang,"นำเข้าไม่สำเร็จและคืนค่าบางส่วนไม่ได้ ส่งออกสำเนากู้คืนก่อนลองอีกครั้ง","Import failed and some previous values could not be restored. Export the recovery copy before trying again.","导入失败，部分原值无法恢复。再次尝试前请先导出恢复副本。")
                      : storageFailure
                      ? tr(
                          lang,
                          "นำเข้าไม่ได้ เก็บสำเนาก่อนนำเข้าไว้ในเครื่องเมื่อพื้นที่อนุญาต",
                          "The import could not be saved. A previous-state recovery copy is kept on this device when storage allows it.",
                          "导入无法保存；存储空间允许时，本设备保留导入前的恢复副本。",
                        )
                      : tr(
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
                "ลบทุกอย่างที่สมุดเก็บไว้บนเครื่องนี้? คำตอบ ไฮไลต์ โน้ต ประวัติการอ่าน ความคิดเรื่องการแก้รัฐธรรมนูญ คำตอบโพล ปกครอง และข้อสอบที่ทำค้างไว้ จะหายทั้งหมด สีหน้าจอและภาษายังอยู่ ส่งออกไว้ก่อนถ้าต้องการเก็บ",
                "Erase everything this notebook keeps on this device? Answers, highlights, notes, reading history, your amendment reflection, poll answers, Pokklong and any unfinished exam all go. Screen colours and language stay. Export first if you want to keep them.",
                "清除本笔记在这台设备上保存的全部内容？答案、标记、笔记、阅读记录、修宪思考、问卷回答、治理练习和未完成的考试都会删除。屏幕配色和语言保留。如需保留，请先导出。",
              )}
            </p>
            <button
              onClick={() => {
                try {
                  eraseLearnerData(localStorage);
                  document.cookie = "constitution-civic-room=; max-age=0; path=/; SameSite=Lax";
                } catch {}
                // Reload so no page keeps an old copy in memory and writes it back.
                location.reload();
              }}
            >
              {tr(lang, "ลบทั้งหมด", "Erase everything", "全部清除")}
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
