"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Hero() {
  const [snippet, setSnippet] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const handleAnalyze = () => {
    if (!snippet.trim()) {
      setScore(null);
      return;
    }
    
    setIsAnalyzing(true);
    
    // Mock analysis delay
    setTimeout(() => {
      const text = snippet.toLowerCase();
      let calculatedScore = 35; // Base score
      
      // Length metric
      if (text.length > 100) calculatedScore += 15;
      if (text.length > 250) calculatedScore += 10;
      
      // Action verbs
      const actionVerbs = ['managed', 'led', 'developed', 'achieved', 'increased', 'improved', 'designed', 'created', 'implemented', 'optimized', 'spearheaded', 'launched'];
      let verbCount = 0;
      actionVerbs.forEach(verb => {
        if (text.includes(verb)) verbCount++;
      });
      calculatedScore += Math.min(verbCount * 8, 25);
      
      // Metrics / Numbers
      const hasNumbers = /\d+%?/.test(text);
      if (hasNumbers) calculatedScore += 15;
      
      setScore(Math.min(calculatedScore, 98));
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
      
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 border border-primary/20 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              CareerAI 2.0 is now live
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 leading-tight">
              Beat the ATS Bots. <br className="hidden md:block" />
              Land More Interviews.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              <strong className="text-foreground">75% of resumes are rejected</strong> by applicant tracking systems before a human ever sees them. Instantly optimize yours to bypass the filters and get noticed.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 transition-transform hover:scale-105">
                  Optimize My Resume
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  </div>
                ))}
              </div>
              <p>Trusted by <strong className="text-foreground">10,000+</strong> job seekers</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:max-w-none lg:ml-auto"
          >
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                Test Your Resume
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Paste a bullet point from your resume to see how an ATS views it. No signup required.
              </p>
              
              <div className="space-y-4">
                <textarea
                  value={snippet}
                  onChange={(e) => { setSnippet(e.target.value); setScore(null); }}
                  placeholder="e.g. Led a team of 5 engineers to develop a new web application, increasing user engagement by 25%."
                  className="w-full h-32 rounded-xl border border-input bg-background/50 px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 resize-none"
                />
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing || !snippet.trim()}
                    className="w-full sm:flex-1 h-16 rounded-xl text-lg font-semibold"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Scan with AI"
                    )}
                  </Button>
                  
                  <div className="w-full sm:w-24 h-16 shrink-0 relative flex items-center justify-center bg-background rounded-xl border border-border/50 shadow-sm">
                    {score !== null ? (
                      <div className="text-center flex flex-col items-center justify-center animate-in zoom-in duration-300">
                        <span className={cn(
                          "text-2xl font-bold tracking-tighter leading-none",
                          score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"
                        )}>
                          {score}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Score</span>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold tracking-tighter text-muted-foreground/30 leading-none">--</span>
                        <span className="block text-[10px] text-muted-foreground/50 uppercase font-bold mt-1">Score</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {score !== null && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/10 rounded-xl p-4 mt-2"
                  >
                    <div className="flex gap-3">
                      <CheckCircle2 className={cn(
                        "w-5 h-5 shrink-0 mt-0.5",
                        score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500"
                      )} />
                      <div>
                        <h4 className="text-sm font-semibold mb-1 text-foreground">
                          {score >= 80 ? "Strong impact detected" : score >= 50 ? "Could be stronger" : "Needs improvement"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {score >= 80 
                            ? "Great use of action verbs and quantifiable metrics. ATS systems will rank this highly." 
                            : score >= 50 
                            ? "Add more specific numbers or results to show your exact impact." 
                            : "Try starting with an action verb (e.g., 'Managed', 'Created') and adding numbers."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
