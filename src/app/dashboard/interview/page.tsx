"use client";

import { useState, useRef, useEffect, useSyncExternalStore, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BrainCircuit, 
  Mic, 
  Square, 
  Loader2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  RefreshCw,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  Check
} from "lucide-react";
import { 
  getInterviewQuestions, 
  generateInterviewQuestions, 
  submitInterviewAnswer, 
  toggleQuestionStatus,
  StoredQuestionEvaluation
} from "@/app/actions/interview";
import { AnswerEvaluation } from "@/lib/ai/gemini";

interface BrowserSpeechEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface BrowserSpeechErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: BrowserSpeechEvent) => void) | null;
  onerror: ((event: BrowserSpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

function subscribeToSpeech() {
  return () => {};
}

function getSpeechClientSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

function getSpeechServerSnapshot(): boolean {
  return false;
}

interface QuestionItem {
  id: string;
  jobRole: string;
  type: string;
  question: string;
  isCompleted: boolean;
  notes: string | null;
}

const CATEGORIES = ["All", "Technical", "HR", "Behavioral", "Aptitude"];

export default function InterviewPrep() {
  const browserSpeechSupported = useSyncExternalStore(
    subscribeToSpeech,
    getSpeechClientSnapshot,
    getSpeechServerSnapshot
  );

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [customRoleInput, setCustomRoleInput] = useState("");
  const [showRoleInput, setShowRoleInput] = useState(false);

  const [textInput, setTextInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechDisabledFallback, setSpeechDisabledFallback] = useState(false);

  const [actionEvaluation, setActionEvaluation] = useState<AnswerEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const isRecordingRef = useRef(false);

  const activeQuestion = questions[activeQuestionIndex] || null;

  const storedEvaluation: AnswerEvaluation | null = useMemo(() => {
    if (activeQuestion?.notes) {
      try {
        const parsed = JSON.parse(activeQuestion.notes) as StoredQuestionEvaluation;
        return parsed?.evaluation || null;
      } catch {
        return null;
      }
    }
    return null;
  }, [activeQuestion]);

  const displayedEvaluation = actionEvaluation || storedEvaluation;

  const reloadQuestions = useCallback((cat: string) => {
    setIsLoadingQuestions(true);
    setErrorMessage(null);
    getInterviewQuestions(cat === "All" ? undefined : cat)
      .then((data) => {
        setQuestions(data);
        setActiveQuestionIndex(0);
        setActionEvaluation(null);
      })
      .catch(() => {
        setErrorMessage("Failed to load interview questions.");
      })
      .finally(() => {
        setIsLoadingQuestions(false);
      });
  }, []);

  useEffect(() => {
    let ignore = false;
    getInterviewQuestions(selectedCategory === "All" ? undefined : selectedCategory)
      .then((data) => {
        if (!ignore) {
          setQuestions(data);
          setActiveQuestionIndex(0);
          setActionEvaluation(null);
          setIsLoadingQuestions(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setErrorMessage("Failed to load interview questions.");
          setIsLoadingQuestions(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedCategory]);

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const generated = await generateInterviewQuestions(customRoleInput || undefined);
      setSuccessMessage(`Successfully generated ${generated.length} role-specific interview questions!`);
      setShowRoleInput(false);
      setCustomRoleInput("");
      reloadQuestions(selectedCategory);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate interview questions";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleComplete = async (q: QuestionItem) => {
    const newStatus = !q.isCompleted;
    setQuestions((prev) =>
      prev.map((item) => (item.id === q.id ? { ...item, isCompleted: newStatus } : item))
    );
    try {
      await toggleQuestionStatus(q.id, newStatus);
    } catch {
      // Revert if error
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, isCompleted: q.isCompleted } : item))
      );
    }
  };

  const handleAnswerSubmit = useCallback(async (finalAnswer: string) => {
    if (!activeQuestion) return;
    const answer = finalAnswer.trim();
    if (!answer) return;

    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const result = await submitInterviewAnswer(activeQuestion.id, answer);
      if (result.success && result.evaluation) {
        setActionEvaluation(result.evaluation);
        setTextInput("");
        setTranscript("");
        // Mark as completed in local state
        setQuestions((prev) =>
          prev.map((item) =>
            item.id === activeQuestion.id
              ? {
                  ...item,
                  isCompleted: true,
                  notes: JSON.stringify({
                    answer,
                    evaluation: result.evaluation,
                    evaluatedAt: new Date().toISOString(),
                  }),
                }
              : item
          )
        );
      } else {
        setErrorMessage(result.error || "Evaluation failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Evaluation failed";
      setErrorMessage(msg);
    } finally {
      setIsEvaluating(false);
    }
  }, [activeQuestion]);

  const handleAnswerSubmitRef = useRef(handleAnswerSubmit);
  useEffect(() => {
    handleAnswerSubmitRef.current = handleAnswerSubmit;
  }, [handleAnswerSubmit]);

  // Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        try {
          const instance = new SpeechRecognitionClass();
          instance.continuous = true;
          instance.interimResults = true;

          instance.onresult = (event: BrowserSpeechEvent) => {
            let currentTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript;
            }
            setTranscript(currentTranscript);
            transcriptRef.current = currentTranscript;
          };

          instance.onerror = (event: BrowserSpeechErrorEvent) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
            isRecordingRef.current = false;
          };

          instance.onend = () => {
            setIsRecording(false);
            if (isRecordingRef.current) {
              isRecordingRef.current = false;
              if (transcriptRef.current.trim()) {
                handleAnswerSubmitRef.current(transcriptRef.current);
              }
            }
          };

          recognitionRef.current = instance;
        } catch (e) {
          console.warn("Could not instantiate speech recognition:", e);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore cleanup
        }
      }
    };
  }, []);

  const hasSpeech = browserSpeechSupported && !speechDisabledFallback;

  const toggleRecording = () => {
    if (isRecording) {
      isRecordingRef.current = true;
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        setSpeechDisabledFallback(true);
        return;
      }
      setTranscript("");
      transcriptRef.current = "";
      setIsRecording(true);
      isRecordingRef.current = true;
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recording:", e);
        setIsRecording(false);
        isRecordingRef.current = false;
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">AI Interview Simulator</h1>
          <p className="text-muted-foreground">
            Practice realistic questions tailored to your resume with instant structured feedback.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => setShowRoleInput(!showRoleInput)} 
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Generate Questions
          </Button>
          <Button 
            variant="outline" 
            onClick={() => reloadQuestions(selectedCategory)} 
            disabled={isLoadingQuestions}
            title="Refresh questions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingQuestions ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Role Generator Form */}
      {showRoleInput && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-base">Generate Questions by Target Role</h3>
            <p className="text-sm text-muted-foreground">
              Leave blank to automatically use your latest uploaded resume and target job title, or specify a custom role.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="e.g. Senior Frontend Engineer, Cloud Architect..."
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                className="max-w-md bg-background"
                disabled={isGenerating}
              />
              <Button onClick={handleGenerateQuestions} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Generate Questions
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={() => setShowRoleInput(false)} disabled={isGenerating}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error / Success Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Categories Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full text-xs px-4"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Main Grid: Question Simulator & Question List */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Active Question Simulator */}
        <Card className="lg:col-span-8 bg-card/60 backdrop-blur-md border-border flex flex-col min-h-[640px]">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <Badge variant="outline" className="font-medium text-xs">
                  {activeQuestion?.type || "Technical"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Target: {activeQuestion?.jobRole || "Full Stack Engineer"}
                </span>
              </div>
              {activeQuestion && (
                <Button
                  size="sm"
                  variant={activeQuestion.isCompleted ? "secondary" : "outline"}
                  onClick={() => handleToggleComplete(activeQuestion)}
                  className="text-xs h-8"
                >
                  <Check className={`w-3.5 h-3.5 mr-1 ${activeQuestion.isCompleted ? "text-emerald-500" : ""}`} />
                  {activeQuestion.isCompleted ? "Completed" : "Mark Done"}
                </Button>
              )}
            </div>
            <CardTitle className="text-lg leading-snug pt-3 font-semibold text-foreground">
              {activeQuestion ? activeQuestion.question : "No questions in this category."}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col justify-between p-6 space-y-6">
            {/* Conversation & AI Feedback display */}
            <div className="space-y-4 flex-1 overflow-y-auto">
              {/* Question Banner */}
              {activeQuestion && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-sm leading-relaxed">
                  <span className="font-semibold text-primary block mb-1">Interviewer Prompt:</span>
                  {activeQuestion.question}
                </div>
              )}

              {/* User Voice transcript preview */}
              {isRecording && transcript && (
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm italic">
                  <span className="font-semibold text-primary not-italic block mb-1">Transcribing Voice:</span>
                  {transcript}...
                </div>
              )}

              {/* Evaluation Loading Spinner */}
              {isEvaluating && (
                <div className="p-8 rounded-xl bg-muted/20 border border-border/50 flex flex-col items-center justify-center text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-sm font-medium">Evaluating your answer with Gemini AI...</p>
                  <p className="text-xs text-muted-foreground">Analyzing technical accuracy, clarity, and areas for improvement.</p>
                </div>
              )}

              {/* Detailed Evaluation Result Card */}
              {displayedEvaluation && !isEvaluating && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 p-5 rounded-2xl bg-card border border-border shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-border/40 pb-3">
                    <span className="font-bold text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> AI Evaluation Feedback
                    </span>
                    <Badge 
                      variant="secondary"
                      className={`text-sm font-bold ${
                        displayedEvaluation.score >= 80 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : displayedEvaluation.score >= 60 
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" 
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      Score: {displayedEvaluation.score}/100
                    </Badge>
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90">
                    {displayedEvaluation.feedback}
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 pt-2">
                    {/* Strengths */}
                    {displayedEvaluation.strengths.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <ThumbsUp className="w-3.5 h-3.5" /> Strengths
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {displayedEvaluation.strengths.map((str, idx) => (
                            <li key={idx}>{str}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mistakes / Gaps */}
                    {displayedEvaluation.mistakes.length > 0 && (
                      <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-xs space-y-1.5">
                        <span className="font-bold text-destructive flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Key Gaps
                        </span>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {displayedEvaluation.mistakes.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Suggested Improvements */}
                  {displayedEvaluation.improvements.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1.5">
                      <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5" /> Suggested Improvements
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {displayedEvaluation.improvements.map((imp, idx) => (
                          <li key={idx}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Answer Input Controls */}
            {activeQuestion ? (
              <div className="space-y-4 pt-4 border-t border-border/40">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Type your interview answer here, or click mic to record..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isEvaluating || isRecording}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAnswerSubmit(textInput);
                      }
                    }}
                    className="bg-background"
                  />

                  {hasSpeech && (
                    <Button
                      type="button"
                      variant={isRecording ? "destructive" : "secondary"}
                      onClick={toggleRecording}
                      disabled={isEvaluating}
                      title={isRecording ? "Stop recording and submit" : "Record your answer"}
                      className="shrink-0"
                    >
                      {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}

                  <Button
                    onClick={() => handleAnswerSubmit(textInput)}
                    disabled={isEvaluating || !textInput.trim()}
                    className="shrink-0"
                  >
                    {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Press Enter to submit for AI evaluation. Your score and feedback will be saved.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <p className="text-muted-foreground">No questions found in this category.</p>
                <Button onClick={() => setShowRoleInput(true)} size="sm">
                  Generate Role Questions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar: Question List & Tracking */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-card/60 backdrop-blur-md border-border h-[640px] flex flex-col">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Question Queue</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {questions.filter((q) => q.isCompleted).length}/{questions.length} Done
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Select a question to practice or review feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 flex-1 overflow-y-auto space-y-2">
              {isLoadingQuestions ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading questions...
                </div>
              ) : questions.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
                  <p>Queue is empty.</p>
                  <Button size="sm" variant="outline" onClick={() => setShowRoleInput(true)}>
                    Create Questions
                  </Button>
                </div>
              ) : (
                questions.map((q, idx) => {
                  const isActive = idx === activeQuestionIndex;
                  return (
                    <div
                      key={q.id}
                      onClick={() => {
                        setActiveQuestionIndex(idx);
                        setActionEvaluation(null);
                        setTextInput("");
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isActive
                          ? "bg-primary/10 border-primary/40 shadow-sm"
                          : "bg-card/40 border-border/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-semibold text-primary">{q.type}</span>
                        {q.isCompleted && (
                          <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                            Evaluated
                          </Badge>
                        )}
                      </div>
                      <p className="line-clamp-2 text-foreground/80 leading-snug">
                        {q.question}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
