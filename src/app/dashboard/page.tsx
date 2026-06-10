"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircularProgress } from "@/components/ui/circular-progress";
import { ArrowUpRight, UploadCloud, Target, Briefcase, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const stats = [
  { title: "Jobs Applied", value: "24", change: "+12%", icon: Briefcase },
  { title: "Interviews Prep", value: "8", change: "+3", icon: Target },
  { title: "Avg ATS Score", value: "78%", change: "+5%", icon: Sparkles },
];

import { useEffect, useState } from "react";
import { getUserResumes } from "@/app/actions/resume";
import { getLearningRoadmaps } from "@/app/actions/roadmap";
import { getJobRecommendations } from "@/app/actions/jobs";

export default function DashboardOverview() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userResumes, roadmaps, jobs] = await Promise.all([
          getUserResumes(),
          getLearningRoadmaps(),
          getJobRecommendations()
        ]);
        setResumes(userResumes);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const latestAnalysis = resumes[0]?.analyses?.[0];
  const atsScore = latestAnalysis?.atsScore || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Here is your career progress overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
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
        <Card className="lg:col-span-4 bg-card/50 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle>Recent Resume Analysis</CardTitle>
            <CardDescription>Your latest ATS performance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8 p-6">
            <CircularProgress value={atsScore} size={160} strokeWidth={12} />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> 
                  Excellent Match
                </h4>
                <p className="text-sm text-muted-foreground">
                  {latestAnalysis 
                    ? `Your resume "${resumes[0]?.fileName}" scored ${atsScore}%. ${latestAnalysis.summary}`
                    : "Upload your first resume to get a detailed ATS report and personalized recommendations."}
                </p>
              </div>
              <div className="flex gap-3">
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

        <Card className="lg:col-span-3 bg-card/50 backdrop-blur-md border-border">
          <CardHeader>
            <CardTitle>AI Recommended Path</CardTitle>
            <CardDescription>Based on your target role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { title: "Master React Server Components", time: "2 hrs", status: "In Progress" },
                { title: "System Design Interview Prep", time: "4 hrs", status: "Next" },
                { title: "Tailwind CSS Advanced Patterns", time: "1 hr", status: "Locked" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      item.status === "In Progress" ? "bg-primary animate-pulse" : 
                      item.status === "Next" ? "bg-yellow-500" : "bg-muted"
                    )} />
                    <div>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
