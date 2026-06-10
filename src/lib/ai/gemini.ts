import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure the API key is available
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// We use the new Gemini 1.5 Pro or Flash models depending on the task
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function analyzeResume(resumeText: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from environment variables.");
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
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Safely parse the JSON response (strip markdown blocks if AI includes them)
    const jsonStr = text.replace(/```json\n?|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw new Error("Failed to analyze resume with AI.");
  }
}

export async function generateInterviewQuestions(resumeText: string, jobRole: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }
    
    const prompt = `
      Based on the candidate's resume and their target job role of "${jobRole}", generate 5 interview questions for each of the following categories: Technical, HR, Behavioral, and Aptitude.
      Provide the response as a structured JSON array.
      Do not include any markdown formatting or code blocks in the output, just the raw JSON.
      
      Expected JSON Structure:
      [
        { "type": "Technical", "question": "string" },
        { "type": "HR", "question": "string" }
      ]
      
      Resume Text:
      ${resumeText}
    `;
  
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error generating interview questions:", error);
      throw new Error("Failed to generate interview questions with AI.");
    }
}

export async function generateLearningRoadmap(currentSkills: string[], missingSkills: string[], targetRole: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from environment variables.");
    }
    
    const prompt = `
      Create a structured learning roadmap for a candidate aiming for the role of "${targetRole}".
      Current Skills: ${currentSkills.join(', ')}
      Missing Skills to acquire: ${missingSkills.join(', ')}
      
      Provide the response as a structured JSON object representing 4 weeks of weekly goals.
      Do not include any markdown formatting or code blocks in the output, just the raw JSON.
      
      Expected JSON Structure:
      {
        "week1": { "goal": "string", "tasks": ["string", "string"] },
        "week2": { "goal": "string", "tasks": ["string", "string"] },
        "week3": { "goal": "string", "tasks": ["string", "string"] },
        "week4": { "goal": "string", "tasks": ["string", "string"] }
      }
    `;
  
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonStr = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error generating learning roadmap:", error);
      throw new Error("Failed to generate learning roadmap with AI.");
    }
}
