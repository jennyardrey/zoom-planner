import { db } from "./db";
// We don't really need storage logic here since frontend talks to Firebase.
// But we implement the interface to satisfy the template structure.

export interface IStorage {
  // Define methods if needed for server-side logic (e.g. seeds)
}

export class DatabaseStorage implements IStorage {
  // Empty implementation
}

export const storage = new DatabaseStorage();
