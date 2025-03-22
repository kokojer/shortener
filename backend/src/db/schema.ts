import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const linksTable = pgTable("links", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  original_link: varchar({ length: 2048 }).notNull(),
  short_id: varchar({ length: 20 }).notNull().unique(),
  expires_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
});

export const linksRelations = relations(linksTable, ({ many }) => ({
  visits: many(visitsTable),
}));

export const visitsTable = pgTable("visits", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  link_id: integer()
    .references(() => linksTable.id, { onDelete: "cascade" })
    .notNull(),
  ip: varchar({ length: 255 }).notNull(),
  date: timestamp(),
});

export const visitsRelations = relations(visitsTable, ({ one }) => ({
  link: one(linksTable, {
    fields: [visitsTable.link_id],
    references: [linksTable.id],
  }),
}));
