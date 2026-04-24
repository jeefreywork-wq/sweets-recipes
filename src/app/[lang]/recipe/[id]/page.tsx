import { getRecipe } from "@/lib/api";
import type { Recipe } from "@/lib/api";
import { getDictionary, Locale } from "@/i18n/dictionaries";
import { Checklist } from "@/components/Checklist";
import { Timer } from "@/components/Timer";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RecipePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: paramLang, id } = await params;
  const lang = paramLang as Locale;
  const dict = getDictionary(lang);
  let recipe: Recipe | null = await getRecipe(id);

  if (!recipe && id === "1") {
    recipe = {
      id: "1",
      title: { en: "Chocolate Cake", ar: "كيكة الشوكولاتة" },
      category: "cakes",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop",
      ingredients: [
        { item: { en: "Flour", ar: "دقيق" }, quantity: "2", unit: "cups" },
        { item: { en: "Cocoa Powder", ar: "بودرة الكاكاو" }, quantity: "1", unit: "cup" },
        { item: { en: "Sugar", ar: "سكر" }, quantity: "2", unit: "cups" }
      ],
      instructions: [
        { text: { en: "Mix dry ingredients.", ar: "اخلط المكونات الجافة." }, hasTimer: false, timerDuration: 0 },
        { text: { en: "Bake at 350F.", ar: "اخبز على حرارة 350 فهرنهايت." }, hasTimer: true, timerDuration: 30 }
      ]
    };
  }

  if (!recipe) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Back */}
      <Link href={`/${lang}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span>Back</span>
      </Link>
      {/* Hero Image */}
      <div className="relative h-80 md:h-[480px] w-full rounded-2xl overflow-hidden shadow-md">
        {recipe.image ? (
          <Image src={recipe.image} alt={recipe.title[lang]} fill unoptimized sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100"></div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
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
                  {inst.hasTimer && (
                    <Timer duration={inst.timerDuration} label={dict.recipe.startTimer} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
