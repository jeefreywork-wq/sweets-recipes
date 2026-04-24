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

export function AdminClient({ dict }: { dict: Dict }) {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);

  // Tabs: "VIEW_ALL" | "ADD_NEW"
  const [activeTab, setActiveTab] = useState("VIEW_ALL");

  // Form State
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
      const recs = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Recipe, "id">) }));
      setRecipes(recs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) fetchRecipes();
    });
    return unsub;
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const uploadToImgBB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      alert("ImgBB API key missing.");
      return;
    }

    setImageUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");
      setImageUrl(data.data.url);
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUploading) return;
    const recipeData = {
      title: { en: titleEn, ar: titleAr },
      image: imageUrl,
      category,
      ingredients: ingredients.map(i => ({
        item: { en: i.itemEn, ar: i.itemAr },
        quantity: i.quantity,
        unit: i.unit
      })),
      instructions: instructions.map(i => ({
        text: { en: i.textEn, ar: i.textAr },
        hasTimer: i.hasTimer,
        timerDuration: i.timerDuration
      })),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "recipes", editingId), recipeData);
        alert("Recipe Updated!");
      } else {
        await addDoc(collection(db, "recipes"), { ...recipeData, createdAt: new Date().toISOString() });
        alert("Recipe Added!");
      }
      resetForm();
      fetchRecipes();
      setActiveTab("VIEW_ALL");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitleEn(""); setTitleAr(""); setCategory("fastSweets"); setImageUrl("");
    setIngredients([{ itemEn: "", itemAr: "", quantity: "", unit: "" }]);
    setInstructions([{ textEn: "", textAr: "", hasTimer: false, timerDuration: 0 }]);
  };

  const editRecipe = (r: Recipe) => {
    setEditingId(r.id);
    setTitleEn(r.title?.en || "");
    setTitleAr(r.title?.ar || "");
    setImageUrl(r.image || "");
    setCategory(r.category || "fastSweets");
    setIngredients(r.ingredients?.map((i: Ingredient) => ({
      itemEn: i.item?.en || "", itemAr: i.item?.ar || "", quantity: i.quantity || "", unit: i.unit || ""
    })) || []);
    setInstructions(r.instructions?.map((i: Instruction) => ({
      textEn: i.text?.en || "", textAr: i.text?.ar || "", hasTimer: i.hasTimer || false, timerDuration: i.timerDuration || 0
    })) || []);
    setActiveTab("ADD_NEW");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRecipe = async (id: string) => {
    if (window.confirm("Delete recipe?")) {
      try {
        await deleteDoc(doc(db, "recipes", id));
        fetchRecipes();
      } catch (err: unknown) {
        alert((err as Error).message);
      }
    }
  };

  if (loading) return <div className="text-xl font-black p-4">LOADING...</div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 card-brutal p-6">
        <h1 className="text-2xl md:text-3xl font-black mb-6">{dict.admin.login}</h1>
        <form onSubmit={login} className="space-y-4">
          <input className="w-full border-2 border-black p-3 text-lg outline-none focus:bg-bg-light" placeholder={dict.admin.email} type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full border-2 border-black p-3 text-lg outline-none focus:bg-bg-light" placeholder={dict.admin.password} type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button className="btn-brutal bg-accent-blue text-white w-full text-xl py-3">{dict.admin.submit}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full text-sm md:text-base">
      <div className="flex flex-wrap justify-between items-center bg-black text-white p-3 md:p-4 border-2 md:border-4 border-black gap-2">
        <h1 className="text-xl md:text-2xl font-black uppercase">{dict.admin.dashboard}</h1>
        <button onClick={() => signOut(auth)} className="btn-brutal bg-white text-black py-1 px-3 text-sm">LOGOUT</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => { setActiveTab("VIEW_ALL"); resetForm(); }}
          className={`flex-1 py-2 font-black uppercase border-2 md:border-4 border-black transition-all ${activeTab === "VIEW_ALL" ? "bg-accent-mint shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-white"}`}
        >
          VIEW ALL
        </button>
        <button 
          onClick={() => setActiveTab("ADD_NEW")}
          className={`flex-1 py-2 font-black uppercase border-2 md:border-4 border-black transition-all ${activeTab === "ADD_NEW" ? "bg-accent-mint shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "bg-white"}`}
        >
          {editingId ? "EDIT RECIPE" : "ADD NEW"}
        </button>
      </div>

      {activeTab === "ADD_NEW" && (
        <form onSubmit={handleSave} className="card-brutal p-4 space-y-6 w-full">
          <div className="flex justify-between items-center border-b-2 border-black pb-2">
            <h2 className="text-lg md:text-xl font-black uppercase">{editingId ? "UPDATE RECIPE" : dict.admin.addRecipe}</h2>
            {editingId && <button type="button" onClick={() => {resetForm(); setActiveTab("VIEW_ALL");}} className="btn-brutal bg-bg-light py-1 px-3 text-xs">CANCEL</button>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border-2 md:border-4 border-black p-2 outline-none w-full" placeholder={dict.admin.titleEn} value={titleEn} onChange={e=>setTitleEn(e.target.value)} required />
            <input className="border-2 md:border-4 border-black p-2 outline-none text-right w-full" placeholder={dict.admin.titleAr} value={titleAr} onChange={e=>setTitleAr(e.target.value)} dir="rtl" required />
          </div>

          <div className="border-4 border-black p-4 relative shadow-brutal bg-white text-center min-h-[200px] flex flex-col items-center justify-center">
            {imageUrl ? (
              <>
                <Image src={imageUrl} alt="Preview" fill unoptimized sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
                <button 
                  type="button" 
                  onClick={() => setImageUrl("")} 
                  className="absolute top-2 right-2 btn-brutal bg-accent-orange text-white py-1 px-3 z-10 text-sm"
                >
                  REMOVE
                </button>
              </>
            ) : (
              <>
                <label className="btn-brutal bg-accent-blue text-white cursor-pointer py-2 px-6">
                  {imageUploading ? "UPLOADING..." : "SELECT IMAGE"}
                  <input type="file" accept="image/*" className="hidden" onChange={uploadToImgBB} disabled={imageUploading} />
                </label>
                {!imageUploading && <span className="mt-4 font-bold uppercase text-gray-500">No file chosen</span>}
              </>
            )}
          </div>

          <select className="border-2 md:border-4 border-black p-2 w-full outline-none font-bold" value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="fastSweets">Fast Sweets</option>
            <option value="cakes">Cakes</option>
            <option value="occasions">Occasions</option>
            <option value="noBake">No-Bake</option>
            <option value="healthy">Healthy</option>
          </select>

          <div className="space-y-2">
            <h3 className="text-base font-bold uppercase">{dict.admin.addIngredient}</h3>
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-2 border-2 border-black p-2 bg-bg-light">
                <input className="border-2 border-black p-2 outline-none w-full md:w-1/3" placeholder="EN" value={ing.itemEn} onChange={e=>{const n=[...ingredients]; n[idx].itemEn=e.target.value; setIngredients(n);}} required />
                <input className="border-2 border-black p-2 outline-none text-right w-full md:w-1/3" placeholder="AR" dir="rtl" value={ing.itemAr} onChange={e=>{const n=[...ingredients]; n[idx].itemAr=e.target.value; setIngredients(n);}} required />
                <div className="flex gap-2 w-full md:w-1/3">
                  <input className="border-2 border-black p-2 outline-none w-1/2" placeholder="Qty" value={ing.quantity} onChange={e=>{const n=[...ingredients]; n[idx].quantity=e.target.value; setIngredients(n);}} required />
                  <input className="border-2 border-black p-2 outline-none w-1/2" placeholder="Unit" value={ing.unit} onChange={e=>{const n=[...ingredients]; n[idx].unit=e.target.value; setIngredients(n);}} required />
                </div>
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} className="btn-brutal bg-accent-orange text-white py-1 px-2 shrink-0">X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={()=>setIngredients([...ingredients, {itemEn:"",itemAr:"",quantity:"",unit:""}])} className="btn-brutal bg-accent-yellow py-1 px-3 text-sm font-bold">+ INGREDIENT</button>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold uppercase">{dict.admin.addStep}</h3>
            {instructions.map((inst, idx) => (
              <div key={idx} className="border-2 border-black p-2 space-y-2 bg-bg-light">
                <div className="flex flex-col md:flex-row gap-2">
                  <input className="border-2 border-black p-2 outline-none w-full md:w-1/2" placeholder="EN" value={inst.textEn} onChange={e=>{const n=[...instructions]; n[idx].textEn=e.target.value; setInstructions(n);}} required />
                  <input className="border-2 border-black p-2 outline-none text-right w-full md:w-1/2" placeholder="AR" dir="rtl" value={inst.textAr} onChange={e=>{const n=[...instructions]; n[idx].textAr=e.target.value; setInstructions(n);}} required />
                </div>
                <div className="flex flex-wrap gap-2 items-center font-bold text-sm">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 border-2 border-black" checked={inst.hasTimer} onChange={e=>{const n=[...instructions]; n[idx].hasTimer=e.target.checked; setInstructions(n);}} />
                    Has Timer?
                  </label>
                  {inst.hasTimer && (
                    <input type="number" className="border-2 border-black p-1 outline-none w-20" placeholder="Mins" value={inst.timerDuration} onChange={e=>{const n=[...instructions]; n[idx].timerDuration=Number(e.target.value); setInstructions(n);}} required />
                  )}
                  {instructions.length > 1 && (
                    <button type="button" onClick={() => setInstructions(instructions.filter((_, i) => i !== idx))} className="btn-brutal bg-accent-orange text-white py-1 px-2 ml-auto shrink-0">X</button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={()=>setInstructions([...instructions, {textEn:"",textAr:"",hasTimer:false,timerDuration:0}])} className="btn-brutal bg-accent-yellow py-1 px-3 text-sm font-bold">+ STEP</button>
          </div>

          <button type="submit" disabled={imageUploading} className={`btn-brutal font-black uppercase w-full py-3 mt-4 ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''} ${editingId ? 'bg-accent-blue text-white' : 'bg-accent-mint'}`}>
            {editingId ? "UPDATE RECIPE" : dict.admin.save}
          </button>
        </form>
      )}

      {activeTab === "VIEW_ALL" && (
        <div className="space-y-4">
          {recipes.length === 0 ? (
            <div className="card-brutal p-8 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
              [ NO RECIPES DETECTED ]
            </div>
          ) : (
            <div className="grid gap-4">
              {recipes.map(r => (
                <div key={r.id} className="card-brutal p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <h4 className="font-bold truncate max-w-[200px] md:max-w-md">{r.title?.en} / {r.title?.ar}</h4>
                    <span className="inline-block px-1 py-0.5 border-2 border-black font-bold text-xs bg-bg-light mt-1">{r.category}</span>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto shrink-0">
                    <button onClick={() => editRecipe(r)} className="btn-brutal bg-accent-yellow flex-1 py-1 px-3 text-sm">EDIT</button>
                    <button onClick={() => deleteRecipe(r.id)} className="btn-brutal bg-accent-orange text-white flex-1 py-1 px-3 text-sm">DEL</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
