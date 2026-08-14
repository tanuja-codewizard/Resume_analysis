"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Mic, Square, Play, Settings2, User, Loader2, Send } from "lucide-react";
import { getInterviewQuestions } from "@/app/actions/interview";

// Add TypeScript types for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function InterviewPrep() {
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Can you explain how React's concurrent rendering works under the hood, and a scenario where it significantly improves performance over synchronous rendering?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [dbQuestions, setDbQuestions] = useState<any[]>([]);
  
  const [textInput, setTextInput] = useState("");
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const isRecordingRef = useRef(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const questions = await getInterviewQuestions();
        if (questions && questions.length > 0) {
          setDbQuestions(questions);
          setMessages([{ role: "ai", content: questions[0].question }]);
        }
      } catch (error) {
        console.error("Failed to fetch questions", error);
      }
    }
    fetchQuestions();
    
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          transcriptRef.current = currentTranscript;
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
          isRecordingRef.current = false;
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          if (isRecordingRef.current) {
            isRecordingRef.current = false;
            if (transcriptRef.current.trim()) {
              handleAudioSubmit(transcriptRef.current);
            }
          }
        };
      } else {
        setHasSpeechSupport(false);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      isRecordingRef.current = true;
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        setHasSpeechSupport(false);
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

  const handleManualSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (textInput.trim()) {
      handleAudioSubmit(textInput);
      setTextInput("");
    }
  };

  const handleAudioSubmit = (finalText: string) => {
    console.log("=== SENDING TO AI ===");
    console.log("Captured Text:", finalText);
    console.log("=====================");

    const userMessage = finalText.trim();
    if (!userMessage) {
      console.warn("Attempted to send empty string to AI. Ignoring.");
      return;
    }

    setIsProcessing(true);
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setTranscript("");
    transcriptRef.current = "";
    
    // Simulate AI thinking and response based on user input
    setTimeout(() => {
      setIsProcessing(false);
      let aiResponse = "Could you elaborate a bit more?";
      if (userMessage.toLowerCase().includes("concurrent") || userMessage.toLowerCase().includes("react") || userMessage.length > 30) {
         aiResponse = "Excellent answer! You covered the core concepts well. Can you give a specific example of an API like useTransition?";
      }
      setMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Interview Simulator</h1>
        <p className="text-muted-foreground">Practice with our AI interviewer. It adapts to your target role and resume.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-md border-border md:col-span-2 flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" /> Active Session
            </CardTitle>
            <CardDescription>Senior React Developer - Technical Round</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end space-y-6 pb-8 overflow-hidden">
            <div className="bg-muted/20 rounded-xl p-4 flex-1 overflow-y-auto flex flex-col gap-4 border border-border/50">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-secondary" : "bg-primary/20"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4 text-foreground" /> : <BrainCircuit className="w-4 h-4 text-primary" />}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-background border border-border rounded-tl-sm"
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                
                {/* Show live transcript while recording */}
                {isRecording && transcript && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 flex-row-reverse">
                     <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-secondary">
                      <User className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="p-3 rounded-2xl max-w-[80%] text-sm bg-primary/80 text-primary-foreground rounded-tr-sm italic">
                      {transcript}...
                    </div>
                  </motion.div>
                )}

                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-4 h-4 text-primary" />
                    </div>
                    <div className="p-3 rounded-2xl bg-background border border-border rounded-tl-sm text-sm flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing response...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center justify-center pt-2 space-y-4">
              {hasSpeechSupport ? (
                <>
                  <div className="relative">
                    {isRecording && (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 rounded-full bg-destructive/50"
                      />
                    )}
                    <Button 
                      size="lg" 
                      onClick={toggleRecording}
                      disabled={isProcessing}
                      className={`relative rounded-full w-16 h-16 transition-all ${
                        isRecording 
                          ? "shadow-[0_0_30px_rgba(var(--destructive),0.6)] bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                          : "shadow-[0_0_20px_rgba(var(--primary),0.3)] bg-primary hover:bg-primary/90 text-primary-foreground"
                      }`}
                    >
                      {isRecording ? <Square className="w-6 h-6 fill-current" /> : <Mic className="w-6 h-6" />}
                    </Button>
                  </div>
                  <p className="text-center text-sm text-muted-foreground h-5">
                    {isRecording ? "Recording... Click to stop" : isProcessing ? "Please wait..." : "Click to start recording your answer"}
                  </p>
                </>
              ) : (
                <form onSubmit={handleManualSubmit} className="w-full flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your answer here..."
                    className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isProcessing}
                  />
                  <Button type="submit" disabled={isProcessing || !textInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-md border-border">
            <CardHeader>
              <CardTitle>Session Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">Easy</Button>
                  <Button variant="default" size="sm" className="flex-1 bg-primary/20 text-primary hover:bg-primary/30">Hard</Button>
                </div>
              </div>
              <Button variant="outline" className="w-full"><Settings2 className="w-4 h-4 mr-2" /> Advanced Config</Button>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-md border-border">
            <CardHeader>
              <CardTitle>Previous Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Frontend Behavioral", score: "8/10", date: "Yesterday" },
                  { title: "System Design basics", score: "6/10", date: "3 days ago" }
                ].map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group">
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold">{s.score}</span>
                      <Button size="icon" variant="ghost" className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
