'use server'

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';

export async function getDashboardStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let finalUserId = user?.id;
  if (!finalUserId) {
    const dummyUser = await prisma.user.findFirst({ where: { email: 'dummy@example.com' } });
    if (!dummyUser) return { success: false, error: 'Unauthorized' };
    finalUserId = dummyUser.id;
  }

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

    const jobsGrowth = jobsAppliedLastMonth === 0 
      ? (jobsAppliedThisMonth > 0 ? '+100%' : '--') 
      : `+${Math.round(((jobsAppliedThisMonth - jobsAppliedLastMonth) / jobsAppliedLastMonth) * 100)}%`;

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

    const interviewsGrowth = interviewsLastMonth === 0 
      ? (interviewsThisMonth > 0 ? '+100%' : '--') 
      : `+${Math.round(((interviewsThisMonth - interviewsLastMonth) / interviewsLastMonth) * 100)}%`;

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

    let atsGrowth = '--';
    if (avgAtsLastMonth > 0) {
      const diff = avgAtsThisMonth - avgAtsLastMonth;
      atsGrowth = diff >= 0 ? `+${diff}%` : `${diff}%`;
    } else if (avgAtsThisMonth > 0) {
      atsGrowth = '+100%';
    }

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
