"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Compass, 
  Sparkles, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertCircle, 
  Trash2, 
  Check, 
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getLearningRoadmaps, 
  generateLearningRoadmap, 
  toggleRoadmapTask, 
  deleteRoadmap 
} from "@/app/actions/roadmap";

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface WeekPlan {
  week: number;
  goal: string;
  tasks: TaskItem[];
  learningTopics: string[];
  measurableOutcome: string;
}

interface RoadmapRecord {
  id: string;
  targetRole: string;
  currentSkills: string[];
  missingSkills: string[];
  weeklyGoals: {
    weeks: WeekPlan[];
  };
  progress: number;
  createdAt: string | Date;
}

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<RoadmapRecord[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);
  const [targetRoleInput, setTargetRoleInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRoadmaps = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getLearningRoadmaps();
      const parsedRoadmaps = (data as unknown as RoadmapRecord[]) || [];
      setRoadmaps(parsedRoadmaps);
      if (parsedRoadmaps.length > 0 && !selectedRoadmapId) {
        setSelectedRoadmapId(parsedRoadmaps[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load learning roadmaps.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoadmapId]);

  useEffect(() => {
    let ignore = false;
    getLearningRoadmaps()
      .then((data) => {
        if (!ignore) {
          const parsed = (data as unknown as RoadmapRecord[]) || [];
          setRoadmaps(parsed);
          if (parsed.length > 0) {
            setSelectedRoadmapId(parsed[0].id);
          }
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : "Failed to load learning roadmaps.";
          setErrorMessage(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const activeRoadmap = roadmaps.find((r) => r.id === selectedRoadmapId) || roadmaps[0] || null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleInput.trim()) {
      setErrorMessage("Please enter a target job role.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const created = await generateLearningRoadmap(targetRoleInput.trim());
      const parsed = created as unknown as RoadmapRecord;
      setRoadmaps((prev) => [parsed, ...prev]);
      setSelectedRoadmapId(parsed.id);
      setTargetRoleInput("");
      setSuccessMessage(`4-week learning roadmap for "${parsed.targetRole}" generated successfully!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Roadmap generation failed.";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!activeRoadmap) return;
    const targetRoadmapId = activeRoadmap.id;
    setTogglingTaskId(taskId);

    try {
      const updated = await toggleRoadmapTask(targetRoadmapId, taskId, !currentCompleted);
      const parsedUpdated = updated as unknown as RoadmapRecord;

      setRoadmaps((prev) =>
        prev.map((r) => (r.id === targetRoadmapId ? parsedUpdated : r))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update task.";
      setErrorMessage(msg);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const handleDeleteRoadmap = async (id: string) => {
    if (!confirm("Are you sure you want to delete this roadmap?")) return;

    try {
      await deleteRoadmap(id);
      setRoadmaps((prev) => {
        const next = prev.filter((r) => r.id !== id);
        if (selectedRoadmapId === id) {
          setSelectedRoadmapId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
      setSuccessMessage("Roadmap deleted successfully.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete roadmap.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20">
              <Compass className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Personalized Learning Roadmap</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            4-week structured milestone plans dynamically tailored to missing skills identified in your resume.
          </p>
        </div>

        {roadmaps.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Select Plan:</span>
            <select
              value={activeRoadmap?.id || ""}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {roadmaps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.targetRole} ({r.progress}% complete)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Notice</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{errorMessage}</span>
            <Button size="sm" variant="outline" onClick={fetchRoadmaps} className="ml-4 h-7 text-xs">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Check className="h-4 w-4 text-emerald-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Generation Bar */}
      <Card className="bg-card/60 backdrop-blur-md border-border">
        <CardContent className="p-5">
          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Enter target role (e.g. Senior Frontend Engineer, DevOps Specialist)..."
                value={targetRoleInput}
                onChange={(e) => setTargetRoleInput(e.target.value)}
                disabled={isGenerating}
                className="bg-background/80"
              />
            </div>
            <Button type="submit" disabled={isGenerating || !targetRoleInput.trim()} className="shrink-0">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating 4-Week Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2 text-primary-foreground" />
                  Generate Roadmap
                </>
              )}
            </Button>
          </form>
          <p className="text-[11px] text-muted-foreground mt-2">
            Skill gaps are automatically gathered from your most recent resume analysis. Practical milestones are validated and stored securely.
          </p>
        </CardContent>
      </Card>

      {/* Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Loading your personalized learning path...</p>
        </div>
      ) : !activeRoadmap ? (
        /* Empty State */
        <Card className="border-dashed border-2 border-border/80 bg-card/30">
          <CardContent className="py-16 text-center space-y-4 max-w-md mx-auto">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">No Active Learning Roadmap</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Generate a 4-week structured curriculum targeting missing skills from your resume analysis.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => {
                  setTargetRoleInput("Full Stack Engineer");
                }}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Try &quot;Full Stack Engineer&quot;
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Active Roadmap Details */
        <div className="space-y-6">
          {/* Roadmap Overview Banner */}
          <Card className="bg-gradient-to-br from-card via-card/80 to-muted/20 border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-2xl font-bold">{activeRoadmap.targetRole}</CardTitle>
                    <Badge variant="outline" className="text-xs font-semibold">
                      4-Week Milestone Plan
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Created on {new Date(activeRoadmap.createdAt).toLocaleDateString()} &bull; Tracks practical project milestones
                  </CardDescription>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground font-medium block">Total Progress</span>
                    <span className="text-2xl font-bold text-primary">{activeRoadmap.progress}%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRoadmap(activeRoadmap.id)}
                    className="text-muted-foreground hover:text-destructive h-9 w-9"
                    title="Delete Roadmap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <Progress value={activeRoadmap.progress} className="h-2.5" />

              {/* Skills Focus Badges */}
              <div className="flex flex-wrap gap-2 pt-2 items-center text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-primary" /> Target Skill Gaps:
                </span>
                {activeRoadmap.missingSkills && activeRoadmap.missingSkills.length > 0 ? (
                  activeRoadmap.missingSkills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[11px] font-medium bg-primary/10 text-primary border-primary/20">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground italic">Domain competency reinforcement</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 4 Weeks Breakdown */}
          <div className="grid md:grid-cols-2 gap-5">
            <AnimatePresence>
              {activeRoadmap.weeklyGoals?.weeks?.map((week) => {
                const completedTasks = week.tasks.filter((t) => t.completed).length;
                const totalTasks = week.tasks.length;
                const weekProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                const isWeekComplete = weekProgress === 100 && totalTasks > 0;

                return (
                  <motion.div
                    key={week.week}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: week.week * 0.08 }}
                  >
                    <Card
                      className={`h-full flex flex-col transition-all border ${
                        isWeekComplete 
                          ? "border-emerald-500/40 bg-card/90 shadow-sm" 
                          : "border-border bg-card/50 hover:border-primary/30"
                      }`}
                    >
                      <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs font-bold ${
                              isWeekComplete 
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                                : "bg-primary/10 text-primary border-primary/20"
                            }`}
                          >
                            Week {week.week}
                          </Badge>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {completedTasks}/{totalTasks} Tasks
                          </span>
                        </div>
                        <CardTitle className="text-base font-semibold leading-snug pt-1">
                          {week.goal}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col justify-between p-5 space-y-5">
                        {/* Task Checklist */}
                        <div className="space-y-2.5">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                            Milestone Tasks
                          </span>
                          <div className="space-y-2">
                            {week.tasks.map((task) => {
                              const isToggling = togglingTaskId === task.id;
                              return (
                                <button
                                  key={task.id}
                                  type="button"
                                  onClick={() => handleToggleTask(task.id, task.completed)}
                                  disabled={isToggling}
                                  className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-start gap-2.5 transition-all ${
                                    task.completed
                                      ? "bg-emerald-500/5 border-emerald-500/30 text-muted-foreground line-through"
                                      : "bg-background/80 border-border/60 hover:border-primary/40 text-foreground"
                                  }`}
                                >
                                  {isToggling ? (
                                    <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0 mt-0.5" />
                                  ) : task.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                                  )}
                                  <span className="leading-snug">{task.title}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Topics & Measurable Outcome */}
                        <div className="space-y-3 pt-3 border-t border-border/40 text-xs">
                          {/* Learning Topics */}
                          {week.learningTopics && week.learningTopics.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5 text-primary" /> Key Concepts:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {week.learningTopics.map((topic, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] font-normal">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Measurable Outcome */}
                          {week.measurableOutcome && (
                            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10 space-y-1">
                              <span className="font-bold text-primary flex items-center gap-1.5 text-[11px]">
                                <Trophy className="w-3.5 h-3.5" /> Measurable Outcome:
                              </span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">
                                {week.measurableOutcome}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
