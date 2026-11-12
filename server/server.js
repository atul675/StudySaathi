const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Please enter a topic.",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content:
            'Generate exactly 5 multiple-choice questions. Return only valid JSON: {"questions":[{"q":"Question","options":["A","B","C","D"],"answer":0,"explanation":"Explanation"}]}. The answer must be the zero-based index of the correct option.',
        },
        {
          role: "user",
          content: `Create a quiz about: ${topic}`,
        },
      ],
      temperature: 0.4,
    });

    const content = completion.choices[0].message.content;
    const quiz = JSON.parse(content);

    if (!Array.isArray(quiz.questions) || quiz.questions.length !== 5) {
      throw new Error("AI returned an invalid quiz format.");
    }

    return res.json(quiz);
  } catch (error) {
    console.error("Quiz generation failed:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Quiz generation failed. Check the backend terminal.",
      });
    }
  }
});
app.post("/api/generate-flashcards", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        error: "Please enter a topic.",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            'Create 10 useful study flashcards. Return only valid JSON in this format: {"flashcards":[{"question":"...","answer":"..."}]}. No markdown.',
        },
        {
          role: "user",
          content: `Create study flashcards about: ${topic}`,
        },
      ],
      temperature: 0.5,
    });

    const content = completion.choices[0].message.content;
    const cleaned = content.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    return res.json(result);
  } catch (error) {
    console.error("Flashcard generation failed:", error);
    return res.status(500).json({
  error: error.message || "Unknown backend error",
});
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`StudySaathi backend running on http://localhost:${PORT}`);
});


