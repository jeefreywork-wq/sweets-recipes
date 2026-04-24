import { getRecipe } from "@/lib/api";
import type { Recipe } from "@/lib/api";
import { getDictionary, Locale } from "@/i18n/dictionaries";
import { Checklist } from "@/components/Checklist";
import { Timer } from "@/components/Timer";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function RecipePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang: paramLang, id } = await params;
  const lang = paramLang as Locale;
  const dict = getDictionary(lang);
  let recipe: Recipe | null = await getRecipe(id);

  // Fake fallback
  if (!recipe && id === "1") {
    recipe = {
      id: "1",
      title: { en: "Brutal Chocolate Cake", ar: "كيكة الشوكولاتة القوية" },
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
    <div className="space-y-12 max-w-4xl mx-auto">
      <div className="relative h-96 border-8 border-black shadow-brutal">
        {recipe.image ? (
          <Image src={recipe.image} alt={recipe.title[lang]} fill unoptimized sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-accent-blue"></div>
        )}
        <div className="absolute -bottom-8 left-8 bg-white border-4 border-black px-6 py-4 shadow-brutal">
          <h1 className="text-4xl md:text-6xl font-black uppercase">{recipe.title[lang]}</h1>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 pt-8">
        <div className="md:col-span-1 space-y-6">
          <h2 className="text-3xl font-black uppercase border-b-4 border-black pb-2">{dict.recipe.ingredients}</h2>
          <Checklist items={recipe.ingredients || []} lang={lang} />
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-3xl font-black uppercase border-b-4 border-black pb-2">{dict.recipe.instructions}</h2>
          <div className="space-y-8">
            {recipe.instructions?.map((inst, i) => (
              <div key={i} className="flex gap-6">
                <div className="text-5xl font-black text-accent-orange shrink-0">{i + 1}</div>
                <div className="bg-white border-4 border-black p-6 shadow-brutal grow">
                  <p className="text-xl font-bold">{inst.text[lang]}</p>
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
