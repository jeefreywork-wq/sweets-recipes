"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Recipe } from "@/lib/api";

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" as const } }),
};

export function HomeClient({ recipes, dict, lang, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes.filter((r: Recipe) =>
    (activeCategory === "ALL" || r.category === activeCategory) &&
    r.title[lang].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] flex flex-col items-center justify-center text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1600&auto=format&fit=crop"
          alt="Desserts background"
          fill unoptimized className="object-cover" sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 px-4 space-y-6 max-w-3xl mx-auto">
          <h1
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-lg"
          >
            {dict.home.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/90 font-medium">{dict.home.heroDesc}</p>
          <div className="w-[90%] max-w-[600px] mx-auto">
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

      <div className="max-w-7xl mx-auto px-4 md:px-20 py-12 space-y-10">
        {/* Category Pills — Sticky */}
        <div className="sticky top-[65px] z-40 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex flex-row gap-3 min-w-max">
              {[{ id: "ALL", label: "All" }, ...categories].map((c) => (
                <motion.button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
            <AnimatePresence mode="popLayout">
              {filteredRecipes.map((r: Recipe, i: number) => {
                const sticker = getSticker(r);
                return (
                  <motion.div
                    key={r.id}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300 ease-out"
                  >
                    <div className="relative h-52">
                      {r.image ? (
                        <Image src={r.image} alt={r.title[lang]} fill unoptimized sizes="400px" className="object-cover rounded-t-2xl" />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-t-2xl"></div>
                      )}
                      {/* Sticker */}
                      {sticker && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-sm ${sticker.cls} backdrop-blur-sm`}>
                          {sticker.label}
                        </span>
                      )}
                    </div>
                    <div className="p-5 flex flex-col grow justify-between">
                      <h3
                        style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-xl font-bold text-gray-900 tracking-tight mb-3"
                      >
                        {r.title[lang]}
                      </h3>
                      <Link
                        href={`/${lang}/recipe/${r.id}`}
                        className="mt-auto text-center py-3 px-4 rounded-2xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors"
                      >
                        {dict.home.viewRecipe}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </section>
      </div>
    </div>
  );
}
