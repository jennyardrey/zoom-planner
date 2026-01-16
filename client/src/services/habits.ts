import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, where } from "firebase/firestore";
import type { Habit, InsertHabit, HabitLog, InsertHabitLog } from "@shared/schema";

const HABITS_COLLECTION = "habits";
const LOGS_COLLECTION = "habitLogs";

// --- HABITS ---

const mapHabit = (doc: any): Habit => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
  } as Habit;
};

export async function getUserHabits(uid: string) {
  if (!db) return [];
  const ref = collection(db, "users", uid, HABITS_COLLECTION);
  const snapshot = await getDocs(query(ref));
  return snapshot.docs.map(mapHabit);
}

export async function createHabit(uid: string, habit: InsertHabit) {
  if (!db) throw new Error("Database not initialized");
  const ref = collection(db, "users", uid, HABITS_COLLECTION);
  const docRef = await addDoc(ref, { ...habit, uid, createdAt: Timestamp.now() });
  return { id: docRef.id, ...habit };
}

export async function updateHabit(uid: string, habitId: string, updates: Partial<InsertHabit>) {
  if (!db) throw new Error("Database not initialized");
  const ref = doc(db, "users", uid, HABITS_COLLECTION, habitId);
  await updateDoc(ref, updates);
  return { id: habitId, ...updates };
}

export async function deleteHabit(uid: string, habitId: string) {
  if (!db) throw new Error("Database not initialized");
  const ref = doc(db, "users", uid, HABITS_COLLECTION, habitId);
  await deleteDoc(ref);
}

// --- LOGS ---

export async function getUserHabitLogs(uid: string, startDate?: string, endDate?: string) {
  if (!db) return [];
  const ref = collection(db, "users", uid, LOGS_COLLECTION);
  
  // Basic query - filter in memory for MVP to simplify indices
  const snapshot = await getDocs(query(ref));
  let logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog));

  if (startDate && endDate) {
    logs = logs.filter(l => l.date >= startDate && l.date <= endDate);
  }
  
  return logs;
}

export async function toggleHabitLog(uid: string, log: InsertHabitLog) {
  if (!db) throw new Error("Database not initialized");
  const ref = collection(db, "users", uid, LOGS_COLLECTION);
  
  // Check if exists
  const q = query(ref, where("habitId", "==", log.habitId), where("date", "==", log.date));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    // Toggle existing
    const docId = snapshot.docs[0].id;
    const currentCompleted = snapshot.docs[0].data().completed;
    const ref = doc(db, "users", uid, LOGS_COLLECTION, docId);
    await updateDoc(ref, { completed: !currentCompleted });
    return { ...log, completed: !currentCompleted };
  } else {
    // Create new
    await addDoc(ref, { ...log, uid });
    return { ...log, completed: true };
  }
}
