"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "@/components/ui/circular-progress";
import { 
  ArrowUpRight, 
  UploadCloud, 
  Target, 
  Briefcase, 
  Sparkles, 
  LucideIcon, 
  Compass, 
  CheckCircle2, 
  Circle, 
  History,
  TrendingUp,
  FileText
} from "lucide-react";
import { getDashboardStats, getCareerProgressData, AnalysisHistoryItem, RoadmapMilestoneItem } from "@/app/actions/dashboard";

interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  empty?: boolean;
}

const baseStats: StatItem[] = [
  { title: "Jobs Applied", value: "--", change: "--", icon: Briefcase },
  { title: "Interviews Prep", value: "--", change: "--", icon: Target },
  { title: "Avg ATS Score", value: "--", change: "--", icon: Sparkles },
];

export default function DashboardOverview() {
  const [dashboardStats, setDashboardStats] = useState<StatItem[]>(baseStats);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [activeMilestones, setActiveMilestones] = useState<RoadmapMilestoneItem[]>([]);
  const [roadmapSummary, setRoadmapSummary] = useState<{ targetRole: string; progress: number; id: string } | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsResult, progressResult] = await Promise.all([
          getDashboardStats(),
          getCareerProgressData()
        ]);

        if (statsResult?.success && statsResult.stats) {
          const mergedStats: StatItem[] = statsResult.stats.map((s, i: number) => ({
            title: s.title,
            value: s.value,
            change: s.change,
            empty: s.empty,
            icon: baseStats[i].icon
          }));
          setDashboardStats(mergedStats);
          setIsEmpty(Boolean(statsResult.isEmptyState));
        }

        if (progressResult?.success) {
          setHistory(progressResult.history || []);
          setActiveMilestones(progressResult.activeMilestones || []);
          setRoadmapSummary(progressResult.roadmapSummary || null);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const latestAnalysis = history[0] || null;
  const previousAnalysis = history[1] || null;
  const atsScore = latestAnalysis?.atsScore || 0;
  const analyzedJobTitle = latestAnalysis?.jobTitle || "General Role";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Here is your verified career progress overview.</p>
      </div>

      {isEmpty && !loading && (
        <Card className="bg-primary/5 border-primary/20 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">No analyses yet</h3>
            <p className="text-muted-foreground max-w-md">
              Upload your resume to get started. We will automatically analyze your strengths, weaknesses, and match you with role benchmarks.
            </p>
            <Link href="/dashboard/resume">
              <Button className="mt-2">Upload Resume</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Primary KPI Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-card/50 backdrop-blur-md border-border hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-emerald-500 mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Latest Resume Analysis Card */}
        <Card className="lg:col-span-4 bg-card/50 backdrop-blur-md border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Resume Analysis</CardTitle>
                <CardDescription>Targeting: {analyzedJobTitle}</CardDescription>
              </div>
              {history.length > 1 && (
                <Badge variant="outline" className="text-xs">
                  {history.length} Analyses Tracked
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8 p-6">
            <CircularProgress value={atsScore} size={160} strokeWidth={12} />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> 
                  {atsScore >= 75 ? "Excellent Match" : atsScore >= 50 ? "Moderate Match" : "Ready for Analysis"}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {latestAnalysis 
                    ? `Your resume "${latestAnalysis.fileName}" scored ${atsScore}% for the ${analyzedJobTitle} role.`
                    : "Upload your first resume to get a detailed ATS report and personalized recommendations."}
                </p>
                {previousAnalysis && (
                  <p className="text-xs text-primary font-medium flex items-center gap-1 pt-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Previous score: {previousAnalysis.atsScore}% ({previousAnalysis.jobTitle}) on {new Date(previousAnalysis.date).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <Link href="/dashboard/resume">
                  <Button variant="outline">View Full Report</Button>
                </Link>
                <Link href="/dashboard/resume">
                  <Button className="shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                    <UploadCloud className="h-4 w-4 mr-2" /> Analyze New
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommended Path / Real Learning Milestones */}
        <Card className="lg:col-span-3 bg-card/50 backdrop-blur-md border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Learning Milestones</CardTitle>
                <CardDescription>
                  {roadmapSummary ? `Target: ${roadmapSummary.targetRole}` : "No active curriculum"}
                </CardDescription>
              </div>
              {roadmapSummary && (
                <Badge variant="secondary" className="text-xs">
                  {roadmapSummary.progress}% Done
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeMilestones.length > 0 ? (
              <div className="space-y-4">
                {activeMilestones.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 text-xs p-2 rounded-lg bg-background/40 border border-border/40">
                    <div className="flex items-start gap-2.5">
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${item.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Week {item.week} Goal</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <Link href="/dashboard/roadmap">
                    <Button variant="ghost" size="sm" className="text-xs text-primary w-full">
                      <Compass className="w-3.5 h-3.5 mr-1.5" /> Open Full 4-Week Roadmap
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  No learning roadmap generated yet. Turn resume skill gaps into a structured 4-week study plan.
                </p>
                <Link href="/dashboard/roadmap">
                  <Button size="sm" variant="outline" className="text-xs">
                    <Compass className="w-3.5 h-3.5 mr-1.5" /> Create Roadmap
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historical Resume Analyses Progression Section */}
      {history.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-md border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Resume Score Progression History
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological record of your ATS evaluations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {history.map((record) => (
                <div key={record.id} className="p-3 rounded-xl border border-border/60 bg-background/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs font-bold bg-primary/10 text-primary">
                      {record.atsScore}% ATS
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground truncate">
                    {record.jobTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                    <FileText className="w-3 h-3" /> {record.fileName}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
