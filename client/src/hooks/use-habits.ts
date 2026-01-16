import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import * as HabitService from "../services/habits";
import type { InsertHabit, InsertHabitLog } from "@shared/schema";
import { useToast } from "./use-toast";

export function useHabits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["habits", user?.uid],
    queryFn: () => user ? HabitService.getUserHabits(user.uid) : Promise.resolve([]),
    enabled: !!user,
  });
}

export function useHabitLogs(startDate?: string, endDate?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["habitLogs", user?.uid, startDate, endDate],
    queryFn: () => user ? HabitService.getUserHabitLogs(user.uid, startDate, endDate) : Promise.resolve([]),
    enabled: !!user,
  });
}

export function useCreateHabit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (habit: InsertHabit) => {
      if (!user) throw new Error("Not authenticated");
      return HabitService.createHabit(user.uid, habit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({ title: "Habit initialized", description: "Consistency is key." });
    },
  });
}

export function useToggleHabit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (log: InsertHabitLog) => {
      if (!user) throw new Error("Not authenticated");
      return HabitService.toggleHabitLog(user.uid, log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
    },
  });
}

export function useDeleteHabit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error("Not authenticated");
      return HabitService.deleteHabit(user.uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({ title: "Habit deleted" });
    },
  });
}
