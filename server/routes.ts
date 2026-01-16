import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // No server-side API routes needed as we use Firebase.
  // We just return the server.
  
  return httpServer;
}
