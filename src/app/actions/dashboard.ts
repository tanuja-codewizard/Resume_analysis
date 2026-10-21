'use server'

import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/sync-user';
import { formatPercentageGrowth, formatAtsGrowth } from '@/lib/utils/formatters';

export { formatPercentageGrowth, formatAtsGrowth };

export async function getDashboardStats() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return { success: false, error: 'Unauthorized' };
  }
  const finalUserId = auth.dbUser.id;

  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. Jobs Applied
    const jobsAppliedThisMonth = await prisma.jobRecommendation.count({
      where: { userId: finalUserId, isApplied: true, createdAt: { gte: firstDayThisMonth } }
    });
    const jobsAppliedLastMonth = await prisma.jobRecommendation.count({
      where: { userId: finalUserId, isApplied: true, createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } }
    });
    const totalJobsApplied = await prisma.jobRecommendation.count({
      where: { userId: finalUserId, isApplied: true }
    });

    const jobsGrowth = formatPercentageGrowth(jobsAppliedThisMonth, jobsAppliedLastMonth);

    // 2. Interviews Prep (Completed Sessions)
    const interviewsThisMonth = await prisma.interviewQuestion.count({
      where: { userId: finalUserId, isCompleted: true, createdAt: { gte: firstDayThisMonth } }
    });
    const interviewsLastMonth = await prisma.interviewQuestion.count({
      where: { userId: finalUserId, isCompleted: true, createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } }
    });
    const totalInterviews = await prisma.interviewQuestion.count({
      where: { userId: finalUserId, isCompleted: true }
    });

    const interviewsGrowth = formatPercentageGrowth(interviewsThisMonth, interviewsLastMonth);

    // 3. Avg ATS Score
    const analysesThisMonth = await prisma.resumeAnalysis.findMany({
      where: { resume: { userId: finalUserId }, createdAt: { gte: firstDayThisMonth } },
      select: { atsScore: true }
    });
    const analysesLastMonth = await prisma.resumeAnalysis.findMany({
      where: { resume: { userId: finalUserId }, createdAt: { gte: firstDayLastMonth, lt: firstDayThisMonth } },
      select: { atsScore: true }
    });
    const allAnalyses = await prisma.resumeAnalysis.findMany({
      where: { resume: { userId: finalUserId } },
      select: { atsScore: true }
    });

    const avgAtsScore = allAnalyses.length > 0 
      ? Math.round(allAnalyses.reduce((sum, a) => sum + (a.atsScore || 0), 0) / allAnalyses.length) 
      : 0;
    
    const avgAtsThisMonth = analysesThisMonth.length > 0
      ? Math.round(analysesThisMonth.reduce((sum, a) => sum + (a.atsScore || 0), 0) / analysesThisMonth.length)
      : 0;
    
    const avgAtsLastMonth = analysesLastMonth.length > 0
      ? Math.round(analysesLastMonth.reduce((sum, a) => sum + (a.atsScore || 0), 0) / analysesLastMonth.length)
      : 0;

    const atsGrowth = formatAtsGrowth(avgAtsThisMonth, avgAtsLastMonth);

    return {
      success: true,
      stats: [
        { title: "Jobs Applied", value: totalJobsApplied.toString(), change: jobsGrowth, empty: totalJobsApplied === 0 },
        { title: "Interviews Prep", value: totalInterviews.toString(), change: interviewsGrowth, empty: totalInterviews === 0 },
        { title: "Avg ATS Score", value: avgAtsScore > 0 ? `${avgAtsScore}%` : "--", change: atsGrowth, empty: allAnalyses.length === 0 }
      ],
      isEmptyState: totalJobsApplied === 0 && totalInterviews === 0 && allAnalyses.length === 0
    };

  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    return { success: false, error: "Failed to load stats" };
  }
}

export interface AnalysisHistoryItem {
  id: string;
  atsScore: number;
  jobTitle: string;
  fileName: string;
  date: string;
  strengths: string[];
  missingSkills: string[];
}

export interface RoadmapMilestoneItem {
  id: string;
  title: string;
  week: number;
  completed: boolean;
}

export async function getCareerProgressData() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = auth.dbUser.id;

  try {
    // 1. Resume analyses history
    const analyses = await prisma.resumeAnalysis.findMany({
      where: { resume: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        resume: {
          select: { fileName: true }
        }
      }
    });

    const history: AnalysisHistoryItem[] = analyses.map((a) => ({
      id: a.id,
      atsScore: a.atsScore,
      jobTitle: a.jobTitle || "General Role",
      fileName: a.resume.fileName,
      date: a.createdAt.toISOString(),
      strengths: a.strengths || [],
      missingSkills: a.missingSkills || []
    }));

    // 2. Genuine Roadmap Milestones
    const latestRoadmap = await prisma.learningRoadmap.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const activeMilestones: RoadmapMilestoneItem[] = [];
    let roadmapSummary: { targetRole: string; progress: number; id: string } | null = null;

    if (latestRoadmap) {
      roadmapSummary = {
        id: latestRoadmap.id,
        targetRole: latestRoadmap.targetRole,
        progress: latestRoadmap.progress
      };

      const goals = latestRoadmap.weeklyGoals as {
        weeks?: Array<{
          week: number;
          tasks?: Array<{ id: string; title: string; completed?: boolean }>;
        }>;
      };

      if (goals && Array.isArray(goals.weeks)) {
        for (const w of goals.weeks) {
          if (Array.isArray(w.tasks)) {
            for (const t of w.tasks) {
              activeMilestones.push({
                id: t.id,
                title: t.title,
                week: w.week,
                completed: Boolean(t.completed)
              });
              if (activeMilestones.length >= 4) break;
            }
          }
          if (activeMilestones.length >= 4) break;
        }
      }
    }

    return {
      success: true,
      history,
      roadmapSummary,
      activeMilestones
    };
  } catch (error) {
    console.error("Failed to fetch career progress data", error);
    return { success: false, error: "Failed to load career progress data" };
  }
}

