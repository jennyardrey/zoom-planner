import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import * as GoalService from "../services/goals";
import type { InsertGoal } from "@shared/schema";
import { useToast } from "./use-toast";

export function useGoals() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["goals", user?.uid],
    queryFn: () => user ? GoalService.getUserGoals(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });
}

export function useCreateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (goal: InsertGoal) => {
      if (!user) throw new Error("Not authenticated");
      return GoalService.createGoal(user.uid, goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: "Goal created", description: "Aim high!" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  });
}

export function useUpdateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: Partial<InsertGoal> }) => {
      if (!user) throw new Error("Not authenticated");
      return GoalService.updateGoal(user.uid, id, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useDeleteGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error("Not authenticated");
      return GoalService.deleteGoal(user.uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({ title: "Goal removed" });
    },
  });
}
