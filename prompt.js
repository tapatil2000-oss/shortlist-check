// prompt.js — the ONLY place the AI instructions live.
// Used by the browser (index.html) and by the server (api/analyze.js),
// so changing the tool's behaviour = editing this one file.
(function (root) {
  var MAX_JOB = 6000;
  var MAX_RESUME = 8000;

  function buildPrompt(job, resume, lang) {
    var language =
      lang === "hinglish"
        ? "Write every explanation (verdict, why_it_matters, fix_in_7_days, proof_to_show, plan tasks) in simple Hinglish (Hindi in Roman script mixed with English, the way a college student in Nashik or Indore texts). Keep resume bullets, keywords and the recruiter message in professional English."
        : "Write everything in simple, clear English for a first-generation college student. Short sentences, no jargon.";

    return [
      "You are a strict but kind placement mentor for college students from Tier 2 and Tier 3 cities in India.",
      "A student wants to know: will my resume get shortlisted for THIS job, and what exactly should I fix before I apply?",
      "",
      "SCORING RUBRIC (total 100):",
      "- Must-have skills in the job that the resume shows: 40",
      "- Relevant experience, projects, college activities, freelance work: 25",
      "- Tools and software named in the job: 15",
      "- Education / course fit: 10",
      "- Resume clarity (numbers, action verbs, readable): 10",
      "Be honest. Do not inflate. A fresher with no matching skill should score below 40.",
      "band: 'Low' if score < 45, 'Medium' if 45-69, 'High' if 70+.",
      "",
      "RULES:",
      "- Never invent experience, numbers or skills the student does not have.",
      "- In rewritten bullets, only reframe facts already in the resume. If a number would help but is missing, write [add number] so the student fills it in.",
      "- Gaps: maximum 3, most important first. Each fix must be doable in 7 days with free resources (YouTube, free Google/Meta/HubSpot courses, a mini project).",
      "- proof_to_show = what the student can put on the resume after fixing it (a project link, a free certificate, a screenshot of results).",
      "- recruiter_message: under 70 words, polite, specific to this job, mentions one real strength from the resume.",
      "- plan: exactly 4 steps covering 7 days.",
      "- " + language,
      "",
      "Return ONLY valid JSON, no markdown, in exactly this shape:",
      '{"score": 0, "band": "Low", "verdict": "one sentence", "matched": ["skill"], "gaps": [{"skill": "", "why_it_matters": "", "fix_in_7_days": "", "proof_to_show": ""}], "bullets": [{"before": "", "after": ""}], "keywords": ["word"], "recruiter_message": "", "plan": [{"day": "Day 1-2", "task": ""}]}',
      "bullets: exactly 3. keywords: up to 8 ATS keywords from the job that the resume is missing.",
      "",
      "JOB DESCRIPTION:",
      String(job).slice(0, MAX_JOB),
      "",
      "STUDENT RESUME:",
      String(resume).slice(0, MAX_RESUME)
    ].join("\n");
  }

  var api = { buildPrompt: buildPrompt, MAX_JOB: MAX_JOB, MAX_RESUME: MAX_RESUME };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.ShortlistPrompt = api;
})(this);
