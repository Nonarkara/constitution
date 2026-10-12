import { Suspense } from "react";
import { Flashcards } from "@/components/Flashcards";
export const metadata = {
  title: "บัตรคำ · Flashcards",
  description: "บัตรคำทบทวนมาตราสำคัญ",
  alternates: { canonical: "/flashcards/" },
};


export default function FlashcardsPage() {
  return (
    <Suspense fallback={null}>
      <Flashcards />
    </Suspense>
  );
}
