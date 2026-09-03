"use client";

import { useRef, useState } from "react";

export type Feedback = { type: "success" | "error"; message: string } | null;

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = (type: "success" | "error", message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback({ type, message });
    timerRef.current = setTimeout(() => setFeedback(null), 3500);
  };

  return { feedback, show };
}

export function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all ${
        feedback.type === "error"
          ? "bg-destructive text-white"
          : "bg-brand text-white"
      }`}
    >
      {feedback.message}
    </div>
  );
}
