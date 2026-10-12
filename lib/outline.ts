import outline from "@/data/outline.json";
import index from "@/data/question-index.json";
import type { Chapter } from "./corpus";
export const chapters = outline.chapters as Chapter[];
export const meta = outline.meta;
export type QuestionRef = { id: string; chapter: number; sections: number[] };
export const questionIndex = index as QuestionRef[];
