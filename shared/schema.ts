import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We define these tables to satisfy the project structure, 
// but the data will effectively be stored in Firestore as per requirements.
// However, defining Zod schemas here is useful for shared types.

export const timeframeEnum = z.string();
export const goalStatusEnum = z.enum(["active", "paused", "done"]);
export const taskStatusEnum = z.enum(["todo", "doing", "done"]);
export const scheduleEnum = z.enum(["daily", "weekdays"]);

// Schemas for Firestore Data
export const goalSchema = z.object({
  id: z.string(),
  uid: z.string(), // Firebase User ID
  title: z.string(),
  description: z.string().optional(),
  timeframe: timeframeEnum,
  startDate: z.string().optional(), // YYYY-MM-DD
  endDate: z.string().optional(),   // YYYY-MM-DD
  status: goalStatusEnum,
  parentGoalId: z.string().optional(),
  createdAt: z.string().or(z.date()) // Timestamp
});

export const taskSchema = z.object({
  id: z.string(),
  uid: z.string(),
  title: z.string(),
  date: z.string(), // YYYY-MM-DD
  timeStart: z.string().nullable(), // HH:mm
  timeEnd: z.string().nullable(), // HH:mm
  allDay: z.boolean().default(false),
  status: taskStatusEnum,
  linkedGoalId: z.string().optional(),
  notes: z.string().optional(),
  isPriority: z.boolean().default(false),
  createdAt: z.string().or(z.date())
});

export const habitSchema = z.object({
  id: z.string(),
  uid: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  schedule: scheduleEnum,
  createdAt: z.string().or(z.date())
});

export const habitLogSchema = z.object({
  id: z.string(),
  uid: z.string(),
  habitId: z.string(),
  date: z.string(), // YYYY-MM-DD
  completed: z.boolean()
});

// Insert Schemas (Omit auto-generated fields)
export const insertGoalSchema = goalSchema.omit({ id: true, uid: true, createdAt: true });
export const insertTaskSchema = taskSchema.omit({ id: true, uid: true, createdAt: true });
export const insertHabitSchema = habitSchema.omit({ id: true, uid: true, createdAt: true });
export const insertHabitLogSchema = habitLogSchema.omit({ id: true, uid: true });

// Export Types
export type Goal = z.infer<typeof goalSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Habit = z.infer<typeof habitSchema>;
export type HabitLog = z.infer<typeof habitLogSchema>;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;

// Dummy Drizzle tables to satisfy template if needed (unused in logic)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});
