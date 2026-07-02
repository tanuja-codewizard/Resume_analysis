'use server'

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { generateLearningRoadmap as generateAIRoadmap } from '@/lib/ai/openai';

export async function generateLearningRoadmap(targetRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    throw new Error("Unauthorized");
  }
  const finalUserId = user.id;

  // Fetch candidate's latest resume analysis
  const latestResume = await prisma.resume.findFirst({
    where: { userId: finalUserId },
    orderBy: { createdAt: 'desc' },
    include: { analyses: true }
  });

  const currentSkills = latestResume?.analyses[0]?.strengths || [];
  const missingSkills = latestResume?.analyses[0]?.missingSkills || [];

  // Generate Roadmap via AI
  const roadmapData = await generateAIRoadmap(currentSkills, missingSkills, targetRole);

  // Save to database
  const roadmap = await prisma.learningRoadmap.create({
    data: {
      userId: finalUserId,
      targetRole,
      currentSkills,
      missingSkills,
      weeklyGoals: roadmapData,
      progress: 0
    }
  });

  return roadmap;
}

export async function getLearningRoadmaps() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
  
    return await prisma.learningRoadmap.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
}
