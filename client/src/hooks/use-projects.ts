import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import * as ProjectService from "../services/projects";
import * as SectionService from "../services/sections";
import type { InsertProject } from "@shared/schema";
import { useToast } from "./use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, updateDoc, doc, deleteField } from "firebase/firestore";

export function useProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["projects", user?.uid],
    queryFn: () => user ? ProjectService.getUserProjects(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });
}

export function useCreateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (project: InsertProject) => {
      if (!user) throw new Error("Not authenticated");
      return ProjectService.createProject(user.uid, project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project created" });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });
}

export function useUpdateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertProject> }) => {
      if (!user) throw new Error("Not authenticated");
      return ProjectService.updateProject(user.uid, id, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (projectId: string) => {
      if (!user) throw new Error("Not authenticated");
      if (!db) throw new Error("Database not initialized");
      const firestore = db;

      // 1. Unassign all tasks belonging to this project using deleteField() directly
      const tasksRef = collection(firestore, "users", user.uid, "tasks");
      const tasksSnapshot = await getDocs(query(tasksRef));
      const projectTaskDocs = tasksSnapshot.docs.filter(d => d.data().projectId === projectId);
      await Promise.all(
        projectTaskDocs.map(d =>
          updateDoc(doc(firestore, "users", user.uid, "tasks", d.id), {
            projectId: deleteField(),
            sectionId: deleteField(),
            order: deleteField(),
          })
        )
      );

      // 2. Delete all sections
      const sections = await SectionService.getProjectSections(user.uid, projectId);
      await Promise.all(sections.map(s => SectionService.deleteSection(user.uid, projectId, s.id)));

      // 3. Delete the project
      await ProjectService.deleteProject(user.uid, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Project deleted", description: "Tasks have been unassigned." });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });
}
