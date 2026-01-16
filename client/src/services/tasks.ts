import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { Task, InsertTask } from "@shared/schema";

const TASKS_COLLECTION = "tasks";

// Helper to sanitize Firestore data to match our schema
const mapTask = (doc: any): Task => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
  } as Task;
};

export async function getUserTasks(uid: string, startDate?: string, endDate?: string) {
  if (!db) return [];
  const tasksRef = collection(db, "users", uid, TASKS_COLLECTION);
  
  // Basic query for user
  let q = query(tasksRef);
  
  // In a real app with proper indices, we would filter by date here.
  // For this MVP, we fetch all user tasks and filter in memory to avoid index creation issues.
  
  const snapshot = await getDocs(q);
  const tasks = snapshot.docs.map(mapTask);

  if (startDate && endDate) {
    return tasks.filter(t => t.date >= startDate && t.date <= endDate);
  } else if (startDate) {
    return tasks.filter(t => t.date === startDate);
  }
  
  return tasks;
}

export async function createTask(uid: string, task: InsertTask) {
  if (!db) throw new Error("Database not initialized");
  const tasksRef = collection(db, "users", uid, TASKS_COLLECTION);
  
  const docRef = await addDoc(tasksRef, {
    ...task,
    uid,
    createdAt: Timestamp.now(),
  });
  
  return { id: docRef.id, ...task };
}

export async function updateTask(uid: string, taskId: string, updates: Partial<InsertTask>) {
  if (!db) throw new Error("Database not initialized");
  const taskRef = doc(db, "users", uid, TASKS_COLLECTION, taskId);
  
  await updateDoc(taskRef, updates);
  return { id: taskId, ...updates };
}

export async function deleteTask(uid: string, taskId: string) {
  if (!db) throw new Error("Database not initialized");
  const taskRef = doc(db, "users", uid, TASKS_COLLECTION, taskId);
  await deleteDoc(taskRef);
}
