import { getRecipes } from "@/lib/api";
import { getDictionary, Locale } from "@/i18n/dictionaries";
import { HomeClient } from "@/components/HomeClient";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: paramLang } = await params;
  const lang = paramLang as Locale;
  const dict = getDictionary(lang);
  const recipes = await getRecipes();

  // Fake fallback data if db empty for visual demo
  const displayRecipes = recipes.length ? recipes : [
    {
      id: "1",
      title: { en: "Brutal Chocolate Cake", ar: "كيكة الشوكولاتة القوية" },
      category: "cakes",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: "2",
      title: { en: "Atomic Mint Cookies", ar: "كوكيز النعناع الذري" },
      category: "fastSweets",
      image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const categories = [
    { id: "fastSweets", label: dict.home.fastSweets },
    { id: "cakes", label: dict.home.cakes },
    { id: "occasions", label: dict.home.occasions },
    { id: "noBake", label: dict.home.noBake },
    { id: "healthy", label: dict.home.healthy },
  ];

  return <HomeClient recipes={displayRecipes} dict={dict} lang={lang} categories={categories} />;
}
