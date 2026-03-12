import { db } from "@/lib/firebase";
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { Project, InsertProject } from "@shared/schema";

const PROJECTS_COLLECTION = "projects";

const mapProject = (docSnap: any): Project => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
  } as Project;
};

export async function getUserProjects(uid: string): Promise<Project[]> {
  if (!db) return [];
  const ref = collection(db, "users", uid, PROJECTS_COLLECTION);
  const snapshot = await getDocs(query(ref));
  return snapshot.docs.map(mapProject);
}

export async function createProject(uid: string, project: InsertProject): Promise<Project> {
  if (!db) throw new Error("Database not initialized");
  const ref = collection(db, "users", uid, PROJECTS_COLLECTION);
  const docRef = await addDoc(ref, { ...project, uid, createdAt: Timestamp.now() });
  return { id: docRef.id, uid, ...project, createdAt: new Date() };
}

export async function updateProject(uid: string, projectId: string, updates: Partial<InsertProject>) {
  if (!db) throw new Error("Database not initialized");
  await updateDoc(doc(db, "users", uid, PROJECTS_COLLECTION, projectId), updates);
}

export async function deleteProject(uid: string, projectId: string) {
  if (!db) throw new Error("Database not initialized");
  await deleteDoc(doc(db, "users", uid, PROJECTS_COLLECTION, projectId));
}
