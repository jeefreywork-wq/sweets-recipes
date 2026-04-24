"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MagneticButton } from "@/components/MagneticButton";
import type { Recipe } from "@/lib/api";

gsap.registerPlugin(ScrollTrigger);

interface Category { id: string; label: string; }

interface HomeClientProps {
  recipes: Recipe[];
  dict: { home: { heroTitle: string; heroDesc: string; viewRecipe: string } };
  lang: "en" | "ar";
  categories: Category[];
}

function getSticker(r: Recipe): { label: string; cls: string } | null {
  const instrCount = r.instructions?.length ?? 0;
  const createdAt = r.createdAt ? new Date(r.createdAt) : null;
  const isNew = createdAt && (Date.now() - createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
  if (isNew) return { label: "🆕 NEW", cls: "bg-sky-100 border-sky-200 text-sky-700" };
  if (instrCount <= 3) return { label: "⚡ QUICK", cls: "bg-yellow-100 border-yellow-200 text-yellow-700" };
  return null;
}

export function HomeClient({ recipes, dict, lang, categories }: HomeClientProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (href: string) => {
    gsap.to(containerRef.current, { opacity: 0, scale: 0.98, duration: 0.2, ease: "power2.inOut" });
    router.push(href);
  };

  // Refs
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDescRef = useRef<HTMLParagraphElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  const shape1Ref = useRef<HTMLDivElement>(null);
  const shape2Ref = useRef<HTMLDivElement>(null);
  const shape3Ref = useRef<HTMLDivElement>(null);

  const filteredRecipes = recipes.filter((r: Recipe) =>
    (activeCategory === "ALL" || r.category === activeCategory) &&
    r.title[lang].toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hero entrance: staggered blur
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.fromTo(
        heroTitleRef.current,
        { y: 30, opacity: 0, filter: "blur(10px)" },
        { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.5 }
      )
        .fromTo(
          heroDescRef.current,
          { y: 20, opacity: 0, filter: "blur(6px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.4 },
          "-=0.3"
        )
        .fromTo(
          heroSearchRef.current,
          { y: 15, opacity: 0, filter: "blur(4px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.35 },
          "-=0.25"
        );
    });
    return () => ctx.revert();
  }, []);

  // Parallax shapes
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (shape1Ref.current) {
        gsap.to(shape1Ref.current, {
          y: -120, ease: "none",
          scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1.5 }
        });
      }
      if (shape2Ref.current) {
        gsap.to(shape2Ref.current, {
          y: -200, x: 60, ease: "none",
          scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 2 }
        });
      }
      if (shape3Ref.current) {
        gsap.to(shape3Ref.current, {
          y: -80, x: -40, ease: "none",
          scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 1 }
        });
      }
    });
    return () => ctx.revert();
  }, []);

  // Cards ScrollTrigger
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    cardRefs.current.forEach((card) => {
      if (!card) return;
      gsap.set(card, { opacity: 0, rotateX: -15, scale: 0.9, transformOrigin: "top center" });
      const st = ScrollTrigger.create({
        trigger: card,
        start: "top 90%",
        onEnter: () => {
          gsap.to(card, { opacity: 1, rotateX: 0, scale: 1, duration: 0.4, ease: "expo.out" });
        },
      });
      triggers.push(st);
    });
    return () => triggers.forEach(t => t.kill());
  }, [filteredRecipes]);

  // Category pill wobble handler
  const handlePillHover = (el: HTMLElement) => {
    gsap.fromTo(el,
      { scaleX: 1, scaleY: 1 },
      { scaleX: 1.12, scaleY: 0.92, duration: 0.15, ease: "power2.out",
        onComplete: () => gsap.to(el, { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" })
      }
    );
  };

  return (
    <div ref={containerRef} className="bg-white min-h-screen overflow-hidden">
      {/* Parallax Decorative Shapes */}
      <div ref={shape1Ref} className="fixed top-32 right-10 w-64 h-64 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none z-0" />
      <div ref={shape2Ref} className="fixed top-80 left-0 w-48 h-48 rounded-full bg-rose-100/30 blur-2xl pointer-events-none z-0" />
      <div ref={shape3Ref} className="fixed bottom-48 right-1/3 w-32 h-32 rounded-full bg-amber-100/40 blur-2xl pointer-events-none z-0" />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] flex flex-col items-center justify-center text-center overflow-hidden z-10">
        <Image
          src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1600&auto=format&fit=crop"
          alt="Desserts background"
          fill unoptimized className="object-cover" sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-4 space-y-6 max-w-3xl mx-auto">
          <h1
            ref={heroTitleRef}
            style={{ fontFamily: "'Playfair Display', serif", opacity: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-lg"
          >
            {dict.home.heroTitle}
          </h1>
          <p ref={heroDescRef} style={{ opacity: 0 }} className="text-lg md:text-xl text-white/90 font-medium">
            {dict.home.heroDesc}
          </p>
          <div ref={heroSearchRef} style={{ opacity: 0 }} className="w-[90%] max-w-[600px] mx-auto">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border-0 px-6 py-4 text-lg shadow-xl outline-none bg-white text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-white/60 transition-all"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-20 py-12 space-y-10 relative z-10">
        {/* Category Pills — Sticky */}
        <div className="sticky top-[65px] z-40 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex flex-row gap-3 min-w-max">
              {[{ id: "ALL", label: "All" }, ...categories].map((c) => (
                <motion.button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={(e) => handlePillHover(e.target as HTMLElement)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    activeCategory === c.id
                      ? "bg-gray-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {c.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        <div ref={gridRef} style={{ perspective: "1200px" }}>
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {filteredRecipes.length === 0 ? (
              <div className="col-span-full text-center py-24 space-y-4">
                <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl text-gray-500 italic">
                  We couldn&apos;t find that recipe, but we&apos;re sure it&apos;s delicious!
                </p>
                <button onClick={() => setSearchQuery("")} className="text-sm text-gray-400 underline underline-offset-4 hover:text-gray-600 transition-colors">
                  Clear Search
                </button>
              </div>
            ) : (
              filteredRecipes.map((r: Recipe, i: number) => {
                const sticker = getSticker(r);
                return (
                  <div
                    key={r.id}
                    ref={el => { cardRefs.current[i] = el; }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300 ease-out"
                  >
                    <div className="relative h-52">
                      {r.image ? (
                        <Image src={r.image} alt={r.title[lang]} fill unoptimized sizes="400px" className="object-cover rounded-t-2xl" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-t-2xl" />
                      )}
                      {sticker && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm ${sticker.cls} backdrop-blur-sm`}>
                          {sticker.label}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col grow justify-between">
                      <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-gray-900 tracking-tight mb-3">
                        {r.title[lang]}
                      </h3>
                      <MagneticButton className="mt-auto">
                        <button
                          onClick={() => handleNavigate(`/${lang}/recipe/${r.id}`)}
                          className="text-center py-3 px-4 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors block w-full"
                        >
                          {dict.home.viewRecipe}
                        </button>
                      </MagneticButton>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
