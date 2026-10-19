// api/analyze.js — Vercel serverless function.
// Keeps the Gemini API key secret on the server. The browser sends
// {job, resume, lang}; this builds the prompt, calls Gemini, returns JSON.
const { buildPrompt, MAX_JOB, MAX_RESUME } = require("../prompt.js");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const { job, resume, lang } = req.body || {};
  if (!job || !resume || job.trim().length < 40 || resume.trim().length < 40) {
    return res.status(400).json({ error: "Paste both the job description and your resume (at least a few lines each)." });
  }
  if (job.length > MAX_JOB || resume.length > MAX_RESUME) {
    return res.status(400).json({ error: "Text is too long. Keep the job under 6,000 and the resume under 8,000 characters." });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: "Server is missing GEMINI_API_KEY. Add it in Vercel → Settings → Environment Variables." });
  }
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: buildPrompt(job, resume, lang) }] }],
          generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
        })
      }
    );
    const data = await r.json();
    if (!r.ok) {
      const msg = (data && data.error && data.error.message) || "AI service error";
      return res.status(502).json({ error: msg });
    }
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const json = JSON.parse(text.replace(/^```json\s*|\s*```$/g, ""));
    return res.status(200).json(json);
  } catch (e) {
    return res.status(502).json({ error: "The AI reply could not be read. Please try again." });
  }
};
