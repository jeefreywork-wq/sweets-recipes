import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Ingredient {
  item: { en: string; ar: string };
  quantity: string;
  unit: string;
}

export interface Instruction {
  text: { en: string; ar: string };
  hasTimer: boolean;
  timerDuration: number;
}

export interface Recipe {
  id: string;
  title: { en: string; ar: string };
  image?: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
  ingredients?: Ingredient[];
  instructions?: Instruction[];
}

export async function getRecipes(): Promise<Recipe[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "recipes"));
    const recipes: Recipe[] = [];
    querySnapshot.forEach((d) => {
      recipes.push({ id: d.id, ...(d.data() as Omit<Recipe, "id">) });
    });
    return recipes;
  } catch (error) {
    console.error("Firebase Read Error:", error);
    return [];
  }
}

export async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const docRef = doc(db, "recipes", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<Recipe, "id">) };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Firebase Read Error:", error);
    return null;
  }
}
