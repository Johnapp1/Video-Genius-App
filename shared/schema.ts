import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("draft"), // draft, in_progress, completed
  workflow: text("workflow").notNull(), // ai-generate, upload-script
  videoLength: text("video_length"),
  contentTemplate: text("content_template"),
  customScript: text("custom_script"),
  generatedContent: json("generated_content"), // stores all AI generated content
  selectedContentTypes: json("selected_content_types"), // array of content types to generate
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProjectSchema = insertProjectSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type UpdateProject = z.infer<typeof updateProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Content generation request schemas
export const generateContentSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  videoLength: z.string(),
  contentTemplate: z.string().optional(),
  selectedContentTypes: z.array(z.string()),
});

export const uploadScriptSchema = z.object({
  title: z.string().min(1, "Title is required"),
  script: z.string().min(1, "Script is required"),
  videoLength: z.string(),
  selectedContentTypes: z.array(z.string()),
});

export type GenerateContentRequest = z.infer<typeof generateContentSchema>;
export type UploadScriptRequest = z.infer<typeof uploadScriptSchema>;
