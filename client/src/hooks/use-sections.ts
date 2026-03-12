import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import * as SectionService from "../services/sections";
import type { InsertSection } from "@shared/schema";
import { useToast } from "./use-toast";

export function useProjectSections(projectId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["sections", user?.uid, projectId],
    queryFn: () => (user && projectId) ? SectionService.getProjectSections(user.uid, projectId) : Promise.resolve([]),
    enabled: !!user && !!projectId,
  });
}

export function useCreateSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, section }: { projectId: string; section: Omit<InsertSection, 'projectId'> }) => {
      if (!user) throw new Error("Not authenticated");
      return SectionService.createSection(user.uid, projectId, section);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sections", user?.uid, variables.projectId] });
      toast({ title: "Section created" });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    },
  });
}

export function useUpdateSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, sectionId, updates }: { projectId: string; sectionId: string; updates: Partial<InsertSection> }) => {
      if (!user) throw new Error("Not authenticated");
      return SectionService.updateSection(user.uid, projectId, sectionId, updates);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sections", user?.uid, variables.projectId] });
    },
  });
}

export function useDeleteSection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ projectId, sectionId }: { projectId: string; sectionId: string }) => {
      if (!user) throw new Error("Not authenticated");
      return SectionService.deleteSection(user.uid, projectId, sectionId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sections", user?.uid, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Section deleted" });
    },
  });
}
