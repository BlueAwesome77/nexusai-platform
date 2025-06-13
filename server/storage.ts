import { users, generations, voiceModels, type User, type InsertUser, type Generation, type InsertGeneration, type VoiceModel, type InsertVoiceModel } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  getGeneration(id: number): Promise<Generation | undefined>;
  updateGeneration(id: number, updates: Partial<Generation>): Promise<Generation | undefined>;
  getGenerationsByType(type: string): Promise<Generation[]>;
  
  createVoiceModel(voiceModel: InsertVoiceModel): Promise<VoiceModel>;
  getVoiceModel(id: number): Promise<VoiceModel | undefined>;
  updateVoiceModel(id: number, updates: Partial<VoiceModel>): Promise<VoiceModel | undefined>;
  getVoiceModelsByUser(userId: number): Promise<VoiceModel[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
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

  async createGeneration(insertGeneration: InsertGeneration): Promise<Generation> {
    const [generation] = await db
      .insert(generations)
      .values({
        ...insertGeneration,
        result: insertGeneration.result || null,
        parameters: insertGeneration.parameters || null,
        status: insertGeneration.status || 'pending'
      })
      .returning();
    return generation;
  }

  async getGeneration(id: number): Promise<Generation | undefined> {
    const [generation] = await db.select().from(generations).where(eq(generations.id, id));
    return generation || undefined;
  }

  async updateGeneration(id: number, updates: Partial<Generation>): Promise<Generation | undefined> {
    const [updated] = await db
      .update(generations)
      .set(updates)
      .where(eq(generations.id, id))
      .returning();
    return updated || undefined;
  }

  async getGenerationsByType(type: string): Promise<Generation[]> {
    return await db.select().from(generations).where(eq(generations.type, type));
  }

  async createVoiceModel(insertVoiceModel: InsertVoiceModel): Promise<VoiceModel> {
    const [voiceModel] = await db
      .insert(voiceModels)
      .values({
        ...insertVoiceModel,
        status: insertVoiceModel.status || 'training',
        sampleFiles: insertVoiceModel.sampleFiles || null,
        elevenLabsVoiceId: insertVoiceModel.elevenLabsVoiceId || null
      })
      .returning();
    return voiceModel;
  }

  async getVoiceModel(id: number): Promise<VoiceModel | undefined> {
    const [voiceModel] = await db.select().from(voiceModels).where(eq(voiceModels.id, id));
    return voiceModel || undefined;
  }

  async updateVoiceModel(id: number, updates: Partial<VoiceModel>): Promise<VoiceModel | undefined> {
    const [updated] = await db
      .update(voiceModels)
      .set(updates)
      .where(eq(voiceModels.id, id))
      .returning();
    return updated || undefined;
  }

  async getVoiceModelsByUser(userId: number): Promise<VoiceModel[]> {
    return await db.select().from(voiceModels).where(eq(voiceModels.userId, userId));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private generations: Map<number, Generation>;
  private voiceModels: Map<number, VoiceModel>;
  private currentUserId: number;
  private currentGenerationId: number;
  private currentVoiceModelId: number;

  constructor() {
    this.users = new Map();
    this.generations = new Map();
    this.voiceModels = new Map();
    this.currentUserId = 1;
    this.currentGenerationId = 1;
    this.currentVoiceModelId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGeneration(insertGeneration: InsertGeneration): Promise<Generation> {
    const id = this.currentGenerationId++;
    const generation: Generation = { 
      ...insertGeneration, 
      id,
      createdAt: new Date(),
    };
    this.generations.set(id, generation);
    return generation;
  }

  async getGeneration(id: number): Promise<Generation | undefined> {
    return this.generations.get(id);
  }

  async updateGeneration(id: number, updates: Partial<Generation>): Promise<Generation | undefined> {
    const generation = this.generations.get(id);
    if (!generation) return undefined;
    
    const updated = { ...generation, ...updates };
    this.generations.set(id, updated);
    return updated;
  }

  async getGenerationsByType(type: string): Promise<Generation[]> {
    return Array.from(this.generations.values()).filter(
      (generation) => generation.type === type
    );
  }

  async createVoiceModel(insertVoiceModel: InsertVoiceModel): Promise<VoiceModel> {
    const id = this.currentVoiceModelId++;
    const voiceModel: VoiceModel = { 
      ...insertVoiceModel, 
      id,
      createdAt: new Date(),
    };
    this.voiceModels.set(id, voiceModel);
    return voiceModel;
  }

  async getVoiceModel(id: number): Promise<VoiceModel | undefined> {
    return this.voiceModels.get(id);
  }

  async updateVoiceModel(id: number, updates: Partial<VoiceModel>): Promise<VoiceModel | undefined> {
    const voiceModel = this.voiceModels.get(id);
    if (!voiceModel) return undefined;
    
    const updated = { ...voiceModel, ...updates };
    this.voiceModels.set(id, updated);
    return updated;
  }

  async getVoiceModelsByUser(userId: number): Promise<VoiceModel[]> {
    return Array.from(this.voiceModels.values()).filter(
      (voiceModel) => voiceModel.userId === userId
    );
  }
}

// Use memory storage by default since DATABASE_URL is optional
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
