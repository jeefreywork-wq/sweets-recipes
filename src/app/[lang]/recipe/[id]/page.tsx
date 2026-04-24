import { getRecipe } from "@/lib/api";
import type { Recipe } from "@/lib/api";
import { getDictionary, Locale } from "@/i18n/dictionaries";
import { RecipeDetail } from "@/components/RecipeDetail";
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

  return <RecipeDetail recipe={recipe} lang={lang} dict={dict} />;
}
