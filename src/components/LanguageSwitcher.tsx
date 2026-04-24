"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({ lang }: { lang: string }) {
  const pathname = usePathname();

  const switchTo = (target: string) => {
    // Replace the leading /en or /ar segment with the target locale
    return pathname.replace(/^\/(en|ar)/, `/${target}`);
  };

  return (
    <div className="flex gap-2">
      <Link
        href={switchTo("en")}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
          lang === "en" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        EN
      </Link>
      <Link
        href={switchTo("ar")}
        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
          lang === "ar" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        عربي
      </Link>
    </div>
  );
}
