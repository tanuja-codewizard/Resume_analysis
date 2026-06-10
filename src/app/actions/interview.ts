'use server'

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { generateInterviewQuestions as generateAIQuestions } from '@/lib/ai/openai';

export async function generateInterviewQuestions(jobRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Fetch candidate's latest resume analysis
  const latestResume = await prisma.resume.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { analyses: true }
  });

  const resumeSummary = latestResume?.analyses[0]?.summary || "No resume summary available. Candidate has general experience.";

  // Generate questions via AI
  const questionsData = await generateAIQuestions(resumeSummary, jobRole);

  // Save to database
  const createdQuestions = [];
  for (const q of questionsData) {
    const newQ = await prisma.interviewQuestion.create({
      data: {
        userId: user.id,
        jobRole,
        type: q.type,
        question: q.question,
      }
    });
    createdQuestions.push(newQ);
  }

  return createdQuestions;
}

export async function getInterviewQuestions() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
  
    return await prisma.interviewQuestion.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
}

export async function toggleQuestionStatus(id: string, isCompleted: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
  
    return await prisma.interviewQuestion.update({
        where: { id, userId: user.id },
        data: { isCompleted }
    });
}
