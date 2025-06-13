import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'text', 'speech', 'voice-clone', 'image', 'animation'
  prompt: text("prompt").notNull(),
  model: text("model").notNull(),
  parameters: json("parameters"),
  result: json("result"),
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const voiceModels = pgTable("voice_models", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default('training'), // 'training', 'ready', 'failed'
  sampleFiles: json("sample_files"), // Array of file paths
  elevenLabsVoiceId: text("elevenlabs_voice_id"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: integer("user_id").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGenerationSchema = createInsertSchema(generations).omit({
  id: true,
  createdAt: true,
});

export const insertVoiceModelSchema = createInsertSchema(voiceModels).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type VoiceModel = typeof voiceModels.$inferSelect;
export type InsertVoiceModel = z.infer<typeof insertVoiceModelSchema>;
