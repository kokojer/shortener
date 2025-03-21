import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const links = pgTable("links", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  original_link: varchar({ length: 2048 }).notNull(),
  short_id: varchar({ length: 20 }).notNull().unique(),
  expires_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
});

export const linksRelations = relations(links, ({ many }) => ({
  visits: many(visits),
}));

export const visits = pgTable("visits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  link_id: integer().notNull(),
  ip: varchar({ length: 255 }).notNull(),
  date: timestamp(),
});

export const visitsRelations = relations(visits, ({ one }) => ({
  link: one(links, {
    fields: [visits.link_id],
    references: [links.id],
  }),
}));
