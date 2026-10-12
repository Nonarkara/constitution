import { Suspense } from "react";
import { Flashcards } from "@/components/Flashcards";

export default function FlashcardsPage() {
  return (
    <Suspense fallback={null}>
      <Flashcards />
    </Suspense>
  );
}
