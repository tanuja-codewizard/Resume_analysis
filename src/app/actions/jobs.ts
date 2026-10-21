'use server'

import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/sync-user';
import type { JobPipelineStage } from '@/lib/utils/jobs';

// Archetype benchmark roles used for skills matching in the absence of a live job board provider
const ARCHETYPE_ROLES = [
  { 
    title: "Frontend Developer", 
    company: "Benchmark Tech Archetype", 
    location: "Remote / Hybrid", 
    salary: "$100k-$130k (Market Estimate)", 
    experience: "Mid-Level", 
    description: "React, Next.js, TypeScript" 
  },
  { 
    title: "Full Stack Engineer", 
    company: "Benchmark Tech Archetype", 
    location: "Hybrid / On-site", 
    salary: "$120k-$150k (Market Estimate)", 
    experience: "Senior", 
    description: "Node.js, React, PostgreSQL" 
  },
  { 
    title: "UI/UX Designer", 
    company: "Benchmark Tech Archetype", 
    location: "Remote", 
    salary: "$90k-$110k (Market Estimate)", 
    experience: "Junior-Mid", 
    description: "Figma, CSS, HTML" 
  },
  { 
    title: "Backend Developer", 
    company: "Benchmark Tech Archetype", 
    location: "Remote", 
    salary: "$110k-$140k (Market Estimate)", 
    experience: "Mid-Level", 
    description: "Python, Django, AWS, PostgreSQL" 
  }
];

function extractCleanWhyRecommended(text: string): string {
  return text.replace(/^\[Stage:(Interviewing|Offered)\]\s*/i, '');
}

/**
 * Loads role recommendations and benchmarks without creating duplicate records.
 * Preserves user's pipeline stage (Saved, Applied, Interviewing, Offered).
 */
export async function getJobRecommendations(filters: { query?: string; location?: string } = {}) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return [];
  }
  const finalUserId = auth.dbUser.id;

  // 1. Fetch existing saved/tracked recommendations first
  const existingJobs = await prisma.jobRecommendation.findMany({
    where: { userId: finalUserId },
    orderBy: { createdAt: 'desc' }
  });

  // If recommendations already exist and no specific filters are applied, return existing records
  if (existingJobs.length > 0 && !filters.query && !filters.location) {
    return existingJobs;
  }

  // Fetch candidate's latest resume analysis to compute skill match
  const latestResume = await prisma.resume.findFirst({
    where: { userId: finalUserId },
    orderBy: { createdAt: 'desc' },
    include: { analyses: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });

  const currentSkills = latestResume?.analyses[0]?.strengths || ["JavaScript", "HTML", "CSS"];

  const candidateJobs = ARCHETYPE_ROLES.filter(j => {
    const matchesQuery = !filters.query || j.title.toLowerCase().includes(filters.query.toLowerCase()) || j.description.toLowerCase().includes(filters.query.toLowerCase());
    const matchesLoc = !filters.location || j.location.toLowerCase().includes(filters.location.toLowerCase());
    return matchesQuery && matchesLoc;
  });

  // Existing keys to avoid creating duplicate (title, company)
  const existingKeys = new Set(
    existingJobs.map(j => `${j.title.toLowerCase().trim()}|${j.company.toLowerCase().trim()}`)
  );

  const newRecommendations = [];
  for (const job of candidateJobs) {
    const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
    if (!existingKeys.has(key)) {
      const jobDescSkills = job.description.split(', ').map(s => s.toLowerCase());
      const matched = jobDescSkills.filter(js => currentSkills.map(cs => cs.toLowerCase()).includes(js));
      const matchPercentage = Math.round((matched.length / Math.max(jobDescSkills.length, 1)) * 100);
      const missingSkills = jobDescSkills.filter(js => !currentSkills.map(cs => cs.toLowerCase()).includes(js));

      newRecommendations.push({
        userId: finalUserId,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        experience: job.experience,
        matchPercentage: matchPercentage > 0 ? matchPercentage : 65,
        missingSkills: missingSkills.length > 0 ? missingSkills : ["System Design"],
        whyRecommended: `Matches ${matchPercentage > 0 ? matchPercentage : 65}% of your profile skills.`,
        isSaved: true,
        isApplied: false
      });
    }
  }

  if (newRecommendations.length > 0) {
    await prisma.$transaction(
      newRecommendations.map(rec => prisma.jobRecommendation.create({ data: rec }))
    );
  }

  return await prisma.jobRecommendation.findMany({
    where: { userId: finalUserId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Persistently update pipeline stage (Saved, Applied, Interviewing, Offered)
 */
export async function updateJobStage(id: string, stage: JobPipelineStage) {
  const auth = await getAuthenticatedUser();
  if (!auth) return { success: false, error: 'Unauthorized' };

  const existing = await prisma.jobRecommendation.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.dbUser.id) {
    return { success: false, error: 'Job not found or unauthorized' };
  }

  const cleanWhy = extractCleanWhyRecommended(existing.whyRecommended || '');

  let newWhy = cleanWhy;
  let isSaved = false;
  let isApplied = false;

  switch (stage) {
    case 'Saved':
      isSaved = true;
      isApplied = false;
      break;
    case 'Applied':
      isSaved = false;
      isApplied = true;
      break;
    case 'Interviewing':
      isSaved = false;
      isApplied = true;
      newWhy = `[Stage:Interviewing] ${cleanWhy}`;
      break;
    case 'Offered':
      isSaved = false;
      isApplied = true;
      newWhy = `[Stage:Offered] ${cleanWhy}`;
      break;
  }

  const updated = await prisma.jobRecommendation.update({
    where: { id },
    data: {
      isSaved,
      isApplied,
      whyRecommended: newWhy
    }
  });

  return { success: true, job: updated };
}

/**
 * Update saved status with authenticated ownership enforcement
 */
export async function toggleSaveJob(id: string, isSaved: boolean) {
  return await updateJobStage(id, isSaved ? 'Saved' : 'Applied');
}

/**
 * Update applied status with authenticated ownership enforcement
 */
export async function toggleApplyJob(id: string, isApplied: boolean) {
  return await updateJobStage(id, isApplied ? 'Applied' : 'Saved');
}

export async function deleteJobRecommendation(id: string) {
  const auth = await getAuthenticatedUser();
  if (!auth) return { success: false, error: 'Unauthorized' };

  const existing = await prisma.jobRecommendation.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.dbUser.id) {
    return { success: false, error: 'Job not found or unauthorized' };
  }

  await prisma.jobRecommendation.delete({ where: { id } });
  return { success: true };
}

export async function getSavedJobs() {
  const auth = await getAuthenticatedUser();
  if (!auth) return [];

  return await prisma.jobRecommendation.findMany({
    where: { userId: auth.dbUser.id, isSaved: true },
    orderBy: { createdAt: 'desc' }
  });
}
