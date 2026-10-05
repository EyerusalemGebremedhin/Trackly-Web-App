import Link from "next/link";
import Image from "next/image";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { LOGIN_POSTERS, SIGNUP_POSTERS } from "@/lib/images";

type Spot = {
  pos: string;
  size: string;
  rotate: number;
  delay: number;
  xlOnly?: boolean;
};

const SPOTS: Record<"login" | "signup", Spot[]> = {
  login: [
    { pos: "left-[3%] top-[8%]", size: "w-40 xl:w-48", rotate: -8, delay: 0 },
    { pos: "left-[15%] bottom-[5%]", size: "w-36 xl:w-44", rotate: 5, delay: -2 },
    { pos: "right-[4%] top-[12%]", size: "w-40 xl:w-48", rotate: 7, delay: -4 },
    { pos: "right-[16%] bottom-[4%]", size: "w-36 xl:w-44", rotate: -6, delay: -1 },
    { pos: "left-[1%] top-[44%]", size: "w-28 xl:w-32", rotate: 4, delay: -3, xlOnly: true },
    { pos: "right-[1%] top-[46%]", size: "w-28 xl:w-32", rotate: -5, delay: -5, xlOnly: true },
  ],
  signup: [
    { pos: "left-[4%] top-[14%]", size: "w-40 xl:w-48", rotate: 6, delay: -1 },
    { pos: "left-[14%] bottom-[6%]", size: "w-36 xl:w-44", rotate: -7, delay: -3 },
    { pos: "right-[3%] top-[8%]", size: "w-40 xl:w-48", rotate: -6, delay: -2 },
    { pos: "right-[15%] bottom-[5%]", size: "w-36 xl:w-44", rotate: 8, delay: 0 },
    { pos: "left-[1%] top-[48%]", size: "w-28 xl:w-32", rotate: -4, delay: -4, xlOnly: true },
    { pos: "right-[1%] top-[44%]", size: "w-28 xl:w-32", rotate: 5, delay: -5, xlOnly: true },
  ],
};

const IMAGES = { login: LOGIN_POSTERS, signup: SIGNUP_POSTERS };

export default function AuthLayout({
  variant,
  title,
  subtitle,
  headline,
  blurb,
  footer,
  children,
}: {
  variant: "login" | "signup";
  title: string;
  subtitle: string;
  headline: string;
  blurb: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const images = IMAGES[variant];

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, #641526 0%, transparent 45%), radial-gradient(circle at 85% 85%, #58101C 0%, transparent 50%), #3C050F",
      }}
    >
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-[#CFA1A8] opacity-10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-[#F5DFE1] opacity-10 blur-3xl" />

      {SPOTS[variant].map((spot, i) => {
        const src = images[i];
        if (!src) return null;
        return (
          <div
            key={`${src}-${i}`}
            aria-hidden
            className={`absolute ${spot.pos} ${spot.size} ${spot.xlOnly ? "hidden xl:block" : "hidden lg:block"}`}
            style={{ transform: `rotate(${spot.rotate}deg)` }}
          >
            <div
              className="float-card rounded-xl bg-white p-1.5 shadow-2xl shadow-black/40"
              style={{ animationDelay: `${spot.delay}s` }}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <Image src={src} alt="" fill sizes="200px" className="object-cover" />
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 text-white backdrop-blur"
        >
          <Logo size={28} reversed />
          <span className="font-serif text-xl">Trackly</span>
        </Link>
        <div className="rounded-full bg-surface p-1 shadow">
          <ThemeToggle />
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12">
        <div className="mb-8 max-w-lg text-center text-white">
          <h2 className="font-serif text-4xl md:text-5xl leading-tight">{headline}</h2>
          <p className="mt-4 text-base text-[#F5DFE1]">{blurb}</p>
        </div>

        <div className="w-full max-w-lg rounded-3xl border border-white/20 bg-surface p-8 sm:p-10 shadow-2xl shadow-black/40">
          <h1 className="font-serif text-3xl text-ink">{title}</h1>
          <p className="mt-2 mb-8 text-base text-muted">{subtitle}</p>

          {children}

          <p className="mt-8 border-t border-hairline pt-6 text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}