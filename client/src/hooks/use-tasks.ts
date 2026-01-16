import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import * as TaskService from "../services/tasks";
import type { InsertTask } from "@shared/schema";
import { useToast } from "./use-toast";

export function useTasks(startDate?: string, endDate?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["tasks", user?.uid, startDate, endDate],
    queryFn: () => user ? TaskService.getUserTasks(user.uid, startDate, endDate) : Promise.resolve([]),
    enabled: !!user,
  });
}

export function useCreateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (task: InsertTask) => {
      if (!user) throw new Error("Not authenticated");
      return TaskService.createTask(user.uid, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task added", description: "Let's get it done." });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Failed to add task", description: err.message });
    }
  });
}

export function useUpdateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<InsertTask> }) => {
      if (!user) throw new Error("Not authenticated");
      return TaskService.updateTask(user.uid, id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Error updating task", description: err.message });
    }
  });
}

export function useDeleteTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error("Not authenticated");
      return TaskService.deleteTask(user.uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task deleted" });
    },
  });
}
