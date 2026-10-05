"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  title: string;
  body: string;
  illustration: React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    title: "Check in, honestly",
    body: "A few minutes a day keeps your record straight, and your lead informed without a single meeting.",
    illustration: (
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <rect x="30" y="20" width="140" height="80" rx="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1.5" />
        <rect x="30" y="20" width="140" height="22" rx="8" fill="#2E0219" />
        <rect x="30" y="34" width="140" height="8" fill="#2E0219" />
        <rect x="44" y="56" width="112" height="6" rx="3" fill="#F4E7EA" />
        <rect x="44" y="68" width="80" height="6" rx="3" fill="#F4E7EA" />
        <rect x="44" y="82" width="100" height="12" rx="4" fill="#FFFBEB" stroke="#FACC15" />
      </svg>
    ),
  },
  {
    title: "See the whole team",
    body: "Leads get a clear read on who's blocked and who's carrying too much, without chasing anyone down.",
    illustration: (
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <circle cx="70" cy="55" r="18" fill="#2E0219" />
        <circle cx="110" cy="45" r="18" fill="#6B6E76" />
        <circle cx="150" cy="60" r="18" fill="#166534" />
        <rect x="40" y="85" width="120" height="8" rx="4" fill="#F4E7EA" />
      </svg>
    ),
  },
  {
    title: "A fair read from AI",
    body: "The analyzer weighs blockers and workload, not just checkmarks, before it says how a week went.",
    illustration: (
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <circle cx="100" cy="55" r="30" fill="none" stroke="#F4E7EA" strokeWidth="10" />
        <circle
          cx="100" cy="55" r="30" fill="none" stroke="#166534" strokeWidth="10"
          strokeDasharray="141 188" strokeLinecap="round" transform="rotate(-90 100 55)"
        />
        <text x="100" y="61" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="16" fontWeight="600" fill="#1F2328">75%</text>
      </svg>
    ),
  },
];

export default function ProgressSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <div className="bg-surface border border-hairline rounded-md overflow-hidden mb-8">
      <div className="flex items-center">
        <button
          onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          aria-label="Previous"
          className="p-3 text-muted hover:text-primary shrink-0"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 grid sm:grid-cols-2 items-center gap-4 py-4">
          <div className="px-2">
            <h3 className="font-serif text-lg text-accent">{slide.title}</h3>
            <p className="text-sm text-muted mt-1">{slide.body}</p>
          </div>
          <div className="h-24">{slide.illustration}</div>
        </div>

        <button
          onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
          aria-label="Next"
          className="p-3 text-muted hover:text-primary shrink-0"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 pb-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-hairline"}`}
          />
        ))}
      </div>
    </div>
  );
}
