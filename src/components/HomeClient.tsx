"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Recipe } from "@/lib/api";

interface Category {
  id: string;
  label: string;
}

interface HomeClientProps {
  recipes: Recipe[];
  dict: { home: { heroTitle: string; heroDesc: string; viewRecipe: string } };
  lang: "en" | "ar";
  categories: Category[];
}

export function HomeClient({ recipes, dict, lang, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRecipes = recipes.filter((r: Recipe) => 
    (activeCategory === "ALL" || r.category === activeCategory) && 
    r.title[lang].toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-0 bg-bg-light">
      {/* Hero Section — Text Only, Centered */}
      <section className="bg-accent-mint border-b-4 border-black py-24 px-4 md:px-8 text-center">
        <h1
          className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none text-black"
          style={{ textShadow: "4px 4px 0px rgba(0,0,0,0.25)", WebkitTextStroke: "1px black" }}
        >
          {dict.home.heroTitle}
        </h1>
        <p className="mt-6 text-lg md:text-2xl font-bold text-black max-w-2xl mx-auto">
          {dict.home.heroDesc}
        </p>
        {/* Integrated Search */}
        <div className="mt-10 max-w-3xl mx-auto">
          <input
            type="text"
            placeholder="SEARCH RECIPES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border-[6px] border-black p-5 text-2xl font-black uppercase outline-none bg-white rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:translate-x-1 focus:translate-y-1 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12 py-12">
        {/* Categories Filter (Horizontal Scroll) */}
        <section className="overflow-x-auto hide-scrollbar">
          <div className="flex flex-row gap-4 min-w-max pb-4">
            <button 
              onClick={() => setActiveCategory("ALL")}
              className={`font-black uppercase border-4 border-black px-6 py-3 transition-all shrink-0 rounded-none ${
                activeCategory === "ALL" 
                  ? "bg-black text-white translate-y-1 translate-x-1 shadow-none" 
                  : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
              }`}
            >
              ALL
            </button>
            {categories.map((c: Category) => (
              <button 
                key={c.id} 
                onClick={() => setActiveCategory(c.id)}
                className={`font-black uppercase border-4 border-black px-6 py-3 transition-all shrink-0 rounded-none ${
                  activeCategory === c.id 
                    ? "bg-black text-white translate-y-1 translate-x-1 shadow-none" 
                    : "bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {/* Recipes */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {filteredRecipes.length === 0 ? (
            <div className="col-span-full text-center p-12 border-4 border-black bg-white font-bold uppercase text-gray-500 shadow-brutal rounded-none">
              [ NO RECIPES MATCH YOUR SEARCH ]
            </div>
          ) : (
            filteredRecipes.map((r: Recipe) => (
              <div key={r.id} className="card-brutal bg-white group overflow-hidden flex flex-col rounded-none">
                <div className="relative h-64 border-b-4 border-black">
                  {r.image ? (
                    <Image src={r.image} alt={r.title[lang]} fill unoptimized sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-accent-blue"></div>
                  )}
                </div>
                <div className="p-6 flex flex-col grow justify-between">
                  <h3 className="text-2xl font-black uppercase mb-2 group-hover:underline">{r.title[lang]}</h3>
                  <Link href={`/${lang}/recipe/${r.id}`} className="mt-6 btn-brutal bg-accent-mint text-center block w-full rounded-none">
                    {dict.home.viewRecipe}
                  </Link>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
