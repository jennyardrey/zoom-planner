import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { Goal, InsertGoal } from "@shared/schema";

const GOALS_COLLECTION = "goals";

const mapGoal = (doc: any): Goal => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
  } as Goal;
};

export async function getUserGoals(uid: string) {
  if (!db) return [];
  const goalsRef = collection(db, "users", uid, GOALS_COLLECTION);
  const q = query(goalsRef);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapGoal);
}

export async function createGoal(uid: string, goal: InsertGoal) {
  if (!db) throw new Error("Database not initialized");
  const goalsRef = collection(db, "users", uid, GOALS_COLLECTION);
  const docRef = await addDoc(goalsRef, {
    ...goal,
    uid,
    createdAt: Timestamp.now(),
  });
  return { id: docRef.id, ...goal };
}

export async function updateGoal(uid: string, goalId: string, updates: Partial<InsertGoal>) {
  if (!db) throw new Error("Database not initialized");
  const goalRef = doc(db, "users", uid, GOALS_COLLECTION, goalId);
  await updateDoc(goalRef, updates);
  return { id: goalId, ...updates };
}

export async function deleteGoal(uid: string, goalId: string) {
  if (!db) throw new Error("Database not initialized");
  const goalRef = doc(db, "users", uid, GOALS_COLLECTION, goalId);
  await deleteDoc(goalRef);
}
