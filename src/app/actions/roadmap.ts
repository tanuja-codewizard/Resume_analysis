'use server'

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAuthenticatedUser } from '@/lib/supabase/sync-user';
import { generateLearningRoadmap as generateAIRoadmap, StructuredRoadmap } from '@/lib/ai/gemini';

export async function generateLearningRoadmap(targetRole: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    throw new Error("Unauthorized");
  }
  const finalUserId = auth.dbUser.id;

  if (!targetRole || !targetRole.trim()) {
    throw new Error("Target role is required to generate a personalized roadmap.");
  }

  // Fetch candidate's latest resume analysis
  const latestResume = await prisma.resume.findFirst({
    where: { userId: finalUserId },
    orderBy: { createdAt: 'desc' },
    include: {
      analyses: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const latestAnalysis = latestResume?.analyses[0];
  const currentSkills = latestAnalysis?.strengths || [];
  const missingSkills = latestAnalysis?.missingSkills || [];

  // Generate Roadmap via Gemini AI
  const roadmapData = await generateAIRoadmap(currentSkills, missingSkills, targetRole.trim());

  // Save to database
  const roadmap = await prisma.learningRoadmap.create({
    data: {
      userId: finalUserId,
      targetRole: targetRole.trim(),
      currentSkills,
      missingSkills,
      weeklyGoals: roadmapData as unknown as Prisma.InputJsonValue,
      progress: 0,
    },
  });

  return roadmap;
}

export async function getLearningRoadmaps() {
  const auth = await getAuthenticatedUser();
  if (!auth) return [];

  return await prisma.learningRoadmap.findMany({
    where: { userId: auth.dbUser.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function toggleRoadmapTask(roadmapId: string, taskId: string, completed: boolean) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    throw new Error("Unauthorized");
  }

  // Validate ownership
  const roadmap = await prisma.learningRoadmap.findFirst({
    where: {
      id: roadmapId,
      userId: auth.dbUser.id,
    },
  });

  if (!roadmap) {
    throw new Error("Roadmap not found or unauthorized access.");
  }

  const rawWeeklyGoals = roadmap.weeklyGoals as unknown as StructuredRoadmap;
  if (!rawWeeklyGoals || !Array.isArray(rawWeeklyGoals.weeks)) {
    throw new Error("Invalid roadmap data.");
  }

  let totalTasks = 0;
  let completedTasks = 0;

  const updatedWeeks = rawWeeklyGoals.weeks.map((week) => {
    const updatedTasks = (week.tasks || []).map((task) => {
      const isTarget = task.id === taskId;
      const isCompleted = isTarget ? completed : Boolean(task.completed);
      totalTasks += 1;
      if (isCompleted) {
        completedTasks += 1;
      }
      return {
        ...task,
        completed: isCompleted,
      };
    });

    return {
      ...week,
      tasks: updatedTasks,
    };
  });

  const newProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const updatedRoadmap = await prisma.learningRoadmap.update({
    where: { id: roadmapId },
    data: {
      weeklyGoals: { weeks: updatedWeeks } as unknown as Prisma.InputJsonValue,
      progress: newProgress,
    },
  });

  return updatedRoadmap;
}

export async function deleteRoadmap(roadmapId: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    throw new Error("Unauthorized");
  }

  const roadmap = await prisma.learningRoadmap.findFirst({
    where: {
      id: roadmapId,
      userId: auth.dbUser.id,
    },
  });

  if (!roadmap) {
    throw new Error("Roadmap not found or unauthorized access.");
  }

  await prisma.learningRoadmap.delete({
    where: { id: roadmapId },
  });

  return { success: true };
}
