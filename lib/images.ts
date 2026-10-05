export type WelcomeSlide =
  | { type: "photo"; image: string; title: string; text: string; fit?: "contain" | "cover" }
  | { type: "posters"; images: string[] };

export const WELCOME_SLIDES: WelcomeSlide[] = [
  { type: "posters", images: ["/progress.jpg", "/vision.jpg", "/time.jpg"] },
    {
    type: "photo",
    image: "/WOW.jpg",
    fit: "contain",
    title: "Reach the top, together",
    text: "Every check-in is a step. Every teammate counts.",
  },
  { type: "posters", images: ["/grow.jpg", "/Speed.jpg", "/team1.jpg"] },
];

export const LOGIN_POSTERS: string[] = [
  "/vision.jpg",
  "/time.jpg",
  "/progress.jpg",
  "/team1.jpg",
  "/direction.jpg",
  "/wancha.jpg",
];

export const SIGNUP_POSTERS: string[] = [
  "/New Day.jpg",
  "/team1.jpg",
  "/time.jpg",
  "/vision.jpg",
  "/progress.jpg",
  "/Speed.jpg",
];