import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { Section, InsertSection } from "@shared/schema";

const mapSection = (docSnap: any): Section => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
  } as Section;
};

export async function getProjectSections(uid: string, projectId: string): Promise<Section[]> {
  if (!db) return [];
  const ref = collection(db, "users", uid, "projects", projectId, "sections");
  const snapshot = await getDocs(query(ref));
  return snapshot.docs.map(mapSection).sort((a, b) => a.order - b.order);
}

export async function createSection(uid: string, projectId: string, section: Omit<InsertSection, 'projectId'>): Promise<Section> {
  if (!db) throw new Error("Database not initialized");
  const ref = collection(db, "users", uid, "projects", projectId, "sections");
  const docRef = await addDoc(ref, { ...section, projectId, uid, createdAt: Timestamp.now() });
  return { id: docRef.id, uid, projectId, ...section, createdAt: new Date() };
}

export async function updateSection(uid: string, projectId: string, sectionId: string, updates: Partial<InsertSection>) {
  if (!db) throw new Error("Database not initialized");
  await updateDoc(doc(db, "users", uid, "projects", projectId, "sections", sectionId), updates);
}

export async function deleteSection(uid: string, projectId: string, sectionId: string) {
  if (!db) throw new Error("Database not initialized");
  await deleteDoc(doc(db, "users", uid, "projects", projectId, "sections", sectionId));
}
