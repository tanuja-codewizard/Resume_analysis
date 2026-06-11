"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, ArrowRight, Quote } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
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
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm space-y-8"
        >
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Enter your details to access your workspace.</p>
          </div>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" required className="bg-muted/50" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input id="password" type="password" required className="bg-muted/50" />
            </div>
            
            <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 mt-2">
              Log In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </motion.div>
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
