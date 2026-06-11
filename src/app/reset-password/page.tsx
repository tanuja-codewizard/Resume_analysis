"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, ArrowRight, Quote, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Optional: Extract hash token or code if needed.
    // Supabase client handles token automatically on client side via session establishment.
    const supabase = createClient();
    const handleAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // If there's no session and no hash, they probably shouldn't be here
      if (!session && !window.location.hash.includes('access_token')) {
        console.warn("No active session or recovery token found.");
      }
    };
    handleAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      // Wait a bit before redirecting, or let the user click
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "An error occurred setting the new password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
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
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center md:text-left">
                  <h1 className="text-3xl font-bold tracking-tight">Set new password</h1>
                  <p className="text-muted-foreground">Please enter your new password below.</p>
                </div>
                
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      className="bg-muted/50" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                      className="bg-muted/50" 
                    />
                  </div>
                  
                  <Button type="submit" disabled={isLoading} className="w-full h-11 text-base shadow-lg shadow-primary/20 mt-2">
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                    ) : (
                      <>Update Password <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
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
                <h1 className="text-3xl font-bold tracking-tight">Password updated</h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Your password has been successfully reset. Redirecting you to login...
                </p>
                <div className="pt-4">
                  <Link href="/login">
                    <Button variant="outline" className="w-full h-11">
                      Go to Log In now
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
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
