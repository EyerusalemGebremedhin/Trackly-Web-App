"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WELCOME_SLIDES } from "@/lib/images";

const TILTS = [-3, 2, -2];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setIndex((i) => (i + 1) % WELCOME_SLIDES.length), 5000);
    return () => clearTimeout(id);
  }, [index]);

  const go = (i: number) => setIndex((i + WELCOME_SLIDES.length) % WELCOME_SLIDES.length);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-b-[2.5rem] bg-[#3C050F] shadow-2xl shadow-black/20">
      {WELCOME_SLIDES.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          {s.type === "photo" ? (
            <>
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: "50% 80%" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(60,5,15,0.9), rgba(60,5,15,0.25) 55%, rgba(60,5,15,0.15))",
                }}
              />
              <div className="absolute bottom-0 left-0 p-8 pb-14 text-white md:p-12 md:pb-14">
                <h3 className="font-serif text-3xl leading-snug md:text-4xl">{s.title}</h3>
                <p className="mt-2 max-w-sm text-sm text-[#F5DFE1]">{s.text}</p>
              </div>
            </>
          ) : (
            <>
              <Image
                src={s.images[0]}
                alt=""
                fill
                sizes="100vw"
                className="scale-125 object-cover opacity-70 blur-2xl"
              />
              <div className="absolute inset-0 bg-[#3C050F]/55" />
              <div className="absolute inset-0 flex items-center justify-center gap-5 px-16 py-10 md:gap-8">
                {s.images.map((src, n) => (
                  <div
                    key={`${src}-${n}`}
                    className={`relative aspect-[2/3] h-full shrink-0 overflow-hidden rounded-xl shadow-2xl shadow-black/50 ring-1 ring-white/20 ${
                      n === 1 ? "hidden md:block" : n === 2 ? "hidden xl:block" : ""
                    }`}
                    style={{ transform: `rotate(${TILTS[n % TILTS.length]}deg)` }}
                  >
                    <Image src={src} alt="" fill sizes="320px" className="object-cover" />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{ background: "linear-gradient(to bottom, rgba(60,5,15,0.7), transparent)" }}
      />

      <button
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/35"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2.5 text-white backdrop-blur transition-colors hover:bg-white/35"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {WELCOME_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}