import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const businessCategoryEnum = pgEnum("business_category", [
  "clinic",
  "salon",
  "gym",
  "restaurant",
  "spa",
  "dental",
  "barber",
  "other",
]);

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  ownerId: text("owner_id").notNull().unique(),
  name: text("name").notNull(),
  category: businessCategoryEnum("category").notNull().default("other"),
  description: text("description"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  website: text("website"),
  logo: text("logo"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
