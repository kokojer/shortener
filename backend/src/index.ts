import express, { Request, Response } from "express";
import { InputShortenSchema, InputShortenType } from "./schemas/input";
import { db } from "./db";
import { linksTable, visitsTable } from "./db/schema";
import { nanoid } from "nanoid";
import urlJoin from "url-join";
import { and, count, desc, eq, gte } from "drizzle-orm";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.post(
  "/shorten",
  async (req: Request<{}, {}, InputShortenType>, res: Response) => {
    const { success, error, data } = InputShortenSchema.safeParse(req.body);
    if (!success) {
      res.status(400).send(error?.issues);
      return;
    }

    const { originalUrl, expiresAt, alias } = data;

    if (!process.env.BASE_URL) {
      res.status(500).send("BASE_URL не указан!");
      return;
    }

    try {
      const link = await db
        .insert(linksTable)
        .values({
          original_link: originalUrl,
          short_id: alias ?? nanoid(20),
          expires_at: expiresAt,
        })
        .returning()
        .then((res) => res[0]);

      res.send(urlJoin(process.env.BASE_URL, link.short_id));
    } catch (e) {
      res.status(500).send(`Произошла ошибка при создании ссылки: ${e}`);
    }
  },
);

app.get("/:short_id", async (req, res) => {
  const { short_id } = req.params;

  try {
    const link = await db
      .select()
      .from(linksTable)
      .where(
        and(
          eq(linksTable.short_id, short_id),
          gte(linksTable.expires_at, new Date()),
        ),
      )
      .then((res) => res[0]);

    if (!link) {
      res.status(404).send(`Ccылка не найдена!`);
      return;
    }

    if (req.ip) {
      await db.insert(visitsTable).values({
        link_id: link.id,
        date: new Date(),
        ip: req.ip,
      });
    }

    res.redirect(link.original_link);
  } catch (e) {
    res.status(500).send(`Произошла ошибка при поиске ссылки: ${e}`);
  }
});

app.get("/info/:short_id", async (req, res) => {
  const { short_id } = req.params;

  try {
    const link = await db
      .select()
      .from(linksTable)
      .where(eq(linksTable.short_id, short_id))
      .then((res) => res[0]);

    if (!link) {
      res.status(404).send(`Ccылка не найдена!`);
      return;
    }

    const countVisits = await db
      .select({ count: count(visitsTable) })
      .from(visitsTable)
      .where(eq(visitsTable.link_id, link.id))
      .then((res) => res[0]);

    res.json({
      originalUrl: link.original_link,
      createdAt: link.created_at,
      clickCount: countVisits.count,
    });
  } catch (e) {
    res.status(500).send(`Произошла ошибка при поиске ссылки: ${e}`);
  }
});

app.delete("/delete/:short_id", async (req, res) => {
  const { short_id } = req.params;

  try {
    await db.delete(linksTable).where(eq(linksTable.short_id, short_id));

    res.status(204).send();
  } catch (e) {
    res.status(500).send(`Произошла ошибка при удалении ссылки: ${e}`);
  }
});

app.get("/analytics/:short_id", async (req, res) => {
  const { short_id } = req.params;

  try {
    const link = await db
      .select()
      .from(linksTable)
      .where(eq(linksTable.short_id, short_id))
      .then((res) => res[0]);

    if (!link) {
      res.status(404).send(`Ccылка не найдена!`);
      return;
    }

    const visits = await db
      .select()
      .from(visitsTable)
      .where(eq(visitsTable.link_id, link.id))
      .orderBy(desc(visitsTable.date));

    const lastVisitsIp = visits.slice(0, 5).map((visit) => visit.ip);

    res.send({
      clickCount: visits.length,
      ip: lastVisitsIp,
    });
  } catch (e) {
    res.status(500).send(`Произошла ошибка при поиске ссылки: ${e}`);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
