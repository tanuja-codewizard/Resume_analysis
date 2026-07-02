'use server'

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple mock for a Job API to simulate real behavior until an API key is provided
async function fetchMockJobs(query: string, location: string) {
  // In a real scenario, this would be a fetch() call to JSearch, Adzuna, etc.
  return [
    { title: "Frontend Developer", company: "Tech Corp", location: "Remote", salary: "$100k-$130k", experience: "Mid-Level", description: "React, Next.js, TypeScript" },
    { title: "Full Stack Engineer", company: "StartupInc", location: "New York, NY", salary: "$120k-$150k", experience: "Senior", description: "Node.js, React, PostgreSQL" },
    { title: "UI/UX Designer", company: "Designify", location: "San Francisco, CA", salary: "$90k-$110k", experience: "Junior", description: "Figma, CSS, HTML" },
    { title: "Backend Developer", company: "DataSystems", location: "Remote", salary: "$110k-$140k", experience: "Mid-Level", description: "Python, Django, AWS" }
  ];
}

export async function getJobRecommendations(filters: { query?: string, location?: string } = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return [];
  }
  const finalUserId = user.id;

  // Fetch candidate's latest resume analysis to get their skills
  const latestResume = await prisma.resume.findFirst({
    where: { userId: finalUserId },
    orderBy: { createdAt: 'desc' },
    include: { analyses: true }
  });

  const currentSkills = latestResume?.analyses[0]?.strengths || ["JavaScript", "HTML", "CSS"];

  const jobs = await fetchMockJobs(filters.query || '', filters.location || '');

  // Calculate Match Percentage using basic logic (or AI in production)
  const recommendations = jobs.map(job => {
    const jobDescSkills = job.description.split(', ').map(s => s.toLowerCase());
    const matched = jobDescSkills.filter(js => currentSkills.map(cs => cs.toLowerCase()).includes(js));
    const matchPercentage = Math.round((matched.length / Math.max(jobDescSkills.length, 1)) * 100);
    const missingSkills = jobDescSkills.filter(js => !currentSkills.map(cs => cs.toLowerCase()).includes(js));

    return {
      userId: finalUserId,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      experience: job.experience,
      matchPercentage: matchPercentage > 0 ? matchPercentage : Math.floor(Math.random() * 50) + 20, // Random baseline if no direct match
      missingSkills: missingSkills.length > 0 ? missingSkills : ["System Design"],
      whyRecommended: `Matches ${matchPercentage}% of your profile skills.`,
      isSaved: false,
      isApplied: false
    };
  });

  // Save to DB and return the inserted records (which contain IDs)
  const createdJobs = [];
  for (const rec of recommendations) {
    const newJob = await prisma.jobRecommendation.create({ data: rec });
    createdJobs.push(newJob);
  }

  return createdJobs;
}

export async function getSavedJobs() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return [];
    }
    const finalUserId = user.id;
  
    return await prisma.jobRecommendation.findMany({
      where: { userId: finalUserId, isSaved: true },
      orderBy: { createdAt: 'desc' }
    });
}
