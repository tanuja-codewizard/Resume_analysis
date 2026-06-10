import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';
const openai = new OpenAI({ apiKey });

export async function analyzeResume(resumeText: string) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing from environment variables.");
  }
  
  const prompt = `
    Analyze the following resume text and provide a structured JSON response.
    Do not include any markdown formatting or code blocks in the output, just the raw JSON.
    
    Expected JSON Structure:
    {
      "atsScore": number (0-100),
      "summary": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "missingSkills": ["string"],
      "grammarIssues": ["string"],
      "formattingIssues": ["string"],
      "keywordAnalysis": { "keyword1": "found", "keyword2": "missing" },
      "industryMatchScore": number (0-100)
    }
    
    Resume Text:
    ${resumeText}
  `;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.warn("Error analyzing resume with OpenAI (likely quota exceeded). Falling back to mock data.", error);
    // Return mock data so the app continues to work for demo purposes
    return {
      atsScore: 85,
      summary: "This is a mock summary generated because the OpenAI API key ran out of quota. The candidate has a strong background in frontend development.",
      strengths: ["React", "TypeScript", "UI/UX Design"],
      weaknesses: ["Backend Architecture", "Docker"],
      missingSkills: ["GraphQL", "AWS"],
      grammarIssues: ["Minor punctuation errors in the summary section."],
      formattingIssues: ["Inconsistent bullet points."],
      keywordAnalysis: { "React": "found", "Next.js": "found", "Vue": "missing" },
      industryMatchScore: 90
    };
  }
}

export async function generateInterviewQuestions(resumeText: string, jobRole: string) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is missing from environment variables.");
    }
    
    const prompt = `
      Based on the candidate's resume and their target job role of "${jobRole}", generate 5 interview questions for each of the following categories: Technical, HR, Behavioral, and Aptitude.
      Provide the response as a structured JSON object containing an array called "questions".
      
      Expected JSON Structure:
      {
        "questions": [
          { "type": "Technical", "question": "string" },
          { "type": "HR", "question": "string" }
        ]
      }
      
      Resume Text:
      ${resumeText}
    `;
  
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
      });
  
      const text = completion.choices[0]?.message?.content || '{"questions": []}';
      return JSON.parse(text).questions;
    } catch (error) {
      console.error("Error generating interview questions:", error);
      throw new Error("Failed to generate interview questions with AI.");
    }
}

export async function generateLearningRoadmap(currentSkills: string[], missingSkills: string[], targetRole: string) {
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is missing from environment variables.");
    }
    
    const prompt = `
      Create a structured learning roadmap for a candidate aiming for the role of "${targetRole}".
      Current Skills: ${currentSkills.join(', ')}
      Missing Skills to acquire: ${missingSkills.join(', ')}
      
      Provide the response as a structured JSON object representing 4 weeks of weekly goals.
      
      Expected JSON Structure:
      {
        "week1": { "goal": "string", "tasks": ["string", "string"] },
        "week2": { "goal": "string", "tasks": ["string", "string"] },
        "week3": { "goal": "string", "tasks": ["string", "string"] },
        "week4": { "goal": "string", "tasks": ["string", "string"] }
      }
    `;
  
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
      });
  
      const text = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(text);
    } catch (error) {
      console.error("Error generating learning roadmap:", error);
      throw new Error("Failed to generate learning roadmap with AI.");
    }
}
