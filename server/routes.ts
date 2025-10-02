import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { generateCompleteContent, generateContentFromScript } from "./openai";
import { generateContentSchema, uploadScriptSchema, insertProjectSchema, updateProjectSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Project management routes
  app.get("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projects = await storage.getProjectsByUserId(req.user!.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject({
        ...projectData,
        userId: req.user!.id,
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = updateProjectSchema.parse(req.body);
      const updatedProject = await storage.updateProject(req.params.id, updates);
      res.json(updatedProject);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      if (project.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const deleted = await storage.deleteProject(req.params.id);
      if (deleted) {
        res.sendStatus(204);
      } else {
        res.status(500).json({ message: "Failed to delete project" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Content generation routes
  app.post("/api/generate/ai-content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { topic, videoLength, contentTemplate, tone, selectedContentTypes } = generateContentSchema.parse(req.body);
      
      // Create project first
      const project = await storage.createProject({
        title: topic,
        description: `AI-generated content for: ${topic}`,
        status: "in_progress",
        workflow: "ai-generate",
        videoLength,
        contentTemplate,
        tone,
        selectedContentTypes,
        userId: req.user!.id,
      });

      // Generate content
      const generatedContent = await generateCompleteContent(
        topic,
        videoLength,
        tone,
        contentTemplate,
        selectedContentTypes
      );

      // Update project with generated content
      const updatedProject = await storage.updateProject(project.id, {
        generatedContent,
        status: "completed",
      });

      res.json(updatedProject);
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({ message: "Failed to generate content: " + (error as Error).message });
    }
  });

  app.post("/api/generate/script-content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { title, script, videoLength, tone, selectedContentTypes } = uploadScriptSchema.parse(req.body);
      
      // Create project first
      const project = await storage.createProject({
        title,
        description: `Generated content from custom script: ${title}`,
        status: "in_progress",
        workflow: "upload-script",
        videoLength,
        customScript: script,
        tone,
        selectedContentTypes,
        userId: req.user!.id,
      });

      // Generate content from script
      const generatedContent = await generateContentFromScript(
        title,
        script,
        videoLength,
        tone,
        selectedContentTypes
      );

      // Update project with generated content
      const updatedProject = await storage.updateProject(project.id, {
        generatedContent,
        status: "completed",
      });

      res.json(updatedProject);
    } catch (error) {
      console.error("Script content generation error:", error);
      res.status(500).json({ message: "Failed to generate content from script: " + (error as Error).message });
    }
  });

  // User stats route
  app.get("/api/user/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const projects = await storage.getProjectsByUserId(req.user!.id);
      const totalProjects = projects.length;
      const completedProjects = projects.filter(p => p.status === "completed").length;
      const thisMonth = projects.filter(p => {
        const createdDate = new Date(p.createdAt!);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length;

      const stats = {
        totalProjects,
        scriptsGenerated: completedProjects,
        thisMonth,
        avgRating: 4.8, // Static for now
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
