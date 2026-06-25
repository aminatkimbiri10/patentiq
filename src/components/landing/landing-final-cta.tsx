"use client";

import Link from "next/link";
import { FadeIn } from "@/components/landing/fade-in";
import { LandingPrimaryCta, LandingSecondaryCta } from "@/components/landing/landing-cta";
import { landingConfig } from "@/config/landing";

export function LandingFinalCta() {
  const { finalCta, pilotCta } = landingConfig;

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[hsl(213,52%,18%)] dark:bg-[hsl(213,40%,12%)]" />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_120%,hsl(193,90%,45%,0.25),transparent_60%)]"
        aria-hidden
      />

      <div className="container relative section-padding text-center">
        <FadeIn>
          <h2 className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
            {finalCta.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/75">
            {finalCta.subtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LandingPrimaryCta
              size="lg"
              className="w-full bg-white text-[hsl(213,52%,25%)] shadow-none hover:bg-white/90 sm:w-auto dark:bg-cyan-500 dark:text-white dark:hover:bg-cyan-400"
            />
            <LandingSecondaryCta
              size="lg"
              className="w-full border-white/30 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            />
          </div>
          <p className="mt-6 text-sm text-white/50">
            Ou{" "}
            <Link href={pilotCta.href} className="font-medium text-white/80 underline-offset-4 hover:underline">
              {pilotCta.label.toLowerCase()}
            </Link>{" "}
            — accompagnement cabinet I2PA inclus.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
