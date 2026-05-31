import { useState } from "react";
import { questions } from "../lib/quetions";

export interface Answer {
  que: string;
  answer: string;
}

interface Props {
  open: boolean;
  fetch: (answers: Answer[]) => void;
}

const Modal = ({ open, fetch }: Props) => {
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, Answer[]>>({});

  if (!open) return null;

  const current = questions[step];
  const isMulti = current.type === "multi_select";
  const selected: Answer[] = answers[current.id] ?? [];
  const isLast = step === questions.length - 1;
  const progress = ((step + 1) / questions.length) * 100;

  const isSelected = (opt: string) => selected.some((a) => a.answer === opt);

  const toggle = (opt: string) => {
    const entry: Answer = { que: current.question, answer: opt };
    setAnswers((prev) => {
      const cur: Answer[] = prev[current.id] ?? [];
      if (isMulti) {
        const exists = cur.some((a) => a.answer === opt);
        return {
          ...prev,
          [current.id]: exists
            ? cur.filter((a) => a.answer !== opt)
            : [...cur, entry],
        };
      }
      return { ...prev, [current.id]: [entry] };
    });
  };

  const handleNext = () => {
    if (isLast) {
      const flat: Answer[] = Object.values(answers).flat();
      fetch(flat);
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-700">
        {/* Header */}
        <div className="px-6 pt-5 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
            Step {step + 1} of {questions.length}
          </span>
          <button
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg p-1 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-6 mt-3 h-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-4">
          <h2 className="text-[17px] font-medium text-zinc-900 dark:text-zinc-100 leading-snug mb-1">
            {current.question}
          </h2>
          {isMulti ? (
            <p className="text-xs text-zinc-400 mb-4">Select all that apply</p>
          ) : (
            <div className="mb-4" />
          )}

          <div className="flex flex-col gap-2">
            {current.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm text-left transition-colors ${
                  isSelected(opt)
                    ? "border-violet-400 bg-violet-50 text-violet-900 dark:bg-violet-950 dark:border-violet-600 dark:text-violet-200"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected(opt)
                      ? "border-violet-500 bg-violet-500"
                      : "border-zinc-300 dark:border-zinc-600"
                  }`}
                >
                  {isSelected(opt) && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M2 5l2.5 2.5L8 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === step ? "bg-violet-500" : "bg-zinc-200 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={selected.length === 0}
              className="px-4 py-2 text-sm rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isLast ? "Find my car →" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
