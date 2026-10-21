"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  MapPin, 
  DollarSign, 
  GripVertical, 
  CheckCircle2, 
  Bookmark, 
  ArrowRight, 
  ArrowLeft,
  Info, 
  Trash2, 
  Sparkles,
  Trophy,
  Loader2
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { 
  getJobRecommendations, 
  updateJobStage, 
  deleteJobRecommendation
} from "@/app/actions/jobs";
import { parseJobStage, JobPipelineStage } from "@/lib/utils/jobs";

interface KanbanJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  stage: JobPipelineStage;
}

type KanbanColumns = Record<JobPipelineStage, KanbanJob[]>;

const initialColumns: KanbanColumns = {
  Saved: [],
  Applied: [],
  Interviewing: [],
  Offered: [],
};

const STAGE_ORDER: JobPipelineStage[] = ["Saved", "Applied", "Interviewing", "Offered"];

export default function JobTracker() {
  const [columns, setColumns] = useState<KanbanColumns>(initialColumns);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      const jobs = await getJobRecommendations();
      const grouped: KanbanColumns = {
        Saved: [],
        Applied: [],
        Interviewing: [],
        Offered: [],
      };

      jobs.forEach((j) => {
        const stage = parseJobStage(j);
        const item: KanbanJob = {
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          salary: j.salary || "Market Benchmark",
          match: j.matchPercentage,
          stage,
        };
        grouped[stage].push(item);
      });

      setColumns(grouped);
    } catch (error) {
      console.error("Failed to load jobs", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    getJobRecommendations()
      .then((jobs) => {
        if (!ignore) {
          const grouped: KanbanColumns = {
            Saved: [],
            Applied: [],
            Interviewing: [],
            Offered: [],
          };

          jobs.forEach((j) => {
            const stage = parseJobStage(j);
            const item: KanbanJob = {
              id: j.id,
              title: j.title,
              company: j.company,
              location: j.location,
              salary: j.salary || "Market Benchmark",
              match: j.matchPercentage,
              stage,
            };
            grouped[stage].push(item);
          });

          setColumns(grouped);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to load jobs", error);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const moveJob = async (job: KanbanJob, toStage: JobPipelineStage) => {
    if (job.stage === toStage) return;
    const fromStage = job.stage;
    setIsUpdating(job.id);

    // Optimistic UI update
    setColumns((prev) => ({
      ...prev,
      [fromStage]: prev[fromStage].filter((j) => j.id !== job.id),
      [toStage]: [...prev[toStage], { ...job, stage: toStage }],
    }));

    try {
      await updateJobStage(job.id, toStage);
    } catch (error) {
      console.error("Failed to update job stage", error);
      // Revert if error
      await loadJobs();
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (job: KanbanJob) => {
    if (!confirm(`Remove "${job.title}" from your tracker?`)) return;
    setIsUpdating(job.id);

    setColumns((prev) => ({
      ...prev,
      [job.stage]: prev[job.stage].filter((j) => j.id !== job.id),
    }));

    try {
      await deleteJobRecommendation(job.id);
    } catch (error) {
      console.error("Failed to delete job", error);
      await loadJobs();
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Career Pipeline &amp; Role Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Track and manage your application progress across each hiring pipeline stage.
          </p>
        </div>
      </div>

      {/* Honesty & Limitation Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-foreground flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-primary">
            Role Benchmark Suggestions (Simulated Archetypes)
          </p>
          <p className="text-muted-foreground leading-relaxed">
            These role cards represent archetype benchmarks matched against your resume skill set. No live external job provider (such as Adzuna, LinkedIn, or Greenhouse) is currently connected, so these are not verified live vacancies. You can track your real application pipeline stages, interview progress, and offers here.
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-5 overflow-x-auto pb-4 flex-1">
        {STAGE_ORDER.map((columnName) => {
          const jobs = columns[columnName];
          return (
            <div key={columnName} className="min-w-[300px] w-[300px] flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between px-1">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  {columnName === "Offered" ? <Trophy className="w-4 h-4 text-emerald-500" /> : null}
                  {columnName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {jobs.length}
                </Badge>
              </div>

              <div className="flex-1 bg-muted/20 border border-border/50 rounded-2xl p-3 flex flex-col gap-3 min-h-[500px]">
                {jobs.map((job, i) => {
                  const isBusy = isUpdating === job.id;
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card className="bg-card/90 backdrop-blur-sm border-border hover:border-primary/40 shadow-sm transition-all">
                        <CardContent className="p-4 flex gap-2.5">
                          <GripVertical className="w-4 h-4 text-muted-foreground/30 mt-1 shrink-0" />
                          <div className="flex-1 space-y-2.5">
                            <div className="flex items-start justify-between gap-1">
                              <div>
                                <h4 className="font-bold text-sm leading-tight text-foreground">
                                  {job.title}
                                </h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                  <Building className="w-3 h-3 text-primary/70" /> {job.company}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(job)}
                                disabled={isBusy}
                                className="h-6 w-6 text-muted-foreground hover:text-destructive -mr-1 -mt-1"
                                title="Remove from tracker"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="space-y-1 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {job.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" /> {job.salary}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/40">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> {job.match}% Match
                              </span>

                              {/* Pipeline Navigation Controls */}
                              <div className="flex items-center gap-1">
                                {isBusy && <Loader2 className="w-3 h-3 animate-spin text-primary mr-1" />}

                                {columnName === "Saved" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={isBusy}
                                    className="h-6 text-[11px] px-2 text-primary"
                                    title="Mark as Applied"
                                    onClick={() => moveJob(job, "Applied")}
                                  >
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Applied
                                  </Button>
                                )}

                                {columnName === "Applied" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={isBusy}
                                      className="h-6 text-[10px] px-1 text-muted-foreground"
                                      title="Back to Saved"
                                      onClick={() => moveJob(job, "Saved")}
                                    >
                                      <ArrowLeft className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={isBusy}
                                      className="h-6 text-[11px] px-2 text-primary"
                                      title="Move to Interviewing"
                                      onClick={() => moveJob(job, "Interviewing")}
                                    >
                                      Interview <ArrowRight className="w-3 h-3 ml-0.5" />
                                    </Button>
                                  </>
                                )}

                                {columnName === "Interviewing" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={isBusy}
                                      className="h-6 text-[10px] px-1 text-muted-foreground"
                                      title="Back to Applied"
                                      onClick={() => moveJob(job, "Applied")}
                                    >
                                      <ArrowLeft className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={isBusy}
                                      className="h-6 text-[11px] px-2 text-emerald-600 dark:text-emerald-400"
                                      title="Mark as Offered"
                                      onClick={() => moveJob(job, "Offered")}
                                    >
                                      Offered <ArrowRight className="w-3 h-3 ml-0.5" />
                                    </Button>
                                  </>
                                )}

                                {columnName === "Offered" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={isBusy}
                                    className="h-6 text-[10px] px-1 text-muted-foreground"
                                    title="Back to Interviewing"
                                    onClick={() => moveJob(job, "Interviewing")}
                                  >
                                    <ArrowLeft className="w-3 h-3 mr-0.5" /> Back
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {jobs.length === 0 && !isLoading && (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl p-6 text-center text-muted-foreground text-xs">
                    <Bookmark className="w-6 h-6 opacity-20 mb-1.5" />
                    <p>No roles in {columnName}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
