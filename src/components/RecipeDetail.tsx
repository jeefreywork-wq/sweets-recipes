"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { Checklist } from "@/components/Checklist";
import { Timer } from "@/components/Timer";
import type { Recipe } from "@/lib/api";

interface RecipeDetailProps {
  recipe: Recipe;
  lang: "en" | "ar";
  dict: { recipe: { ingredients: string; instructions: string; startTimer: string } };
}

export function RecipeDetail({ recipe, lang, dict }: RecipeDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLAnchorElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll reset
    window.scrollTo({ top: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.fromTo(containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )
      .fromTo(backRef.current,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3 },
        "-=0.15"
      )
      .fromTo(imageRef.current,
        { scale: 1.04, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4 },
        "-=0.15"
      )
      .fromTo(
        contentRef.current ? Array.from(contentRef.current.children) : [],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.05 },
        "-=0.25"
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-4 py-10 space-y-10" style={{ opacity: 0 }}>
      {/* Back */}
      <Link
        ref={backRef}
        href={`/${lang}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors group"
        style={{ opacity: 0 }}
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span>Back</span>
      </Link>

      {/* Hero Image */}
      <div ref={imageRef} className="relative h-80 md:h-[480px] w-full rounded-2xl overflow-hidden shadow-md" style={{ opacity: 0 }}>
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title[lang]}
            fill unoptimized
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow"
          >
            {recipe.title[lang]}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 pb-2 border-b border-gray-200">{dict.recipe.ingredients}</h2>
          <Checklist items={recipe.ingredients || []} lang={lang} />
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 pb-2 border-b border-gray-200">{dict.recipe.instructions}</h2>
          <div className="space-y-6">
            {recipe.instructions?.map((inst, i) => (
              <div key={i} className="flex gap-5">
                <div className="text-3xl font-black text-gray-200 shrink-0 leading-none pt-1">{String(i + 1).padStart(2, "0")}</div>
                <div className="bg-gray-50 rounded-2xl p-5 grow border border-gray-100">
                  <p className="text-base font-medium text-gray-800">{inst.text[lang]}</p>
                  {inst.hasTimer && <Timer duration={inst.timerDuration} label={dict.recipe.startTimer} />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
