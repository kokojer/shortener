import express, { Request, Response } from "express";
import { InputShortenSchema, InputShortenType } from "./schemas/input";
import { db } from "./db";
import { links } from "./db/schema";
import { nanoid } from "nanoid";
import urlJoin from "url-join";

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.post(
  "/shorten",
  async (req: Request<{}, {}, InputShortenType>, res: Response) => {
    const { success, error } = InputShortenSchema.safeParse(req.body);
    if (!success) return res.status(400).send(error?.issues);

    const { originalUrl, expiresAt, alias } = req.body;

    const link = await db
      .insert(links)
      .values({
        original_link: originalUrl,
        short_id: alias ?? nanoid(20),
        expires_at: expiresAt,
      })
      .returning();

    if (!process.env.BASE_URL) throw new Error("BASE_URL не указан!");

    res.send(urlJoin(process.env.BASE_URL, link[0].short_id));
  },
);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
