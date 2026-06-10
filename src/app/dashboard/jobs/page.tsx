"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, DollarSign, GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { getJobRecommendations } from "@/app/actions/jobs";

const initialColumns = {
  "Saved": [
    { id: "1", title: "Senior React Developer", company: "Vercel", location: "Remote", salary: "$140k - $180k", match: 94 },
    { id: "2", title: "Frontend Engineer", company: "Stripe", location: "San Francisco", salary: "$150k - $200k", match: 88 },
  ],
  "Applied": [
    { id: "3", title: "Full Stack Engineer", company: "Supabase", location: "Remote", salary: "$130k - $160k", match: 85 },
  ],
  "Interviewing": [
    { id: "4", title: "UI Engineer", company: "Figma", location: "New York", salary: "$160k - $190k", match: 91 },
  ],
  "Offered": []
};

export default function JobTracker() {
  const [columns, setColumns] = useState<any>(initialColumns);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      try {
        const jobs = await getJobRecommendations();
        setColumns((prev: any) => ({
          ...prev,
          "Saved": jobs.map(j => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            salary: j.salary || "N/A",
            match: j.matchPercentage
          }))
        }));
      } catch (error) {
        console.error("Failed to load jobs", error);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Job Tracker</h1>
          <p className="text-muted-foreground">Manage your applications with this Kanban board.</p>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {Object.entries(columns).map(([columnName, jobs]: [string, any], colIndex) => (
          <div key={columnName} className="min-w-[320px] w-[320px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{columnName}</h3>
              <Badge variant="secondary">{jobs.length}</Badge>
            </div>
            
            <div className="flex-1 bg-muted/20 border border-border/50 rounded-xl p-3 flex flex-col gap-3 min-h-[500px]">
              {jobs.map((job: any, i: number) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 cursor-grab active:cursor-grabbing shadow-sm group">
                    <CardContent className="p-4 flex gap-3">
                      <GripVertical className="w-5 h-5 text-muted-foreground/30 mt-1 cursor-grab" />
                      <div className="flex-1 space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">{job.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Building className="w-3 h-3"/> {job.company}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3"/> {job.salary}</span>
                        </div>
                        <div className="flex justify-end">
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {job.match}% Match
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {jobs.length === 0 && (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Drop jobs here</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
