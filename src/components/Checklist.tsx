"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Ingredient } from "@/lib/api";

export function Checklist({ items, lang }: { items: Ingredient[]; lang: string }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const toggle = (i: number) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          onClick={() => toggle(i)}
          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
            checked[i] ? "bg-gray-100 opacity-50 line-through" : "bg-white hover:bg-gray-50 border border-gray-100"
          }`}
        >
          <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 transition-colors ${
            checked[i] ? "bg-gray-900 border-gray-900" : "border-gray-300"
          }`}>
            {checked[i] && <Check size={12} strokeWidth={3} className="text-white" />}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {item.quantity} {item.unit} {item.item[lang as 'en' | 'ar']}
          </span>
        </li>
      ))}
    </ul>
  );
}
