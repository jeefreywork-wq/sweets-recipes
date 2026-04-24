"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Image from "next/image";
import type { Recipe, Ingredient, Instruction } from "@/lib/api";

interface Dict {
  admin: {
    login: string; email: string; password: string; submit: string;
    dashboard: string; addRecipe: string; titleEn: string; titleAr: string;
    save: string; addIngredient: string; addStep: string; timerDuration: string;
  };
}

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200 bg-white transition-all";
const btnPrimary = "w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const btnSecondary = "px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors";

export function AdminClient({ dict }: { dict: Dict }) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("VIEW_ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [titleEn, setTitleEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [category, setCategory] = useState("fastSweets");
  const [ingredients, setIngredients] = useState([{ itemEn: "", itemAr: "", quantity: "", unit: "" }]);
  const [instructions, setInstructions] = useState([{ textEn: "", textAr: "", hasTimer: false, timerDuration: 0 }]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const fetchRecipes = async () => {
    try {
      const snap = await getDocs(collection(db, "recipes"));
      setRecipes(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Recipe, "id">) })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u); setLoading(false);
      if (u) fetchRecipes();
    });
    return unsub;
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (err: unknown) { alert((err as Error).message); }
  };

  const uploadToImgBB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) { alert("ImgBB API key missing."); return; }
    setImageUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      setImageUrl(data.data.url);
    } catch (err: unknown) { alert((err as Error).message); }
    finally { setImageUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUploading) return;
    const recipeData = {
      title: { en: titleEn, ar: titleAr }, image: imageUrl, category,
      ingredients: ingredients.map(i => ({ item: { en: i.itemEn, ar: i.itemAr }, quantity: i.quantity, unit: i.unit })),
      instructions: instructions.map(i => ({ text: { en: i.textEn, ar: i.textAr }, hasTimer: i.hasTimer, timerDuration: i.timerDuration })),
      updatedAt: new Date().toISOString()
    };
    try {
      if (editingId) { await updateDoc(doc(db, "recipes", editingId), recipeData); alert("Updated!"); }
      else { await addDoc(collection(db, "recipes"), { ...recipeData, createdAt: new Date().toISOString() }); alert("Added!"); }
      resetForm(); fetchRecipes(); setActiveTab("VIEW_ALL");
    } catch (err: unknown) { alert((err as Error).message); }
  };

  const resetForm = () => {
    setEditingId(null); setTitleEn(""); setTitleAr(""); setCategory("fastSweets"); setImageUrl("");
    setIngredients([{ itemEn: "", itemAr: "", quantity: "", unit: "" }]);
    setInstructions([{ textEn: "", textAr: "", hasTimer: false, timerDuration: 0 }]);
  };

  const editRecipe = (r: Recipe) => {
    setEditingId(r.id); setTitleEn(r.title?.en || ""); setTitleAr(r.title?.ar || "");
    setImageUrl(r.image || ""); setCategory(r.category || "fastSweets");
    setIngredients(r.ingredients?.map((i: Ingredient) => ({ itemEn: i.item?.en || "", itemAr: i.item?.ar || "", quantity: i.quantity || "", unit: i.unit || "" })) || []);
    setInstructions(r.instructions?.map((i: Instruction) => ({ textEn: i.text?.en || "", textAr: i.text?.ar || "", hasTimer: i.hasTimer || false, timerDuration: i.timerDuration || 0 })) || []);
    setActiveTab("ADD_NEW"); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRecipe = async (id: string) => {
    if (window.confirm("Delete this recipe?")) {
      try { await deleteDoc(doc(db, "recipes", id)); fetchRecipes(); }
      catch (err: unknown) { alert((err as Error).message); }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 w-full max-w-sm space-y-6">
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-gray-900">{dict.admin.login}</h1>
            <p className="text-sm text-gray-400 mt-1">Admin access only</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input className={inputCls} placeholder={dict.admin.email} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className={inputCls} placeholder={dict.admin.password} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button className={btnPrimary} type="submit">{dict.admin.submit}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 py-10 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl font-bold text-gray-900">{dict.admin.dashboard}</h1>
        <button onClick={() => signOut(auth)} className={btnSecondary}>Sign out</button>
      </div>

      {/* Stat Card */}
      <div className="w-fit">
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-1 min-w-[160px]">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Recipes</p>
          <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-gray-900">{recipes.length}</p>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => { setActiveTab("VIEW_ALL"); resetForm(); }} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "VIEW_ALL" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
            All Recipes
          </button>
          {activeTab === "ADD_NEW" && (
            <button className="px-5 py-2 rounded-lg text-sm font-semibold bg-white shadow-sm text-gray-900">
              {editingId ? "Edit Recipe" : "Add New"}
            </button>
          )}
        </div>
        {activeTab === "VIEW_ALL" && (
          <button
            onClick={() => setActiveTab("ADD_NEW")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <span className="text-lg leading-none">+</span> New Recipe
          </button>
        )}
      </div>

      {/* Form */}
      {activeTab === "ADD_NEW" && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Update Recipe" : dict.admin.addRecipe}</h2>
            {editingId && <button type="button" onClick={() => { resetForm(); setActiveTab("VIEW_ALL"); }} className={btnSecondary}>Cancel</button>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className={inputCls} placeholder={dict.admin.titleEn} value={titleEn} onChange={e => setTitleEn(e.target.value)} required />
            <input className={`${inputCls} text-right`} placeholder={dict.admin.titleAr} value={titleAr} onChange={e => setTitleAr(e.target.value)} dir="rtl" required />
          </div>

          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 min-h-[180px] flex flex-col items-center justify-center relative overflow-hidden hover:border-indigo-300 transition-colors">
            {imageUrl ? (
              <>
                <Image src={imageUrl} alt="Preview" fill unoptimized sizes="400px" className="object-cover" />
                <button type="button" onClick={() => setImageUrl("")} className="absolute top-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-white shadow border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50">Remove</button>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">+</div>
                <span className="text-sm font-medium">{imageUploading ? "Uploading..." : "Click to upload image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={uploadToImgBB} disabled={imageUploading} />
              </label>
            )}
          </div>

          <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
            <option value="fastSweets">Fast Sweets</option>
            <option value="cakes">Cakes</option>
            <option value="occasions">Occasions</option>
            <option value="noBake">No-Bake</option>
            <option value="healthy">Healthy</option>
          </select>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">{dict.admin.addIngredient}</h3>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <input className={inputCls} placeholder="EN" value={ing.itemEn} onChange={e => { const n = [...ingredients]; n[idx].itemEn = e.target.value; setIngredients(n); }} required />
                <input className={`${inputCls} text-right`} placeholder="AR" dir="rtl" value={ing.itemAr} onChange={e => { const n = [...ingredients]; n[idx].itemAr = e.target.value; setIngredients(n); }} required />
                <input className={`${inputCls} md:w-24`} placeholder="Qty" value={ing.quantity} onChange={e => { const n = [...ingredients]; n[idx].quantity = e.target.value; setIngredients(n); }} required />
                <input className={`${inputCls} md:w-24`} placeholder="Unit" value={ing.unit} onChange={e => { const n = [...ingredients]; n[idx].unit = e.target.value; setIngredients(n); }} required />
                {ingredients.length > 1 && <button type="button" onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 text-xs font-semibold shrink-0">Remove</button>}
              </div>
            ))}
            <button type="button" onClick={() => setIngredients([...ingredients, { itemEn: "", itemAr: "", quantity: "", unit: "" }])} className={btnSecondary}>+ Add Ingredient</button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">{dict.admin.addStep}</h3>
            {instructions.map((inst, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex flex-col md:flex-row gap-2">
                  <input className={inputCls} placeholder="Step EN" value={inst.textEn} onChange={e => { const n = [...instructions]; n[idx].textEn = e.target.value; setInstructions(n); }} required />
                  <input className={`${inputCls} text-right`} placeholder="Step AR" dir="rtl" value={inst.textAr} onChange={e => { const n = [...instructions]; n[idx].textAr = e.target.value; setInstructions(n); }} required />
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded" checked={inst.hasTimer} onChange={e => { const n = [...instructions]; n[idx].hasTimer = e.target.checked; setInstructions(n); }} />
                    Has Timer
                  </label>
                  {inst.hasTimer && <input type="number" className={`${inputCls} w-28`} placeholder="Minutes" value={inst.timerDuration} onChange={e => { const n = [...instructions]; n[idx].timerDuration = Number(e.target.value); setInstructions(n); }} required />}
                  {instructions.length > 1 && <button type="button" onClick={() => setInstructions(instructions.filter((_, i) => i !== idx))} className="ml-auto px-3 py-1.5 rounded-lg bg-rose-50 text-rose-500 border border-rose-100 text-xs font-semibold">Remove</button>}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setInstructions([...instructions, { textEn: "", textAr: "", hasTimer: false, timerDuration: 0 }])} className={btnSecondary}>+ Add Step</button>
          </div>

          <button type="submit" disabled={imageUploading} className={`${btnPrimary} ${editingId ? "bg-indigo-500 hover:bg-indigo-600" : ""}`}>
            {editingId ? "Update Recipe" : dict.admin.save}
          </button>
        </form>
      )}

      {/* Recipe Grid */}
      {activeTab === "VIEW_ALL" && (
        recipes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] p-16 text-center space-y-3">
            <div className="text-5xl">🍳</div>
            <p style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-gray-700">Your kitchen is empty.</p>
            <p className="text-sm text-gray-400">Start adding delicious recipes!</p>
            <button onClick={() => setActiveTab("ADD_NEW")} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-colors">
              + Add First Recipe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map(r => (
              <div key={r.id} className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                {/* Image */}
                <div className="relative h-44 bg-gray-100">
                  {r.image && <Image src={r.image} alt={r.title?.en || ""} fill unoptimized sizes="300px" className="object-cover" />}
                  {/* Hover overlay — desktop only */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Info */}
                <div className="p-5 space-y-2">
                  <h4 style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-gray-900 text-base truncate">{r.title?.en}</h4>
                  <p className="text-xs text-gray-400 truncate">{r.title?.ar}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-semibold border border-indigo-100">{r.category}</span>
                    <div className="flex gap-2">
                      <button onClick={() => editRecipe(r)} title="Edit" className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-sm hover:bg-amber-100 transition-colors">✏️</button>
                      <button onClick={() => deleteRecipe(r.id)} title="Delete" className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-sm hover:bg-rose-100 transition-colors">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
