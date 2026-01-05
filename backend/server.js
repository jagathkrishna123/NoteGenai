import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI backend is running");
});

app.post("/api/ai/generate", async (req, res) => {
  const { topic, length = "short", level = "easy" } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  /* ---------- AI INSTRUCTIONS ---------- */
  const lengthInstruction =
    length === "long"
      ? "Write a detailed explanation with examples."
      : "Write a short and concise explanation.";

  let difficultyInstruction = "";
  if (level === "easy") {
    difficultyInstruction =
      "Explain in very simple terms suitable for beginners.";
  } else if (level === "exam") {
    difficultyInstruction =
      "Explain in an exam-oriented manner with clear definitions and key points.";
  } else if (level === "advanced") {
    difficultyInstruction =
      "Explain in an advanced, in-depth manner with technical clarity.";
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "kwaipilot/kat-coder-pro:free",
        messages: [
          {
            role: "system",
            content:
              "Generate clean, plain-text study notes only. Do NOT use markdown, headings, bullet points, symbols, bold text, or special formatting. Write normal paragraphs suitable for PDF export.",
          },
          {
            role: "user",
            content: `
Topic: ${topic}

Instructions:
${lengthInstruction}
${difficultyInstruction}

Write clear study notes in plain text.
            `,
          },
        ],
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Question Notes Generator",
        },
        timeout: 20000, // 20s safety timeout
      }
    );

    const answer =
      response.data?.choices?.[0]?.message?.content ||
      "No response generated.";

    res.json({ answer });
  } catch (error) {
    console.error(
      "AI ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "AI generation failed",
    });
  }
});
//////////////////

app.post("/api/ai/generate-bulk", async (req, res) => {
  const { topics } = req.body;

  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: "Topics required" });
  }

  try {
    const results = [];

    for (const topic of topics) {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "kwaipilot/kat-coder-pro:free",
          messages: [
            {
              role: "system",
              content:
                "Generate clean plain-text study notes. No markdown or formatting.",
            },
            {
              role: "user",
              content: `Explain this topic clearly:\n${topic}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      results.push({
        topic,
        answer:
          response.data?.choices?.[0]?.message?.content ||
          "No answer generated",
      });
    }

    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Bulk generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
