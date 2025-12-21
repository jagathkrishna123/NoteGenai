
// import express from "express";
// import fetch from "node-fetch";
// import cors from "cors";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("AI backend is running");
// });

// app.post("/api/ai/generate", async (req, res) => {
//   const { topic } = req.body;

//   if (!topic) {
//     return res.status(400).json({ error: "Topic is required" });
//   }

//   try {
//     const response = await fetch(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "HTTP-Referer": "http://localhost:3000",
//           "X-Title": "Question Notes Generator",
//         },
//         body: JSON.stringify({
//           model: "kwaipilot/kat-coder-pro:free",
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You generate clean, concise study notes suitable for exams.",
//             },
//             {
//               role: "user",
//               content: `Explain the following topic clearly:\n\n${topic}`,
//             },
//           ],
//           temperature: 0.6,
//         }),
//       }
//     );

//     const data = await response.json();
//     console.log("OPENROUTER RESPONSE:", data);

//     const answer =
//       data?.choices?.[0]?.message?.content ||
//       "No response generated.";

//     res.json({ answer });
//   } catch (error) {
//     console.error("AI ERROR:", error);
//     res.status(500).json({ error: "AI generation failed" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`✅ Backend running at http://localhost:${PORT}`);
// });


//////////////////////////////////////////////////////////////////////////

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI backend is running");
});

app.post("/api/ai/generate", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Question Notes Generator",
        },
        body: JSON.stringify({
          model: "kwaipilot/kat-coder-pro:free",
          messages: [
                {
    role: "system",
    content:
        "You are an AI that generates clean, plain-text study notes for students. Do NOT use markdown, headings, bullet points, symbols, or formatting like ##, **, -, or *. Write in simple paragraphs only."
    },

            {
              role: "user",
              content: `Explain the following topic clearly:\n\n${topic}`,
            },
          ],
          temperature: 0.6,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error:", errorText);
      return res.status(500).json({ error: "AI provider error" });
    }

    const data = await response.json();

    const answer =
      data?.choices?.[0]?.message?.content ||
      "No response generated.";

    res.json({ answer });
  } catch (error) {
    console.error("AI ERROR:", error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
