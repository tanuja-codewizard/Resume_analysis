"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircularProgress } from "@/components/ui/circular-progress";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, BrainCircuit, Target, Lightbulb } from "lucide-react";
import { uploadAndAnalyzeResume } from "@/app/actions/resume";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResumeAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a resume first.");
      return;
    }
    
    setIsAnalyzing(true);
    setErrorMsg("");
    
    try {
      const form = e.target as HTMLFormElement;
      const jobTitle = (form.elements.namedItem('jobTitle') as HTMLInputElement)?.value;
      const jobDescription = (form.elements.namedItem('jobDescription') as HTMLTextAreaElement)?.value;
      
      const getBase64 = (f: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(f);
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = error => reject(error);
        });
      };
      
      const fileBase64 = await getBase64(file);
      
      const formData = new FormData();
      formData.append('fileBase64', fileBase64);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);
      if (jobTitle) formData.append('jobTitle', jobTitle);
      if (jobDescription) formData.append('jobDescription', jobDescription);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        formData.append('access_token', session.access_token);
      }
      
      const result = await uploadAndAnalyzeResume(formData);
      
      if (result.success && result.resume) {
        setAnalysis(result.resume.analyses[0]);
        setShowResults(true);
      } else {
        setErrorMsg(result.error || "Failed to analyze resume");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Analyzer</h1>
        <p className="text-muted-foreground">Upload your resume and a target job description to get an AI-powered ATS score and feedback.</p>
      </div>

      <AnimatePresence mode="wait">
        {!showResults ? (
          <motion.form
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleAnalyze}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Upload Zone */}
            <Card className="bg-card/50 backdrop-blur-md border-border md:col-span-2">
              <CardContent className="p-12">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <div 
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer group ${file ? 'border-emerald-500 bg-emerald-500/5' : 'border-primary/30 hover:bg-primary/5 hover:border-primary/50'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform ${file ? 'bg-emerald-500/10' : 'bg-primary/10 group-hover:scale-110'}`}>
                    {file ? <FileText className="h-8 w-8 text-emerald-500" /> : <UploadCloud className="h-8 w-8 text-primary" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {file ? file.name : "Upload your Resume"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Drag and drop your file here or click to browse (PDF, DOCX)."}
                  </p>
                  <Button type="button" variant={file ? "outline" : "secondary"} className="pointer-events-none">
                    {file ? "Change File" : "Select File"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-md border-border md:col-span-2">
              <CardHeader>
                <CardTitle>Target Job Description</CardTitle>
                <CardDescription>Paste the description of the job you want to apply for.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input id="job-title" name="jobTitle" placeholder="e.g. Senior Frontend Engineer" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-desc">Job Description</Label>
                    <textarea 
                      id="job-desc" 
                      name="jobDescription"
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Paste the requirements and responsibilities here..."
                      required
                    />
                  </div>
                  {errorMsg && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {errorMsg}
                    </div>
                  )}
                  <Button type="submit" className="w-full h-12 text-lg shadow-[0_0_15px_rgba(var(--primary),0.3)]" disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing with AI...</>
                    ) : (
                      <><Sparkles className="mr-2 h-5 w-5" /> Generate ATS Report</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.form>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <Button variant="outline" onClick={() => { setShowResults(false); setFile(null); }}>Analyze Another</Button>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills Gap</TabsTrigger>
                <TabsTrigger value="recruiters">Recruiters</TabsTrigger>
                <TabsTrigger value="interview">Interview</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="grid gap-6 md:grid-cols-3 mt-4">
                <Card className="bg-card/50 backdrop-blur-md border-border md:col-span-1 flex flex-col items-center justify-center p-8 text-center">
                  <CircularProgress value={analysis?.atsScore || 0} size={180} strokeWidth={12} className="mb-6" />
                  <h3 className="text-xl font-bold">{analysis?.atsScore >= 80 ? "Strong Match" : analysis?.atsScore >= 50 ? "Moderate Match" : "Needs Work"}</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {analysis?.summary || "Your resume has been analyzed. Check the detailed feedback."}
                  </p>
                </Card>

                <div className="md:col-span-2 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-md border-emerald-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-emerald-500">
                        <CheckCircle2 className="h-5 w-5" /> What You Did Well
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {analysis?.strengths?.map((strength: string, i: number) => (
                          <li key={i} className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" /> {strength}</li>
                        )) || <li className="text-muted-foreground">No specific strengths found.</li>}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-md border-yellow-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2 text-yellow-500">
                        <AlertCircle className="h-5 w-5" /> Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {analysis?.weaknesses?.map((weakness: string, i: number) => (
                          <li key={i} className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" /> {weakness}</li>
                        )) || <li className="text-muted-foreground">No major weaknesses found.</li>}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="mt-4">
                <Card className="bg-card/50 backdrop-blur-md border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/> Skills Requirements</CardTitle>
                    <CardDescription>How your skills match up against the job description.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-emerald-500">Matched Skills (Strengths)</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis?.strengths?.map((skill: string) => (
                          <div key={skill} className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-sm">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-destructive">Missing Skills to Add</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis?.missingSkills?.map((skill: string) => (
                          <div key={skill} className="px-3 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-sm">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="recruiters" className="mt-4">
                <Card className="bg-card/50 backdrop-blur-md border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-yellow-500"/> What Recruiters Want</CardTitle>
                    <CardDescription>Insider tips based on this specific job description.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <h4 className="font-bold text-foreground mb-2">1. Emphasize Performance Optimization</h4>
                        <p className="text-sm text-muted-foreground">The JD mentions "high-traffic user interfaces" multiple times. Recruiters will look for terms like 'Lighthouse score', 'lazy loading', and 'memoization'. Make sure your bullet points reflect this.</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <h4 className="font-bold text-foreground mb-2">2. Leadership & Mentorship</h4>
                        <p className="text-sm text-muted-foreground">For a senior role, they expect you to guide others. Add a bullet point about how you "mentored 3 junior developers" or "led technical design sessions".</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interview" className="mt-4">
                <Card className="bg-card/50 backdrop-blur-md border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary"/> Predicted Interview Questions</CardTitle>
                    <CardDescription>Practice these questions before your actual interview.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border border-border rounded-lg">
                        <p className="font-medium">1. Can you explain how you would architect a complex state management system in Next.js using React Server Components?</p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="font-medium">2. Tell me about a time you had to optimize a React application that was suffering from severe re-render issues.</p>
                      </div>
                      <div className="p-4 border border-border rounded-lg">
                        <p className="font-medium">3. How do you decide when to use Client Components vs Server Components?</p>
                      </div>
                      <Link href="/dashboard/interview" className={cn(buttonVariants({ variant: "default" }), "mt-4 w-full sm:w-auto")}>
                        Practice in Simulator
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
