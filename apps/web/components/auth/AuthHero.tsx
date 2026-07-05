// Left hero panel for the auth screens (login + sign-up). A green radial-gradient
// surface with a large headline, supporting copy, and three "glass" cards at the
// bottom. The cards are configurable so the same panel serves both flows:
//   - Login: stat cards (₹4.2Cr+ disbursed, 2,847 funded, 48hrs approval)
//   - Sign-up: numbered step cards (Create Account / Build Profile / Explore)
// Layout faithful to "Login FLow.png" / "Sign up Flow.png".

interface HeroCard {
  // Stat variant: big value + label + sub. Step variant: title + numbered badge.
  title: string;
  sub?: string;
  badge?: string; // small bottom line (stat) — e.g. "18% this quarter"
  step?: number; // when present, renders a numbered step badge instead of a sub
}

interface AuthHeroProps {
  headline: React.ReactNode;
  asideTitle: string;
  cards: HeroCard[];
}

export function AuthHero({ headline, asideTitle, cards }: AuthHeroProps) {
  return (
    <div className="relative hidden overflow-hidden rounded-3xl lg:flex lg:flex-col lg:justify-end">
      {/* Green radial gradient: light sage top-left → near-black bottom-right. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 120% at 0% 0%, #6f8f5e 0%, #3f5a37 35%, #14210f 70%, #0a0e0c 100%)",
        }}
      />

      <div className="relative z-10 p-10 xl:p-14">
        <div className="flex items-end justify-between gap-8">
          <h1 className="max-w-md text-5xl font-bold leading-[1.05] text-white xl:text-6xl">
            {headline}
          </h1>
          <p className="max-w-[14rem] text-lg font-semibold leading-snug text-white/90">
            {asideTitle}
          </p>
        </div>

        {/* Three glass cards. */}
        <div className="mt-12 grid grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm"
            >
              <p className="text-2xl font-bold text-white">{card.title}</p>
              <p className="mt-1 text-sm text-white/80">{card.sub}</p>
              {card.step !== undefined ? (
                <div className="mt-4 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                  {card.step}
                </div>
              ) : card.badge ? (
                <p className="mt-3 text-xs text-white/70">{card.badge}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
