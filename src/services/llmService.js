require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

function safeJSONParse(str) {
  try {
    const start = str.indexOf("{");
    const end = str.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(str.slice(start, end + 1));
    }
  } catch (err) {
    console.warn("JSON parse failed:", err.message);
  }
  return { feedback: str.trim(), overallScore: 0 };
}

async function askLLMAboutCV(cvText) {
  const cvPrompt = `
# ROLE / PERSONA
You are **Iko**, a senior technical recruiter with deep expertise in backend and AI engineering roles.
Your job is to evaluate CVs for both technical and communication competence.

# TASK
Analyze the CV and evaluate it based on:
1. Technical Competence (skills, frameworks, programming languages)
2. Problem Solving (complexity and impact of past work)
3. Communication & Presentation (clarity of writing, documentation)
4. Role Relevance (fit for backend/AI positions)

# ONE SHOT EXAMPLE
Example CV Snippet:
---
"Experienced backend engineer proficient in Node.js and Python, built ML pipelines for healthcare startup."
---

Example Output:
{
  "feedback": "Strong backend foundation with relevant AI project experience. Can improve clarity in project documentation.",
  "technicalCompetence": 88,
  "problemSolving": 82,
  "communication": 75,
  "relevance": 85,
  "overallScore": 82.5
}

# THINKING (CHAIN OF THOUGHT)
- Identify strong and weak areas from the CV.
- Evaluate each dimension numerically (0-100).
- Average the scores as overallScore.
- Keep feedback professional and concise.

# OUTPUT FORMAT
Return strictly valid JSON with this structure:
{
  "feedback": "string",
  "technicalCompetence": number (0-100),
  "problemSolving": number (0-100),
  "communication": number (0-100),
  "relevance": number (0-100),
  "overallScore": number (0-100)
}

# CV CONTENT
${cvText}
`;

  try {
    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are a senior technical recruiter and AI evaluator. Always return valid JSON output.",
        },
        { role: "user", content: cvPrompt },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content.trim();
    const parsed = safeJSONParse(content);

    // ✅ Perbaikan skoring math sesuai rubric:
    // LLM memberi 0–100 → ubah ke 1–5 → lalu ke 0–1 (CV Match Rate)
    let normalizedScore = 0;
    if (
      typeof parsed.overallScore === "number" &&
      !isNaN(parsed.overallScore)
    ) {
      const fiveScale = (parsed.overallScore / 100) * 5; // 0–100 ke 1–5
      normalizedScore = parseFloat(((fiveScale - 1) / 4).toFixed(2)); // 1–5 ke 0–1
      if (normalizedScore < 0) normalizedScore = 0;
      if (normalizedScore > 1) normalizedScore = 1;
    }

    return {
      feedback: parsed.feedback || content,
      score: normalizedScore, // 0–1 sesuai rubric CV
    };
  } catch (err) {
    return { feedback: "Failed to evaluate CV due to LLM error.", score: 0 };
  }
}

async function askLLMAboutProject(reportText) {
  const projectPrompt = `
# ROLE / PERSONA
You are **Iko**, a senior AI researcher and technical reviewer specializing in software engineering, data science, and backend systems.
You have years of experience evaluating academic and professional project reports.

# TASK
Analyze the following project report and assess it based on:
1. Problem Understanding (clarity, relevance)
2. Technical Depth (algorithms, architecture, data handling)
3. Creativity & Innovation (uniqueness, originality)
4. Practical Implementation (applicability, scalability, usability)

# ONE SHOT EXAMPLE
Example Input:
---
"Project Title: Smart Traffic Light System using IoT.
Description: Uses sensors and ESP32 to manage adaptive traffic flow."
---

Example Output:
{
  "feedback": "Strong IoT integration and solid implementation using ESP32. Could expand on data analytics or edge AI components.",
  "problemUnderstanding": 85,
  "technicalDepth": 78,
  "creativity": 72,
  "implementation": 88,
  "overallScore": 80.75
}

# THINKING (CHAIN OF THOUGHT)
- Read the report carefully.
- Identify major technical and creative elements.
- Evaluate each dimension objectively (0–100 scale).
- Average the four dimensions to produce overallScore.
- Keep the feedback concise and constructive.

# OUTPUT FORMAT
Return strictly valid JSON with this structure:
{
  "feedback": "string",
  "problemUnderstanding": number (0–100),
  "technicalDepth": number (0–100),
  "creativity": number (0–100),
  "implementation": number (0–100),
  "overallScore": number (0–100)
}

# REPORT
${reportText}
`;

  try {
    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are a senior AI project reviewer who always returns valid JSON only.",
        },
        { role: "user", content: projectPrompt },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content.trim();
    console.log("🧠 Raw LLM response (Project):", content);

    const parsed = safeJSONParse(content);
    console.log("✅ Parsed Project result:", parsed);

    // ✅ Perbaikan skoring math sesuai rubric:
    // LLM memberi 0–100 → ubah ke 1–5 (karena rubric project pakai skala 1–5)
    let scaledScore = 0;
    if (
      typeof parsed.overallScore === "number" &&
      !isNaN(parsed.overallScore)
    ) {
      scaledScore = parseFloat(((parsed.overallScore / 100) * 5).toFixed(2));
      if (scaledScore < 1) scaledScore = 1;
      if (scaledScore > 5) scaledScore = 5;
    }

    return {
      feedback: parsed.feedback || content,
      score: scaledScore, // 1–5 sesuai rubric Project
    };
  } catch (err) {
    console.error("❌ Error from OpenAI (Project):", err);
    return {
      feedback: "⚠️ Failed to evaluate Project Report due to LLM error.",
      score: 1, // default minimal
    };
  }
}

async function askLLMFinalSummary(cvResult, projectResult) {
  const prompt = `
# ROLE / PERSONA
You are **Iko**, a senior hiring manager evaluating a backend engineer candidate.
You already have results from the CV and Project evaluations.

# TASK
Synthesize both evaluations into a concise final summary.
- Mention strengths (technical skills, project execution)
- Highlight improvement areas
- End with a short hiring recommendation (e.g., good fit, promising, or needs improvement)
Write naturally in 3–5 sentences.

# INPUT
CV Evaluation:
Feedback: ${cvResult.feedback}
Score: ${cvResult.score}

Project Evaluation:
Feedback: ${projectResult.feedback}
Score: ${projectResult.score}

# OUTPUT FORMAT
Return only plain text (no JSON).
`;

  try {
    const response = await client.chat.completions.create({
      model: process.env.LLM_MODEL_NAME,
      messages: [
        {
          role: "system",
          content:
            "You are a senior technical hiring manager who writes concise and balanced evaluation summaries.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const summary = response.choices[0].message.content.trim();
    console.log("Final LLM Summary:", summary);
    return summary;
  } catch (err) {
    console.error("Error generating final summary:", err);
    return "Failed to generate final summary due to LLM error.";
  }
}

module.exports = { askLLMAboutCV, askLLMAboutProject, askLLMFinalSummary };
