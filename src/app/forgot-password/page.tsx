"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, ArrowRight, Quote, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left side: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-8 left-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold tracking-tight">CareerAI</span>
          </Link>
        </div>
        
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center md:text-left">
                  <h1 className="text-3xl font-bold tracking-tight">Forgot Password</h1>
                  <p className="text-muted-foreground">Enter your email address to receive a password reset link.</p>
                </div>
                
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      required 
                      className="bg-muted/50" 
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full h-11 text-base shadow-lg shadow-primary/20 mt-2">
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      <>Send Reset Link <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
                
                <div className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Log in
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center md:text-left"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 mx-auto md:mx-0">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  If this email is registered, you'll receive a reset link shortly.
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full h-11">
                      Return to Log In
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Right side: Graphic/Testimonial */}
      <div className="hidden lg:flex flex-1 bg-muted/30 border-l border-border relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 max-w-md"
        >
          <Quote className="h-12 w-12 text-primary/40 mb-6" />
          <blockquote className="text-2xl font-medium leading-relaxed mb-6">
            "CareerAI helped me transition from a bootcamp grad to a Senior Frontend Engineer. The ATS scoring alone is worth its weight in gold."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary">
              MK
            </div>
            <div>
              <div className="font-semibold text-foreground">Maya Kapoor</div>
              <div className="text-sm text-muted-foreground">Senior Engineer at TechCorp</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
