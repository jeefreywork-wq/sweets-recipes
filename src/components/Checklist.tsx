"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import type { Ingredient } from "@/lib/api";

export function Checklist({ items, lang }: { items: Ingredient[]; lang: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const toggle = (i: number) => {
    setChecked(prev => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li
          key={i}
          className={`flex items-center gap-4 p-4 border-4 border-black cursor-pointer transition-all ${
            checked[i] ? "bg-gray-200 opacity-50 line-through" : "bg-white card-brutal"
          }`}
          onClick={() => toggle(i)}
        >
          <div className="w-8 h-8 border-4 border-black shrink-0 flex items-center justify-center bg-(--color-bg-light)">
            {checked[i] && <Check strokeWidth={4} />}
          </div>
          <div className="font-bold text-lg">
            {item.quantity} {item.unit} {item.item[lang as 'en' | 'ar']}
          </div>
        </li>
      ))}
    </ul>
  );
}
