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
  console.log("hello");
  

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

app.post("/api/ai/generate-questions", async (req, res) => {
  const { topics, questionType, bloomsLevel, numQuestions, marks, syllabusText } = req.body;
  console.log("heloo");
  

  if (!Array.isArray(topics) || topics.length === 0) {
    return res.status(400).json({ error: "Topics are required" });
  }

  if (!questionType || !bloomsLevel || !numQuestions) {
    return res.status(400).json({ error: "Question type, Bloom's level, and number of questions are required" });
  }

  // For testing, return mock questions if API key is not available
  if (!process.env.OPENROUTER_API_KEY) {
    console.log("No API key found, returning mock questions");
    const mockQuestions = generateMockQuestions(questionType, numQuestions, topics);
    return res.json({ questions: mockQuestions });
  }

  // Define Bloom's taxonomy instructions
  const bloomsInstructions = {
    remembering: "Focus on recall and recognition of facts, concepts, and basic information.",
    understanding: "Focus on explaining ideas, interpreting information, and summarizing concepts.",
    applying: "Focus on using information in new situations and solving problems.",
    analyzing: "Focus on breaking down information, identifying relationships, and drawing conclusions.",
    evaluating: "Focus on making judgments, critiquing information, and supporting opinions.",
    creating: "Focus on generating new ideas, designing solutions, and creating original work."
  };

  // Define question type instructions
  const questionTypeInstructions = {
    mcq: `Generate multiple choice questions with 4 options (A, B, C, D) each. Include the correct answer. Format: Question|Option A|Option B|Option C|Option D|Correct Answer`,
    objective: `Generate objective type questions (true/false, fill in the blanks, match the following). Format: Question|Answer`,
    short: `Generate short answer questions requiring 2-3 sentence responses. Format: Question|Expected Answer`,
    long: `Generate long answer questions requiring detailed explanations. Format: Question|Detailed Answer`
  };

  const systemPrompt = `You are an expert question paper generator. Based on the syllabus content provided, generate ${numQuestions} ${questionTypeInstructions[questionType]} following Bloom's taxonomy level: ${bloomsInstructions[bloomsLevel]}. Each question should be worth ${marks} marks. Use the provided topics as the basis for questions. Return questions in plain text format without markdown.`;

  const userPrompt = `Syllabus Content:\n${syllabusText}\n\nTopics to generate questions from:\n${topics.join('\n')}\n\nGenerate ${numQuestions} questions following the specified format.`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "kwaipilot/kat-coder-pro:free",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Question Paper Generator",
        },
        timeout: 30000,
      }
    );

    const generatedContent = response.data?.choices?.[0]?.message?.content || "";

    // Parse the generated content based on question type
    const questions = parseGeneratedQuestions(generatedContent, questionType);

    res.json({ questions });
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({
      error: "Question generation failed",
      details: error.message
    });
  }
});

// Mock question generator for testing
function generateMockQuestions(questionType, numQuestions, topics) {
  const questions = [];
  const sampleTopics = topics.slice(0, numQuestions);

  for (let i = 0; i < numQuestions; i++) {
    const topic = sampleTopics[i] || `Sample Topic ${i + 1}`;

    if (questionType === 'mcq') {
      questions.push({
        question: `What is the main concept of ${topic}?`,
        options: {
          A: "Option A",
          B: "Option B",
          C: "Option C",
          D: "Option D"
        },
        correctAnswer: "A",
        type: 'mcq'
      });
    } else if (questionType === 'objective') {
      questions.push({
        question: `True or False: ${topic} is an important concept.`,
        answer: "True",
        type: 'objective'
      });
    } else if (questionType === 'short') {
      questions.push({
        question: `Explain ${topic} in 2-3 sentences.`,
        answer: `This is a short answer explaining ${topic}. It covers the main points and provides a concise explanation.`,
        type: 'short'
      });
    } else if (questionType === 'long') {
      questions.push({
        question: `Discuss ${topic} in detail, covering its importance and applications.`,
        answer: `This is a detailed explanation of ${topic}. It covers various aspects including definitions, importance, applications, and related concepts. The answer provides comprehensive information suitable for long answer questions.`,
        type: 'long'
      });
    }
  }

  return questions;
}

// Helper function to parse generated questions
function parseGeneratedQuestions(content, questionType) {
  const questions = [];
  const lines = content.split('\n').filter(line => line.trim());

  if (questionType === 'mcq') {
    // Parse MCQ format: Question|Option A|Option B|Option C|Option D|Correct Answer
    lines.forEach((line, index) => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 6) {
        questions.push({
          question: parts[0],
          options: {
            A: parts[1],
            B: parts[2],
            C: parts[3],
            D: parts[4]
          },
          correctAnswer: parts[5],
          type: 'mcq'
        });
      }
    });
  } else if (questionType === 'objective') {
    // Parse objective format: Question|Answer
    lines.forEach((line, index) => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        questions.push({
          question: parts[0],
          answer: parts[1],
          type: 'objective'
        });
      }
    });
  } else if (questionType === 'short' || questionType === 'long') {
    // Parse short/long answer format: Question|Answer
    lines.forEach((line, index) => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        questions.push({
          question: parts[0],
          answer: parts[1],
          type: questionType
        });
      }
    });
  }

  return questions;
}

console.log("Starting server...");
console.log(`PORT: ${PORT}`);

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
