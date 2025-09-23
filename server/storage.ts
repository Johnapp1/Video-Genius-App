import { type User, type InsertUser, type Project, type InsertProject, type UpdateProject, users, projects } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import ConnectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const MemoryStore = createMemoryStore(session);
const PgSession = ConnectPgSimple(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByUserId(userId: string): Promise<Project[]>;
  createProject(project: InsertProject & { userId: string }): Promise<Project>;
  updateProject(id: string, updates: UpdateProject): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PgSession({
      pool: pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectsByUserId(userId: string): Promise<Project[]> {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  }

  async createProject(projectData: InsertProject & { userId: string }): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values({
        ...projectData,
        description: projectData.description || null,
        status: projectData.status || "draft",
        videoLength: projectData.videoLength || null,
        contentTemplate: projectData.contentTemplate || null,
        customScript: projectData.customScript || null,
        generatedContent: projectData.generatedContent || null,
        selectedContentTypes: projectData.selectedContentTypes || null,
      })
      .returning();
    return project;
  }

  async updateProject(id: string, updates: UpdateProject): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
