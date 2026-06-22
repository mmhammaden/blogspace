import { Router } from "express";

const router = Router();

// Simple route to fetch a random joke from an external API
// This uses the official 'icanhazdadjoke' API (no auth required). We do server-side fetch
// to avoid exposing CORS issues to frontend and to cache/transform results if needed.

router.get("/joke", async (req, res) => {
  try {
    const resp = await fetch("https://icanhazdadjoke.com/", {
      headers: { Accept: "application/json", "User-Agent": "BlogSpace/1.0" },
    });
    if (!resp.ok) return res.status(502).json({ message: "Failed to fetch joke" });
    const data = await resp.json();
    res.json({ joke: data.joke, id: data.id });
  } catch (err) {
    console.error("Joke fetch error:", err);
    res.status(500).json({ message: "Unable to fetch joke" });
  }
});

export default router;
