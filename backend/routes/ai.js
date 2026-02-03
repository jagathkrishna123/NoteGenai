import express from 'express';
import axios from 'axios';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post("/generate", authenticateToken, async (req, res) => {
    const { topic, length = "short", level = "easy" } = req.body;

    if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
    }

    const lengthInstruction = length === "long" ? "Write a detailed explanation with examples." : "Write a short and concise explanation.";
    let difficultyInstruction = "";
    if (level === "easy") difficultyInstruction = "Explain in very simple terms suitable for beginners.";
    else if (level === "exam") difficultyInstruction = "Explain in an exam-oriented manner with clear definitions and key points.";
    else if (level === "advanced") difficultyInstruction = "Explain in an advanced, in-depth manner with technical clarity.";

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-r1-0528:free",
                messages: [
                    { role: "system", content: "Generate clean, plain-text study notes only. Do NOT use markdown, headings, bullet points, symbols, bold text, or special formatting. Write normal paragraphs suitable for PDF export." },
                    { role: "user", content: `Topic: ${topic}\n\nInstructions:\n${lengthInstruction}\n${difficultyInstruction}\n\nWrite clear study notes in plain text.` },
                ],
                temperature: 0.6,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const answer = response.data.choices?.[0]?.message?.content || "No response generated.";
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ error: "AI generation failed" });
    }
});

router.post("/generate-bulk", authenticateToken, async (req, res) => {
    const { topics } = req.body;
    if (!Array.isArray(topics) || topics.length === 0) return res.status(400).json({ error: "Topics required" });

    try {
        const results = [];
        for (const topic of topics) {
            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "deepseek/deepseek-r1-0528:free",
                    messages: [
                        { role: "system", content: "Generate clean plain-text study notes. No markdown or formatting." },
                        { role: "user", content: `Explain this topic clearly:\n${topic}` },
                    ],
                },
                {
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            results.push({ topic, answer: response.data.choices?.[0]?.message?.content || "No answer generated" });
        }
        res.json({ results });
    } catch (error) {
        res.status(500).json({ error: "Bulk generation failed" });
    }
});

router.post("/generate-questions", authenticateToken, async (req, res) => {
    const { topics, questionType, bloomsLevel, numQuestions, marks } = req.body;

    if (!Array.isArray(topics) || topics.length === 0 || !questionType || !bloomsLevel || !numQuestions) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const bloomsInstructions = {
        remembering: "Focus on recall and recognition of facts.",
        understanding: "Focus on explaining ideas.",
        applying: "Focus on using information in new situations.",
        analyzing: "Focus on breaking down information.",
        evaluating: "Focus on making judgments.",
        creating: "Focus on generating new ideas."
    };

    const systemPrompt = `You are an expert question paper generator. Return ONLY valid JSON in this format: {"questions": [{"question": "string", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "answer": "string"}]}. Rules: Generate ${numQuestions} questions of type ${questionType} for Bloom's level: ${bloomsInstructions[bloomsLevel] || bloomsLevel}. Marks: ${marks}.`;

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-r1-0528:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Topics: ${topics.join("\n")}` },
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const content = response.data.choices?.[0]?.message?.content || "{}";
        res.json(JSON.parse(content));
    } catch (error) {
        res.status(500).json({ error: "Question generation failed" });
    }
});

router.post("/chat", authenticateToken, async (req, res) => {
    const { message, conversation = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    try {
        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "deepseek/deepseek-r1-0528:free",
                messages: [
                    { role: "system", content: "You are a helpful AI assistant. Respond clearly in plain text paragraphs. Avoid markdown formatting." },
                    ...conversation,
                    { role: "user", content: message },
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const msg = response.data.choices?.[0]?.message;
        const aiResponse = msg?.content || msg?.reasoning || "Sorry, I couldn't generate a response.";
        res.json({ response: aiResponse });
    } catch (error) {
        res.status(500).json({ error: "Chat failed" });
    }
});

export default router;
