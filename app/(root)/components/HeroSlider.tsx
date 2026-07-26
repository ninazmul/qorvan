"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";

interface Slide {
  _id: string;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  buttonText?: string;
  buttonUrl?: string;
}

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(next, 6000);

    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section className="relative w-full bg-muted/20">
      <div className="relative w-full h-[600px] sm:h-[450px] md:h-[550px] lg:h-[650px] xl:h-[780px] overflow-hidden">
        <div className="relative w-full h-[600px] sm:h-[400px] md:h-[520px] lg:h-[620px] xl:h-[720px] overflow-hidden">
          {/* Background Images */}
          {slides.map((s, idx) => (
            <div
              key={s._id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={s.backgroundImage}
                alt={s.title}
                fill
                priority={idx === current}
                sizes="100vw"
                className="object-cover object-top"
              />

              {/* Left Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#063b22] via-[#063b22]/90 to-transparent" />
            </div>
          ))}

          {/* Content */}
          <div className="container mx-auto relative z-10 flex h-full items-center">
            <div className="max-w-2xl px-5 sm:px-8 md:px-12 lg:px-20">
              <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
                {slide.title}
              </h1>

              {slide.subtitle && (
                <p className="mt-6 text-lg leading-8 text-white/85">
                  {slide.subtitle}
                </p>
              )}

              <div className="mt-10 flex flex-wrap gap-4">
                {slide.buttonText && (
                  <Link
                    href={slide.buttonUrl || "#"}
                    className="inline-flex items-center rounded-xl bg-primary px-8 py-4 font-semibold text-white transition hover:scale-105"
                  >
                    {slide.buttonText}
                  </Link>
                )}

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur transition hover:bg-white hover:text-black"
                >
                  Learn More
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          {/* Left Arrow */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-primary"
              >
                <ChevronLeft />
              </button>

              {/* Right Arrow */}
              <button
                onClick={next}
                className="absolute right-5 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur hover:bg-primary"
              >
                <ChevronRight />
              </button>

              {/* Dots */}
              <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`transition-all duration-300 ${
                      index === current
                        ? "h-2 w-10 rounded-full bg-white"
                        : "h-2 w-2 rounded-full bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
