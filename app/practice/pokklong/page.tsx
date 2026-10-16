import { PracticeArena } from "@/components/PracticeArena";

export const metadata = {
  title: "ปกครอง (เบต้า)",
  description:
    "ทายก่อน แล้วจึงดูเหตุผลและตรรกะจนถึงตอนนี้ · Guess first, then the why and the logic so far.",
  alternates: { canonical: "/practice/pokklong/" },
};

export default function PokklongPage() {
  return <PracticeArena guessFirst />;
}
