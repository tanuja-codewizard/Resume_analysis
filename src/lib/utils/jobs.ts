export type JobPipelineStage = "Saved" | "Applied" | "Interviewing" | "Offered";

export function parseJobStage(job: { isSaved: boolean; isApplied: boolean; whyRecommended?: string | null }): JobPipelineStage {
  const why = job.whyRecommended || '';
  if (why.startsWith('[Stage:Offered]')) return 'Offered';
  if (why.startsWith('[Stage:Interviewing]')) return 'Interviewing';
  if (job.isApplied) return 'Applied';
  return 'Saved';
}
