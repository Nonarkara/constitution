/**
 * The fields of a question that carry prose.
 *
 * This list exists because two things once disagreed about what a "question"
 * is. The release gate measured prompt, choices and explanation. The rewrite
 * pipeline worked on prompt, choices, question, explanation and hook. The
 * `logic` field — the rule a question actually teaches — was measured by
 * neither, so 30 over-long Thai runs and 10 over-long English sentences
 * shipped in it while every gate was green.
 *
 * So the list lives in ONE place, and both the gate and the pipeline import
 * it. If a field is added here, both start measuring it. If a field is
 * removed here, both stop. They cannot drift apart, because there is only
 * one of them.
 */

/** Fields that hold a {th,en,zh} prose object. */
export const PROSE_FIELDS = ["prompt", "choices", "explanation", "logic", "hook"];

/**
 * Every prose field of a question, as [name, proseObject] pairs.
 *
 * The name is what the gate prints and what the pipeline keys its before /
 * after pairs on, so it must be stable.
 */
export function bankChunks(q) {
  const chunks = [];
  for (const name of PROSE_FIELDS) {
    if (name === "choices") {
      (q.choices || []).forEach((c, i) => {
        if (c) chunks.push([`choice${i}`, c]);
      });
    } else if (q[name]) {
      chunks.push([name, q[name]]);
    }
  }
  return chunks;
}
