export const dictionaries = {
  en: {
    home: {
      title: "SWEETS RECIPES",
      heroTitle: "Authentic Sweets for Every Occasion",
      heroDesc: "Explore hand-picked recipes from traditional cakes to healthy treats",
      filterCategories: "Categories",
      fastSweets: "Fast Sweets",
      cakes: "Cakes & Cold Desserts",
      occasions: "Occasions & Events",
      noBake: "No-Bake",
      healthy: "Healthy Corner",
      viewRecipe: "VIEW RECIPE",
    },
    recipe: {
      ingredients: "INGREDIENTS",
      instructions: "INSTRUCTIONS",
      startTimer: "START TIMER",
    },
    admin: {
      login: "ADMIN LOGIN",
      email: "Email",
      password: "Password",
      submit: "ENTER",
      dashboard: "DASHBOARD",
      addRecipe: "ADD RECIPE",
      titleEn: "Title (EN)",
      titleAr: "Title (AR)",
      save: "SAVE RECIPE",
      addIngredient: "ADD INGREDIENT",
      addStep: "ADD STEP",
      timerDuration: "Duration (min)"
    }
  },
  ar: {
    home: {
      title: "وصفات حلويات",
      heroTitle: "حلويات أصيلة لكل المناسبات",
      heroDesc: "اكتشف وصفات مختارة بعناية من الكيك التقليدي إلى الحلويات الصحية",
      filterCategories: "التصنيفات",
      fastSweets: "حلويات سريعة",
      cakes: "كيك وحلويات باردة",
      occasions: "مناسبات وحفلات",
      noBake: "بدون فرن",
      healthy: "ركن صحي",
      viewRecipe: "عرض الوصفة",
    },
    recipe: {
      ingredients: "المقادير",
      instructions: "طريقة التحضير",
      startTimer: "بدء المؤقت",
    },
    admin: {
      login: "تسجيل دخول المشرف",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      submit: "دخول",
      dashboard: "لوحة التحكم",
      addRecipe: "إضافة وصفة",
      titleEn: "العنوان (إنجليزي)",
      titleAr: "العنوان (عربي)",
      save: "حفظ الوصفة",
      addIngredient: "إضافة مكون",
      addStep: "إضافة خطوة",
      timerDuration: "المدة (دقائق)"
    }
  }
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = (lang: Locale) => dictionaries[lang] ?? dictionaries.en;
