import { z } from "zod";
import { insertGoalSchema, insertTaskSchema, insertHabitSchema, insertHabitLogSchema, goalSchema, taskSchema, habitSchema, habitLogSchema } from "./schema";

// This file defines the API contract.
// Note: The implementation will use Firebase Firestore directly in the frontend,
// but these schemas serve as the data definitions.

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// We define a 'virtual' API structure to help structure the code, 
// even though we won't use these endpoints.
export const api = {
  goals: {
    list: {
      method: "GET" as const,
      path: "/api/goals",
      responses: { 200: z.array(goalSchema) }
    },
    create: {
      method: "POST" as const,
      path: "/api/goals",
      input: insertGoalSchema,
      responses: { 201: goalSchema }
    },
    update: {
      method: "PATCH" as const,
      path: "/api/goals/:id",
      input: insertGoalSchema.partial(),
      responses: { 200: goalSchema }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/goals/:id",
      responses: { 204: z.void() }
    }
  },
  tasks: {
    list: {
      method: "GET" as const,
      path: "/api/tasks",
      responses: { 200: z.array(taskSchema) }
    },
    create: {
      method: "POST" as const,
      path: "/api/tasks",
      input: insertTaskSchema,
      responses: { 201: taskSchema }
    },
    update: {
      method: "PATCH" as const,
      path: "/api/tasks/:id",
      input: insertTaskSchema.partial(),
      responses: { 200: taskSchema }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/tasks/:id",
      responses: { 204: z.void() }
    }
  },
  habits: {
    list: {
      method: "GET" as const,
      path: "/api/habits",
      responses: { 200: z.array(habitSchema) }
    },
    create: {
      method: "POST" as const,
      path: "/api/habits",
      input: insertHabitSchema,
      responses: { 201: habitSchema }
    },
    update: {
      method: "PATCH" as const,
      path: "/api/habits/:id",
      input: insertHabitSchema.partial(),
      responses: { 200: habitSchema }
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/habits/:id",
      responses: { 204: z.void() }
    }
  },
  habitLogs: {
    list: {
      method: "GET" as const,
      path: "/api/habit-logs",
      responses: { 200: z.array(habitLogSchema) }
    },
    create: {
      method: "POST" as const,
      path: "/api/habit-logs",
      input: insertHabitLogSchema,
      responses: { 201: habitLogSchema }
    },
    update: {
      method: "PATCH" as const,
      path: "/api/habit-logs/:id",
      input: insertHabitLogSchema.partial(),
      responses: { 200: habitLogSchema }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
